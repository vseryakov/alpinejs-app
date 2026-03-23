
import * as all from '../src/index.js'

for (const p in all) if (p != "app") all.app[p] = all[p]

window.app = all.app

all.$on(document, "alpine:init", () => { all.AlpinePlugin(Alpine) });
