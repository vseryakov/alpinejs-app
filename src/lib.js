
import { __, app, call, isFunction, isNumber, isObject, isString, noop, toCamel } from "./app"

/**
 * @param {any[]} list
 * @param {any|any[]} item
 * @return {boolean} true if `item` exists in the array `list`, search is case sensitive. if `item` is an array it will return true if
 * any element in the array exists in the `list`.
 */
export function isFlag(list, item)
{
    return Array.isArray(list) && (Array.isArray(item) ? item.some((x) => (list.includes(x))) : list.includes(item));
}


/**
 * Apply an iterator function to each item in an array serially. Execute a callback when all items
 * have been completed or immediately if there is is an error provided.
 * @param {any[]} list
 * @param {function} iterator
 * @param {function} [callback]
 * @param {boolean} [direct=true]
 * @example
 * app.forEachSeries([ 1, 2, 3 ], function (i, next, data) {
 *    console.log(i, data);
 *    next(null, data);
 * }, (err, data) => {
 *    console.log('done', data);
 * });
 */
export function forEachSeries(list, iterator, callback, direct = true)
{
    callback = isFunction(callback) || noop;
    if (!Array.isArray(list) || !list.length) return callback();
    function iterate(i, ...args) {
        if (i >= list.length) return direct ? callback(null, ...args) : setTimeout(callback, 0, null, ...args);
        iterator(list[i], (...args) => {
            if (args[0]) {
                if (direct) callback(...args); else setTimeout(callback, 0, ...args);
                callback = noop;
            } else {
                iterate(++i, ...args.slice(1));
            }
        }, ...args);
    }
    iterate(0);
}

/**
 * Execute a list of functions serially and execute a callback upon completion or occurance of an error. Each function will be passed
 * a callback to signal completion. The callback accepts either an error for the first argument in which case the flow will be aborted
 * and the final callback will be called immediately or some optional data to be passed to thr next iterator function as a second argument.
 *
 * The iterator and callback will be called via setImmediate function to allow the main loop to process I/O unless the `direct` argument is true
 * @param {function[]} tasks
 * @param {function} [callback]
 * @param {boolean} [direct]
 * @example
 * app.series([
 *    function(next) {
 *        next(null, "data");
 *    },
 *    function(next, data) {
 *       setTimeout(function () { next(null, data); }, 100);
 *    },
 * ], (err, data) => {
 *    console.log(err, data);
 * });
 */
export function series(tasks, callback, direct = true)
{
    forEachSeries(tasks, (task, next, ...args) => {
        if (direct) task(next, ...args); else setTimeout(task, 0, next, ...args);
    }, callback, direct);
}

/**
 * Apply an iterator function to each item in an array in parallel. Execute a callback when all items
 * have been completed or immediately if there is an error provided.
 * @param {any[]} list
 * @param {function} iterator
 * @param {function} callback
 * @param {boolean} direct - controls how the final callback is called, if true it is called directly otherwisde via setImmediate
 * @example
 * app.forEach([ 1, 2, 3 ], function (i, next) {
 *   console.log(i);
 *   next();
 * }, (err) => {
 *   console.log('done');
 * });
 */
export function forEach(list, iterator, callback, direct = true)
{
    callback = isFunction(callback) || noop;
    if (!Array.isArray(list) || !list.length) return callback();
    var count = list.length;
    for (let i = 0; i < list.length; i++) {
        iterator(list[i], (err) => {
            if (err) {
                if (direct) callback(err); else setTimeout(callback, 0, err);
                callback = noop;
                i = list.length + 1;
            } else
            if (--count == 0) {
                if (direct) callback(); else setTimeout(callback, 0);
                callback = noop;
            }
        });
    }
}

/**
 * Execute a list of functions in parallel and execute a callback upon completion or occurance of an error. Each function will be passed
 * a callback to signal completion. The callback accepts an error for the first argument. The iterator and callback will be
 * called via setImmediate function to allow the main loop to process I/O unless the `direct` argument is true
 * @param {function[]} tasks
 * @param {function} [callback]
 * @param {boolean} [direct=true]
 */
export function parallel(tasks, callback, direct = true)
{
    forEach(tasks, (task, next) => { task(next) }, callback, direct);
}

/**
 * Return Date object for given text or numeric date representation, for invalid date returns 1969 unless `invalid` parameter is given,
 * in this case invalid date returned as null. If `dflt` is NaN, null or 0 returns null as well.
 * @param {string|Date|number} val
 * @param {any} [dflt]
 * @param {boolean} [invalid]
 * @return {Date}
 */
export function toDate(val, dflt, invalid)
{
    if (isFunction(val?.getTime)) return val;
    var d = NaN;
    // String that looks like a number
    if (isString(val)) {
        val = /^[0-9.]+$/.test(val) ? toNumber(val) : val.replace(/([0-9])(AM|PM)/i, "$1 $2");
    }
    if (isNumber(val)) {
        // Convert nanoseconds to milliseconds
        if (val > 2147485547000) val = Math.round(val / 1000);
        // Convert seconds to milliseconds
        if (val < 2147483647) val *= 1000;
    }
    if (!isString(val) && !isNumber(val)) val = d;
    if (val) try { d = new Date(val); } catch (e) {}
    return !isNaN(d) ? d : invalid || (dflt !== undefined && isNaN(dflt)) || dflt === null || dflt === 0 ? null : new Date(dflt || 0);
}

/**
 * Return duration in human format, mtime is msecs
 * @param {number} mtime
 * @param {boolean} [age] - if true duration from now, as age
 * @return {string}
 */
export function toDuration(mtime, age)
{
    var str = "";
    mtime = isNumber(mtime) ?? toNumber(mtime);
    if (mtime > 0) {
        if (age) mtime = Date.now() - mtime;
        var secs = Math.floor(mtime/1000);
        var d = Math.floor(secs / 86400);
        var mm = Math.floor(d / 30);
        var w = Math.floor(d / 7);
        var h = Math.floor((secs - d * 86400) / 3600);
        var m = Math.floor((secs - d * 86400 - h * 3600) / 60);
        var s = Math.floor(secs - d * 86400 - h * 3600 - m * 60);
        if (mm > 0) {
            str = mm > 1 ? __(mm, " months") : __("1 month");
            if (d > 0) str += " " + (d > 1 ? __(d, " days") : __("1 day"));
            if (h > 0) str += " " + (h > 1 ? __(h, " hours") : __("1 hour"));
        } else
        if (w > 0) {
            str = w > 1 ? __(w, " weeks") : __("1 week");
            if (d > 0) str += " " + (d > 1 ? __(d, " days") : __("1 day"));
            if (h > 0) str += " " + (h > 1 ? __(h, " hours") : __("1 hour"));
        } else
        if (d > 0) {
            str = d > 1 ? __(d, " days") : __("1 day");
            if (h > 0) str += " " + (h > 1 ? __(h, " hours") : __("1 hour"));
            if (m > 0) str += " " + (m > 1 ? __(m, " minutes") : __("1 minute"));
        } else
        if (h > 0) {
            str = h > 1 ? __(h, " hours") : __("1 hour");
            if (m > 0) str += " " + (m > 1 ? __(m, " minutes") : __("1 minute"));
        } else
        if (m > 0) {
            str = m > 1 ? __(m, " minutes") : __("1 minute");
            if (s > 0) str += " " + (s > 1 ? __(s, " seconds") : __("1 second"));
        } else {
            str = secs > 1 ? __(secs, " seconds") : __("1 second");
        }
    }
    return str;
}

/**
 * Return size human readable format
 * @param {number} size
 * @param {boolean} [decimals=2]
 */
export function toSize(size, decimals = 2)
{
    var i = size > 0 ? Math.floor(Math.log(size) / Math.log(1024)) : 0;
    return (size / Math.pow(1024, i)).toFixed(isNumber(decimals) ?? 2) * 1 + ' ' +
           [__('Bytes'), __('KBytes'), __('MBytes'), __('GBytes'), __('TBytes')][i];
}

/**
 * Convert text into capitalized words, if it is less or equal than minlen leave it as is
 * @param {string} name
 * @param {int} [minlen]
 * @return {string}
 */
export function toTitle(name, minlen)
{
    return isString(name) ?
           minlen > 0 && name.length <= minlen ? name :
           name.replace(/_/g, " ").
           split(/[ ]+/).
           reduce((x,y) => (x + y.substr(0,1).toUpperCase() + y.substr(1) + " "), "").
           trim() : "";
}

/**
 * Safe convertion to a number, no expections, uses 0 instead of NaN, handle booleans, if float specified, returns as float.
 * @param {any} val - to be converted to a number
 * @param {object} [options]
 * @param {int} [options.dflt] - default value
 * @param {int} [options.float] - treat as floating number
 * @param {int} [options.min] - minimal value, clip
 * @param {int} [options.max] - maximum value, clip
 * @param {int} [options.incr] - a number to add before checking for other conditions
 * @param {int} [options.mult] - a number to multiply before checking for other conditions
 * @param {int} [options.novalue] - replace this number with default
 * @param {int} [options.zero] - replace with this number if result is 0
 * @param {int} [options.digits] - how many digits to keep after the floating point
 * @param {int} [options.bigint] - return BigInt if not a safe integer
 * @return {number}
 * @example
 * app.toNumber("123")
 * app.toNumber("1.23", { float: 1, dflt: 0, min: 0, max: 2 })
 */
export function toNumber(val, options)
{
    var n = 0;
    if (typeof val == "number") {
        n = val;
    } else
    if (typeof val == "boolean") {
        n = val ? 1 : 0;
    } else {
        if (typeof val != "string") {
            n = options?.dflt || 0;
        } else {
            // Autodetect floating number
            var f = typeof options?.float == "undefined" || options?.float == null ? /^(-|\+)?([0-9]+)?\.[0-9]+$/.test(val) : options?.float;
            n = val[0] == 't' ? 1 : val[0] == 'f' ? 0 : val == "infinity" ? Infinity : (f ? parseFloat(val, 10) : parseInt(val, 10));
        }
    }
    n = isNaN(n) ? options?.dflt || 0 : n;
    if (options) {
        if (typeof options.novalue == "number" && n === options.novalue) n = options.dflt || 0;
        if (typeof options.incr == "number") n += options.incr;
        if (typeof options.mult == "number") n *= options.mult;
        if (isNaN(n)) n = options.dflt || 0;
        if (typeof options.min == "number" && n < options.min) n = options.min;
        if (typeof options.max == "number" && n > options.max) n = options.max;
        if (typeof options.float != "undefined" && !options.float) n = Math.round(n);
        if (typeof options.zero == "number" && !n) n = options.zero;
        if (typeof options.digits == "number") n = parseFloat(n.toFixed(options.digits));
        if (options.bigint && typeof n == "number" && !Number.isSafeInteger(n)) n = BigInt(n);
    }
    return n;
}

/**
 * Return a test representation of a number according to the money formatting rules,
 * @param {number} num
 * @param {object} [options]
 * @param {string} [options.locale=en-US]
 * @param {string} [options.currency=USD]
 * @param {string} [options.display=symbol]
 * @param {string} [options.sign=standard]
 * @param {int} [options.min=2]
 * @param {int} [options.max=3]
 * @memberof module:lib
 * @method toPrice
 */
export function toPrice(num, options)
{
    try {
        return toNumber(num).toLocaleString(options?.locale || "en-US", {
            style: 'currency',
            currency: options?.currency || 'USD',
            currencyDisplay: options?.display || "symbol",
            currencySign: options?.sign || "standard",
            minimumFractionDigits: options?.min || 2,
            maximumFractionDigits: options?.max || 5 });
    } catch (e) {
        console.error("toPrice:", e, num, options);
        return "";
    }
}

/**
 * Split string into array, ignore empty items by default
 * @param {string} str
 * If str is an array and type is not specified then all non-string items will be returned as is.
 * @param {RegExp|string} [sep=,|] - separator
 * @param {object} [options]
 * @param {boolean} [options.keepempty] - will preserve empty items, by default empty strings are ignored
 * @param {boolean} [options.notrim] - will skip trimming strings, trim is the default
 * @param {int} [options.max] - will skip strings over the specificed size if no `trunc`
 * @param {boolean} [options.trunc] - will truncate strings longer than `max`
 * @param {regexp} [options.regexp] - will skip string if not matching
 * @param {regexp} [options.noregexp] - will skip string if matching
 * @param {boolean} [options.number] - convert into a number
 * @param {boolean} [options.cap] - capitalize
 * @param {boolean} [options.camel] - camelize
 * @param {boolean} [options.lower] - lowercase
 * @param {boolean} [options.upper] - uppercase
 * @param {string|regexp} [options.strip] - remove occurences
 * @param {object} [options.replace] - an object map which characters to replace with new values
 * @param {boolean} [options.range] - will parse numeric ranges in the format `NUM-NUM` and add all numbers in between, invalid ranges are skipped
 * @param {boolean} [options.unique] - remove duplicate entries
 * @return {string[]}
 */
export function split(str, sep, options)
{
    if (!str) return [];
    var list = (Array.isArray(str) ? str : (isString(str) ? str : String(str)).split(sep || /[,|]/)), len = list.length;
    if (!len) return list;

    var rc = [], keys = isObject(options) ? Object.reys(options) : [], v;
    for (let i = 0; i < len; ++i) {
        v = list[i];
        if (v === "" && !options?.keepempty) continue;
        if (!isString(v)) {
            rc.push(v);
            continue;
        }
        if (!options?.notrim) v = v.trim();

        for (let k = 0; k < keys.length; ++k) {
            switch (keys[k]) {
            case "range":
                var dash = v.indexOf("-", 1);
                if (dash == -1) break;
                var s = toNumber(v.substr(0, dash));
                var e = toNumber(v.substr(dash + 1));
                for (; s <= e; s++) rc.push(s.toString());
                v = "";
                break;

            case "max":
                if (v.length > options.max) {
                    v = options.trunc ? v.substr(0, options.max) : "";
                }
                break;

            case "regexp":
                if (!options.regexp.test(v)) v = "";
                break;

            case "noregexp":
                if (options.regexp.test(v)) v = "";
                break;

            case "lower":
                v = v.toLowerCase();
                break;

            case "upper":
                v = v.toUpperCase();
                break;

            case "strip":
                v = v.replace(options.strip, "");
                break;

            case "replace":
                for (const p in options.replace) {
                    v = v.replaceAll(p, options.replace[p]);
                }
                break;

            case "camel":
                v = toCamel(v, options);
                break;

            case "cap":
                v = toTitle(v, options.cap);
                break;

            case "number":
                v = toNumber(v, options);
                break;
            }
        }
        if (!v.length && !options?.keepempty) continue;
        rc.push(v);
    }
    if (options?.unique) {
        rc = Array.from(new Set(rc));
    }
    return rc;
}

/**
 * Inject CSS/Script resources into the current page, all urls are loaded at the same time by default.
 * @param {string[]|string} urls - list of urls to load
 * @param {object} [options]
 * @param {boolean} [options.series] - load urls one after another
 * @paarm {boolean} [options.async] if set then scripts executed as soon as loaded otherwise executing scripts will be in the order provided
 * @param {function} [options.callback] will be called with (el, opts) args for customizations after loading each url or on error
 * @param {object} [options.attrs] is an object with attributes to set like nonce, ...
 * @param {int} [options.timeout] - call the callback after timeout
 */
export function loadResources(urls, options, callback)
{
    if (typeof options == "function") callback = options, options = null;
    if (typeof urls == "string") urls = [urls];
    app[`forEach${options?.series ? "Series" : ""}`](urls, (url, next) => {
        let el;
        const ev = () => { call(options?.callback, el, options); next() }
        if (/\.css/.test(url)) {
            el = app.$elem("link", "rel", "stylesheet", "type", "text/css", "href", url, "load", ev, "error", ev)
        } else {
            el = app.$elem('script', "async", !!options?.async, "src", url, "load", ev, "error", ev)
        }
        for (const p in options?.attrs) {
            app.$attr(el, p, options.attrs[p]);
        }
        document.head.appendChild(el);
    }, options?.timeout > 0 ? () => { setTimeout(callback, options.timeout) } : callback);
}

/**
 * Send file(s) and forms
 * @param {string} url
 * @param {object} options
 * @param {object} [options.files] - name/File pairs to be sent as multi-part
 * @param {object} [options.body] - simple form properties
 * @param {object} [options.json] - send as JSON blobs
 * @param {function} [callback]
 */
export function sendFile(url, options, callback)
{
    const add = (k, v) => {
       body.append(k, isFunction(v) ? v() : v === null || v === true ? "" : v);
    }

    const build = (key, val) => {
        if (val === undefined) return;
        if (Array.isArray(val)) {
            for (const i in val) build(`${key}[${app.isO(val[i]) ? i : ""}]`, val[i]);
        } else
        if (isObject(val)) {
            for (const n in val) build(`${key}[${n}]`, val[n]);
        } else {
            add(key, val);
        }
    }

    var body = new FormData();
    for (const p in options.body) {
        build(p, options.body[p]);
    }
    for (const p in options.files) {
        const file = options.files[p];
        if (!file?.files?.length) continue;
        body.append(p, file.files[0]);
    }
    for (const p in options.json) {
        const blob = new Blob([JSON.stringify(options.json[p])], { type: "application/json" });
        body.append(p, blob);
    }

    var req = {
        body,
        method: options.method || "POST",
    };
    for (const p in options) {
        if (p == "json" || p == "files") continue;
        req[p] ??= options[p];
    }
    app.fetch(url, req, callback);
}

function isattr(attr, list)
{
    const name = attr.nodeName.toLowerCase();
    if (list.includes(name)) {
        if (sanitizer._attrs.has(name)) {
            return sanitizer._urls.test(attr.nodeValue) || sanitizer._data.test(attr.nodeValue);
        }
        return true;
    }
    return list.some((x) => (x instanceof RegExp && x.test(name)));
}

/**
 * HTML sanitizer, based on Bootstrap internal sanitizer
 * @param {strings} html
 * @param {boolean} list - if true return a list of Nodes
 * @return {Node[]|string}
 */
export function sanitizer(html, list)
{
    if (!isString(html)) return list ? [] : html;
    const body = app.$parse(html);
    const elements = [...body.querySelectorAll('*')];
    for (const el of elements) {
        const name = el.nodeName.toLowerCase();
        if (sanitizer._tags[name]) {
            const allow = [...sanitizer._tags['*'], ...sanitizer._tags[name] || []];
            for (const attr of [...el.attributes]) {
                if (!isattr(attr, allow)) el.removeAttribute(attr.nodeName);
            }
        } else {
            el.remove();
        }
    }
    return list ? Array.from(body.childNodes) : body.innerHTML;
}

sanitizer._attrs = new Set(['background','cite','href','itemtype','longdesc','poster','src','xlink:href'])
sanitizer._urls = /^(?:(?:https?|mailto|ftp|tel|file|sms):|[^#&/:?]*(?:[#/?]|$))/i
sanitizer._data = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[\d+/a-z]+=*$/i
sanitizer._tags = {
    '*': ['class', 'dir', 'id', 'lang', 'role', /^aria-[\w-]*$/i,
    'data-bs-toggle', 'data-bs-target', 'data-bs-dismiss', 'data-bs-parent'],
    a: ['target', 'href', 'title', 'rel'], area: [],
    b: [], blockquote: [], br: [], button: [],
    col: [], code: [],
    div: [], em: [], hr: [],
    img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'style'],
    h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
    i: [], li: [], ol: [], p: [], pre: [],
    s: [], small: [], span: [], sub: [], sup: [], strong: [],
    table: [], thead: [], tbody: [], th: [], tr: [], td: [],
    u: [], ul: [],
}
