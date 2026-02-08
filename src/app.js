/**
 * Global application object
 * @namespace app
 */

export var app = {

    /**
     * @var {string} - Defines the root path for the application, must be framed with slashes.
     * @default
     */
    base: "/app/",

    /**
     * @var {object} - Central app HTML element for rendering main components.
     * @default
     */
    $target: "#app-main",

    /**
     * @var {string} - Specifies a fallback component for unrecognized paths on initial load, it is used by {@link restorePath}.
     * @default
     */
    index: "index",

    /**
     * @var {string} - Event name components listen
     * @default
     */
    event: "component:event",

    /**
     * @var {object} - HTML templates, this is the central registry of HTML templates to be rendered on demand,
     * this is an alternative to using **&lt;template&gt;** tags which are kept in the DOM all the time even if not used.
     * This object can be populated in the bundle or loaded later as JSON, this all depends on the application environment.
     */
    templates: {},

    /**
     * @var {string} - Component classes, this is the registry of all components logic to be used with corresponding templates.
     * Only classed derived from **app.AlpineComponent** will be used, internally they are registered with **Alpine.data()** to be reused by name.
     */
    components: {},

    /** @var {function}  - see {@link isFunction} */
    isF: isFunction,

    /** @var {function}  - see {@link isString} */
    isS: isString,

    /** @var {function}  - see {@link isElement} */
    isE: isElement,

    /** @var {function}  - see {@link isObject} */
    isO: isObject,

    /** @var {function}  - see {@link isNumber} */
    isN: isNumber,

    /** @var {function}  - see {@link isArray} */
    isA: isArray,

    toCamel,
    toNumber,
    call,
    escape,
    noop,
    log,
    trace,
    __,
};

/**
 * Empty function
 */
export function noop() {}

/**
   * if __app.debug__ is set then it will log arguments in the console otherwise it is no-op
   * @param {...any} args
   */
export function trace(...args) { app.debug && app.log(...args) }

/**
 * Alias to console.log
 */
export function log(...args) { console.log(...args) }

/**
 * Empty locale translator
 * @param {...any} args
 * @returns {string}
 */
export function __(...args) { return args.join("") };

/**
 * Returns the array if the value is non empty array or dflt value if given or undefined
 * @param {any} val
 * @returns {any|any[]}
 */
export function isArray(val, dflt) { return Array.isArray(val) && val.length ? val : dflt }

/**
 * Returns the num itself if it is a number
 * @param {any} num
 * @returns {number|undefined}
 */
export function isNumber(num) { return typeof num == "number" ? num : undefined }

/**
 * Returns the str itself if it is not empty or ""
 * @param {any} str
 * @returns {string}
 */
export function isString(str) { return typeof str == "string" && str }

/**
 * Returns the callback is it is a function
 * @param {any} callback
 * @returns {function|undefined}
 */

export function isFunction(callback) { return typeof callback == "function" && callback }

/**
 * Returns the obj itself if it is a not null object
 * @param {any} obj
 * @returns {object|undefined}
 */
export function isObject(obj) { return typeof obj == "object" && obj }

/**
 * Returns the element itself if it is a HTMLElement
 * @param {any} element
 * @returns {HTMLElement|undefined}
 */
export function isElement(element) { return element instanceof HTMLElement && element }

/**
 * Convert a string into camelized format
 * @param {string} str
 * @returns {string}
 */
export function toCamel(str)
{
    return isString(str) ? str.toLowerCase().replace(/[.:_-](\w)/g, (_, c) => c.toUpperCase()) : ""
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
 * toNumber("123")
 * 123
 * toNumber("1.23", { float: 1, dflt: 0, min: 0, max: 2 })
 * 1.23
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
 * Call a function safely with context and arguments:
 * @param {object|function} obj
 * @param {string|function} [method]
 * @param {any} [...args]
 * @example
 * app.call(func,..)
 * app.call(obj, func, ...)
 * app.call(obj, method, ...)
 */
export function call(obj, method, ...args)
{
    if (isFunction(obj)) return obj(method, ...args);
    if (typeof obj != "object") return;
    if (isFunction(method)) return method.call(obj, ...args);
    if (obj && isFunction(obj[method])) return obj[method].call(obj, ...args);
}

const _entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };

/**
 * Convert common special symbols into xml entities
 * @param {string} str
 * @returns {string}
 */
export function escape(str)
{
    if (typeof str != "string") return "";
    return str.replace(/([&<>'":])/g, (_, x) => (_entities[x] || x));
}
