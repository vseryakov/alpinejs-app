
app.templates["dropdown"]='<div class="dropdown">    <button type="button" class="btn btn-outline-dark dropdown-toggle" aria-haspopup="true" aria-expanded="false" data-bs-toggle="dropdown" x-text="title">    </button>    <div class="dropdown-menu">        <template x-for="item in options">            <a tabindex=-1 class="dropdown-item py-2" :class="value == _value(item) ? \'active\' : \'\'" @click="_click(item)">                <span x-text="_title(item)"></span>            </a>        </template>    </div></div>';

app.components.dropdown = class extends app.AlpineComponent {

    title = ""
    value = ""
    parent = ""

    onCreate() {
        this.$parent = this.$el.parentElement;
        this.$xdata = app.$data(this.$parent, 0);
        var options = this.$xdata?.options || this.options;
        this.value = this.$parent._x_model?.get() || this.$xdata?.value || this._value(options[0]);
        this.title = this._title(options.find(x => (this.value == this._value(x))));
    }
    
    _title(item) {
        return item?.name || item || '';
    }
    
    _value(item) {
        return item?.value || item?.name || item || '';
    }
    
    _click(item) {
        this.value = this.$parent.value = this._value(item);
        this.title = this._title(item);
        this.$parent._x_model?.set(this.value);
        this.$dispatch("change", item);
    }
}
