
const esbuild = require("esbuild");
const jsdoc = require(__dirname + "/esbuild-jsdoc");

esbuild.build({
    entryPoints: ['builds/cdn.js'],
    outfile: 'dist/app.js',
    platform: 'browser',
    bundle: true,
    metafile: true,
    legalComments: 'inline',
    plugins: [jsdoc],
}).catch(() => process.exit(1))

esbuild.build({
    entryPoints: ['builds/cdn.js'],
    outfile: 'dist/app.min.js',
    platform: 'browser',
    minify: true,
    bundle: true,
    legalComments: 'none',
}).catch(() => process.exit(1))

esbuild.build({
    entryPoints: ['builds/module.js'],
    outfile: 'dist/app.mjs',
    platform: 'neutral',
    bundle: true,
    metafile: true,
    legalComments: 'inline',
    plugins: [jsdoc],
}).catch(() => process.exit(1))

esbuild.build({
    entryPoints: ['builds/module.js'],
    outfile: 'dist/app.min.mjs',
    platform: 'neutral',
    minify: true,
    bundle: true,
    legalComments: 'none',
}).catch(() => process.exit(1))
