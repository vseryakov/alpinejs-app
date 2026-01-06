
import { app, call, isString, toCamel, trace } from './app';
import { emit, off, on } from "./events"

/**
 * Base class for components
 * @param {string} name - component name
 * @param {object} [params] - properties passed during creation
 * @class
 */
export class Component {
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
        trace("init:", this.$type, this.$name);
        Object.assign(this.params, params);
        emit("component:create", { type: this.$type, name: this.$name, component: this, element: this.$el, params: this.params });
        if (!this.params.$noevents) {
            on(app.event, this._handleEvent);
        }
        call(this._onCreate?.bind(this, this.params));
    }

    /**
     * Called when a component is about to be destroyed, calls __onDelete__ class method for custom cleanup
     */
    destroy() {
        trace("destroy:", this.$type, this.$name);
        off(app.event, this._handleEvent);
        emit("component:delete", { type: this.$type, name: this.$name, component: this, element: this.$el, params: this.params });
        call(this._onDelete?.bind(this));
        this.params = {};
        delete this.$root;
    }

}

/* eslint-disable no-invalid-this */

function handleEvent(event, ...args)
{
    if (this.onEvent) {
        trace("event:", this.$type, this.$name, event, ...args);
        call(this.onEvent?.bind(this.$data || this), event, ...args);
    }
    if (!isString(event)) return;
    var method = toCamel("on_" + event);
    if (!this[method]) return;

    trace("event:", this.$type, this.$name, method, ...args);
    call(this[method]?.bind(this.$data || this), ...args);
}

export default Component;
