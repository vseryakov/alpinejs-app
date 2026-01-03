import { app, isFunction, isString } from "./app"

var _events = {}

/**
 * Listen on event, the callback is called synchronously, optional namespace allows deleting callbacks later easier by not providing
 * exact function by just namespace.
 * @param {string} event
 * @param {function} callback
 * @param {string} [namespace]
 */
app.on = (event, callback, namespace) => {
    if (!isFunction(callback)) return;
    if (!_events[event]) _events[event] = [];
    _events[event].push([callback, isString(namespace)]);
}

/**
 * Listen on event, the callback is called only once
 * @param {string} event
 * @param {function} callback
 * @param {string} [namespace]
 */
app.once = (event, callback, namespace) => {
    if (!isFunction(callback)) return;
    const cb = (...args) => {
        app.off(event, cb);
        callback(...args);
    }
    app.on(event, cb, namespace);
}

/**
 * Remove all current listeners for the given event, if a callback is given make it the **only** listener.
 * @param {string} event
 * @param {function} callback
 * @param {string} [namespace]
 */
app.only = (event, callback, namespace) => {
    _events[event] = isFunction(callback) ? [callback, isString(namespace)] : [];
}

/**
 * Remove all event listeners for the event name and exact callback or namespace
 * @param {string} event|namespace
 * - event name if callback is not empty
 * - namespace if no callback
 * @param {function|string} [callback]
 * - function - exact callback to remove for the event
 * - string - namespace for the event
 * @example
 * app.on("component:*", (ev) => { ... }, "myapp")
 * ...
 * app.off("myapp")
 */
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

/**
 * Send an event to all listeners at once, one by one.
 *
 * If the event ends with **_:*_** it means notify all listeners that match the beginning of the given pattern, for example:
 * @param {string} event
 * @param {...any} args
 * @example <caption>notify topic:event1, topic:event2, ...</caption>
 * app.emit("topic:*",....)
 */
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

