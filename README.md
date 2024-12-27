# alpinejs-app

## A Simple Single Page Application (SPA) library for Alpine.js.

### Why?

I still prefer to develop HTML markup part and Javascript part in separate files, to keep presentation and logic separately and
lie to use two-way bindings, used Knockoutjs for a long time but now use Alpinejs which covers bindings and reactivity perfectly
with less code.

This also makes bundling more flexible: can store everything in one bundle by converting HTML files into strings, store HTML templates in
downloadable JSON files to be imported from the app, keep files on the server and load individually...

### Main highlights:

Components are main UI elements.

A component is an HTML template or HTML template backed by a JavaScript class.

Components may contain other components and so forth.

There is a notion of a main component which is rendered inside the `#app-main` HTML element. It shows the current main page in the browser window.

Navigating is implemented by telling which component to show and automatically saved in the browser history by `savePath` if rendered as the main component.

The browser Window `popstate` event is handled when the Back button is hit and renders a component automatically using `restorePath`.

To be able navigate to the app in browser directly the server must redirect such links to the main app HTML page,
the default endpoint is set in `app.base` as '/app/'.

## Installation

### npm

```bash
npm install @vseryakov/alpinejs-app
```

### cdn

```html
<script src="https://unpkg.com/@vseryakov/alpinejs-app@1.x.x/dist/app.min.js"></script>

<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
```

## Getting Started

Below is a hello world style silly example.

```html
<head>
<script>
    app.templates.example = `<div>HTML only template inside <span x-text="$name"></span> showing <span x-text=template></span></div>`

    app.components.hello = class extends app.AlpineComponent {
        toggle() {
            this.template = !this.template ? "example" : "";
        }
    }

    app.$ready(app.restorePath);
</script>
</head>

<body>
    <div id="app-main"></div>
</body>

<template id="index">
    <h5>This is the index component</h5>
    <button x-render="'hello/123?reason=World'">Say Hello</button>
</template>

<template id="hello">
    <h5>This is the <span x-text=$name></span> component</h5>
    Param: <span x-text="params.param"></span><br>
    Reason: <span x-text="params.reason"></span><br>

    <div x-template></div>

    <button @click="toggle">Show Example</button>
    <button x-render="'index'">Back</button>
</template>
```
Explanation:

- the script defines a template and a component, then calls `restorePath` once the body is ready, it will render the `index` by default b/c the static path is not our app endpoint
- the body contains our main app placeholder
- the `index` template is our default main page, `x-render` directive points to our `hello` component with some parameters
- clicking on the 'Say Hello' link will render the `hello` component instead of the index inside the main container
- the hello component is more complicated but it is a typical Alpinejs template with `x-text` referring to the internal component properties
- the hello component extends `app.AlpineComponent` class to add our toggle function
- a new `x-template` directive renders nothing b/c the property it uses (template) is empty initially
- clicking on the button 'Toggle' calls hello component toggle method which changes the `template` property used by the x-template directive. It is rendered inside the x-template div.

Nothing much, all the work is done by Alpinejs actually.

## Render directive

A click event handler to show a component with parameters. It is a Alpinejs JavaScript expression so to show a static name it must be surrounded by quotes.
The component is a name or path or url to provide additional parameters to a component, see `parsePath` below.

Special parameters:

- `$target` - render a component inside a specific container.
- `$history` - ask to explicitly save in browser history.

```html
<a x-render="'hello/1/2?reason=World'">Say Hello</a>

<button class="btn btn-primary" x-render="'index?$target=#div'">Show</button>
```

## Template directive

Render a template or component inside the container, by default the expression is to use variable `template`,
it is defined in every `app.AlpineComponent` class.

On change a template or component is shown, this can be an alternative to the `x-if` Alpine directive.

```html
<div x-template></div>

<div x-template="template"></div>
```

## Magic $app

It references the app object so any method or property can be accessed directly. Programmatic rendering is the most useful feature.

```html
<a @click="$app.render('page/1/2?$target=#section')">Render Magic</a>

<a @click="$app.render({ name: 'page', params: { $target: '#section' }})">Render Magic</a>
```

## Component classes

While Alpinejs has several ways how to reuse the data this app makes it more unified, this is opinionated of course.

Here is the life-cycle of a component:

- on creation a component calls `onCreate` method if exists. it can be created in derived class to implement custom initialization logic and create properties.
  At this time the context is already initialized, the `params` property is set with parameters passed in the render call.
  an event handler for `component:event` is registered on the app.

- The `component:create` event is broadcasted with an object { name, element, params, component }

- when a component is removed from the DOM `onDelete` method is called to cleanup resources like event handlers, timers...

- app event `component:event` is sent to all live components, this can be used to broadcast important events happening and
  each component will decide what to do with it. This is uses app event emitter instead of DOM events to keep it separate and not overload
  browser with app specific messages.

### Now let's extend our example

Add a new button to the index template

```html
<button x-render="'hello2'">Say Hello2</button>
```

Create another component:

```javascript
    app.templates.example2 = `<div>Another template inside <span x-text="$app.base + $name"></span> showing template <span x-text=template></span></div>`

    app.templates.hello2 = "#hello"

    app.components.hello2 = class extends app.components.hello {
        onCreate() {
            this.params.reason = "Hello2 World"
            this._timer = setInterval(() => { this.params.param = Date() }, 1000);
        }

        onDelete() {
            clearInterval(this._timer)
        }

        onToggle(data) {
            console.log("received toggle event:", data)
        }

        toggle() {
            this.template = !this.template ? "example2" : "";
            app.emit(app.event, "toggle", this.template)
        }
    }
````

New things:

- an HTML template `example2` which is almost the same as previous example
- a new template `hello2` which points to `hello` element, reusing existing markup
- a new component class `hello2` which extends the existing hello component, this is basic JavaScript class usage

The new `hello2` component now uses provided life-cycle feature:
 - `onCreate` method overrides the reason and starts a timer
 - `onDelete` method deletes the timer
 - the toggle method is overridden to show new `example2` template and broadcast an event about it
 - `onToggle` method is an event handler only showing the "toggle" event

The "index.html" with this demo is included, try `open index.html` to see it in action.

## API

### Global settings

- `base: "/app/"`

  App base path, must start & end with /

- `main: "#app-main"`

  Main app element for main components

- `index: "index"`

  Default component to render when called `restorePath` on first load and the path is not recognized

- `templates: {}`

  HTML templates, this is local registry of HTML pieces to be rendered on demand,
  this is an alternative to using <template> tags which kept in the DOM all the time even if not used.

  This object can be populated in the bundle or loaded later as JSON, this all depends on the application environment.

- `components: {}`

  Component classes, this is registry of all components logic to be used with corresponding templates.
  Only classed derived from `app.AlpineComponent` will be used, internally they are registered with `Alpine.data()` to be reused by name.

### Rendering

- `app.render(options, dflt)`

  Show a component, `options` can be a string to be parsed by `parsePath` or an object `{ name, params }`.
  if no `params.$target` provided a component will be shown inside the main element defined by `app.main`.

  When showing main app the current component is asked to be deleted first via `beforeDelete` method.
  If it returns `false` the render is cancelled immediately.

- `app.resolve(path, dflt)`

  Returns an object with `template` and `component` properties: `{ name, params, template, component }`
  Calls `app.parsePath` first to resolve component name and params.

  The template property is set as:
   - try `app.templates[.name]`
   - try an element with ID `name` and use innerHTML
   - if not found and `dflt` is given try the same with it
   - if template texts starts with # it means it is a reference to another element's innerHTML
   - if template text starts with $ it means it is a reference to another template in `app.templates`

  The component property is set as:
   - try `app.components[.name]`
   - try `app.components[dflt]`
   - if resolved to a function return
   - if resolved to a string it refers to another component, try `app.templates[component]`

  if the `component` property is empty then this component is HTML template.

### Router

- `app.restorePath(path, dflt)`

  Show a component by path, it is called on `window.popstate` event by default and is used
  to show first component on initial page load. Empty path means to use current location. If the
  path is not recognized or no component is found then the default `dflt` component is shown.

- `app.savePath(options)`

  Saves the given component in the history as `/name/param/param2/param3/...`, this is called on every
  `component:create` event for main components.

- `app.parsePath(path, dflt)`

  Parses component path and returns an object `{ name, params }` ready for rendering. External urls are ignored.

  The path can be:
   - component name
   - relative path: name/param/param2/param3/....
   - absolute path: /app/name/param/paarm2/...
   - URL: https://host/app/name/param/...

   All parts from the path and query parameters will be placed in the `params` object.

### DOM utilities

- `app.$ready(callback)`

  Run callback once the document is loaded and ready, it uses setTimeout to schedule callbacks

- `app.$(selector[, doc])`

  An alias to `document.querySelector`, doc can be an Element

- `app.$on(element, event, callback)`

  An alias for `element.addEventListener`

- `app.$elem(name, ...arg)`

  Create a DOM element with attributes, `.name` means style.name, `:name` means a property `name`, all other are attributes,
  functions are event listeners

    ```app.$elem("div", "id", "123", ".display", "none", ":_x-prop", "value", "click", () => {})```


### Event emitter

The app implements very simple event emitter to handle internal messages separate from the DOM events.

There are predefined system events:

 - `component:create` - is sent when a new component is rendered, { type, name, element, params }
 - `component:delete` - is sent when a component is deleted, { type, name, element, params }
 - `component:event` - a generic event defined in `app.event` is received by every live component and is handled by `onEvent(...)` method if exist.
   Then convert the first string argument into camel format like `onFirstArg(...)` and call this method if exists

Methods:

- `app.on(event, callback)`

  Listen on event, the callback is called synchronously

- `app.off(event, callback)`

  Remove event listener

- `app.emit(event, ...args)`

  Send an event to all listeners at once, one by one


### General utilities

- `app.call(obj, method, ...arg)`

  Call a function safely with context and arguments:
   - app.call(func,..)
   - app.call(context, func, ...)
   - app.call(context, method, ...)

- `app.fetch(options, callback)`

  Fetch remote content, wrapper around Fetch API, options are compatible to $.ajax:
   - type - GET,... POST is default
   - data - a body, can be a string, an object, FormData
   - dataType - explicit return type: text, blob, default is auto detected between text or json
   - headers - an object with additional headers to send

  The callback(err, data, info) - where info is an object { status, headers, type }

- `app.trace(...)`

  if `app.debug` is set then trace will log in the console

### Advanced

- `app.plugin(name, options)`

  Register a render plugin, at least 2 functions must be defined in the options object:
   - `render(element, options)` - show a component, called by `app.render`
   - `context(element)` - return the component or data context for the root element
   - `cleanup(element)` - optional, run additional cleanups before destroying a component
   - `default` - if not empty make this plugin default
   - `Component` - optional base component constructor, it will be registered as app.{Type}Component, like AlpineComponent, KoComponent,... to easy create custom components

  The reason for plugins is that while this is designed for Alpinejs, the idea originated by using Knockoutjs with this system,
  the plugin can be found at [app.ko.js](https://github.com/vseryakov/backendjs/blob/master/web/js/app.ko.js).

## Author
  Vlad Seryakov

## License

Licensed under [MIT](https://github.com/vseryakov/alpinejs-app/blob/master/LICENSE)
