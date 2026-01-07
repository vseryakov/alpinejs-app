# Components

## Component Lifecycle and Event Handling

While Alpine.js has several ways how to reuse the data this app makes it more unified, it is opinionated of course.

Here is the life-cycle of a component:

- on creation a component calls **onCreate** method if exists. it can be created in derived class to implement custom initialization logic and create properties.
  At this time the context is already initialized, the **params** property is set with parameters passed in the render call and event handler for **component:event** is registered on the app.

- The **component:create** event is broadcasted with an object { name, element, params, component }

- when a component is removed from the DOM **onDelete** method is called to cleanup resources like event handlers, timers...

- app event **component:event** is sent to all live components, this can be used to broadcast important events happening and
  each component will decide what to do with it. This is uses app event emitter instead of DOM events to keep it separate and not overload
  browser with app specific messages.

### Using the example from {@tutorial start} tutorial:

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
```

Changes to the example from the {@tutorial start} tutorial:

- A **hello2** template referencing existing **hello** for shared markup.
- A new **hello2** component extending from **hello**, showcasing class inheritance.

The **hello2** component takes advantage of the lifecycle methods to customize the behaviour:
- **onCreate** sets up initialization like overriding reasons and running a timer.
- **onDelete** manages cleanup by stopping timers.
- **toggle** method reuses the toggling but adds broadcasting changes via events.

For complete interaction, access live demo at the [index.html](https://vseryakov.github.io/alpinejs-app/examples/index.html).

## Event emitter

The app implements very simple event emitter to handle internal messages separate from the DOM events.

There are predefined system events:

 - **alpine:init** - is sent on document alpine:init event from Alpine. Initializes custom elements at the moment, in case some components were loaded after
    app and Alpine loaded it is necessary to emit it again via **app.emit('alpine:init')**
 - **dom:changed** - fired on start and on every resize or color scheme change, the event is an object: **{ breakPoint, colorScheme }** where
   breakPoint is one of **xs, sm, md, lg, xl, xxl** and  colorScheme is one of **dark, light**
 - **path:restore** - is sent by the window **popstate** event from **app.start**
 - **path:save** - is sent by **app.render** for main components only
 - **path:push** - is sent just before calling **history.pushState** with the path to be pushed
 - **component:create** - is sent when a new component is created, { type, name, element, params }
 - **component:delete** - is sent when a component is deleted, { type, name, element, params }
 - **component:event** - a generic event defined in **app.event** is received by every live component and is handled by **onEvent(...)** method if exist.
   Then convert the first string argument into camel format like **onFirstArg(...)** and call this method if exists

## Custom Elements

Component classes are registered as Custom Elements with **app-** prefix,

using the example above hello component can be placed inside HTML as **<app-hello></app-hello>**.

See also how the [dropdown](examples/dropdown.js) component is implemented.


### Using as NPM module for ESM bundles

The library comes with CDN and ESM bundles:

- dist/app.js - CDN bundle with global window.app object
- dist/app-lib.js - Base bundle with additional tools from the src/lib.js
- dist/app-bootstrap.js - Lib bundle with Bootstrap showAlert/showToast functions

- dist/app.mjs - ESM module, nothing is global, all methods are exported


```bash
npm install @vseryakov/alpinejs-app alpinejs
```

```js
import Alpine from "alpinejs";
import { AlpinePlugin } from "alpinejs-app";

Alpine.plugin(AlpinePlugin);

window.Alpine = Alpine;
window.Alpine.start();
```

To use src/lib.js just import it in your code directly for example:


```js
import * as app from 'alpinejs-app/src/index'
import * as lib from 'alpinejs-app/src/lib'
```

## Examples

The examples/ folder contains more components to play around and a bundle.sh script to show a simple way of bundling components together.

### Simple CDN bundled example: [index.html](examples/index.html)

An example to show very simple way to bundle .html and .js files into a single file as
CDN bundle, i.e. window.app is global with all methods in it.

To run live example do `npm run start`.

Then go to http://localhost:8090/ to see the example with router and external rendering.

### Esbuild app plugin

The **scripts/esbuild-app.js** script is an **esbuild** plugin that bundles multiple .js and .html files to be used by the app.

Running `node build.js` in the examples folder will generate the **bundle.js** which includes all .js and .html files used by the index.html




