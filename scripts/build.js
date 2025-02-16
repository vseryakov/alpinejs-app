const esbuild = require("esbuild");

esbuild.build({
    entryPoints: ['builds/cdn.js'],
    outfile: 'dist/app.js',
    platform: 'browser',
    bundle: true,
}).catch(() => process.exit(1))

esbuild.build({
    entryPoints: ['builds/cdn.js'],
    outfile: 'dist/app.min.js',
    platform: 'browser',
    minify: true,
    bundle: true,
}).catch(() => process.exit(1))

esbuild.build({
    entryPoints: ['builds/module.js'],
    outfile: 'dist/app.mjs',
    platform: 'neutral',
    bundle: true,
}).catch(() => process.exit(1))

esbuild.build({
    entryPoints: ['builds/module.js'],
    outfile: 'dist/app.min.mjs',
    platform: 'neutral',
    minify: true,
    bundle: true,
}).catch(() => process.exit(1))
