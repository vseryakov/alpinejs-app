# Magics


## Magic: **$app**

The **$app** object is an alias to the global app object to be called directly in the Alpine.js directives.

```html
<a @click="$app.render('page/1/2?$target=#section')">Render Magic</a>

<a @click="$app.render({ name: 'page', params: { $target: '#section' }})">Render Magic</a>
```

## Magic: **$component**

The **$component** magic returns the immediate component. It may be convenient to directly call the component method or access property
to avoid confusion with intermediate **x-data** scopes especially if same property names are used.

```html
<a @click="$component.method()">Component Method</a>
```

## Magic: **$parent**

The **$parent** magic returns a parent component for the immediate component i.e. a parent for **$component** magic.

```html
<a @click="$parent.method()">Parent Method</a>
```

## Magic: **$params**

The **$params** magic returns the **params** object from the current or first parent element,
it works for both components and HTML only templates.

The params object is query parameters passed via URL or an object passed directly to **app.render**.

```html
<a x-render="'hello?$target=h&t='+Date.now()">Show</a>

<template id="hello">
    This template was rendered at <span x-text="new Date(parseInt($params.t))"></span>
</div>
```
