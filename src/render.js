import { app, isElement, isFunction, isString } from "./app"

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
    const tmpl = app.parsePath(path);
    app.trace("resolve:", path, dflt, tmpl);
    var name = tmpl?.name, templates = app.templates, components = app.components;
    var template = tmpl.template || templates[name] || document.getElementById(name);
    if (!template && dflt) {
        template = templates[dflt] || document.getElementById(dflt);
        if (template) tmpl.name = dflt;
    }
    if (isString(template) && template.startsWith("#")) {
        template = document.getElementById(tmpl.otemplate = template.substr(1));
    } else
    if (isString(template) && template.startsWith("$")) {
        template = templates[tmpl.otemplate = template.substr(1)];
    }

    if (!template) return;
    tmpl.template = template;
    var component = components[name] || components[tmpl.name];
    if (isString(component)) {
        component = components[tmpl.ocomponent = component];
    }
    tmpl.component = component;
    return tmpl;
}

app.render = (options, dflt) => {
    var tmpl = app.resolve(options, dflt);
    if (!tmpl) return;

    var params = tmpl.params = Object.assign(tmpl.params || {}, options?.params);
    params.$target = options.$target || params.$target || app.$target;

    app.trace("render:", options, tmpl.name, tmpl.params);

    const element = isElement(params.$target) || app.$(params.$target);
    if (!element) return;

    var plugin = tmpl.component?.$type || options?.plugin || params.$plugin;
    plugin = _plugins[plugin] || _default_plugin;
    if (!plugin?.render) return;

    // Replacing main component
    if (params.$target == app.$target) {
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
        if (!(options?.$nohistory || params.$nohistory || tmpl.component?.$nohistory || app.$nohistory)) {
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

