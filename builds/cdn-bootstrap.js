
import app from './../src/index'

import * as bs from "./../src/bootstrap"
import * as lib from "./../src/lib"

Object.assign(app, bs);
Object.assign(app, lib);

window.app = app
