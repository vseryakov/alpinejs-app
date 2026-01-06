
import * as all from '../dist/app.mjs'

var app = window.app = all.app;

Object.assign(app, all)

import * as components from './{hello,dropdown,todo,dashboard}.js'

Object.assign(app.components, components);

import * as templates from "./{hello,dashboard,dropdown,example,todo}.html"

Object.assign(app.templates, templates);

app.debug = 1
app.start();
all.$on(document, "alpine:init", () => { all.AlpinePlugin(Alpine) });

import Alpine from "../dist/alpinejs.mjs"
window.Alpine = Alpine;
Alpine.start();
