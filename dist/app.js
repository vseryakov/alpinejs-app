(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // dist/app.mjs
  var app_exports = {};
  __export(app_exports, {
    $: () => $,
    $all: () => $all,
    $append: () => $append,
    $attr: () => $attr,
    $data: () => $data,
    $elem: () => $elem,
    $empty: () => $empty,
    $event: () => $event,
    $off: () => $off,
    $on: () => $on,
    $param: () => $param,
    $parse: () => $parse,
    $ready: () => $ready,
    AlpineComponent: () => AlpineComponent,
    AlpinePlugin: () => AlpinePlugin,
    Component: () => component_default,
    afetch: () => afetch,
    app: () => app,
    default: () => index_default,
    emit: () => emit,
    fetch: () => fetch,
    fetchOptions: () => fetchOptions,
    off: () => off,
    on: () => on,
    once: () => once,
    only: () => only,
    parsePath: () => parsePath,
    register: () => register,
    render: () => render,
    resolve: () => resolve,
    restorePath: () => restorePath,
    savePath: () => savePath,
    start: () => start,
    stylePlugin: () => stylePlugin
  });
  var app = {
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
    call,
    escape,
    noop,
    log,
    trace,
    __
  };
  function noop() {
  }
  function trace(...args) {
    app.debug && app.log(...args);
  }
  function log(...args) {
    console.log(...args);
  }
  function __(...args) {
    return args.join("");
  }
  function isArray(val, dflt) {
    return Array.isArray(val) && val.length ? val : dflt;
  }
  function isNumber(num) {
    return typeof num == "number" ? num : void 0;
  }
  function isString(str) {
    return typeof str == "string" && str;
  }
  function isFunction(callback) {
    return typeof callback == "function" && callback;
  }
  function isObject(obj) {
    return typeof obj == "object" && obj;
  }
  function isElement(element) {
    return element instanceof HTMLElement && element;
  }
  function toCamel(str) {
    return isString(str) ? str.toLowerCase().replace(/[.:_-](\w)/g, (_, c) => c.toUpperCase()) : "";
  }
  function call(obj, method, ...args) {
    if (isFunction(obj)) return obj(method, ...args);
    if (typeof obj != "object") return;
    if (isFunction(method)) return method.call(obj, ...args);
    if (obj && isFunction(obj[method])) return obj[method].call(obj, ...args);
  }
  var _entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };
  function escape(str) {
    if (typeof str != "string") return "";
    return str.replace(/([&<>'":])/g, (_, x) => _entities[x] || x);
  }
  var _events = {};
  function on(event, callback, namespace) {
    if (!isFunction(callback)) return;
    if (!_events[event]) _events[event] = [];
    _events[event].push([callback, isString(namespace)]);
  }
  function once(event, callback, namespace) {
    if (!isFunction(callback)) return;
    const cb = (...args) => {
      off(event, cb);
      callback(...args);
    };
    on(event, cb, namespace);
  }
  function only(event, callback, namespace) {
    _events[event] = isFunction(callback) ? [callback, isString(namespace)] : [];
  }
  function off(event, callback) {
    if (event && callback) {
      if (!_events[event]) return;
      const i = isFunction(callback) ? 0 : isString(callback) ? 1 : -1;
      if (i >= 0) _events[event] = _events[event].filter((x) => x[i] !== callback);
    } else if (isString(event)) {
      for (const ev in _events) {
        _events[ev] = _events[ev].filter((x) => x[1] !== event);
      }
    }
  }
  function emit(event, ...args) {
    trace("emit:", event, ...args, app.debug > 1 && _events[event]);
    if (_events[event]) {
      for (const cb of _events[event]) cb[0](...args);
    } else if (isString(event) && event.endsWith(":*")) {
      event = event.slice(0, -1);
      for (const p in _events) {
        if (p.startsWith(event)) {
          for (const cb of _events[p]) cb[0](...args);
        }
      }
    }
  }
  function $param(name, dflt) {
    return new URLSearchParams(location.search).get(name) || dflt || "";
  }
  var esc = (selector) => selector.replace(/#([^\s"#']+)/g, (_, id) => `#${CSS.escape(id)}`);
  function $(selector, doc) {
    return isString(selector) ? (isElement(doc) || document).querySelector(esc(selector)) : null;
  }
  function $all(selector, doc) {
    return isString(selector) ? (isElement(doc) || document).querySelectorAll(esc(selector)) : null;
  }
  function $event(element, name, detail = {}) {
    return element instanceof EventTarget && element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true }));
  }
  function $on(element, event, callback, ...arg) {
    return isFunction(callback) && element.addEventListener(event, callback, ...arg);
  }
  function $off(element, event, callback, ...arg) {
    return isFunction(callback) && element.removeEventListener(event, callback, ...arg);
  }
  function $attr(element, attr, value) {
    if (isString(element)) element = $(element);
    if (!isElement(element)) return;
    return value === void 0 ? element.getAttribute(attr) : value === null ? element.removeAttribute(attr) : element.setAttribute(attr, value);
  }
  function $empty(element, cleanup) {
    if (isString(element)) element = $(element);
    if (!isElement(element)) return;
    while (element.firstChild) {
      const node = element.firstChild;
      node.remove();
      call(cleanup, node);
    }
    return element;
  }
  function $elem(name, ...args) {
    var element = document.createElement(name), key, val, opts;
    if (isObject(args[0])) {
      args = Object.entries(args[0]).flatMap((x) => x);
      opts = args[1];
    }
    for (let i = 0; i < args.length - 1; i += 2) {
      key = args[i], val = args[i + 1];
      if (!isString(key)) continue;
      if (isFunction(val)) {
        $on(element, key, val, { capture: opts?.capture, passive: opts?.passive, once: opts?.once, signal: opts?.signal });
      } else if (key.startsWith("-")) {
        element.style[key.substr(1)] = val;
      } else if (key.startsWith(".")) {
        element[key.substr(1)] = val;
      } else if (key.startsWith("data-")) {
        element.dataset[toCamel(key.substr(5))] = val;
      } else if (key == "text") {
        element.textContent = val || "";
      } else if (val !== null) {
        element.setAttribute(key, val ?? "");
      }
    }
    return element;
  }
  function $parse(html, format) {
    html = new window.DOMParser().parseFromString(html || "", "text/html");
    return format === "doc" ? html : format === "list" ? Array.from(html.body.childNodes) : html.body;
  }
  function $append(element, template, setup) {
    if (isString(element)) element = $(element);
    if (!isElement(element)) return;
    let doc;
    if (isString(template)) {
      doc = $parse(template, "doc");
    } else if (template?.content?.nodeType == 11) {
      doc = { body: template.content.cloneNode(true) };
    } else {
      return element;
    }
    let node;
    while (node = doc.head?.firstChild) {
      element.appendChild(node);
    }
    while (node = doc.body.firstChild) {
      element.appendChild(node);
      if (setup && node.nodeType == 1) call(setup, node);
    }
    return element;
  }
  var _ready = [];
  function $ready(callback) {
    _ready.push(callback);
    if (document.readyState == "loading") return;
    while (_ready.length) setTimeout(call, 0, _ready.shift());
  }
  $on(window, "DOMContentLoaded", () => {
    while (_ready.length) setTimeout(call, 0, _ready.shift());
  });
  function domChanged() {
    var w = document.documentElement.clientWidth;
    emit("dom:changed", {
      breakPoint: w < 576 ? "xs" : w < 768 ? "sm" : w < 992 ? "md" : w < 1200 ? "lg" : w < 1400 ? "xl" : "xxl",
      colorScheme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    });
  }
  $ready(() => {
    domChanged();
    $on(window.matchMedia("(prefers-color-scheme: dark)"), "change", domChanged);
    var _resize;
    $on(window, "resize", () => {
      clearTimeout(_resize);
      _resize = setTimeout(domChanged, 250);
    });
  });
  var _plugins = {};
  var _default_plugin;
  function register(name, options) {
    if (!name || !isString(name)) throw Error("type must be defined");
    if (options) {
      for (const p of ["render", "cleanup", "data"]) {
        if (options[p] && !isFunction(options[p])) throw Error(p + " must be a function");
      }
      if (isFunction(options?.Component)) {
        app[toCamel(`_${name}_component`)] = options.Component;
      }
    }
    var plugin = _plugins[name] = _plugins[name] || {};
    if (options?.default) _default_plugin = plugin;
    return Object.assign(plugin, options);
  }
  function $data(element, level) {
    if (isString(element)) element = $(element);
    for (const p in _plugins) {
      if (!_plugins[p].data) continue;
      const d = _plugins[p].data(element, level);
      if (d) return d;
    }
  }
  function resolve(path, dflt) {
    const tmpl = parsePath(path);
    trace("resolve:", path, dflt, tmpl);
    var name = tmpl?.name, templates = app.templates, components = app.components;
    var template = tmpl.template || templates[name] || document.getElementById(name);
    if (!template && dflt) {
      template = templates[dflt] || document.getElementById(dflt);
      if (template) tmpl.name = dflt;
    }
    if (isString(template) && template.startsWith("#")) {
      template = document.getElementById(tmpl.otemplate = template.substr(1));
    } else if (isString(template) && template.startsWith("$")) {
      template = templates[tmpl.otemplate = template.substr(1)];
    }
    if (!template) return;
    tmpl.template = template;
    var component = components[name] || components[tmpl.name];
    if (isString(component)) {
      component = components[tmpl.ocomponent = component];
    }
    tmpl.component = component;
    return tmpl;
  }
  function render(options, dflt) {
    var tmpl = resolve(options, dflt);
    if (!tmpl) return;
    var params = tmpl.params = Object.assign(tmpl.params || {}, options?.params);
    params.$target = options.$target || params.$target || app.$target;
    trace("render:", options, tmpl.name, tmpl.params);
    const element = isElement(params.$target) || $(params.$target);
    if (!element) return;
    var plugin = tmpl.component?.$type || options?.plugin || params.$plugin;
    plugin = _plugins[plugin] || _default_plugin;
    if (!plugin?.render) return;
    if (params.$target == app.$target) {
      var ev = { name: tmpl.name, params };
      emit(app.event, "prepare:delete", ev);
      if (ev.stop) return;
      var plugins = Object.values(_plugins);
      for (const p of plugins.filter((x) => x.cleanup)) {
        call(p.cleanup, element);
      }
      if (!(options?.$nohistory || params.$nohistory || tmpl.component?.$nohistory || app.$nohistory)) {
        queueMicrotask(() => {
          emit("path:save", tmpl);
        });
      }
    }
    emit("component:render", tmpl);
    plugin.render(element, tmpl);
    return tmpl;
  }
  function stylePlugin(callback) {
    if (isFunction(callback)) _stylePlugins.push(callback);
  }
  var _stylePlugins = [];
  function applyStylePlugins(element) {
    if (!(element instanceof HTMLElement)) return;
    for (const cb of _stylePlugins) cb(element);
  }
  on("alpine:init", () => {
    for (const p in _plugins) {
      call(_plugins[p], "init");
    }
    on("component:create", (ev) => {
      if (isElement(ev?.element)) applyStylePlugins(ev.element);
    });
  });
  function parsePath(path) {
    var rc = { name: "", params: {} }, query, loc = window.location;
    if (isObject(path)) return Object.assign(rc, path);
    if (!isString(path)) return rc;
    var base = app.base;
    if (path.startsWith(loc.origin)) path = path.substr(loc.origin.length);
    if (path.includes("://")) path = path.replace(/^(.*:\/\/[^/]*)/, "");
    if (path.startsWith(base)) path = path.substr(base.length);
    if (path.startsWith("/")) path = path.substr(1);
    if (path == base.slice(1, -1)) path = "";
    const q = path.indexOf("?");
    if (q > 0) {
      query = path.substr(q + 1, 1024);
      rc.name = path = path.substr(0, q);
    }
    if (path.endsWith(".html")) {
      path = path.slice(0, -5);
    }
    if (path.includes("/")) {
      path = path.split("/").slice(0, 7);
      rc.name = path.shift();
      for (let i = 0; i < path.length; i++) {
        if (!path[i]) continue;
        rc.params[`param${i + 1}`] = path[i];
      }
    } else {
      rc.name = path || "";
    }
    if (query) {
      for (const [key, value] of new URLSearchParams(query).entries()) {
        rc.params[key] = value;
      }
    }
    return rc;
  }
  function savePath(options) {
    if (isString(options)) options = { name: options };
    if (!options?.name) return;
    var path = [options.name];
    if (options?.params) {
      for (let i = 1; i < 7; i++) path.push(options.params[`param${i}`] || "");
    }
    while (!path.at(-1)) path.length--;
    path = path.join("/");
    trace("savePath:", path, options);
    if (!path) return;
    emit("path:push", window.location.origin + app.base + path);
    window.history.pushState(null, "", window.location.origin + app.base + path);
  }
  function restorePath(path) {
    trace("restorePath:", path, app.index);
    render(path, app.index);
  }
  function start() {
    on("path:save", savePath);
    on("path:restore", restorePath);
    $ready(restorePath.bind(app, window.location.href));
  }
  $on(window, "popstate", () => emit("path:restore", window.location.href));
  var fetchOptions = {
    method: "GET",
    cache: "default",
    headers: {}
  };
  function parseOptions(url, options) {
    const headers = options?.headers || {};
    const opts = Object.assign({
      headers,
      method: options?.method || options?.post && "POST" || void 0
    }, options?.request);
    for (const p in fetchOptions.headers) {
      headers[p] ??= fetchOptions.headers[p];
    }
    for (const p of ["method", "cache", "credentials", "duplex", "integrity", "keepalive", "mode", "priority", "redirect", "referrer", "referrerPolicy", "signal"]) {
      if (fetchOptions[p] !== void 0) {
        opts[p] ??= fetchOptions[p];
      }
    }
    var body = options?.body;
    if (opts.method == "GET" || opts.method == "HEAD") {
      if (isObject(body)) {
        url += "?" + new URLSearchParams(body).toString();
      }
    } else if (isString(body)) {
      opts.body = body;
      headers["content-type"] ??= "application/x-www-form-urlencoded; charset=UTF-8";
    } else if (body instanceof FormData) {
      opts.body = body;
      delete headers["content-type"];
    } else if (isObject(body)) {
      opts.body = JSON.stringify(body);
      headers["content-type"] = "application/json; charset=UTF-8";
    } else if (body) {
      opts.body = body;
      headers["content-type"] ??= "application/octet-stream";
    }
    return [url, opts];
  }
  function parseResponse(res) {
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
  function fetch(url, options, callback) {
    if (isFunction(options)) callback = options, options = null;
    try {
      const [uri, opts] = parseOptions(url, options);
      trace("fetch:", uri, opts, options);
      window.fetch(uri, opts).then(async (res) => {
        var err, data2, info = parseResponse(res);
        if (!res.ok) {
          if (/\/json/.test(info.headers["content-type"])) {
            const d = await res.json();
            err = { status: res.status };
            for (const p in d) err[p] = d[p];
          } else {
            err = { message: await res.text(), status: res.status };
          }
          return call(callback, err, data2, info);
        }
        switch (options?.dataType) {
          case "text":
            data2 = await res.text();
            break;
          case "blob":
            data2 = await res.blob();
            break;
          default:
            data2 = /\/json/.test(info.headers["content-type"]) ? await res.json() : await res.text();
        }
        call(callback, null, data2, info);
      }).catch((err) => {
        call(callback, err);
      });
    } catch (err) {
      call(callback, err);
    }
  }
  function afetch(url, options) {
    return new Promise((resolve2, reject) => {
      fetch(url, options, (err, data2, info) => {
        resolve2({ ok: !err, status: info.status, err, data: data2, info });
      });
    });
  }
  var Component = class {
    params = {};
    constructor(name, params) {
      this.$name = name;
      Object.assign(this.params, params);
      this._handleEvent = handleEvent.bind(this);
      this._onCreate = this.onCreate || null;
      this._onDelete = this.onDelete || null;
    }
    /**
     * Called immediately after creation, after event handler setup it calls the class
     * method __onCreate__ to let custom class perform its own initialization
     * @param {object} params - properties passed
     */
    init(params) {
      trace("init:", this.$type, this.$name);
      Object.assign(this.params, params);
      emit("component:create", { type: this.$type, name: this.$name, component: this, element: this.$el, params: this.params });
      if (!this.params.$noevents) {
        on(app.event, this._handleEvent);
      }
      call(this._onCreate?.bind(this, this.params));
    }
    /**
     * Called when a component is about to be destroyed, calls __onDelete__ class method for custom cleanup
     */
    destroy() {
      trace("destroy:", this.$type, this.$name);
      off(app.event, this._handleEvent);
      emit("component:delete", { type: this.$type, name: this.$name, component: this, element: this.$el, params: this.params });
      call(this._onDelete?.bind(this));
      this.params = {};
      delete this.$root;
    }
  };
  function handleEvent(event, ...args) {
    if (this.onEvent) {
      trace("event:", this.$type, this.$name, event, ...args);
      call(this.onEvent?.bind(this.$data || this), event, ...args);
    }
    if (!isString(event)) return;
    var method = toCamel("on_" + event);
    if (!this[method]) return;
    trace("event:", this.$type, this.$name, method, ...args);
    call(this[method]?.bind(this.$data || this), ...args);
  }
  var component_default = Component;
  var _alpine = "alpine";
  var _Alpine;
  var AlpineComponent = class extends component_default {
    static $type = _alpine;
    constructor(name, params) {
      super(name, params);
      this.$type = _alpine;
    }
    init() {
      super.init(this.$root.parentElement._x_params);
    }
  };
  var Element = class extends HTMLElement {
    connectedCallback() {
      queueMicrotask(() => {
        _render(this, this.localName.substr(4));
      });
    }
  };
  function _render(element, options) {
    if (isString(options)) {
      options = resolve(options);
      if (!options) return;
    }
    $empty(element);
    element._x_params = Object.assign({}, options.params);
    _Alpine.onElRemoved(element, () => {
      delete element._x_params;
    });
    if (!options.component) {
      _Alpine.mutateDom(() => {
        $append(element, options.template, _Alpine.initTree);
      });
    } else {
      _Alpine.data(options.name, () => new options.component(options.name));
      const node = $elem("div", "x-data", options.name);
      $append(node, options.template);
      _Alpine.mutateDom(() => {
        element.appendChild(node);
        _Alpine.initTree(node);
      });
    }
    return options;
  }
  function data(element, level) {
    if (!isElement(element)) element = $(app.$target + " div");
    if (!element) return;
    if (typeof level == "number") return element._x_dataStack?.at(level);
    return _Alpine.closestDataStack(element)[0];
  }
  function init() {
    for (const [name, obj] of Object.entries(app.components)) {
      const tag = `app-${obj?.$tag || name}`;
      if (obj?.$type != _alpine || customElements.get(tag)) continue;
      customElements.define(tag, class extends Element {
      });
      _Alpine.data(name, () => new obj(name));
    }
  }
  function $render(el, value, modifiers, callback) {
    const cache = modifiers.includes("cache");
    const opts = { post: modifiers.includes("post") };
    if (!value.url && !(!cache && /^(https?:\/\/|\/|.+\.html(\?|$)).+/.test(value))) {
      if (callback(el, value)) return;
    }
    fetch(value, opts, (err, text, info) => {
      if (err || !isString(text)) {
        return console.warn("$render: Text expected from", value, "got", err, text);
      }
      const tmpl = isString(value) ? parsePath(value) : value;
      tmpl.template = text;
      tmpl.name = tmpl.params?.$name || tmpl.name;
      if (cache) {
        app.templates[tmpl.name] = text;
      }
      callback(el, tmpl);
    });
  }
  function $template(el, value, modifiers) {
    const mods = {};
    const toMods = (tmpl) => {
      for (let i = 0; i < modifiers.length; i++) {
        const mod = modifiers[i];
        switch (mod) {
          case "params":
            var scope = _Alpine.$data(el);
            if (!isObject(scope[modifiers[i + 1]])) break;
            tmpl.params = Object.assign(scope[modifiers[i + 1]], tmpl.params);
            break;
          case "inline":
            mods.inline = "inline-block";
            break;
          default:
            mods[mod] = mod;
        }
      }
      return tmpl;
    };
    $render(el, value, modifiers, (el2, tmpl) => {
      tmpl = resolve(tmpl);
      if (!tmpl) return;
      if (!_render(el2, toMods(tmpl))) return;
      if (mods.show) {
        if (mods.nonempty && !el2.firstChild) {
          el2.style.setProperty("display", "none", mods.important);
        } else {
          el2.style.setProperty("display", mods.flex || mods.inline || "block", mods.important);
        }
      }
      return true;
    });
  }
  register(_alpine, { render: _render, Component: AlpineComponent, data, init, default: 1 });
  function AlpinePlugin(Alpine2) {
    _Alpine = Alpine2;
    emit("alpine:init");
    Alpine2.magic("app", (el) => app);
    Alpine2.magic("params", (el) => {
      while (el) {
        if (el._x_params) return el._x_params;
        el = el.parentElement;
      }
    });
    Alpine2.magic("component", (el) => Alpine2.closestDataStack(el).find((x) => x.$type == _alpine && x.$name));
    Alpine2.magic("parent", (el) => Alpine2.closestDataStack(el).filter((x) => x.$type == _alpine && x.$name)[1]);
    Alpine2.directive("render", (el, { modifiers, expression }, { evaluate, cleanup }) => {
      const click = (e) => {
        const value = evaluate(expression);
        if (!value) return;
        e.preventDefault();
        if (modifiers.includes("stop")) {
          e.stopPropagation();
        }
        $render(el, value, modifiers, (el2, tmpl) => render(tmpl));
      };
      $on(el, "click", click);
      el.style.cursor = "pointer";
      cleanup(() => {
        $off(el, "click", click);
      });
    });
    Alpine2.directive("template", (el, { modifiers, expression }, { effect, cleanup }) => {
      const evaluate = Alpine2.evaluateLater(el, expression);
      var template;
      const empty = () => {
        template = null;
        Alpine2.mutateDom(() => {
          $empty(el, (node) => Alpine2.destroyTree(node));
          if (modifiers.includes("show")) {
            el.style.setProperty("display", "none", modifiers.includes("important") ? "important" : void 0);
          }
        });
      };
      effect(() => evaluate((value) => {
        if (!value) return empty();
        if (value !== template) {
          $template(el, value, modifiers);
        }
        template = value;
      }));
      cleanup(empty);
    });
    Alpine2.directive("scope-level", (el, { expression }, { evaluate }) => {
      const scope = Alpine2.closestDataStack(el);
      el._x_dataStack = scope.slice(0, parseInt(evaluate(expression || "")) || 0);
    });
  }
  app.Component = component_default;
  var index_default = app;

  // builds/cdn.js
  Object.assign(app, app_exports);
  window.app = app;
  $on(document, "alpine:init", () => {
    AlpinePlugin(Alpine);
  });
})();
