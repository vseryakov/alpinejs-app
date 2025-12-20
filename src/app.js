/**
 * Global application object
 * @namespace
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
     * @var {string} - Specifies a fallback component for unrecognized paths on initial load, it is used by {@link app.restorePath}.
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

    isF: isFunction,
    isS: isString,
    isE: isElement,
    isO: isObj,
    isN: isNumber,
    toCamel,
};


/**
 * Returns the num itself if it is a number
 * @param {any} num
 * @returns {number|undefined}
 * @func isN
 * @memberof app
 */
export function isNumber(num) { return typeof num == "number" ? num : undefined }

/**
 * Returns the str itself if it is not empty or ""
 * @param {any} str
 * @returns {string}
 * @func isS
 * @memberof app
 */
export function isString(str) { return typeof str == "string" && str }

/**
 * Returns the callback is it is a function
 * @param {any} callback
 * @returns {function|undefined}
 * @func isF
 * @memberof app
 */

export function isFunction(callback) { return typeof callback == "function" && callback }

/**
 * Returns the obj itself if it is a not null object
 * @param {any} obj
 * @returns {object|undefined}
 * @func isO
 * @memberof app
 */
export function isObj(obj) { return typeof obj == "object" && obj }

/**
 * Returns the element itself if it is a HTMLElement
 * @param {any} element
 * @returns {HTMLElement|undefined}
 * @func isE
 * @memberof app
 */
export function isElement(element) { return element instanceof HTMLElement && element }

/**
 * Convert a string into camelized format
 * @param {string} str
 * @returns {string}
 * @func toCamel
 * @memberof app
 */
export function toCamel(str) { return isString(str) ? str.toLowerCase().replace(/[.:_-](\w)/g, (_, c) => c.toUpperCase()) : "" }
