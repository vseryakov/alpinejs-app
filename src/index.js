
export * from './events'
export * from './dom'
export * from './router'
export * from './render'
export * from './fetch'
export * from './app'

import { AlpineComponent, AlpinePlugin } from './alpine'

import Component from './component';

import { app } from './app'

app.Component = Component;

export { app, Component, AlpineComponent, AlpinePlugin }

export default app;
