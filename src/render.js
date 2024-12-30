import app from "./app"

var _plugins = {}
var _default_plugin;

app.plugin = (name, options) => {
    if (!name || typeof name != "string") throw Error("type must be defined")
    if (options) {
        for (const p of ["render", "cleanup"]) {
            if (options[p] && typeof options[p] != "function") throw Error(p + " must be a function");
        }
        if (typeof options?.Component == "function") {
            app[`${name.substr(0, 1).toUpperCase() + name.substr(1).toLowerCase()}Component`] = options.Component;
        }
    }
    var plugin = _plugins[name] = _plugins[name] || {};
    if (options?.default) _default_plugin = plugin;
    return Object.assign(plugin, options);
}

app.resolve = (path, dflt) => {
    const rc = app.parsePath(path);
    app.trace("resolve:", path, dflt, rc);

    var name = rc.name, templates = app.templates, components = app.components;
    var template = templates[name] || document.getElementById(name)?.innerHTML;
    if (!template && dflt) {
        template = templates[dflt] || document.getElementById(dflt)?.innerHTML;
        if (template) rc.name = dflt;
    }
    if (template?.startsWith("#")) {
        template = document.getElementById(template.substr(1))?.innerHTML;
    } else
    if (template?.startsWith("$")) {
        template = templates[template.substr(1)];
    }
    if (!template) return;
    rc.template = template;
    var component = components[name] || components[rc.name];
    if (typeof component == "string") component = components[component];
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
        // Save in history if not excplicitly asked not to
        if (!(options.nohistory || params.$nohistory)) params.$history = 1;
    }

    var plugin = tmpl.component?.$type || options.plugin || params.$plugin;
    plugin = _plugins[plugin] || _default_plugin;
    if (!plugin?.render) return;
    plugin.render(element, tmpl);
    return tmpl;
}

