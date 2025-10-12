
export var app = {
    base: "/app/",
    $target: "#app-main",
    index: "index",
    event: "component:event",
    templates: {},
    components: {},
    isF: isFunction,
    isS: isString,
    isE: isElement,
    isO: isObj,
    isN: isNumber,
    toCamel,
}

export function isNumber(num) { return typeof num == "number" ? num : undefined }

export function isString(str) { return typeof str == "string" && str }

export function isFunction(callback) { return typeof callback == "function" && callback }

export function isObj(obj) { return typeof obj == "object" && obj }

export function isElement(element) { return element instanceof HTMLElement && element }

export function toCamel(key) { return isString(key) ? key.toLowerCase().replace(/[.:_-](\w)/g, (_, c) => c.toUpperCase()) : "" }
