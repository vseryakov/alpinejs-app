# alpinejs-app

## A Simplest Single Page Application (SPA) library for Alpine.js.

### The Vision

- **_To maintain a clear separation between HTML and JavaScript logic._**

  This separation keeps presentation distinct from logic as much as possible and have as few abstractions as possible.

  Develop layout with HTML/CSS and the logic with Alpine.js for two-way data bindings and reactivity.

- **_To have some kind of central registry of HTML templates and Javascript classes and use it to register components._**

  The registry is just 2 properties in the global **app** object, **app.templates** and **app.components**.

  Server-side rendering of templates (similar to **htmx**) is supported out of the box, same directives render bundled or
  remote HTML templates the same way without any external dependencies.

  How the registry is delivered to the browser depends on bundling or application, for example:

  Native support:

   - esbuild: bundle everything into a single file by importing multiple JS/HTML files: see **scripts/build-app.js** for a simple **esbuild** plugin
   - server-side: maintain HTML files on the server to load individually on demand using the same directives, see **examples/dashboard.html**.

  More ideas:

   - keep HTML templates in JSON files to load separately via fetch on demand or via importmap
   - include your .js files in the HTML for small apps and let the browser to handle caching

### Features

- **Components**: These are the primary building blocks of the UI. They can be either standalone HTML templates or HTML backed by JavaScript classes, capable of nesting other components.

- **Main Component**: Displays the current main page within the **#app-main** HTML element. It manages the navigation and saves the view to the browser history using **app.savePath**.

- **History Navigation**: Supports browser back/forward navigation by rendering the appropriate component on window **popstate** events, achieved using **app.restorePath**.

- **Direct Deep-Linking**: For direct access, server-side routes must redirect to the main app HTML page, with the base path set as '/app/' by default.

## Getting started

Visit the [tutorial](https://vseryakov.github.io/alpinejs-app/docs/web/tutorial-start.html).


## Full documentation

Visit the [documentation](https://vseryakov.github.io/alpinejs-app/docs/web/index.html).


## Live demo

Available at [demo](https://vseryakov.github.io/alpinejs-app/examples/index.html).

_External rendering is not working due pages only serving static content, local demo shows server-side rendering._

## Author
  Vlad Seryakov

## License

Licensed under [MIT](https://github.com/vseryakov/alpinejs-app/blob/master/LICENSE)

