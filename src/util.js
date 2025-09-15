import { app, isFunction, isString } from "./app"

app.noop = () => {}

app.log = (...args) => console.log(...args)

app.trace = (...args) => { app.debug && app.log(...args) }

app.call = (obj, method, ...arg) => {
    if (isFunction(obj)) return obj(method, ...arg);
    if (typeof obj != "object") return;
    if (isFunction(method)) return method.call(obj, ...arg);
    if (obj && isFunction(obj[method])) return obj[method].call(obj, ...arg);
}

var _events = {}

app.on = (event, callback, namespace) => {
    if (!isFunction(callback)) return;
    if (!_events[event]) _events[event] = [];
    _events[event].push([callback, isString(namespace)]);
}

app.once = (event, callback, namespace) => {
    if (!isFunction(callback)) return;
    const cb = (...args) => {
        app.off(event, cb);
        callback(...args);
    }
    app.on(event, cb, namespace);
}

app.only = (event, callback, namespace) => {
    _events[event] = isFunction(callback) ? [callback, isString(namespace)] : [];
}

app.off = (event, callback) => {
    if (event && callback) {
        if (!_events[event]) return;
        const i = isFunction(callback) ? 0 : isString(callback) ? 1 : -1;
        if (i >= 0) _events[event] = _events[event].filter(x => x[i] !== callback);
    } else
    if (isString(event)) {
        for (const ev in _events) {
            _events[ev] = _events[ev].filter(x => x[1] !== event);
        }
    }
}

app.emit = (event, ...args) => {
    app.trace("emit:", event, ...args, app.debug > 1 && _events[event]);
    if (_events[event]) {
        for (const cb of _events[event]) cb[0](...args);
    } else
    if (isString(event) && event.endsWith(":*")) {
        event = event.slice(0, -1);
        for (const p in _events) {
            if (p.startsWith(event)) {
                for (const cb of _events[p]) cb[0](...args);
            }
        }
    }
}

