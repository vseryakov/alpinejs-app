
import { app, call, isElement, isFunction, isString, toCamel, trace } from "./app"
import { emit, on } from "./events"
import { $ } from "./dom"
import { parsePath } from "./router"

var _plugins = {}
var _default_plugin;

/**
 * Register a render plugin, at least 2 functions must be defined in the options object:
 * @param {string} name
 * @param {object} options
 * @param {function} render - (element, options) to show a component, called by {@link render}
 * @param {function} cleanup - (element) - optional, run additional cleanups before destroying a component
 * @param {function} data - (element) - return the component class instance for the given element or the main
 * @param {boolean} [options.default] - if not empty make this plugin default
 * @param {class} [options.Component] - optional base component constructor, it will be registered as
 * app.{Type}Component, like AlpineComponent, KoComponent,... to easy create custom components in CDN mode
 *
 * The reason for plugins is that while this is designed for Alpine.js, the idea originated by using Knockout.js with this system,
 * the plugin can be found at [app.ko.js](https://github.com/vseryakov/backendjs/blob/c97ca152dfd55a3841d07b54701e9d2b8620c516/web/js/app.ko.js).
 *
 * There is a simple plugin in examples/simple.js to show how to use it without any rendering engine with vanillla HTML, not very useful though.
 */
export function register(name, options)
{
    if (!name || !isString(name)) throw Error("type must be defined")
    if (options) {
        for (const p of ["render", "cleanup", "data"]) {
            if (options[p] && !isFunction(options[p])) throw Error(p + " must be a function");
        }
        if (isFunction(options?.Component)) {
            app[toCamel(`_${name}_component`)] = options.Component;
        }
    }
    var plugin = _plugins[name] = _plugins[name] || {};
    if (options?.default) _default_plugin = plugin;
    return Object.assign(plugin, options);
}

/**
 * Return component data instance for the given element or the main component if omitted. This is for
 * debugging purposes or cases when calling some known method is required.
 * @param {string|HTMLElement} element
 * @param {number} [level] - if is not a number then the closest scope is returned otherwise only the requested scope at the level or undefined.
 * This is useful for components to make sure they use only the parent's scope for example.
 *
 * @returns {Proxy|undefined} to get the actual object pass it to **Alpine.raw(app.$data())**
 */
export function $data(element, level)
{
    if (isString(element)) element = $(element);
    for (const p in _plugins) {
        if (!_plugins[p].data) continue;
        const d = _plugins[p].data(element, level);
        if (d) return d;
    }
}

/**
 * Returns an object with **template** and **component** properties.
 *
 * Calls {@link parsePath} first to resolve component name and params.
 *
 * Passing an object with 'template' set will reuse it, for case when template is already resolved.
 *
 * The template property is set as:
 *  - try app.templates[.name]
 *  - try an element with ID name and use innerHTML
 *  - if not found and dflt is given try the same with it
 *  - if template texts starts with # it means it is a reference to another element's innerHTML,
 *     otemplate is set with the original template before replacing the template property
 *  - if template text starts with $ it means it is a reference to another template in **app.templates**,
 *     otemplate is set with the original template before replacing the template property
 *
 * The component property is set as:
 *  - try app.components[.name]
 *  - try app.components[dflt]
 *  - if resolved to a function return
 *  - if resolved to a string it refers to another component, try app.templates[component],
 *     ocomponent is set with the original component string before replacing the component property
 *
 * if the component property is empty then this component is HTML template.
 * @param {string} path
 * @param {string} [dflt]
 * @returns {object} in format { name, params, template, component }
 */
export function resolve(path, dflt)
{
    const tmpl = parsePath(path);
    trace("resolve:", path, dflt, tmpl);
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

/**
 * Show a component, options can be a string to be parsed by {@link parsePath} or an object with { name, params } properties.
 * if no **params.$target** provided a component will be shown inside the main element defined by {@link $target}.
 *
 * It returns the resolved component as described in {@link resolve} method after rendering or nothing if nothing was shown.
 *
 * When showing main app the current component is asked to be deleted first by sending an event __prepare:delete__,
 * a component that is not ready to be deleted yet must set the property __event.stop__ in the event
 * handler __onPrepareDelete(event)__ in order to prevent rendering new component.
 *
 * To explicitly disable history pass __options.$nohistory__ or __params.$nohistory__ otherwise main components are saved automatically by sending
 * the __path:save__ event.
 *
 * A component can globally disable history by creating a static property __$nohistory__ in the class definition.
 *
 * To disable history all together set `app.$nohistory = true`.
 *
 * @param {string|object} options
 * @param {string} [dflt]
 * @returns {object|undefined}
 */
export function render(options, dflt)
{
    var tmpl = resolve(options, dflt);
    if (!tmpl) return;

    var params = tmpl.params = Object.assign(tmpl.params || {}, options?.params);
    params.$target = options.$target || params.$target || app.$target;

    trace("render:", options, tmpl.name, tmpl.params);

    const element = isElement(params.$target) || $(params.$target);
    if (!element) return;

    var plugin = tmpl.component?.$type || options?.plugin || params.$plugin;
    plugin = _plugins[plugin] || _default_plugin;
    if (!plugin?.render) return;

    // Replacing main component
    if (params.$target == app.$target) {
        // Ask if it can be destroyed first
        var ev = { name: tmpl.name, params };
        emit(app.event, "prepare:delete", ev);
        if (ev.stop) return;

        // Cleanup by all plugins
        var plugins = Object.values(_plugins);
        for (const p of plugins.filter(x => x.cleanup)) {
            call(p.cleanup, element);
        }

        // Save in history if not explicitly asked not to
        if (!(options?.$nohistory || params.$nohistory || tmpl.component?.$nohistory || app.$nohistory)) {
            queueMicrotask(() => {
                emit("path:save", tmpl);
            });
        }
    }
    emit("component:render", tmpl);
    plugin.render(element, tmpl);
    return tmpl;
}


/**
 * Add a callback to process classes for new components, all registered callbacks will be called on component:create
 * event with top HTMLElement as parameter. This is for UI frameworks intergation to apply logic to added elements
 * @param {function} callback
 * @example
 * app.stylePlugin((el) => {
 *     app.$all(".carousel", element).forEach(el => (bootstrap.Carousel.getOrCreateInstance(el)));
 * })
 */
export function stylePlugin(callback)
{
    if (isFunction(callback)) _stylePlugins.push(callback);
}

var _stylePlugins = [];

function applyStylePlugins(element)
{
    if (!(element instanceof HTMLElement)) return;
    for (const cb of _stylePlugins) cb(element);
}

on("alpine:init", () => {
    for (const p in _plugins) {
        call(_plugins[p], "init");
    }
    on("component:create", (ev) => {
        if (isElement(ev?.element)) applyStylePlugins(ev.element);
    });
});

