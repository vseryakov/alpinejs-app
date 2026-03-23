
import "./cdn"

import * as lib from "./../src/lib"
Object.assign(window.app, lib);

import * as ws from "./../src/ws"
Object.assign(window.app, ws);

