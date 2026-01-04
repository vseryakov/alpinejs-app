
const esbuild = require("esbuild");
const jsdoc = require(__dirname + "/esbuild-jsdoc");

const cdns = [
    { index: 'builds/cdn.js', out: 'app' },
    { index: 'builds/cdn-lib.js', out: 'app-lib' },
    { index: 'builds/cdn-bootstrap.js', out: 'app-bootstrap' },
];

for (const cdn of cdns) {
    esbuild.build({
        entryPoints: [cdn.index],
        outfile: "dist/" + cdn.out + ".js",
        platform: 'browser',
        bundle: true,
        metafile: true,
        legalComments: 'inline',
        plugins: [jsdoc],
    }).catch(() => process.exit(1))

    esbuild.build({
        entryPoints: [cdn.index],
        outfile: "dist/" + cdn.out + ".min.js",
        platform: 'browser',
        minify: true,
        bundle: true,
        legalComments: 'none',
    }).catch(() => process.exit(1))
}

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
