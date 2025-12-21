const fs = require("fs");
const path = require("path");

module.exports = {
    name: 'app',
    setup(build) {
        build.onLoad({ filter: /\.html$/ }, async (args) => {
            const text = await fs.promises.readFile(args.path, 'utf8')
            return {
                contents: `app.templates.${path.basename(args.path, ".html")} = '${text.replace(/[\n\r]/g, "").replaceAll("'", "\\'")}'`,
                loader: 'js',
            }
        })
    },
}
