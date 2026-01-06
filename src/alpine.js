import { app, isElement, isObject, isString } from './app';
import Component from './component';
import { fetch } from "./fetch";
import { $, $append, $elem, $empty, $off, $on } from "./dom";
import { emit } from "./events"
import { register, render, resolve } from "./render"
import { parsePath } from "./router"

const _alpine = "alpine";

var _Alpine;

/**
 * Alpine.js component
 * @param {string} name - component name
 * @param {object} [params] - properties passed during creation
 * @class
 * @extends Component
 * @example <caption>Component code</caption>
 * app.components.items = class extends app.AlpineComponent {
 *   items = []
 *
 *   onCreate() {
 *       app.fetch("host/items", (err, items) => {
 *           this.items = items;
 *       })
 *   }
 *}
 * @example <caption>Component template</caption>
 * <div x-show="!list.length">
 *   Your basket is empty
 * </div>
 * <template x-for="item in items">
 *   ID: <div x-text="item.id"></div>
 * </template>
 */
class AlpineComponent extends Component {
    static $type = _alpine;

    constructor(name, params) {
        super(name, params);
        this.$type = _alpine;
    }

    init() {
        super.init(this.$root.parentElement._x_params);
    }

}

class Element extends HTMLElement {

    connectedCallback() {
        queueMicrotask(() => {
            _render(this, this.localName.substr(4));
        });
    }
}

function _render(element, options)
{
    if (isString(options)) {
        options = resolve(options);
        if (!options) return;
    }

    $empty(element);

    element._x_params = Object.assign({}, options.params);
    _Alpine.onElRemoved(element, () => { delete element._x_params });

    if (!options.component) {
        _Alpine.mutateDom(() => {
            $append(element, options.template, _Alpine.initTree);
        });
    } else {
        // In case a component was loaded after alpine:init event
        _Alpine.data(options.name, () => (new options.component(options.name)));

        const node = $elem("div", "x-data", options.name);
        $append(node, options.template);

        _Alpine.mutateDom(() => {
            element.appendChild(node);
            _Alpine.initTree(node);
        });
    }
    return options;
}

function data(element, level)
{
    if (!isElement(element)) element = $(app.$target + " div");
    if (!element) return;
    if (typeof level == "number") return element._x_dataStack?.at(level);
    return _Alpine.closestDataStack(element)[0];
}

function init()
{
    for (const [name, obj] of Object.entries(app.components)) {
        const tag = `app-${obj?.$tag || name}`;
        if (obj?.$type != _alpine || customElements.get(tag)) continue;
        customElements.define(tag, class extends Element {});
        _Alpine.data(name, () => (new obj(name)));
    }
}

function $render(el, value, modifiers, callback)
{
    const cache = modifiers.includes("cache");
    const opts = { post: modifiers.includes("post") };

    if (!value.url && !(!cache && /^(https?:\/\/|\/|.+\.html(\?|$)).+/.test(value))) {
        if (callback(el, value)) return;
    }
    fetch(value, opts, (err, text, info) => {
        if (err || !isString(text)) {
            return console.warn("$render: Text expected from", value, "got", err, text);
        }
        const tmpl = isString(value) ? parsePath(value) : value;
        tmpl.template = text;
        tmpl.name = tmpl.params?.$name || tmpl.name;
        if (cache) {
            app.templates[tmpl.name] = text;
        }
        callback(el, tmpl);
    });
}

function $template(el, value, modifiers)
{
    const mods = {};

    const toMods = (tmpl) => {
        for (let i = 0; i < modifiers.length; i++) {
            const mod = modifiers[i];
            switch (mod) {
            case "params":
                var scope = _Alpine.$data(el);
                if (!isObject(scope[modifiers[i + 1]])) break;
                tmpl.params = Object.assign(scope[modifiers[i + 1]], tmpl.params);
                break;
            case "inline":
                mods.inline = "inline-block";
                break;
            default:
                mods[mod] = mod;
            }
        }
        return tmpl;
    }

    $render(el, value, modifiers, (el, tmpl) => {
        tmpl = resolve(tmpl);
        if (!tmpl) return;

        if (!_render(el, toMods(tmpl))) return;

        if (mods.show) {
            if (mods.nonempty && !el.firstChild) {
                el.style.setProperty('display', "none", mods.important);
            } else {
                el.style.setProperty('display', mods.flex || mods.inline || "block", mods.important)
            }
        }
        return true;
    });

}

register(_alpine, { render: _render, Component: AlpineComponent, data, init, default: 1 });

export { AlpineComponent };

export default AlpineComponent;

export function AlpinePlugin(Alpine)
{
    _Alpine = Alpine;

    emit("alpine:init");

    Alpine.magic("app", (el) => app);

    Alpine.magic("params", (el) => {
        while (el) {
            if (el._x_params) return el._x_params;
            el = el.parentElement;
        }
    });

    Alpine.magic("component", (el) => (Alpine.closestDataStack(el).find(x => x.$type == _alpine && x.$name)));

    Alpine.magic("parent", (el) => (Alpine.closestDataStack(el).filter(x => x.$type == _alpine && x.$name)[1]));

    Alpine.directive("render", (el, { modifiers, expression }, { evaluate, cleanup }) => {
        const click = (e) => {
            const value = evaluate(expression);
            if (!value) return;
            e.preventDefault();
            if (modifiers.includes("stop")) {
                e.stopPropagation();
            }
            $render(el, value, modifiers, (el, tmpl) => (render(tmpl)));
        }
        $on(el, "click", click)
        el.style.cursor = "pointer";

        cleanup(() => {
            $off(el, 'click', click)
        })
    });

    Alpine.directive('template', (el, { modifiers, expression }, { effect, cleanup }) => {
        const evaluate = Alpine.evaluateLater(el, expression);
        var template;

        const empty = () => {
            template = null;
            Alpine.mutateDom(() => {
                $empty(el, (node) => Alpine.destroyTree(node));

                if (modifiers.includes("show")) {
                    el.style.setProperty('display', "none", modifiers.includes('important') ? 'important' : undefined);
                }
            })
        }

        effect(() => evaluate(value => {
            if (!value) return empty();

            if (value !== template) {
                $template(el, value, modifiers);
            }
            template = value;
        }))

        cleanup(empty);
    });

    Alpine.directive("scope-level", (el, { expression }, { evaluate }) => {
        const scope = Alpine.closestDataStack(el);
        el._x_dataStack = scope.slice(0, parseInt(evaluate(expression || "")) || 0);
    });

}

