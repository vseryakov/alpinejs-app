import { app } from './app'

import './events'
import './dom'
import './router'
import './render'
import './fetch'
import './alpine'
import Component from './component';
app.Component = Component;

import * as lib from "./lib"

export { app, lib };
