
import { $data, AlpineComponent } from "../dist/app.mjs"

export class dropdown extends AlpineComponent {

    title = ""
    value = ""
    _parent = ""

    onCreate() {
        this._parent = this.$el.parentElement;
        var xdata = $data(this.$parent, 0);
        var options = xdata?.options || this.options;
        this.value = this._parent._x_model?.get() || xdata?.value || this._value(options[0]);
        this.title = this._title(options.find(x => (this.value == this._value(x))));
    }
    
    _title(item) {
        return item?.name || item || '';
    }
    
    _value(item) {
        return item?.value || item?.name || item || '';
    }
    
    _click(item) {
        this.value = this._parent.value = this._value(item);
        this.title = this._title(item);
        this._parent._x_model?.set(this.value);
        this.$dispatch("change", item);
    }
}
