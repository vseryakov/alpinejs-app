
import { call, isFunction, isObject, isString, trace } from "./app"

/**
 * Global object to customize {@link fetch} and {@link afetch}
 * @example <caption>make POST default method</caption>
 * fetchOptions.method = "POST"
 * await afetch("url.com")
 */
export var fetchOptions = {
    method: "GET",
    cache: "default",
    headers: {},
};

function parseOptions(url, options)
{
    const headers = options?.headers || {};
    const opts = Object.assign({
        headers,
        method: options?.method || options?.post && "POST" || undefined,
    }, options?.request);

    for (const p in fetchOptions.headers) {
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
    const info = { status: res.status, headers: {}, type: res.type, url: res.url, redirected: res.redirected };
    for (const h of res.headers) {
        info.headers[h[0].toLowerCase()] = h[1];
    }
    const h_csrf = fetchOptions.csrfHeader || "x-csrf-token";
    const v_csrf = info?.headers[h_csrf];
    if (v_csrf) {
        if (v_csrf <= 0) {
            delete fetchOptions.headers[h_csrf];
        } else {
            fetchOptions.headers[h_csrf] = v_csrf;
        }
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
 * @param {string} [options.dataType] - explicit return type: text, blob, default is auto detected between text or json
 * @param {object} [options.headers] - an object with additional headers to send, all global headers from app.fetchOptions.headers also are merged
 * @param {object} [options.request] - properties to pass to fetch options according to Web API `RequestInit`
 * @param {function} [callback] - callback as (err, data, info) where info is an object { status, headers, type }
 *
 * @example
 * fetch("http://api.host.com/user/123", (err, data, info) => {
 *    if (info.status == 200) console.log(data, info);
 * });
 */

export function fetch(url, options, callback)
{
    if (isFunction(options)) callback = options, options = null;

    try {
        const [uri, opts] = parseOptions(url, options);
        trace("fetch:", uri, opts, options);

        window.fetch(uri, opts).
        then(async (res) => {
            var err, data, info = parseResponse(res);
            var ctype = info.headers["content-type"];
            if (!res.ok) {
                if (/\/json/.test(ctype)) {
                    const d = await res.json();
                    err = { status: res.status };
                    for (const p in d) err[p] = d[p];
                } else {
                    err = { message: await res.text(), status: res.status };
                }
                return call(callback, err, data, info);
            }
            switch (options?.dataType) {
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
        }).catch (err => {
            call(callback, err);
        });
    } catch (err) {
        call(callback, err);
    }
}

/**
 * Promisified {@link fetch} which returns a Promise, all exceptions are passed to the reject handler, no need to use try..catch
 * Return everything in an object `{ ok, status, err, data, info }`.
 * @example
 * const { err, data } = await afetch("https://localhost:8000")
 *
 * const { ok, err, status, data } = await afetch("https://localhost:8000")
 * if (!ok) console.log(status, err);
 * @param {string} url
 * @param {object} [options]
 * @async
 */

export function afetch(url, options)
{
    return new Promise((resolve, reject) => {
        fetch(url, options, (err, data, info) => {
            resolve({ ok: !err, status: info.status, err, data, info });
        });
    });
}
