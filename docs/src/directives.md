# Directives

## Directive: **x-template**

Render a template or component inside a container from the expression which must return a template URL/name or nothing to clear the container.

This is an alternative to the **x-if** Alpine directive especially with multiple top elements because x-if only supports one top element and
ablity to render server-side templates.

If the expression is URL like, i.e. **https?://** or **/path** or **file.html** it will be retrieved from the
server first and then rendered into the target.

To cache the HTML use the modifier **cache**, the path base name is used by default for cached template.

```html
<div x-template="template"></div>

<div x-template="show ? 'index' : ''"></div>

<div x-template.cache="show ? '/path/index.html' : ''"></div>
```

Modifiers:
 - **show** - behave as **x-show**, i.e. hide if no template and display if it is set, **x-template.show="..."**
 - **nonempty** - force to hide the container if it is empty even if the expression is not, only works with **show**
 - **flex** - set display to flex instead of block
 - **inline** - set display to inline-block instead of block
 - **important** - apply !important similar to **x-show**
 - **params.opts** - pass an object **opts** in the current scope as the **params** to the component, similar to **app.render({ name, params: opts })**
 - **cache** - cache external templates by name, the name is either the file name or special param **$name**
 - **post** - use the POST method when retrieving external template

The directive supports special parameters to be set in **this.params**, similar to **x-render**, for example:

```html
<div x-template="'docs?$nohistory=1&id=123'">Show</div>
```

The component **docs** will have **this.params.$nohistory** set to 1 on creation and **params.id=123**

The other way to pass params to be sure the component will not use by accident wrong data is to use modifier **.params.NAME**

```html
<div x-data="{ opts: { $nohistory: 1, docid: 123 } }">
    <div x-template.params.opts="'docs'">Show</div>
</div
```

The component docs will have **opts** as the **this.params**.

For HTML only templates the params passed in the url can be accessed via the **$params** magic, see below for examples.

## Directive: **x-render**

Binds to click event to display components. Can render components by name, path, or URL with parameters using **app.parsePath**.
Nothing happens in case the expression is empty. Event's default action is cancelled automatically.

If the expression is URL like, i.e. **https?://** or **/path** or **file.html** it will be retrieved from the
server first and then rendered into the target.

To cache the HTML use the modifier **cache**.

All query parameters will be stored in the component's **params** object or template's **$params** magic.

Special options include:

- **$target** - to define a specific container for rendering, it is always set in the params even if empty
- **$history** - to explicitly manage browser history.
- **$name** - a name to be used to cache external templates

Modifiers:
 - **stop** - stop event propagation
 - **cache** - cache external templates by name, the name is either the file name or special param **$name**
 - **post** - use the POST method when retrieving external template

```html
<a x-render="'hello/hi?reason=World'">Say Hello</a>

in the hello component this.params.reason will be set with 'World'

<button x-render="'index?$target=#div'">Show Bundled or Cached</button>

<button x-render.cache="'/index.html?$target=#div'">Show External</button>
```

## Directive: **x-scope-level**

Reduce data scope depth for the given element, it basically cuts off data inheritance at the requested depth.
Useful for sub-components not to interfere with parent's properties. In most cases declaring local properties would work but
limiting scope for children might as well be useful.

```html
<div x-scope-level></div>

<div x-scope-level=1></div>
```

## Directive: **x-droppable**

Adds drag-and-drop (and click-to-select) file upload behavior to an element.

 - Clicking the element triggers a click on a nested `<input type="file">`.
 - Dragging a file over/into the element sets `target.dragging = 1`.
 - Leaving/dropping resets `target.dragging = 0`.
 - Dropping a file emits a global app event: `"file:dropped"`, components can use `onFileDropped` method to receive such events
 - Whole components can be used as droppable targets using `$component` magic

```html
 <div x-data="{ dragging: 0 }" x-droppable="{ dragging }" :class="{ 'border-primary': dragging }">
     <input type="file" hidden />
     <p>Click or drag file here</p>
 </div>

<div x-droppable="$component" :class="{ 'border-primary': dragging }">
     <input type="file" hidden />
     <p>Click or drag file here</p>
 </div>

```
