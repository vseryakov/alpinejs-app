const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

let appPlugin = {
    name: 'app',
    setup(build) {
        build.onLoad({ filter: /\.html$/ }, async (args) => {
            let text = await fs.promises.readFile(args.path, 'utf8')
            return {
                contents: `app.templates.${path.basename(args.path, ".html")} = '${text.replace(/[\n\r]/g, "").replaceAll("'", "\\'")}'`,
                loader: 'js',
            }
        })
    },
}

esbuild.build({
    entryPoints: ['index.js'],
    outfile: 'bundle.js',
    platform: 'browser',
    bundle: true,
    plugins: [appPlugin],
}).catch(() => process.exit(1))
