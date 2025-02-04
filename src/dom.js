import { app, isString, isFunction, isObj, isElement, toCamel } from "./app"

app.$param = (name, dflt) => {
    return new URLSearchParams(location.search).get(name) || dflt || "";
}

const esc = (selector) => (isString(selector) ? selector.replace(/#([^\s"#']+)/g, (_, id) => `#${CSS.escape(id)}`) : "")

app.$ = (selector, doc) => ((isElement(doc) || document).querySelector(esc(selector)))

app.$all = (selector, doc) => ((isElement(doc) || document).querySelectorAll(esc(selector)))

app.$event = (element, name, detail = {}) =>
    (isElement(element) && element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true })))

app.$on = (element, event, callback, ...arg) => {
    return isFunction(callback) && element.addEventListener(event, callback, ...arg);
}

app.$off = (element, event, callback, ...arg) => {
    return isFunction(callback) && element.removeEventListener(event, callback, ...arg);
}

app.$attr = (element, attr, value) => {
    if (isString(element) && element) element = app.$(element);
    if (!isElement(element)) return;
    return value === undefined ? element.getAttribute(attr) :
           value === null ? element.removeAttribute(attr) :
           element.setAttribute(attr, value);
}

app.$empty = (element, cleanup) => {
    if (isString(element) && element) element = app.$(element);
    if (!isElement(element)) return;
    while (element.firstChild) {
        const node = element.firstChild;
        node.remove();
        app.call(cleanup, node);
    }
    return element;
}

app.$elem = (name, ...arg) => {
    var element = document.createElement(name), key, val;
    if (isObj(arg[0])) {
        arg = Object.entries(arg[0]).flatMap(x => x);
    }
    for (let i = 0; i < arg.length - 1; i += 2) {
        key = arg[i], val = arg[i + 1];
        if (!isString(key)) continue;
        if (isFunction(val)) {
            app.$on(element, key, val);
        } else
        if (key.startsWith(".")) {
            element.style[key.substr(1)] = val;
        } else
        if (key.startsWith(":")) {
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

var _ready = []

app.$ready = (callback) => {
    _ready.push(callback);
    if (document.readyState == "loading") return;
    while (_ready.length) setTimeout(app.call, 0, _ready.shift());
}

app.$on(window, "DOMContentLoaded", () => {
    while (_ready.length) setTimeout(app.call, 0, _ready.shift());
});

