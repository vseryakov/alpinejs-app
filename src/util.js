import app from "./app"

app.noop = () => {}

app.log = (...args) => console.log(...args)

app.trace = (...args) => { app.debug && console.log(...args) }

app.call = (obj, method, ...arg) => {
    if (typeof obj == "function") return obj(method, ...arg);
    if (typeof obj != "object") return;
    if (typeof method == "function") return method.call(obj, ...arg);
    if (obj && typeof obj[method] == "function") return obj[method].call(obj, ...arg);
}

var _events = {}

app.on = (event, callback) => {
    if (!callback) return;
    if (!_events[event]) _events[event] = [];
    _events[event].push(callback);
}

app.off = (event, callback) => {
    if (!_events[event] || !callback) return;
    const i = _events[event].indexOf(callback);
    if (i > -1) return _events[event].splice(i, 1);
}

app.emit = (event, ...args) => {
    app.trace(event, ...args);
    if (!_events[event]) return;
    for (const cb of _events[event]) app.call(cb, ...args);
}

