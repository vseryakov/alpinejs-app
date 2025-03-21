import { app, isString, isElement, toCamel } from './app';

class Component {
    params = {};

    constructor(name, params) {
        this.$name = name;
        Object.assign(this.params, params);
        this._handleEvent = handleEvent.bind(this);
        this._onCreate = this.onCreate || null;
        this._onDelete = this.onDelete || null;
    }

    init(params) {
        app.trace("init:", this.$type, this.$name);
        Object.assign(this.params, params);
        if (!this.params.$noevents) {
            app.on(app.event, this._handleEvent);
        }
        app.call(this._onCreate?.bind(this, this.params));
        app.emit("component:create", { type: this.$type, name: this.$name, component: this, element: this.$el, params: this.params });
    }

    destroy() {
        app.trace("destroy:", this.$type, this.$name);
        app.off(app.event, this._handleEvent);
        app.emit("component:delete", { type: this.$type, name: this.$name, component: this, element: this.$el, params: this.params });
        app.call(this._onDelete?.bind(this));
        this.params = {};
        delete this.$root;
    }

}

function handleEvent(event, ...args)
{
    if (this.onEvent) {
        app.trace("event:", this.$type, this.$name, event, ...args);
        app.call(this.onEvent?.bind(this.$data || this), event, ...args);
    }
    if (!isString(event)) return;
    var method = toCamel("on_" + event);
    if (!this[method]) return;

    app.trace("event:", this.$type, this.$name, method, ...args);
    app.call(this[method]?.bind(this.$data || this), ...args);
}

export default Component;
