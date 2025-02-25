import { app, isString, isElement, toCamel } from './app';

const _alpine = "alpine";

class Component {
    params = {};

    static $type = _alpine;

    constructor(name, params) {
        this.$name = name;
        Object.assign(this.params, params);
        this._handleEvent = this.handleEvent.bind(this);
    }

    init() {
        app.trace("init:", this.$name);
        Object.assign(this.params, this.$el._x_params);
        app.call(this.onCreate?.bind(this));
        if (!this.params.$noevents) {
            app.on(app.event, this._handleEvent);
        }
        app.emit("component:create", { type: _alpine, name: this.$name, component: this, element: this.$el, params: Alpine.raw(this.params) });
    }

    destroy() {
        app.trace("destroy:", this.$name);
        app.off(app.event, this._handleEvent);
        app.emit("component:delete", { type: _alpine, name: this.$name, component: this, element: this.$el, params: Alpine.raw(this.params) });
        app.call(this.onDelete?.bind(this));
        this.params = {};
    }

    handleEvent(event, ...args) {
        if (this.onEvent) {
            app.trace("event:", this.$name, event, ...args);
            app.call(this.onEvent?.bind(this.$data), event, ...args);
        }
        if (!isString(event)) return;
        var method = toCamel("on_" + event);
        if (!this[method]) return;
        app.trace("event:", this.$name, method, ...args);
        app.call(this[method]?.bind(this.$data), ...args);
    }

}

class Element extends HTMLElement {

    connectedCallback() {
        queueMicrotask(() => {
            render(this, this.getAttribute("template") || this.localName.substr(4));
        });
    }
}

function render(element, options)
{
    if (isString(options)) {
        options = app.resolve(options);
        if (!options) return;
    }

    // Remove existing elements, allow Alpine to cleanup
    app.$empty(element)

    // Add new elements
    const doc = app.$parse(options.template, "doc");
    if (!options.component) {
        Alpine.mutateDom(() => {
            while (doc.head.firstChild) {
                element.appendChild(doc.head.firstChild);
            }
            while (doc.body.firstChild) {
                const node = doc.body.firstChild;
                element.appendChild(node);
                if (node.nodeType != 1) continue;
                Alpine.initTree(node);
            }
        });
    } else {
        // In case a component was loaded after alpine:init event
        Alpine.data(options.name, () => (new options.component(options.name)));
        const node = app.$elem("div", "x-data", options.name, "._x_params", options.params);
        while (doc.head.firstChild) {
            element.appendChild(doc.head.firstChild);
        }
        while (doc.body.firstChild) {
            node.appendChild(doc.body.firstChild);
        }

        Alpine.mutateDom(() => {
            element.appendChild(node);
            Alpine.initTree(node);
            delete node._x_params;
        });
    }
    return options;
}

function data(element, level)
{
    if (!isElement(element)) element = app.$(app.main + " div");
    if (!element) return;
    if (typeof level == "number") return element._x_dataStack?.at(level);
    return Alpine.closestDataStack(element)[0];
}

app.plugin(_alpine, { render, Component, data, default: 1 });

app.on("alpine:init", () => {
    for (const [name, obj] of Object.entries(app.components)) {
        const tag = `app-${obj?.$tag || name}`;
        if (obj?.$type != _alpine || customElements.get(tag)) continue;
        customElements.define(tag, class extends Element {});
        Alpine.data(name, () => (new obj(name)));
    }
});

app.$on(document, "alpine:init", () => {

    app.emit("alpine:init");

    Alpine.magic('app', (el) => app);

    Alpine.directive('render', (el, { modifiers, expression }, { evaluate, cleanup }) => {
        const click = (e) => {
            e.preventDefault()
            app.render(evaluate(expression));
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
                if (render(el, value)) {
                    if (modifiers.includes("show")) {
                        el.style.setProperty('display',
                                             modifiers.includes('flex') ? 'flex' :
                                             modifiers.includes('inline') ? "inline-block": "block",
                                             modifiers.includes('important') ? 'important' : undefined)
                    }
                }
            }
            template = value;
        }))

        cleanup(empty);
    });

    Alpine.directive("scope-level", (el, { expression }, { evaluate }) => {
        const scope = Alpine.closestDataStack(el);
        el._x_dataStack = scope.slice(0, parseInt(evaluate(expression)) || 0);
    });


});

