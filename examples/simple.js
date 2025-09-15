(() => {
const app = window.app;
const _type = "simple";

class Component extends app.Component {

    static $type = _type;

    constructor(name, params) {
        super(name, params);
        this.$type = _type;
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

    app.$empty(element, (node) => {
        if (node._x_simple instanceof SimpleComponent) {
            app.call(node._x_simple, "destroy");
            delete node._x_simple;
        }
    })

    app.$append(element, options.template);
    if (options.component) {
        const obj = new options.component(options.name, options.params);
        obj.$root = obj.$el = element;
        app.call(obj, "init");
        element._x_simple = obj;
    }
    return options;
}

function data(element, level)
{
    if (!isElement(element)) element = app.$(app.$target + " div");
    return element?._x_simple;
}

function init()
{
    for (const [name, obj] of Object.entries(app.components)) {
        const tag = `app-${obj?.$tag || name}`;
        if (obj?.$type != _type || customElements.get(tag)) continue;
        customElements.define(tag, class extends Element {});
    }
}

app.plugin(_type, { render, Component, data, init });


})();

