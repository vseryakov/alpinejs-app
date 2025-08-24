# alpinejs-app

## A Simple Single Page Application (SPA) library for Alpine.js.

### The Vision

- to maintain a clear separation between HTML and JavaScript logic. This separation keeps presentation distinct from logic as much as possible. With Alpine.js, we now get efficient two-way data bindings and reactivity using even less code.

- to have some kind of central registry of HTML templates and Javascript classes and use it to register components.

The registry is just 2 global Javascript objects, `templates` and `components`.

How the registry is delivered to the browser depends on bundling or application, for example:

- bundle everything into a single file by converting HTML files to strings: see `examples/build.js` for a simple `esbuild` plugin
- keep HTML templates in JSON files to load separately via fetch on demand
- maintain HTML files on the server to load individually on demand similar to `htmx`

### Features

- **Components**: These are the primary building blocks of the UI. They can be either standalone HTML templates or HTML backed by JavaScript logic, capable of nesting other components.

- **Main Component**: Displays the current main page within the `#app-main` HTML element. It manages the navigation and saves the view to the browser history using `app.savePath`.

- **History Navigation**: Supports browser back/forward navigation by rendering the appropriate component on window `popstate` events, achieved using `app.restorePath`.

- **Direct Deep-Linking**: For direct access, server-side routes must redirect to the main app HTML page, with the base path set as '/app/' by default.

## Installation

### npm

```bash
npm install @vseryakov/alpinejs-app
```

### cdn

```html
<script src="https://unpkg.com/alpinejs-app@1.x.x/dist/app.min.js"></script>

<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
```

## Getting Started

Here's a simple hello world [example](examples/index.html).

Live demo is available at [demo](https://vseryakov.github.io/alpinejs-app/examples/index.html).

### index.html

```html
<head>
<script src="bundle.js"></script>
</head>

<body>
    <div id="app-main"></div>
</body>

<template id="index">
    <h5>This is the index component</h5>

    <button x-render="'hello/hi?reason=World'">Say Hello</button>
</template>

<template id="hello">
    <h5>This is the <span x-text=$name></span> component</h5>
    Param: <span x-text="params.param1"></span>
    <br>
    Reason: <span x-text="params.reason"></span>
    <br>

    <div x-template.show="template"></div>

    <button @click="toggle">Toggle</button>
    <button x-render="'index'">Back</button>
</template>
```

### index.js

```javascript
import '../dist/app.js'
import './hello'
import './dropdown'
import "./dropdown.html"
import "./example.html"

app.debug = 1
app.start();
```

### hello.js

``` javascript
app.components.hello = class extends app.AlpineComponent {
    template = ""

    toggle() {
        this.template = !this.template ? "example" : "";
    }
}
```

**What is happening:**

- The script defines a template and a component, `app.start` calls `app.restorePath` when the page is ready, defaulting to render `index` since the static path doesn’t match. (running locally with file:// origin will not replace history)
- The body includes a placeholder for the main app.
- The `index` template is the default starting page, with a button to display the `hello` component with parameters.
- Clicking 'Say Hello' switches the display to the `hello` component via `x-render` directive.
- The `hello` component is a class extending `app.AlpineComponent` with a toggle function.
- A `x-template` directive remains empty until the `template` variable is populated by clicking the 'Show' button, which triggers the component's toggle method to render the `example` template in the contained div. The `.show` modifier keeps the div hidden until template is set.
- The `example` template is defined in the `examples/example.html` file and bundled into bundle.js.

Nothing much, all the work is done by Alpine.js actually.

## Directive: `x-template`

Render a template or component inside the container from the expression which must return a template name or nothing to clear the container.

This can be an alternative to the `x-if` Alpine directive especially with multiple top elements because x-if only supports one top element.

```html
<div x-template="template"></div>

<div x-template="show ? 'index' : ''"></div>
```

Modifiers:
 - `show` - behave as `x-show`, i.e. hide if no template and display if it is set, `x-template.show="..."`
 - `nonempty` - force to hide the container if it is empty even if the expression is not, only works with `show`
 - `flex` - set display to flex instead of block
 - `inline` - set display to inline-block instead of block
 - `important` - apply !important similar to `x-show`
 - `params.opts` - pass an object `opts` in the current scope as the `params` to the component, similar to `app.render({ name, params: opts })`

The directive supports special parameters to be set in `this.params`, similar to `x-render`, for example:

    <div x-template="'docs?$nohistory=1'">Show</div>

The component `docs` will have `this.params.$nohistory` set to 1 on creation.

The other way to pass params to be sure the component will not use by accident wrong data is to use modifier `.params.NAME`

    <div x-data="{ opts: { $nohistory: 1, docid: 123 } }">
        <div x-template.params.opts="'docs'">Show</div>
    </div

The component docs will have `opts` as the `this.params`.

## Directive: `x-render`

Binds to click events to display components. Can set components via a syntax supporting names, paths, or URLs with parameters through `parsePath`.
Nothing happens in case the expression is empty. Event's default action is cancelled automatically.

Special options include:

- `$target` - to define a specific container for rendering, it is always set in the params even if empty
- `$history` - to explicitly manage browser history.

```html
<a x-render="'hello/hi?reason=World'">Say Hello</a>

<button x-render="'index?$target=#div'">Show</button>
```

## Directive: `x-scope-level`

Reduce data scope depth for the given element, it basically cuts off data inheritance at the requested depth.
Useful for sub-components not to interfere with parent's properties. In most cases declaring local properties would work but
limiting scope for children might as well be useful.

```html
<div x-scope-level></div>

<div x-scope-level=1></div>
```
## Magic: `$app`

The `$app` object is an alias to the global app object to be called directly in the Alpine.js directives.

```html
<a @click="$app.render('page/1/2?$target=#section')">Render Magic</a>

<a @click="$app.render({ name: 'page', params: { $target: '#section' }})">Render Magic</a>
```

## Magic: `$component`

The `$component` magic returns the immediate component. It may be convenient to directly call the component method or access property
to avoid confusion with intermediate `x-data` scopes especially if same property names are used.

```html
<a @click="$component.method()">Component Method</a>
```

## Magic: `$parent`

The `$parent` magic returns a parent component for the immediate component i.e. a parent for `$component` magic.

```html
<a @click="$parent.method()">Parent Method</a>
```

## Component Lifecycle and Event Handling

While Alpine.js has several ways how to reuse the data this app makes it more unified, it is opinionated of course.

Here is the life-cycle of a component:

- on creation a component calls `onCreate` method if exists. it can be created in derived class to implement custom initialization logic and create properties.
  At this time the context is already initialized, the `params` property is set with parameters passed in the render call and event handler for `component:event` is registered on the app.

- The `component:create` event is broadcasted with an object { name, element, params, component }

- when a component is removed from the DOM `onDelete` method is called to cleanup resources like event handlers, timers...

- app event `component:event` is sent to all live components, this can be used to broadcast important events happening and
  each component will decide what to do with it. This is uses app event emitter instead of DOM events to keep it separate and not overload
  browser with app specific messages.

### Using the example above:

Add a new button to the index template:

```html
<button x-render="'hello2'">Say Hello2</button>
```

Introduce another component:

### hello.js

```javascript
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
            super.toggle();
            app.emit(app.event, "toggle", this.template)
        }
    }
````

Changes to the previous example:

- A `hello2` template referencing existing `hello` for shared markup.
- A new `hello2` component extending from `hello`, showcasing class inheritance.

The `hello2` component takes advantage of the lifecycle methods to customize the behaviour:
- `onCreate` sets up initialization like overriding reasons and running a timer.
- `onDelete` manages cleanup by stopping timers.
- `toggle` method reuses the toggling but adds broadcasting changes via events.

For complete interaction, access live demo at the [index.html](https://vseryakov.github.io/alpinejs-app/examples/index.html).

## Custom Elements

Component classes are registered as Custom Elements with `app-` prefix,

using the example above hello component can be placed inside HTML as `<app-hello></app-hello>`.

See also how the [dropdown](examples/dropdown.js) component is implemented.


## Examples

The examples/ folder contains more components to play around and a bundle.sh script to show a simple way of bundling components together.

### Simple bundled example: [index.html](examples/index.html)

An example to show very simple way to bundle .html and .js files into a single file.

It comes with pre-created bundle, to rebuild:
- run `npm run demo`
- it will generate examples/bundle.js file that includes all HTML and Javascript code
- load it in the browser: `open examples/index.html`

### Esbuild app plugin

The `examples/build.js` script is an `esbuild` plugin that bundles templates from .html files to be used by the app.

Running `node build.js` in the examples folder will generate the `bundle.js` which includes all .js and .html files used by the index.html


## API

### Global settings

- `base: "/app/"`

  Defines the root path for the application, must be framed with slashes.

- `main: "#app-main"`

  Central app container for rendering main components.

- `index: "index"`

  Specifies a fallback component for unrecognized paths on initial load, it is used by `app.restorePath`.

- `templates: {}`

  HTML templates, this is the central registry of HTML templates to be rendered on demand,
  this is an alternative to using `<template>` tags which are kept in the DOM all the time even if not used.

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
  the `path:save` event. A component can globally disable history by creating a static property `$nohistory` in the class definition.

- `app.resolve(path, dflt)`

  Returns an object with `template` and `component` properties: `{ name, params, template, component }`.

  Calls `app.parsePath` first to resolve component name and params.

  The template property is set as:
   - try `app.templates[.name]`
   - try an element with ID `name` and use innerHTML
   - if not found and `dflt` is given try the same with it
   - if template texts starts with # it means it is a reference to another element's innerHTML,
      `otemplate` is set with the original template before replacing the `template` property
   - if template text starts with $ it means it is a reference to another template in `app.templates`,
      `otemplate` is set with the original template before replacing the `template` property

  The component property is set as:
   - try `app.components[.name]`
   - try `app.components[dflt]`
   - if resolved to a function return
   - if resolved to a string it refers to another component, try `app.templates[component]`,
      `ocomponent` is set with the original component string before replacing the `component` property

  if the `component` property is empty then this component is HTML template.


### Router

- `app.start`

  Setup default handlers:
   - on `path:restore` event call `app.restorePath` to render a component from the history
   - on `path:save` call `app.savePath` to save the current component in the history
   - on page ready call `app.restorePath` to render the initial page

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

  An alias to `document.querySelector`, doc can be an Element, empty or non-string selectors will return null

- `app.$on(element, event, callback)`

  An alias for `element.addEventListener`

- `app.$elem(name, ...arg)`

  Create a DOM element with attributes, `-name` means `style.name`, `.name` means a property `name`, all other are attributes,
  functions are event listeners

    ```app.$elem("div", "id", "123", "-display", "none", "._x-prop", "value", "click", () => {})```

- `app.$elem(name, object [, options])`

  Similar to above but all properties and attributes are taken from an object, in this form options can be passed, at the moment only
  options for addEventListener are supported.

    ```app.$elem("div", { id: "123", "-display": "none", "._x-prop": "value", click: () => {} }, { signal })```

- `app.$parse(text, format)`

  A shortcut to DOMParser, default is to return the .body.

  Second argument defined the result format:
   - `list` - the result will be an array with all body child nodes, i.e. simpler to feed it to Element.append()
   - `doc` - return the whole parsed document

    ```document.append(...app.$parse("<div>...</div>"), 'list'))```

- `app.$empty(element, cleanup)`

  Remove all nodes from the given element, call the cleanup callback for each node if given

- `app.$append(element, template, setup)`

  Append nodes from the template to the given element, call optional setup callback for each node.

  The `template` can be a string with HTML or a `<template>` element.

      ```app.$append(document, "<div>...</div>")```

- `app.$data(element, level)`

  Return component data instance for the given element or the main component if omitted. This is for
  debugging purposes or cases when calling some known method is required.

  if the `level` is not a number then the closest scope is returned otherwise only the requested scope at the level or undefined.
  This is useful for components to make sure they use only the parent's scope for example.

  This returns Proxy object, to get the actual object pass it to `Alpine.raw(app.$data())`


### Event emitter

The app implements very simple event emitter to handle internal messages separate from the DOM events.

There are predefined system events:

 - `alpine:init` - is sent on document alpine:init event from Alpine. Initializes custom elements at the moment, in case some components were loaded after
    app and Alpine loaded it is necessary to emit it again via `app.emit('alpine:init')`
 - `path:restore` - is sent by the window `popstate` event from `app.start`
 - `path:save` - is sent by `app.render` for main components only
 - `path:push` - is sent just before calling `history.pushState` with the path to be pushed
 - `component:create` - is sent when a new component is created, { type, name, element, params }
 - `component:delete` - is sent when a component is deleted, { type, name, element, params }
 - `component:event` - a generic event defined in `app.event` is received by every live component and is handled by `onEvent(...)` method if exist.
   Then convert the first string argument into camel format like `onFirstArg(...)` and call this method if exists

Methods:

- `app.on(event, callback, [namespace])`

  Listen on event, the callback is called synchronously, optional namespace allows deleting callbacks later easier by not providing
  exact function by just namespace.

- `app.once(event, callback, [namespace])`

  Listen on event, the callback is called only once

- `app.only(event, callback, [namespace])`

  Remove all current listeners for the given event, if a callback is given make it the only listener.

- `app.off(event, callback)`

  Remove all event listeners by event name and exact callback function

- `app.off(event, namespace)`

  Remove all event listeners by event name and namespace

- `app.off(namespace)`

  Remove all event listeners by namespace

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
   - `data(element)` - return the component class instance for the given element or the main
   - `default` - if not empty make this plugin default
   - `Component` - optional base component constructor, it will be registered as app.{Type}Component, like AlpineComponent, KoComponent,... to easy create custom components

  The reason for plugins is that while this is designed for Alpine.js, the idea originated by using Knockout.js with this system,
  the plugin can be found at [app.ko.js](https://github.com/vseryakov/backendjs/blob/master/web/js/app.ko.js).


## Author
  Vlad Seryakov

## License

Licensed under [MIT](https://github.com/vseryakov/alpinejs-app/blob/master/LICENSE)

