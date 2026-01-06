
import Alpine from "../dist/alpinejs.mjs"

import { AlpinePlugin, app, on, start } from '../dist/app.mjs'

import * as components from './{hello,dashboard,dropdown,todo}.js'

Object.assign(app.components, components);

import * as templates from "./{hello,dashboard,dropdown,example,todo}.html"

Object.assign(app.templates, templates);

window.app = app;
app.debug = 1
start();

on('dom:changed', (ev) => {
    document.documentElement.setAttribute('data-bs-theme', ev.colorScheme);
});

Alpine.plugin(AlpinePlugin);

Alpine.start();
