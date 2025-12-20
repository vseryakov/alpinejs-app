
import { app, isString, toCamel } from './app';

/**
 * Base class for components
 * @param {string} name - component name
 * @param {object} [params] - properties passed during creation
 * @class
 */
class Component {
    params = {};

    constructor(name, params) {
        this.$name = name;
        Object.assign(this.params, params);
        this._handleEvent = handleEvent.bind(this);
        this._onCreate = this.onCreate || null;
        this._onDelete = this.onDelete || null;
    }

    /**
     * Called immediately after creation, after event handler setup it calls the class
     * method __onCreate__ to let custom class perform its own initialization
     * @param {object} params - properties passed
     */
    init(params) {
        app.trace("init:", this.$type, this.$name);
        Object.assign(this.params, params);
        app.emit("component:create", { type: this.$type, name: this.$name, component: this, element: this.$el, params: this.params });
        if (!this.params.$noevents) {
            app.on(app.event, this._handleEvent);
        }
        app.call(this._onCreate?.bind(this, this.params));
    }

    /**
     * Called when a component is about to be destroyed, calls __onDelete__ class method for custom cleanup
     */
    destroy() {
        app.trace("destroy:", this.$type, this.$name);
        app.off(app.event, this._handleEvent);
        app.emit("component:delete", { type: this.$type, name: this.$name, component: this, element: this.$el, params: this.params });
        app.call(this._onDelete?.bind(this));
        this.params = {};
        delete this.$root;
    }

}

/* eslint-disable no-invalid-this */

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
