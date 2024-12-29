import app from "./app"

app.parsePath = (path) => {
    var rc = { name: "", params: {} }, query, loc = window.location;

    if (typeof path != "string") return rc;

    // Custom parser b/c this is not always url
    var base = app.base;
    if (path.startsWith(loc.origin)) path = path.substr(loc.origin.length);
    if (path.includes("://")) path = path.replace(/^(.*:\/\/[^\/]*)/, "");
    if (path.startsWith(base)) path = path.substr(base.length);
    if (path.startsWith("/")) path = path.substr(1);
    if (path == base.slice(1, -1)) path = "";

    const q = path.indexOf("?");
    if (q > 0) {
        query = path.substr(q + 1, 1024);
        rc.name = path = path.substr(0, q);
    }
    if (path.includes("/")) {
        path = path.split("/").slice(0, 5);
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
    if (typeof options == "string") options = { name: options };
    if (!options?.name) return;
    var path = [options.name];
    if (options?.params) {
        for (let i = 1; i < 5; i++) path.push(options.params[`param${i}`] || "");
    }
    while (!path.at(-1)) path.length--;
    path = path.join("/");
    app.trace("savePath:", path, options);
    if (!path) return;
    window.history.pushState(null, "", window.location.origin + app.base + path);
}

app.restorePath = (path, dflt) => {
    app.trace("restorePath:", path || window.location.href, dflt || app.index);
    app.render(path || window.location.href, dflt || app.index);
}

app.$on(window, "popstate", () => app.restorePath());

app.on("component:create", (event) => {
    app.trace("component:create", event);
    queueMicrotask(() => {
        if (event?.params?.$history) app.savePath(event);
    });
});

