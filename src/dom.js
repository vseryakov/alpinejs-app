import { app, isStr, isFunc, isObj, isElement, toCamel } from "./app"

app.$param = (name, dflt) => {
    return new URLSearchParams(location.search).get(name) || dflt || "";
}

const esc = (selector) => (isStr(selector) ? selector.replace(/#([^\s"#']+)/g, (_, id) => `#${CSS.escape(id)}`) : "")

app.$ = (selector, doc) => ((isElement(doc) || document).querySelector(esc(selector)))

app.$all = (selector, doc) => ((isElement(doc) || document).querySelectorAll(esc(selector)))

app.$event = (element, name, detail = {}) =>
    (isElement(element) && element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true })))

app.$on = (element, event, callback, ...arg) => {
    return isFunc(callback) && element.addEventListener(event, callback, ...arg);
}

app.$off = (element, event, callback, ...arg) => {
    return isFunc(callback) && element.removeEventListener(event, callback, ...arg);
}

app.$attr = (element, attr, value) => {
    if (isStr(element) && element) element = app.$(element);
    if (!isElement(element)) return;
    return value === undefined ? element.getAttribute(attr) :
           value === null ? element.removeAttribute(attr) :
           element.setAttribute(attr, value);
}

app.$empty = (element, cleanup) => {
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
        if (!isStr(key)) continue;
        if (isFunc(val)) {
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
        } else {
            element.setAttribute(key, val ?? "");
        }
    }
    return element;
}

app.$parse = (html, list) => {
    html = new window.DOMParser().parseFromString(html || "", 'text/html').body;
    return list ? Array.from(html.childNodes) : html;
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

