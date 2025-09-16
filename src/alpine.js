import { app, isElement, isObj, isString } from './app';
import Component from './component';

const _alpine = "alpine";

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
            render(this, this.localName.substr(4));
        });
    }
}

function render(element, options)
{
    if (isString(options)) {
        options = app.resolve(options);
        if (!options) return;
    }

    app.$empty(element);
    element._x_params = Object.assign({}, options.params);

    if (!options.component) {
        Alpine.mutateDom(() => {
            app.$append(element, options.template, Alpine.initTree);
        });
    } else {
        // In case a component was loaded after alpine:init event
        Alpine.data(options.name, () => (new options.component(options.name)));

        const node = app.$elem("div", "x-data", options.name);
        app.$append(node, options.template);

        Alpine.mutateDom(() => {
            element.appendChild(node);
            Alpine.initTree(node);
        });
    }
    return options;
}

function data(element, level)
{
    if (!isElement(element)) element = app.$(app.$target + " div");
    if (!element) return;
    if (typeof level == "number") return element._x_dataStack?.at(level);
    return Alpine.closestDataStack(element)[0];
}

function init()
{
    for (const [name, obj] of Object.entries(app.components)) {
        const tag = `app-${obj?.$tag || name}`;
        if (obj?.$type != _alpine || customElements.get(tag)) continue;
        customElements.define(tag, class extends Element {});
        Alpine.data(name, () => (new obj(name)));
    }
}

function $render(el, value, modifiers, callback)
{
    const cache = modifiers.includes("cache");
    const method = modifiers.includes("post") ? app.post : app.fetch;

    if (!value.url && !(!cache && /^(https?:\/\/|\/|.+\.html(\?|$)).+/.test(value))) {
        if (callback(el, value)) return;
    }
    method(value, (err, text, info) => {
        if (err || !isString(text)) {
            return console.warn("$render: Text expected from", value, "got", err, text);
        }
        const tmpl = isString(value) ? app.parsePath(value) : value;
        tmpl.template = text;
        if (cache) {
            tmpl.name = tmpl.params?.$name || tmpl.name;
            app.templates[tmpl.name] = text;
        } else {
            tmpl.name = "";
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
                var scope = Alpine.$data(el);
                if (!isObj(scope[modifiers[i + 1]])) break;
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
        tmpl = app.resolve(tmpl);
        if (!tmpl) return;

        if (!render(el, toMods(tmpl))) return;

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

app.plugin(_alpine, { render, Component: AlpineComponent, data, init, default: 1 });

app.$on(document, "alpine:init", () => {

    app.emit("alpine:init");

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
            $render(el, value, modifiers, (el, tmpl) => (app.render(tmpl)));
        }
        app.$on(el, "click", click)
        el.style.cursor = "pointer";

        cleanup(() => {
            app.$off(el, 'click', click)
        })
    });

    Alpine.directive('template', (el, { modifiers, expression }, { effect, cleanup }) => {
        const evaluate = Alpine.evaluateLater(el, expression);
        var template;

        const empty = () => {
            template = null;
            Alpine.mutateDom(() => {
                app.$empty(el, (node) => Alpine.destroyTree(node));

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

});

