
app.components.dropdown = class extends app.AlpineComponent {

    title = ""
    value = ""
    parent = ""

    onCreate() {
        var options = this.options;
        this.parent = this.$el.parentElement;
        this.value = this.parent._x_model?.get() || app.$data(this.parent)?.value || this._value(options[0]);
        this.title = this._title(options.find(x => (this.value == this._value(x))));
    }
    
    _title(item) {
        return item?.name || item || '';
    }
    
    _value(item) {
        return item?.value || item?.name || item || '';
    }
    
    _click(item) {
        this.value = this.parent.value = this._value(item);
        this.title = this._title(item);
        this.parent._x_model?.set(this.value);
        this.$dispatch("change", item);
    }
}
