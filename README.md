# alpinejs-app

## A Simple Single Page Application (SPA) library for Alpine.js.

### The Motivation

The rationale behind `alpinejs-app` is the preference to maintain a clear separation between HTML and JavaScript logic. This separation keeps presentation distinct from logic, a methodology introduced a long time ago. With Alpine.js, we now get efficient two-way data bindings and reactivity using even less code.

This structure also offers flexible bundling options: bundle everything into a single file by converting HTML to strings, keep HTML templates in JSON files to load separately, or maintain them on the server to load individually.

### Key Features

- **Components**: These are the primary building blocks of the UI. They can be either standalone HTML templates or HTML backed by JavaScript logic, capable of nesting other components.

- **Main Component**: Displays the current main page within the `#app-main` HTML element. It manages the navigation and saves the view to the browser history using `savePath` when it's the main view.

- **History Navigation**: Supports browser back/forward navigation by rendering the appropriate component on window `popstate` events, achieved using `restorePath`.

- **Direct Deep-Linking**: For direct access, server-side routes must redirect to the main app HTML page, with the base path set as '/app/' by default.

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

Here's a simple introductory example featuring a hello world scenario.

```html
<head>
<script>
    app.templates.example = `<div>HTML only template inside <span x-text="$name"></span> showing <span x-text=template></span></div>`

    app.components.hello = class extends app.AlpineComponent {
        toggle() {
            this.template = !this.template ? "example" : "";
        }
    }

    app.start();
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
    Param: <span x-text="params.param1"></span><br>
    Reason: <span x-text="params.reason"></span><br>

    <div x-template></div>

    <button @click="toggle">Show Example</button>
    <button x-render="'index'">Back</button>
</template>
```

**Explanation:**

- The script defines a template and a component, `app.start` calls `restorePath` when the page is ready, defaulting to render `index` since the static path doesn’t match.
- The body includes a placeholder for the main app.
- The `index` template is the default starting page, with a `x-render` directive for displaying the `hello` component with parameters.
- Clicking 'Say Hello' switches the display to the `hello` component.
- The `hello` component is a typical Alpine.js setup involving `x-text` for displaying component properties.
- The component extends `app.AlpineComponent` to include a toggle function.
- A `x-template` directive remains empty until the template variable is populated by clicking the 'Toggle' button, which triggers the component's toggle method to render the `example` template in the contained div.

Nothing much, all the work is done by Alpinejs actually.

## Render directive

Binds to click events to display components. Can set components via a syntax supporting names, paths, or URLs with parameters through `parsePath`.

Special options include:

- `$target` - to define a specific container for rendering.
- `$history` - to explicitly manage browser history.

```html
<a x-render="'hello/1/2?reason=World'">Say Hello</a>

<button class="btn btn-primary" x-render="'index?$target=#div'">Show</button>
```

## Template directive

Render a template or component inside the container, by default the expression is to use variable `template`,
it is defined in every `app.AlpineComponent` class.

This can be an alternative to the `x-if` Alpine directive.

```html
<div x-template></div>

<div x-template="template"></div>
```

## Magic $app

The `$app` object opens access to app-wide methods and properties, enabling features such as programmatic rendering.

```html
<a @click="$app.render('page/1/2?$target=#section')">Render Magic</a>

<a @click="$app.render({ name: 'page', params: { $target: '#section' }})">Render Magic</a>
```

### Component Lifecycle and Event Handling

While Alpinejs has several ways how to reuse the data this app makes it more unified, this is opinionated of course.

Here is the life-cycle of a component:

- on creation a component calls `onCreate` method if exists. it can be created in derived class to implement custom initialization logic and create properties.
  At this time the context is already initialized, the `params` property is set with parameters passed in the render call and event handler for `component:event` is registered on the app.

- The `component:create` event is broadcasted with an object { name, element, params, component }

- when a component is removed from the DOM `onDelete` method is called to cleanup resources like event handlers, timers...

- app event `component:event` is sent to all live components, this can be used to broadcast important events happening and
  each component will decide what to do with it. This is uses app event emitter instead of DOM events to keep it separate and not overload
  browser with app specific messages.

In extending the example:

Add a new button to the index template:

```html
<button x-render="'hello2'">Say Hello2</button>
```

Introduce another component:

```javascript
    app.templates.example2 = `<div>Another template inside <span x-text="$app.base + $name"></span> showing template <span x-text=template></span></div>`

    app.templates.hello2 = "#hello"

    app.components.hello2 = class extends app.components.hello {
        onCreate() {
            this.params.reason = "Hello2 World"
            this._timer = setInterval(() => { this.params.param1 = Date() }, 1000);
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

Key additions include:

- An additional HTML template `example2` paralleling the previous example structure.
- A `hello2` template referencing `hello` for shared markup.
- A new `hello2` component extending from `hello`, showcasing class inheritance.

The `hello2` component utilizes lifecycle methods:
- `onCreate` sets up initialization like overriding reasons and running a timer.
- `onDelete` manages cleanup by stopping timers.
- `toggle` method now highlights template toggling and broadcasts changes via events.

For complete interaction, access the "index.html" included, and experiment by opening it.

## API

### Global settings

- `base: "/app/"`

  Defines the root path for the application, must be framed with slashes.

- `main: "#app-main"`

  Central app container for rendering main components.

- `index: "index"`

  Specifies a fallback component for unrecognized paths on initial load, it is used by `restorePath`.

- `templates: {}`

  HTML templates, this is the central registry of HTML templates to be rendered on demand,
  this is an alternative to using <template> tags which are kept in the DOM all the time even if not used.

  This object can be populated in the bundle or loaded later as JSON, this all depends on the application environment.

- `components: {}`

  Component classes, this is the registry of all components logic to be used with corresponding templates.
  Only classed derived from `app.AlpineComponent` will be used, internally they are registered with `Alpine.data()` to be reused by name.


### Rendering

- `app.render(options, dflt)`

  Show a component, `options` can be a string to be parsed by `parsePath` or an object `{ name, params }`.
  if no `params.$target` provided a component will be shown inside the main element defined by `app.main`.

  It returns the resolved component as described in `resolve` method after rendering or nothing if nothing was shown.

  When showing main app the current component is asked to be deleted first by sending an event `prepare:delete`, a component that is not ready to be deleted yet
  must set the property `event.stop` in the event handler `onPrepareDelete(event)` in order to prevent rendering new component.

  To explicitly disable history pass `options.nohistory` or `params.$nohistory` otherwise main components are saved automatically by sending
  the `path:save` event.

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

- `app.start`

  Setup default handlers:
   - on `path:restore` event call `restorePath` to render a component from the history
   - on `path:save` call `savePath` to save the current component in the history
   - on page ready call `restorePath` to render the initial page

   **If not called then no browser history will not be handled, up to the app to do it some other way.**. One good
   reason is to create your own handlers to build different path and then save/restore.

- `app.restorePath(path)`

  Show a component by path, it is called on `path:restore` event by default from `app.start` and is used
  to show first component on initial page load. If the path is not recognized or no component is
  found then the default `app.index` component is shown.

- `app.savePath(options)`

  Saves the given component in the history as `/name/param1/param2/param3/...`.

  It is called on every `component:create` event for main components as a microtask,
  meaning immediate callbacks have a chance to modify the behaviour.

- `app.parsePath(path, dflt)`

  Parses component path and returns an object `{ name, params }` ready for rendering. External urls are ignored.

  The path can be:
   - component name
   - relative path: name/param1/param2/param3/....
   - absolute path: /app/name/param1/param2/...
   - URL: https://host/app/name/param1/...

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

 - `path:restore` - is sent by the window `popstate` event from `app.start`
 - `path:save` - is sent by `app.render` for main components only
 - `component:create` - is sent when a new component is created, { type, name, element, params }
 - `component:delete` - is sent when a component is deleted, { type, name, element, params }
 - `component:event` - a generic event defined in `app.event` is received by every live component and is handled by `onEvent(...)` method if exist.
   Then convert the first string argument into camel format like `onFirstArg(...)` and call this method if exists

Methods:

- `app.on(event, callback)`

  Listen on event, the callback is called synchronously

- `app.off(event, callback)`

  Remove event listener

- `app.emit(event, ...args)`

  Send an event to all listeners at once, one by one.

  If the event ends with `:*` it means notify all listeners that match the beginning of the given pattern, for example:

      `app.emit("topic:*",....)` will notify `topic:event1`, `topic:event2`, ...


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

  if `app.debug` is set then it will log arguments in the console


### Advanced

- `app.plugin(name, options)`

  Register a render plugin, at least 2 functions must be defined in the options object:
   - `render(element, options)` - show a component, called by `app.render`
   - `cleanup(element)` - optional, run additional cleanups before destroying a component
   - `default` - if not empty make this plugin default
   - `Component` - optional base component constructor, it will be registered as app.{Type}Component, like AlpineComponent, KoComponent,... to easy create custom components

  The reason for plugins is that while this is designed for Alpinejs, the idea originated by using Knockoutjs with this system,
  the plugin can be found at [app.ko.js](https://github.com/vseryakov/backendjs/blob/master/web/js/app.ko.js).


## Author
  Vlad Seryakov

## License

Licensed under [MIT](https://github.com/vseryakov/alpinejs-app/blob/master/LICENSE)

Some parts of the documentation are produced by ChatGPT.

