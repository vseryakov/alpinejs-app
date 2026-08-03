
import { call, isFunction, isObject, isString, trace } from "./app"

/**
 * Global object to customize {@link fetch}
 * @example <caption>make POST default method</caption>
 * fetchOptions.method = "POST"
 * await fetch("url.com")
 */
export var fetchOptions = {
    method: "GET",
    cache: "default",
    headers: Object.create(null),
};

function parseOptions(url, options)
{
    const headers = options?.headers || Object.create(null);
    const opts = Object.assign({
        headers,
        method: options?.method || options?.post && "POST" || undefined,
    }, options?.request);

    for (const p in fetchOptions.headers) {
        if (p === "__proto___") continue;
        headers[p] ??= fetchOptions.headers[p];
    }
    for (const p of ["method","cache","credentials","duplex","integrity","keepalive","mode","priority","redirect","referrer","referrerPolicy","signal"]) {
        if (fetchOptions[p] !== undefined) {
            opts[p] ??= fetchOptions[p];
        }
    }
    var body = options?.body;
    if (opts.method == "GET" || opts.method == "HEAD") {
        if (isObject(body)) {
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
    if (isObject(body)) {
        opts.body = JSON.stringify(body);
        headers["content-type"] = "application/json; charset=UTF-8";
    } else
    if (body) {
        opts.body = body;
        headers["content-type"] ??= "application/octet-stream";
    }
    return [url, opts];
}


function parseResponse(res)
{
    const info = {
        status: res.status,
        headers: Object.create(null),
        type: res.type,
        url: res.url,
        redirected: res.redirected
    };
    for (const h of res.headers) {
        info.headers[h[0].toLowerCase()] = h[1];
    }
    return info;
}

/**
 * Fetch remote content, wrapper around Fetch API
 *
 * __NOTE: Saves X-CSRF-Token header and sends it back with subsequent requests__
 * @param {string} url - URL to fetch
 * @param {object} [options]
 * @param {string} [options.method] - GET, POST,...GET is default or from app.fetchOptions.method
 * @param {boolean} [options.post] - set method to POST
 * @param {string|object|FormData} [options.body] - a body accepted by window.fetch
 * @param {string} [options.data_type] - explicit return type: text, blob, default is auto detected between text or json
 * @param {object} [options.headers] - an object with additional headers to send, all global headers from app.fetchOptions.headers also are merged
 * @param {object} [options.request] - properties to pass to fetch options according to Web API `RequestInit`
 * @param {function} [callback] - callback as (err, data, info) where info is an object { status, headers, type }
 * @async
 * @example
 * fetch("http://api.host.com/user/123", (err, data, info) => {
 *    if (info.status == 200) console.log(data, info);
 * });
 *
 * const { err, data } = await fetch("https://localhost:8000")
 *
 * const { ok, err, status, data } = await fetch("https://localhost:8000")
 * if (!ok) console.log(status, err);
 */

export async function fetch(url, options, callback)
{
    if (isFunction(options)) callback = options, options = null;

    try {
        const [uri, opts] = parseOptions(url, options);
        trace("fetch:", uri, opts, options);

        var data, info;

        const res = await window.fetch(uri, opts);
        info = parseResponse(res);
        var ctype = info.headers["content-type"];
        if (!res.ok) {
            let err;
            if (/\/json/.test(ctype)) {
                const d = await res.json();
                err = Object.create(null, { status: { value: res.status, enumerable: true } });
                for (const p in d) err[p] = d[p];
            } else {
                err = { message: await res.text(), status: res.status };
            }
            throw err;
        }
        switch (options?.data_type) {
        case "text":
            data = await res.text();
            break;
        case "blob":
            data = await res.blob();
            break;
        default:
            data = /\/json/.test(ctype) ? await res.json() :
            /image|video|audio|pdf|zip|binary|octet/.test(ctype) ? await res.blob() : await res.text();
        }
        call(callback, null, data, info);
        return { ok: true, status: info?.status, data, info }
    } catch (err) {
        call(callback, err);
        return { ok: false, status: info?.status, err, data, info }
    }
}
