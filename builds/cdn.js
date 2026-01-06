
import * as all from '../dist/app.mjs'

Object.assign(all.app, all)

window.app = all.app

all.$on(document, "alpine:init", () => { all.AlpinePlugin(Alpine) });
