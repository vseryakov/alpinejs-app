import { app, isObj, isString } from "./app"

function parseOptions(options)
{
    var url = isString(options) ? options : options?.url || "";
    var headers = options?.headers || {};
    var opts = Object.assign({
        headers: headers,
        method: options?.method || options?.post && "POST" || "GET",
        cache: "default",
    }, options?.options);

    var body = options?.body;
    if (opts.method == "GET" || opts.method == "HEAD") {
        if (isObj(body)) {
            url += "?" + new URLSearchParams(body).toString();
        }
    } else
    if (isString(body)) {
        opts.body = body;
        headers["content-type"] ??= 'application/x-www-form-urlencoded; charset=UTF-8';
    } else
    if (body instanceof FormData) {
        opts.body = body;
        delete headers["content-type"];
    } else
    if (isObj(body)) {
        opts.body = JSON.stringify(body);
        headers["content-type"] = "application/json; charset=UTF-8";
    } else
    if (body) {
        opts.body = body;
        headers["content-type"] ??= "application/octet-stream";
    }
    return [url, opts];
}

app.fetch = function(options, callback)
{
    try {
        const [url, opts] = parseOptions(options);
        app.trace("fetch:", url, opts, options);

        window.fetch(url, opts).
        then(async (res) => {
            var err, data;
            var info = { status: res.status, headers: {}, type: res.type, url: res.url, redirected: res.redirected };
            for (const h of res.headers) {
                info.headers[h[0].toLowerCase()] = h[1];
            }
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
            switch (options?.dataType) {
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
        }).catch (err => {
            app.call(callback, err);
        });
    } catch (err) {
        app.call(callback, err);
    }
}

app.afetch = function(options)
{
    return new Promise((resolve, reject) => {
        app.fetch(options, (err, data, info) => {
            if (err && !options?.nocatch) {
                return reject(err, data, info);
            }
            if (options?.nocatch) {
                data = { err, data, info };
            }
            resolve(data, info);
        });
    });
}
