import { app, isStr, isFunc } from "./app"

app.noop = () => {}

app.log = (...args) => console.log(...args)

app.trace = (...args) => { app.debug && app.log(...args) }

app.call = (obj, method, ...arg) => {
    if (isFunc(obj)) return obj(method, ...arg);
    if (typeof obj != "object") return;
    if (isFunc(method)) return method.call(obj, ...arg);
    if (obj && isFunc(obj[method])) return obj[method].call(obj, ...arg);
}

var _events = {}

app.on = (event, callback) => {
    if (!isFunc(callback)) return;
    if (!_events[event]) _events[event] = [];
    _events[event].push(callback);
}

app.once = (event, callback) => {
    if (!isFunc(callback)) return;
    const cb = (...args) => {
        app.off(event, cb);
        callback(...args);
    }
    app.on(event, cb);
}

app.only = (event, callback) => {
    _events[event] = isFunc(callback) ? [callback] : [];
}

app.off = (event, callback) => {
    if (!_events[event] || !callback) return;
    const i = _events[event].indexOf(callback);
    if (i > -1) return _events[event].splice(i, 1);
}

app.emit = (event, ...args) => {
    app.trace("emit:", event, ...args);
    if (_events[event]) {
        for (const cb of _events[event]) cb(...args);
    } else
    if (isStr(event) && event.endsWith(":*")) {
        event = event.slice(0, -1);
        for (const p in _events) {
            if (p.startsWith(event)) {
                for (const cb of _events[p]) cb(...args);
            }
        }
    }
}

