import { app, isObj, isString } from "./app"

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

app.restorePath = (path) => {
    app.trace("restorePath:", path, app.index);
    app.render(path, app.index);
}

app.start = () => {
    app.on("path:save", app.savePath);
    app.on("path:restore", app.restorePath);
    app.$ready(app.restorePath.bind(app, window.location.href));
}

app.$on(window, "popstate", () => app.emit("path:restore", window.location.href));

