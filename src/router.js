import { app, isObj, isString } from "./app"


 /**
  * Parses component path and returns an object with at least **{ name, params }** ready for rendering. External urls are ignored.
  *
  * Passing an object will retun a shallow copy of it with name and params properties possibly set if not provided.
  *
  * The path can be:
  * - component name
  * - relative path: name/param1/param2/param3/....
  * - absolute path: /app/name/param1/param2/...
  * - URL: https://host/app/name/param1/...
  *
  *  All parts from the path and query parameters will be placed in the **params** object.
  *
  * The **.html** extention will be stripped to support extrernal loading but other exts will be kept as is.
  *
  * @param {string|object} path
  * @returns {Object} in format { name, params }
  */
app.parsePath = (path) => {
    var rc = { name: "", params: {} }, query, loc = window.location;

    if (isObj(path)) return Object.assign(rc, path);
    if (!isString(path)) return rc;

    // Custom parser b/c this is not always url
    var base = app.base;
    if (path.startsWith(loc.origin)) path = path.substr(loc.origin.length);
    if (path.includes("://")) path = path.replace(/^(.*:\/\/[^/]*)/, "");
    if (path.startsWith(base)) path = path.substr(base.length);
    if (path.startsWith("/")) path = path.substr(1);
    if (path == base.slice(1, -1)) path = "";

    const q = path.indexOf("?");
    if (q > 0) {
        query = path.substr(q + 1, 1024);
        rc.name = path = path.substr(0, q);
    }
    if (path.endsWith(".html")) {
        path = path.slice(0, -5);
    }
    if (path.includes("/")) {
        path = path.split("/").slice(0, 7);
        rc.name = path.shift();
        for (let i = 0; i < path.length; i++) {
            if (!path[i]) continue;
            rc.params[`param${i + 1}`] = path[i];
        }
    } else {
        rc.name = path || "";
    }
    if (query) {
        for (const [key, value] of new URLSearchParams(query).entries()) {
            rc.params[key] = value;
        }
    }
    return rc;
}

/**
 * Saves the given component in the history as ** /name/param1/param2/param3/.. **
 *
 * It is called on every **component:create** event for main components as a microtask,
 * meaning immediate callbacks have a chance to modify the behaviour.
 * @param {Object} options
 *
 */
app.savePath = (options) => {
    if (isString(options)) options = { name: options };
    if (!options?.name) return;
    var path = [options.name];
    if (options?.params) {
        for (let i = 1; i < 7; i++) path.push(options.params[`param${i}`] || "");
    }
    while (!path.at(-1)) path.length--;
    path = path.join("/");
    app.trace("savePath:", path, options);
    if (!path) return;
    app.emit("path:push", window.location.origin + app.base + path);
    window.history.pushState(null, "", window.location.origin + app.base + path);
}

/**
 * Show a component by path, it is called on **path:restore** event by default from {@link app.start} and is used
 * to show first component on initial page load. If the path is not recognized or no component is
 * found then the default {@link app.index} component is shown.
 * @param {string} path
 */
app.restorePath = (path) => {
    app.trace("restorePath:", path, app.index);
    app.render(path, app.index);
}

/**
 * Setup default handlers:
 * - on **path:restore** event call {@link app.restorePath} to render a component from the history
 * - on **path:save** call {@link app.savePath} to save the current component in the history
 * - on page ready call {@link app.restorePath} to render the initial page
 *
 * **If not called then no browser history will not be handled, up to the app to do it some other way.**. One good
 * reason is to create your own handlers to build different path and then save/restore.
 */
app.start = () => {
    app.on("path:save", app.savePath);
    app.on("path:restore", app.restorePath);
    app.$ready(app.restorePath.bind(app, window.location.href));
}

app.$on(window, "popstate", () => app.emit("path:restore", window.location.href));

