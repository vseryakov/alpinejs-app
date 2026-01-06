
const { glob, readFile } = require("fs/promises");
const path = require("path");

const namespace = "esbuild-app"
const filter = /[*,{}].*\.(js|html)$/

module.exports = {
    name: namespace,
    setup(build) {
        build.onResolve({ filter }, async (args) => {
            const files = [];
            for await (const file of glob(path.join(args.resolveDir, args.path))) {
                files.push(path.relative(args.resolveDir, file))
            }
            return {
                namespace,
                path: args.path,
                pluginData: {
                    path: args.resolveDir,
                    files
                }
            }
        }),

        build.onLoad({ filter, namespace }, async (args) => {
            var contents = "";
            if (args.path.endsWith(".js")) {
                for (const file of args.pluginData.files) {
                    contents += `export * from './${file}'\n`;
                }
            } else {
                for await (const file of args.pluginData.files) {
                    const text = await readFile(file, 'utf8');
                    const name = path.basename(file, ".html");
                    contents += `const ${name} = '${text.replace(/[\n\r]/g, "").replaceAll("'", "\\'")}'; export { ${name} }\n`
                }
            }

            return {
                contents,
                resolveDir: args.pluginData.path,
                loader: 'js',
            }
        })
    }
}

