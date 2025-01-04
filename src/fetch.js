import { app, isStr, isObj } from "./app"

app.fetchOpts = function(options)
{
    var headers = options.headers || {};
    var opts = Object.assign({
        headers: headers,
        method: options.type || "POST",
        cache: "default",
    }, options.fetchOptions);

    var data = options.data;
    if (opts.method == "GET" || opts.method == "HEAD") {
        if (isObj(data)) {
            options.url += "?" + new URLSearchParams(data).toString();
        }
    } else
    if (isStr(data)) {
        opts.body = data;
        headers["content-type"] = options.contentType || 'application/x-www-form-urlencoded; charset=UTF-8';
    } else
    if (data instanceof FormData) {
        opts.body = data;
        delete headers["content-type"];
    } else
    if (isObj(data)) {
        opts.body = JSON.stringify(data);
        headers["content-type"] = "application/json; charset=UTF-8";
    } else
    if (data) {
        opts.body = data;
        headers["content-type"] = options.contentType || "application/octet-stream";
    }
    return opts;
}

app.fetch = function(options, callback)
{
    try {
        const opts = app.fetchOpts(options);
        window.fetch(options.url, opts).
        then(async (res) => {
            var err, data;
            var info = { status: res.status, headers: {}, type: res.type };
            for (const h of res.headers) info.headers[h[0].toLowerCase()] = h[1];
            if (!res.ok) {
                if (/\/json/.test(info.headers["content-type"])) {
                    const d = await res.json();
                    err = { status: res.status };
                    for (const p in d) err[p] = d[p];
                } else {
                    err = { message: await res.text(), status: res.status };
                }
                return app.call(callback, err, data, info);
            }
            switch (options.dataType) {
            case "text":
                data = await res.text();
                break;
            case "blob":
                data = await res.blob();
                break;
            default:
                data = /\/json/.test(info.headers["content-type"]) ? await res.json() : await res.text();
            }
            app.call(callback, null, data, info);
        }).catch ((err) => {
            app.call(callback, err);
        });
    } catch (err) {
        app.call(callback, err);
    }
}
