import { app, isElement, isFunction, isObj, isString, toCamel } from "./app"

app.$param = (name, dflt) => (new URLSearchParams(location.search).get(name) || dflt || "");

const esc = (selector) => (selector.replace(/#([^\s"#']+)/g, (_, id) => `#${CSS.escape(id)}`))

app.$ = (selector, doc) => (isString(selector) ? (isElement(doc) || document).querySelector(esc(selector)) : null)

app.$all = (selector, doc) => (isString(selector) ? (isElement(doc) || document).querySelectorAll(esc(selector)) : null)

app.$event = (element, name, detail = {}) => (
    element instanceof EventTarget && element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true }))
);

app.$on = (element, event, callback, ...arg) => (isFunction(callback) && element.addEventListener(event, callback, ...arg));

app.$off = (element, event, callback, ...arg) => (isFunction(callback) && element.removeEventListener(event, callback, ...arg));

app.$attr = (element, attr, value) => {
    if (isString(element)) element = app.$(element);
    if (!isElement(element)) return;
    return value === undefined ? element.getAttribute(attr) :
           value === null ? element.removeAttribute(attr) :
           element.setAttribute(attr, value);
}

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

app.$elem = (name, ...arg) => {
    var element = document.createElement(name), key, val, opts;
    if (isObj(arg[0])) {
        arg = Object.entries(arg[0]).flatMap(x => x);
        opts = arg[1];
    }
    for (let i = 0; i < arg.length - 1; i += 2) {
        key = arg[i], val = arg[i + 1];
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

app.$parse = (html, format) => {
    html = new window.DOMParser().parseFromString(html || "", 'text/html');
    return format === "doc" ? html : format === "list" ? Array.from(html.body.childNodes) : html.body;
}

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

app.$ready = (callback) => {
    _ready.push(callback);
    if (document.readyState == "loading") return;
    while (_ready.length) setTimeout(app.call, 0, _ready.shift());
}

app.$on(window, "DOMContentLoaded", () => {
    while (_ready.length) setTimeout(app.call, 0, _ready.shift());
});

