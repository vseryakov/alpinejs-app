
export var app = {
    base: "/app/",
    main: "#app-main",
    index: "index",
    event: "component:event",
    templates: {},
    components: {},
}

export function isFunc(callback) { return typeof callback == "function" }

export function isStr(str) { return typeof str == "string" }

export function isNull(obj) { return obj ?? true }

export function isObj(obj) { return typeof obj == "object" && obj }

export function isElement(element) { return element instanceof HTMLElement ? element : undefined }

export function toCamel(key) { return key.toLowerCase().replace(/-(\w)/g, (_, c) => c.toUpperCase()) }
