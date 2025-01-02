import app from "./app"

const esc = (selector) => (typeof selector == "string" ? selector.replace(/#([^\s"#']+)/g, (_, id) => `#${CSS.escape(id)}`) : "")

app.$ = (selector, doc) => ((doc || document).querySelector(esc(selector)))

app.$all = (selector, doc) => ((doc || document).querySelectorAll(esc(selector)))

app.$on = (element, event, callback, ...arg) => {
    return typeof callback == "function" && element.addEventListener(event, callback, ...arg);
}

app.$off = (element, event, callback, ...arg) => {
    return typeof callback == "function" && element.removeEventListener(event, callback, ...arg);
}

app.$attr = (element, attr, value) => {
    if (!(element instanceof HTMLElement)) return;
    return value === undefined ? element.getAttribute(attr) :
    value === null ? element.removeAttribute(attr) :
    element.setAttribute(attr, value);
}

app.$empty = (element, cleanup) => {
    if (!(element instanceof HTMLElement)) return;
    while (element.firstChild) {
        const node = element.firstChild;
        node.remove();
        app.call(cleanup, node);
    }
}

app.$param = (name, dflt) => {
    return new URLSearchParams(location.search).get(name) || dflt || "";
}

app.$elem = (name, ...arg) => {
    var el = document.createElement(name), key;
    for (let i = 0; i < arg.length - 1; i += 2) {
        key = arg[i];
        if (typeof key != "string") continue;
        if (typeof arg[i + 1] == "function") {
            app.$on(el, key, arg[i + 1], false);
        } else
        if (key.startsWith(".")) {
            el.style[key.substr(1)] = arg[i + 1];
        } else
        if (key.startsWith("data-")) {
            el.dataset[key.substr(5)] = arg[i + 1];
        } else
        if (key.startsWith(":")) {
            el[key.substr(1)] = arg[i + 1];
        } else {
            el.setAttribute(key, arg[i + 1] ?? "");
        }
    }
    return el;
}

app.$parse = (text) => {
    return new window.DOMParser().parseFromString(text, 'text/html').body;
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

