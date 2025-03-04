
app.components.hello = class extends app.AlpineComponent {
    template = ""

    toggle() {
        this.template = !this.template ? "example" : this.template == "example" ? "hello2" : "";
    }
}

app.templates.hello2 = "#hello"

app.components.hello2 = class extends app.components.hello {
    onCreate() {
        this.params.reason = "Hello2 World"
        this._timer = setInterval(() => { this.params.param1 = Date() }, 1000);
    }

    onDelete() {
        clearInterval(this._timer)
    }

    onPrepareDelete(event) {
        // Setting event.stop=1 will prevent rendering new component
    }

    onToggle(data) {
        console.log("received toggle event:", data)
    }

    toggle() {
        super.toggle()
        app.emit(app.event, "toggle", this.template)
    }
}

