const fs = require("fs");

module.exports = {
    name: 'jsdoc',
    setup(build) {
        const cache = {};

        build.onLoad({ filter: /\.js$/ }, async (args) => {
            let contents = cache[args.path];
            if (!contents) {
                contents = await fs.promises.readFile(args.path, 'utf8')
                cache[args.path] = contents = contents.replaceAll("/**", "/*!*");
            }
            return { contents, loader: 'js' }
        });

        build.onEnd(result => {
            for (const file in result.metafile?.outputs) {
                fs.writeFileSync(file, fs.readFileSync(file).toString().replaceAll("/*!*", "/**"));
            }
        })
    },
}
