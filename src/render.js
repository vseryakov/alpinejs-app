import { app, isString, isFunction } from "./app"

var _plugins = {}
var _default_plugin;

app.plugin = (name, options) => {
    if (!name || !isString(name)) throw Error("type must be defined")
    if (options) {
        for (const p of ["render", "cleanup", "data"]) {
            if (options[p] && !isFunction(options[p])) throw Error(p + " must be a function");
        }
        if (isFunction(options?.Component)) {
            app[`${name.substr(0, 1).toUpperCase() + name.substr(1).toLowerCase()}Component`] = options.Component;
        }
    }
    var plugin = _plugins[name] = _plugins[name] || {};
    if (options?.default) _default_plugin = plugin;
    return Object.assign(plugin, options);
}

app.$data = (element, level) => {
    if (isString(element)) element = app.$(element);
    for (const p in _plugins) {
        if (!_plugins[p].data) continue;
        const d = _plugins[p].data(element, level);
        if (d) return d;
    }
}

app.resolve = (path, dflt) => {
    const rc = app.parsePath(path);
    app.trace("resolve:", path, dflt, rc);

    var name = rc.name, templates = app.templates, components = app.components;
    var template = templates[name] || document.getElementById(name);
    if (!template && dflt) {
        template = templates[dflt] || document.getElementById(dflt);
        if (template) rc.name = dflt;
    }
    if (isString(template) && template.startsWith("#")) {
        template = document.getElementById(template.substr(1));
    } else
    if (isString(template) && template.startsWith("$")) {
        template = templates[template.substr(1)];
    }

    if (!template) return;
    rc.template = template;
    var component = components[name] || components[rc.name];
    if (isString(component)) component = components[component];
    rc.component = component;
    return rc;
}

app.render = (options, dflt) => {
    var tmpl = app.resolve(options?.name || options, dflt);
    if (!tmpl) return;

    var params = tmpl.params;
    Object.assign(params, options?.params);
    app.trace("render:", options, tmpl.name, tmpl.params);

    const element = app.$(params.$target || app.main);
    if (!element) return;

    var plugin = tmpl.component?.$type || options?.plugin || params.$plugin;
    plugin = _plugins[plugin] || _default_plugin;
    if (!plugin?.render) return;

    // Replacing main component
    if (!params.$target || params.$target == app.main) {
        // Ask if it can be destroyed first
        var ev = { name: tmpl.name, params };
        app.emit(app.event, "prepare:delete", ev);
        if (ev.stop) return;

        // Cleanup by all plugins
        var plugins = Object.values(_plugins);
        for (const p of plugins.filter(x => x.cleanup)) {
            app.call(p.cleanup, element);
        }

        // Save in history if not explicitly asked not to
        if (!(options?.nohistory || params.$nohistory || tmpl.component?.$nohistory)) {
            queueMicrotask(() => {
                app.emit("path:save", tmpl);
            });
        }
    }
    app.emit("component:render", tmpl);
    plugin.render(element, tmpl);
    return tmpl;
}

app.on("alpine:init", () => {
    for (const p in _plugins) {
        app.call(_plugins[p], "init");
    }
});

