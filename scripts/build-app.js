const path = require("path");
const http = require("http");
const url = require("url");
const esbuild = require("esbuild");
const plugin = require(__dirname + "/esbuild-app");

const opts = {
    entryPoints: ['index.js'],
    outfile: 'bundle.js',
    platform: 'browser',
    metafile: true,
    bundle: true,
    plugins: [plugin],
    logLevel: 'info',
};

(async () => {
    if (process.argv.includes("--watch")) {
        var ctx = await esbuild.context(opts);
        await ctx.watch();

        const { hosts, port } = await ctx.serve({ host: "127.0.0.1", servedir: '.', fallback: "index.html" });

        http.createServer((req, res) => {
            var u = url.parse(req.url);
            if (/\.(js|html)(\?|$)/.test(u.path)) {
                u.path = "/" + path.basename(u.path);
            }
            const options = { port, hostname: hosts[0], path: u.path, method: req.method, headers: req.headers }
            const preq = http.request(options, pres => { pres.pipe(res, { end: true }) });
            req.pipe(preq, { end: true });
        }).listen(8090);

        console.log(" !! Please point your browser to http://127.0.0.1:8090/")
    } else {
        await esbuild.build(opts);

        opts.entryPoints = ['index.mjs'];
        opts.platform = "neutral"
        opts.outfile = 'bundle.mjs'
        await esbuild.build(opts);
    }
})();
