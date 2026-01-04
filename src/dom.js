import { app, isElement, isFunction, isObject, isString, toCamel } from "./app"

/**
 * Returns a query parameter value from the current document location
 * @param {string} name
 * @param {string} [dflt]
 * @return {string}
 */
app.$param = (name, dflt) => (new URLSearchParams(location.search).get(name) || dflt || "");

const esc = (selector) => (selector.replace(/#([^\s"#']+)/g, (_, id) => `#${CSS.escape(id)}`))

/**
 * An alias to **document.querySelector**, doc can be an Element, empty or non-string selectors will return null
 * @param {string} selector
 * @param {HTMLElement} [doc]
 * @returns {null|HTMLElement}
 * @example
 * var el = app.$("#div")
 */
app.$ = (selector, doc) => (isString(selector) ? (isElement(doc) || document).querySelector(esc(selector)) : null)

/**
 * An alias for **document.querySelectorAll**
 * @param {string} selector
 * @param {HTMLElement} [doc]
 * @returns {null|HTMLElement[]}
 * @example
 * Array.from(app.$all("input")).find((el) => !(el.readOnly || el.disabled || el.type == "hidden"));
 */
app.$all = (selector, doc) => (isString(selector) ? (isElement(doc) || document).querySelectorAll(esc(selector)) : null)

/**
 * Send a CustomEvent using DispatchEvent to the given element, true is set to composed, cancelable and bubbles properties.
 * @param {HTMLElement} element
 * @param {string} name
 * @param {object} [detail]
 */
app.$event = (element, name, detail = {}) => (
    element instanceof EventTarget && element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true }))
);

/**
 * An alias for **element.addEventListener**
 * @param {HTMLElement} element
 * @param {string} event
 * @param {function} callback
 * @param {any} [...args] - additional params to addEventListener
 * @example
 * app.$on(window, "popstate", () => { ... })
 */
app.$on = (element, event, callback, ...arg) => (isFunction(callback) && element.addEventListener(event, callback, ...arg));

/**
 * An alias for **element.removeEventListener**
 * @param {HTMLElement} element
 * @param {string} event
 * @param {function} callback
 * @param {any} [...args] - additional params to removeEventListener
 */
app.$off = (element, event, callback, ...arg) => (isFunction(callback) && element.removeEventListener(event, callback, ...arg));

/**
 * Return or set attribute by name from the given element.
 * @param {HTMLElement|string} element
 * @param {string} attr
 * @param {any} [value]
 * - undefined - return the attribute value
 * - null - remove attribute
 * - any - assign new value
 * @returns {undefined|any}
 */
app.$attr = (element, attr, value) => {
    if (isString(element)) element = app.$(element);
    if (!isElement(element)) return;
    return value === undefined ? element.getAttribute(attr) :
           value === null ? element.removeAttribute(attr) :
           element.setAttribute(attr, value);
}

/**
 * Remove all nodes from the given element, call the cleanup callback for each node if given
 * @param {HTMLElement|string} element
 * @param {functions} [cleanup]
 * @returns {HTMLElement}
 */
app.$empty = (element, cleanup) => {
    if (isString(element)) element = app.$(element);
    if (!isElement(element)) return;
    while (element.firstChild) {
        const node = element.firstChild;
        node.remove();
        app.call(cleanup, node);
    }
    return element;
}

/**
 * Create a DOM element with attributes, **-name** means **style.name**, **.name** means a property **name**,
 * all other are attributes, functions are event listeners
 * @param {string} name
 * @param {any|object} [...args]
 * @param {object} [options]
 * @example
 * app.$elem("div", "id", "123", "-display", "none", "._x-prop", "value", "click", () => {})
 *
 * @example <caption>Similar to above but all properties and attributes are taken from an object, in this form options can be passed, at the moment only
 * options for addEventListener are supported.</caption>
 *
 * app.$elem("div", { id: "123", "-display": "none", "._x-prop": "value", click: () => {} }, { signal })
 */
app.$elem = (name, ...args) => {
    var element = document.createElement(name), key, val, opts;
    if (isObject(args[0])) {
        args = Object.entries(args[0]).flatMap(x => x);
        opts = args[1];
    }
    for (let i = 0; i < args.length - 1; i += 2) {
        key = args[i], val = args[i + 1];
        if (!isString(key)) continue;
        if (isFunction(val)) {
            app.$on(element, key, val, { capture: opts?.capture, passive: opts?.passive, once: opts?.once, signal: opts?.signal });
        } else
        if (key.startsWith("-")) {
            element.style[key.substr(1)] = val;
        } else
        if (key.startsWith(".")) {
            element[key.substr(1)] = val;
        } else
        if (key.startsWith("data-")) {
            element.dataset[toCamel(key.substr(5))] = val;
        } else
        if (key == "text") {
            element.textContent = val || "";
        } else
        if (val !== null) {
            element.setAttribute(key, val ?? "");
        }
    }
    return element;
}

/**
 * A shortcut to DOMParser, default is to return the .body.
 * @param {string} html
 * @param {string} [format] - defines the result format:
 *  - list - the result will be an array with all body child nodes, i.e. simpler to feed it to Element.append()
 *  - doc - return the whole parsed document
 * @example
 * document.append(...app.$parse("<div>...</div>"), 'list'))
 */
app.$parse = (html, format) => {
    html = new window.DOMParser().parseFromString(html || "", 'text/html');
    return format === "doc" ? html : format === "list" ? Array.from(html.body.childNodes) : html.body;
}

/**
 * Append nodes from the template to the given element, call optional setup callback for each node.
 * @param {string|HTMLElement} element
 * @param {string|HTMLElement} template can be a string with HTML or a template element.
 * @param {function} [setup]
 * @example
 * app.$append(document, "<div>...</div>")
 */
app.$append = (element, template, setup) => {
    if (isString(element)) element = app.$(element);
    if (!isElement(element)) return;

    let doc;
    if (isString(template)) {
        doc = app.$parse(template, "doc");
    } else
    if (template?.content?.nodeType == 11) {
        doc = { body: template.content.cloneNode(true) };
    } else {
        return element;
    }

    let node;
    while (node = doc.head?.firstChild) {
        element.appendChild(node);
    }
    while (node = doc.body.firstChild) {
        element.appendChild(node);
        if (setup && node.nodeType == 1) app.call(setup, node);
    }
    return element;
}

var _ready = []

/**
 * Run callback once the document is loaded and ready, it uses setTimeout to schedule callbacks
 * @param {function} callback
 * @example
 * app.$ready(() => {
 *
 * })
 */
app.$ready = (callback) => {
    _ready.push(callback);
    if (document.readyState == "loading") return;
    while (_ready.length) setTimeout(app.call, 0, _ready.shift());
}

app.$on(window, "DOMContentLoaded", () => {
    while (_ready.length) setTimeout(app.call, 0, _ready.shift());
});

function domChanged()
{
    var w = document.documentElement.clientWidth;
    app.emit("dom:changed", {
        breakPoint: w < 576 ? 'xs' : w < 768 ? 'sm' : w < 992 ? 'md' : w < 1200 ? 'lg' : w < 1400 ? 'xl' : 'xxl',
        colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light",
    });
}

app.$ready(() => {
    domChanged();
    app.$on(window.matchMedia('(prefers-color-scheme: dark)'), 'change', domChanged);

    var _resize;
    app.$on(window, "resize", () => {
        clearTimeout(_resize);
        _resize = setTimeout(domChanged, 250);
    });
});
