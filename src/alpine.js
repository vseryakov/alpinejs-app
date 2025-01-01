import app from './app';

const _alpine = "alpine";

class Component {
    // x-template dynamic rendering
    template = "";
    // Render options
    params = {};

    static $type = _alpine;
    static _id = 0;

    constructor(name, params) {
        this.$name = name;
        this.$_id = `${name}:${_alpine}:${Component._id++}`;
        Object.assign(this.params, params);
        this._handleEvent = this.handleEvent.bind(this);
    }

    init() {
        app.trace("init:", this.$_id);
        Object.assign(this.params, this.$el._x_params);
        app.call(this.onCreate?.bind(this));
        if (!this.params.$noevents) {
            app.on(app.event, this._handleEvent);
        }
        app.emit("component:create", { type: _alpine, name: this.$name, component: this, element: this.$el, params: Alpine.raw(this.params) });
    }

    destroy() {
        app.trace("destroy:", this.$_id);
        app.off(app.event, this._handleEvent);
        app.emit("component:delete", { type: _alpine, name: this.$name, component: this, element: this.$el, params: Alpine.raw(this.params) });
        app.call(this.onDelete?.bind(this));
        this.params = {};
    }

    handleEvent(event, ...args) {
        app.trace("event:", this.$_id, ...args)
        app.call(this.onEvent?.bind(this.$data), event, ...args);
        if (typeof event != "string") return;
        var method = ("on_" + event).toLowerCase().replace(/[.:_-](\w)/g, (_, char) => char.toUpperCase());
        app.call(this[method]?.bind(this.$data), ...args);
    }

}

class Element extends HTMLElement {

    connectedCallback() {
        render(this, this.getAttribute("template") || this.localName.substr(Alpine.prefixed().length));
    }

}

function render(element, options)
{
    if (typeof options == "string") {
        options = app.resolve(options);
        if (!options) return;
    }

    // Remove existing elements, allow Alpine to cleanup
    app.$empty(element)

    // Add new elements
    const body = new DOMParser().parseFromString(options.template, "text/html").body;
    if (!options.component) {
        Alpine.mutateDom(() => {
            while (body.firstChild) {
                const node = body.firstChild;
                element.appendChild(node);
                if (node.nodeType != 1) continue;
                Alpine.addScopeToNode(node, {}, element);
                Alpine.initTree(node);
            }
        });
    } else {
        // In case a component was loaded after alpine:init event
        Alpine.data(options.name, () => (new options.component(options.name)));
        const node = app.$elem("div", "x-data", options.name, ":_x_params", options.params);
        while (body.firstChild) {
            node.appendChild(body.firstChild);
        }

        Alpine.mutateDom(() => {
            element.appendChild(node);
            Alpine.initTree(node);
            delete node._x_params;
        });
    }
}

app.plugin(_alpine, { render, Component, default: 1 });

app.on("alpine:init", () => {
    for (const [name, obj] of Object.entries(app.components)) {
        if (obj?.$type != _alpine || customElements.get(Alpine.prefixed(name))) continue;
        customElements.define(Alpine.prefixed(name), class extends Element {});
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

    Alpine.directive('template', (el, { expression }, { effect, cleanup }) => {
        const evaluate = Alpine.evaluateLater(el, expression || "template");

        const hide = () => {
            Alpine.mutateDom(() => {
                app.$empty(el, (node) => Alpine.destroyTree(node));
            })
        }

        effect(() => evaluate(value => {
            value ? render(el, value) : hide()
        }))

        cleanup(hide);
    });

});


