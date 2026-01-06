# Getting Started

## Installation

### npm

```bash
npm install alpinejs-app
```

### cdn

These must be placed before your bundle.

```html
<script src="https://unpkg.com/alpinejs-app@1.x.x/dist/app.min.js"></script>
<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
```

### git

    git clone https://github.com/vseryakov/alpinejs-app.git

## First app

Here is how to build very simple Hello World app.

```shell
mkdir app && cd app

npm install alpinejs-app

sh ./node_modules/alpinejs-app/scripts/demo.sh
```

The files shown below will be created in the app folder, this is to save you from copy/pasting. The classes and styles are stripped for
brivity, the actual demo may contain some styles to make it look nicer.

The package.json is also created, now let's build our silly app and see how it works.

```shell
npm install
npm run watch
```

Point your browser to __http://localhost:8090/__ to see it in action.


### index.html

```html
<head>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>

<script src="bundle.js"></script>

</head>

<body>
    <div id="app-main"></div>
</body>

<template id="index">
    <h5>This is the index component</h5>

    <button x-render="'hello/hi?reason=World'">Say Hello</button>
</template>

```

### hello.html

```html
<h5>This is the <span x-text=$name></span> component</h5>

<p>
    First param from render url: <span x-text="params.param1"></span>
</p>

<p>
    Named param reason: <span x-text="params.reason"></span>
</p>

<div x-template.show="template"></div>

<button @click="toggle">Toggle</button>

<button x-render="'index'">Back</button>

```

### example.html

```html
<div>
    This is the example template
</div>
 ```

### index.js

```javascript
import 'alpinejs-app/dist/app.js'

import './hello'

import * as templates from './{hello,example}.html'
Object.assign(app.templates, templates)

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

- The script defines a template and a component, {@link start} calls {@link restorePath} when the page is ready, defaulting to render "index" since the static path doesn’t match. (running locally with file:// origin will not replace history)
- The body includes a placeholder for the main app.
- The "index" template is the default starting page, with a button to display the __hello__ component with parameters.
- Clicking 'Say Hello' switches the display to the __hello__ component via __x-render__ directive.
- The __hello__ component is a class extending {@link AlpineComponent} with a toggle function.
- A __x-template__ directive remains empty until the "template" variable is populated by clicking the 'Show' button, which triggers the component's toggle method to render the __example__ template in the contained div. The __.show__ modifier keeps the div hidden until template is set.
- The __example__ template is defined in the "examples/example.html" file and bundled into bundle.js.

Nothing much, all the work is done by Alpine.js actually.

A more complex example is at [demo](https://vseryakov.github.io/alpinejs-app/examples/index.html).

To continue go to the {@tutorial components}.

