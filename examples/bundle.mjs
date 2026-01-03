// ../dist/app.mjs
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
  /**
   * global defaults for the {@link app.fetch} will be used if not passed
   * @var {object} app.fetchOptions
   */
  isF: isFunction,
  isS: isString,
  isE: isElement,
  isO: isObj,
  isN: isNumber,
  isA: isArray,
  toCamel,
  call,
  escape,
  noop,
  __,
  /**
   * Alias to console.log
   */
  log: (...args) => console.log(...args),
  /**
   * if __app.debug__ is set then it will log arguments in the console otherwise it is no-op
   * @param {...any} args
   */
  trace: (...args) => {
    app.debug && app.log(...args);
  }
};
function noop() {
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
function isObj(obj) {
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
app.on = (event, callback, namespace) => {
  if (!isFunction(callback)) return;
  if (!_events[event]) _events[event] = [];
  _events[event].push([callback, isString(namespace)]);
};
app.once = (event, callback, namespace) => {
  if (!isFunction(callback)) return;
  const cb = (...args) => {
    app.off(event, cb);
    callback(...args);
  };
  app.on(event, cb, namespace);
};
app.only = (event, callback, namespace) => {
  _events[event] = isFunction(callback) ? [callback, isString(namespace)] : [];
};
app.off = (event, callback) => {
  if (event && callback) {
    if (!_events[event]) return;
    const i = isFunction(callback) ? 0 : isString(callback) ? 1 : -1;
    if (i >= 0) _events[event] = _events[event].filter((x) => x[i] !== callback);
  } else if (isString(event)) {
    for (const ev in _events) {
      _events[ev] = _events[ev].filter((x) => x[1] !== event);
    }
  }
};
app.emit = (event, ...args) => {
  app.trace("emit:", event, ...args, app.debug > 1 && _events[event]);
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
};
app.$param = (name, dflt) => new URLSearchParams(location.search).get(name) || dflt || "";
var esc = (selector) => selector.replace(/#([^\s"#']+)/g, (_, id) => `#${CSS.escape(id)}`);
app.$ = (selector, doc) => isString(selector) ? (isElement(doc) || document).querySelector(esc(selector)) : null;
app.$all = (selector, doc) => isString(selector) ? (isElement(doc) || document).querySelectorAll(esc(selector)) : null;
app.$event = (element, name, detail = {}) => element instanceof EventTarget && element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true }));
app.$on = (element, event, callback, ...arg) => isFunction(callback) && element.addEventListener(event, callback, ...arg);
app.$off = (element, event, callback, ...arg) => isFunction(callback) && element.removeEventListener(event, callback, ...arg);
app.$attr = (element, attr, value) => {
  if (isString(element)) element = app.$(element);
  if (!isElement(element)) return;
  return value === void 0 ? element.getAttribute(attr) : value === null ? element.removeAttribute(attr) : element.setAttribute(attr, value);
};
app.$empty = (element, cleanup) => {
  if (isString(element)) element = app.$(element);
  if (!isElement(element)) return;
  while (element.firstChild) {
    const node = element.firstChild;
    node.remove();
    app.call(cleanup, node);
  }
  return element;
};
app.$elem = (name, ...args) => {
  var element = document.createElement(name), key, val, opts;
  if (isObj(args[0])) {
    args = Object.entries(args[0]).flatMap((x) => x);
    opts = args[1];
  }
  for (let i = 0; i < args.length - 1; i += 2) {
    key = args[i], val = args[i + 1];
    if (!isString(key)) continue;
    if (isFunction(val)) {
      app.$on(element, key, val, { capture: opts?.capture, passive: opts?.passive, once: opts?.once, signal: opts?.signal });
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
};
app.$parse = (html, format) => {
  html = new window.DOMParser().parseFromString(html || "", "text/html");
  return format === "doc" ? html : format === "list" ? Array.from(html.body.childNodes) : html.body;
};
app.$append = (element, template, setup) => {
  if (isString(element)) element = app.$(element);
  if (!isElement(element)) return;
  let doc;
  if (isString(template)) {
    doc = app.$parse(template, "doc");
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
    if (setup && node.nodeType == 1) app.call(setup, node);
  }
  return element;
};
var _ready = [];
app.$ready = (callback) => {
  _ready.push(callback);
  if (document.readyState == "loading") return;
  while (_ready.length) setTimeout(app.call, 0, _ready.shift());
};
app.$on(window, "DOMContentLoaded", () => {
  while (_ready.length) setTimeout(app.call, 0, _ready.shift());
});
function domChanged() {
  var w = document.documentElement.clientWidth;
  app.emit("dom:changed", {
    breakPoint: w < 576 ? "xs" : w < 768 ? "sm" : w < 992 ? "md" : w < 1200 ? "lg" : w < 1400 ? "xl" : "xxl",
    colorScheme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  });
}
app.$ready(() => {
  domChanged();
  app.$on(window.matchMedia("(prefers-color-scheme: dark)"), "change", domChanged);
  var _resize;
  app.$on(window, "resize", () => {
    clearTimeout(_resize);
    _resize = setTimeout(domChanged, 250);
  });
});
app.parsePath = (path) => {
  var rc = { name: "", params: {} }, query, loc = window.location;
  if (isObj(path)) return Object.assign(rc, path);
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
};
app.savePath = (options) => {
  if (isString(options)) options = { name: options };
  if (!options?.name) return;
  var path = [options.name];
  if (options?.params) {
    for (let i = 1; i < 7; i++) path.push(options.params[`param${i}`] || "");
  }
  while (!path.at(-1)) path.length--;
  path = path.join("/");
  app.trace("savePath:", path, options);
  if (!path) return;
  app.emit("path:push", window.location.origin + app.base + path);
  window.history.pushState(null, "", window.location.origin + app.base + path);
};
app.restorePath = (path) => {
  app.trace("restorePath:", path, app.index);
  app.render(path, app.index);
};
app.start = () => {
  app.on("path:save", app.savePath);
  app.on("path:restore", app.restorePath);
  app.$ready(app.restorePath.bind(app, window.location.href));
};
app.$on(window, "popstate", () => app.emit("path:restore", window.location.href));
var _plugins = {};
var _default_plugin;
app.plugin = (name, options) => {
  if (!name || !isString(name)) throw Error("type must be defined");
  if (options) {
    for (const p of ["render", "cleanup", "data"]) {
      if (options[p] && !isFunction(options[p])) throw Error(p + " must be a function");
    }
    if (isFunction(options?.Component)) {
      app[`${name.substr(0, 1).toUpperCase() + name.substr(1).toLowerCase()}Component`] = options.Component;
    }
  }
  var plugin = _plugins[name] = _plugins[name] || {};
  if (options?.default) _default_plugin = plugin;
  return Object.assign(plugin, options);
};
app.$data = (element, level) => {
  if (isString(element)) element = app.$(element);
  for (const p in _plugins) {
    if (!_plugins[p].data) continue;
    const d = _plugins[p].data(element, level);
    if (d) return d;
  }
};
app.resolve = (path, dflt) => {
  const tmpl = app.parsePath(path);
  app.trace("resolve:", path, dflt, tmpl);
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
};
app.render = (options, dflt) => {
  var tmpl = app.resolve(options, dflt);
  if (!tmpl) return;
  var params = tmpl.params = Object.assign(tmpl.params || {}, options?.params);
  params.$target = options.$target || params.$target || app.$target;
  app.trace("render:", options, tmpl.name, tmpl.params);
  const element = isElement(params.$target) || app.$(params.$target);
  if (!element) return;
  var plugin = tmpl.component?.$type || options?.plugin || params.$plugin;
  plugin = _plugins[plugin] || _default_plugin;
  if (!plugin?.render) return;
  if (params.$target == app.$target) {
    var ev = { name: tmpl.name, params };
    app.emit(app.event, "prepare:delete", ev);
    if (ev.stop) return;
    var plugins = Object.values(_plugins);
    for (const p of plugins.filter((x) => x.cleanup)) {
      app.call(p.cleanup, element);
    }
    if (!(options?.$nohistory || params.$nohistory || tmpl.component?.$nohistory || app.$nohistory)) {
      queueMicrotask(() => {
        app.emit("path:save", tmpl);
      });
    }
  }
  app.emit("component:render", tmpl);
  plugin.render(element, tmpl);
  return tmpl;
};
app.on("alpine:init", () => {
  for (const p in _plugins) {
    app.call(_plugins[p], "init");
  }
});
var fetchOptions = app.fetchOptions = {
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
    if (isObj(body)) {
      url += "?" + new URLSearchParams(body).toString();
    }
  } else if (isString(body)) {
    opts.body = body;
    headers["content-type"] ??= "application/x-www-form-urlencoded; charset=UTF-8";
  } else if (body instanceof FormData) {
    opts.body = body;
    delete headers["content-type"];
  } else if (isObj(body)) {
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
app.fetch = function(url, options, callback) {
  if (isFunction(options)) callback = options, options = null;
  try {
    const [uri, opts] = parseOptions(url, options);
    app.trace("fetch:", uri, opts, options);
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
        return app.call(callback, err, data2, info);
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
      app.call(callback, null, data2, info);
    }).catch((err) => {
      app.call(callback, err);
    });
  } catch (err) {
    app.call(callback, err);
  }
};
app.afetch = function(url, options) {
  return new Promise((resolve, reject) => {
    app.fetch(url, options, (err, data2, info) => {
      resolve({ ok: !err, status: info.status, err, data: data2, info });
    });
  });
};
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
    app.trace("init:", this.$type, this.$name);
    Object.assign(this.params, params);
    app.emit("component:create", { type: this.$type, name: this.$name, component: this, element: this.$el, params: this.params });
    if (!this.params.$noevents) {
      app.on(app.event, this._handleEvent);
    }
    app.call(this._onCreate?.bind(this, this.params));
  }
  /**
   * Called when a component is about to be destroyed, calls __onDelete__ class method for custom cleanup
   */
  destroy() {
    app.trace("destroy:", this.$type, this.$name);
    app.off(app.event, this._handleEvent);
    app.emit("component:delete", { type: this.$type, name: this.$name, component: this, element: this.$el, params: this.params });
    app.call(this._onDelete?.bind(this));
    this.params = {};
    delete this.$root;
  }
};
function handleEvent(event, ...args) {
  if (this.onEvent) {
    app.trace("event:", this.$type, this.$name, event, ...args);
    app.call(this.onEvent?.bind(this.$data || this), event, ...args);
  }
  if (!isString(event)) return;
  var method = toCamel("on_" + event);
  if (!this[method]) return;
  app.trace("event:", this.$type, this.$name, method, ...args);
  app.call(this[method]?.bind(this.$data || this), ...args);
}
var component_default = Component;
var _alpine = "alpine";
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
      render(this, this.localName.substr(4));
    });
  }
};
function render(element, options) {
  if (isString(options)) {
    options = app.resolve(options);
    if (!options) return;
  }
  app.$empty(element);
  element._x_params = Object.assign({}, options.params);
  Alpine.onElRemoved(element, () => {
    delete element._x_params;
  });
  if (!options.component) {
    Alpine.mutateDom(() => {
      app.$append(element, options.template, Alpine.initTree);
    });
  } else {
    Alpine.data(options.name, () => new options.component(options.name));
    const node = app.$elem("div", "x-data", options.name);
    app.$append(node, options.template);
    Alpine.mutateDom(() => {
      element.appendChild(node);
      Alpine.initTree(node);
    });
  }
  return options;
}
function data(element, level) {
  if (!isElement(element)) element = app.$(app.$target + " div");
  if (!element) return;
  if (typeof level == "number") return element._x_dataStack?.at(level);
  return Alpine.closestDataStack(element)[0];
}
function init() {
  for (const [name, obj] of Object.entries(app.components)) {
    const tag = `app-${obj?.$tag || name}`;
    if (obj?.$type != _alpine || customElements.get(tag)) continue;
    customElements.define(tag, class extends Element {
    });
    Alpine.data(name, () => new obj(name));
  }
}
function $render(el, value, modifiers, callback) {
  const cache = modifiers.includes("cache");
  const opts = { post: modifiers.includes("post") };
  if (!value.url && !(!cache && /^(https?:\/\/|\/|.+\.html(\?|$)).+/.test(value))) {
    if (callback(el, value)) return;
  }
  app.fetch(value, opts, (err, text, info) => {
    if (err || !isString(text)) {
      return console.warn("$render: Text expected from", value, "got", err, text);
    }
    const tmpl = isString(value) ? app.parsePath(value) : value;
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
          var scope = Alpine.$data(el);
          if (!isObj(scope[modifiers[i + 1]])) break;
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
    tmpl = app.resolve(tmpl);
    if (!tmpl) return;
    if (!render(el2, toMods(tmpl))) return;
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
app.plugin(_alpine, { render, Component: AlpineComponent, data, init, default: 1 });
app.$on(document, "alpine:init", () => {
  app.emit("alpine:init");
  Alpine.magic("app", (el) => app);
  Alpine.magic("params", (el) => {
    while (el) {
      if (el._x_params) return el._x_params;
      el = el.parentElement;
    }
  });
  Alpine.magic("component", (el) => Alpine.closestDataStack(el).find((x) => x.$type == _alpine && x.$name));
  Alpine.magic("parent", (el) => Alpine.closestDataStack(el).filter((x) => x.$type == _alpine && x.$name)[1]);
  Alpine.directive("render", (el, { modifiers, expression }, { evaluate, cleanup }) => {
    const click = (e) => {
      const value = evaluate(expression);
      if (!value) return;
      e.preventDefault();
      if (modifiers.includes("stop")) {
        e.stopPropagation();
      }
      $render(el, value, modifiers, (el2, tmpl) => app.render(tmpl));
    };
    app.$on(el, "click", click);
    el.style.cursor = "pointer";
    cleanup(() => {
      app.$off(el, "click", click);
    });
  });
  Alpine.directive("template", (el, { modifiers, expression }, { effect, cleanup }) => {
    const evaluate = Alpine.evaluateLater(el, expression);
    var template;
    const empty = () => {
      template = null;
      Alpine.mutateDom(() => {
        app.$empty(el, (node) => Alpine.destroyTree(node));
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
  Alpine.directive("scope-level", (el, { expression }, { evaluate }) => {
    const scope = Alpine.closestDataStack(el);
    el._x_dataStack = scope.slice(0, parseInt(evaluate(expression || "")) || 0);
  });
});
var lib_exports = {};
__export(lib_exports, {
  forEach: () => forEach,
  forEachSeries: () => forEachSeries,
  isFlag: () => isFlag,
  loadResources: () => loadResources,
  parallel: () => parallel,
  sanitizer: () => sanitizer,
  sendFile: () => sendFile,
  series: () => series,
  split: () => split,
  toAge: () => toAge,
  toBool: () => toBool,
  toDate: () => toDate,
  toDuration: () => toDuration,
  toNumber: () => toNumber,
  toPrice: () => toPrice,
  toSize: () => toSize,
  toTitle: () => toTitle
});
function isFlag(list, item) {
  return Array.isArray(list) && (Array.isArray(item) ? item.some((x) => list.includes(x)) : list.includes(item));
}
function forEachSeries(list, iterator, callback, direct = true) {
  callback = isFunction(callback) || noop;
  if (!Array.isArray(list) || !list.length) return callback();
  function iterate(i, ...args) {
    if (i >= list.length) return direct ? callback(null, ...args) : setTimeout(callback, 0, null, ...args);
    iterator(list[i], (...args2) => {
      if (args2[0]) {
        if (direct) callback(...args2);
        else setTimeout(callback, 0, ...args2);
        callback = noop;
      } else {
        iterate(++i, ...args2.slice(1));
      }
    }, ...args);
  }
  iterate(0);
}
function series(tasks, callback, direct = true) {
  forEachSeries(tasks, (task, next, ...args) => {
    if (direct) task(next, ...args);
    else setTimeout(task, 0, next, ...args);
  }, callback, direct);
}
function forEach(list, iterator, callback, direct = true) {
  callback = isFunction(callback) || noop;
  if (!Array.isArray(list) || !list.length) return callback();
  var count = list.length;
  for (let i = 0; i < list.length; i++) {
    iterator(list[i], (err) => {
      if (err) {
        if (direct) callback(err);
        else setTimeout(callback, 0, err);
        callback = noop;
        i = list.length + 1;
      } else if (--count == 0) {
        if (direct) callback();
        else setTimeout(callback, 0);
        callback = noop;
      }
    });
  }
}
function parallel(tasks, callback, direct = true) {
  forEach(tasks, (task, next) => {
    task(next);
  }, callback, direct);
}
function toDate(val, dflt, invalid) {
  if (isFunction(val?.getTime)) return val;
  var d = NaN;
  if (isString(val)) {
    val = /^[0-9.]+$/.test(val) ? toNumber(val) : val.replace(/([0-9])(AM|PM)/i, "$1 $2");
  }
  if (isNumber(val)) {
    if (val > 2147485547e3) val = Math.round(val / 1e3);
    if (val < 2147483647) val *= 1e3;
  }
  if (!isString(val) && !isNumber(val)) val = d;
  if (val) try {
    d = new Date(val);
  } catch (e) {
  }
  return !isNaN(d) ? d : invalid || dflt !== void 0 && isNaN(dflt) || dflt === null || dflt === 0 ? null : new Date(dflt || 0);
}
function toAge(mtime) {
  var str = "";
  mtime = isNumber(mtime) ?? toNumber(mtime);
  if (mtime > 0) {
    var secs = Math.floor((Date.now() - mtime) / 1e3);
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
    } else if (w > 0) {
      str = w > 1 ? __(w, " weeks") : __("1 week");
      if (d > 0) str += " " + (d > 1 ? __(d, " days") : __("1 day"));
      if (h > 0) str += " " + (h > 1 ? __(h, " hours") : __("1 hour"));
    } else if (d > 0) {
      str = d > 1 ? __(d, " days") : __("1 day");
      if (h > 0) str += " " + (h > 1 ? __(h, " hours") : __("1 hour"));
      if (m > 0) str += " " + (m > 1 ? __(m, " minutes") : __("1 minute"));
    } else if (h > 0) {
      str = h > 1 ? __(h, " hours") : __("1 hour");
      if (m > 0) str += " " + (m > 1 ? __(m, " minutes") : __("1 minute"));
    } else if (m > 0) {
      str = m > 1 ? __(m, " minutes") : __("1 minute");
      if (s > 0) str += " " + (s > 1 ? __(s, " seconds") : __("1 second"));
    } else {
      str = secs > 1 ? __(secs, " seconds") : __("1 second");
    }
  }
  return str;
}
function toDuration(mtime) {
  var str = "";
  mtime = isNumber(mtime) ?? toNumber(mtime);
  if (mtime > 0) {
    var seconds = Math.floor(mtime / 1e3);
    var d = Math.floor(seconds / 86400);
    var h = Math.floor((seconds - d * 86400) / 3600);
    var m = Math.floor((seconds - d * 86400 - h * 3600) / 60);
    var s = Math.floor(seconds - d * 86400 - h * 3600 - m * 60);
    if (d > 0) {
      str = d > 1 ? __(d, " days") : __("1 day");
      if (h > 0) str += " " + (h > 1 ? __(h, " hours") : __("1 hour"));
      if (m > 0) str += " " + (m > 1 ? __(m, " minutes") : __("1 minute"));
    } else if (h > 0) {
      str = h > 1 ? __(h, " hours") : __("1 hour");
      if (m > 0) str += " " + (m > 1 ? __(m, " minutes") : __("1 minute"));
    } else if (m > 0) {
      str = m > 1 ? __(m, " minutes") : __("1 minute");
      if (s > 0) str += " " + (s > 1 ? __(s, " seconds") : __("1 second"));
    } else {
      str = seconds > 1 ? __(seconds, " seconds") : __("1 second");
    }
  }
  return str;
}
function toSize(size, decimals = 2) {
  var i = size > 0 ? Math.floor(Math.log(size) / Math.log(1024)) : 0;
  return (size / Math.pow(1024, i)).toFixed(isNumber(decimals) ?? 2) * 1 + " " + [__("Bytes"), __("KBytes"), __("MBytes"), __("GBytes"), __("TBytes")][i];
}
function toTitle(name, minlen) {
  return isString(name) ? minlen > 0 && name.length <= minlen ? name : name.replace(/_/g, " ").split(/[ ]+/).reduce((x, y) => x + y.substr(0, 1).toUpperCase() + y.substr(1) + " ", "").trim() : "";
}
function toBool(val, dflt) {
  if (typeof val == "boolean") return val;
  if (typeof val == "number") return !!val;
  if (val === void 0) val = dflt;
  return /^(true|on|yes|1|t)$/i.test(val);
}
function toNumber(val, options) {
  var n = 0;
  if (typeof val == "number") {
    n = val;
  } else if (typeof val == "boolean") {
    n = val ? 1 : 0;
  } else {
    if (typeof val != "string") {
      n = options?.dflt || 0;
    } else {
      var f = typeof options?.float == "undefined" || options?.float == null ? /^(-|\+)?([0-9]+)?\.[0-9]+$/.test(val) : options?.float;
      n = val[0] == "t" ? 1 : val[0] == "f" ? 0 : val == "infinity" ? Infinity : f ? parseFloat(val, 10) : parseInt(val, 10);
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
function toPrice(num, options) {
  try {
    return toNumber(num).toLocaleString(options?.locale || "en-US", {
      style: "currency",
      currency: options?.currency || "USD",
      currencyDisplay: options?.display || "symbol",
      currencySign: options?.sign || "standard",
      minimumFractionDigits: options?.min || 2,
      maximumFractionDigits: options?.max || 5
    });
  } catch (e) {
    console.error("toPrice:", e, num, options);
    return "";
  }
}
function split(str, sep, options) {
  if (!str) return [];
  var list = Array.isArray(str) ? str : (isString(str) ? str : String(str)).split(sep || /[,|]/), len = list.length;
  if (!len) return list;
  var rc = [], keys = isObj(options) ? Object.reys(options) : [], v;
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
function loadResources(urls, options, callback) {
  if (typeof options == "function") callback = options, options = null;
  if (typeof urls == "string") urls = [urls];
  app[`forEach${options?.series ? "Series" : ""}`](urls, (url, next) => {
    let el;
    const ev = () => {
      call(options?.callback, el, options);
      next();
    };
    if (/\.css/.test(url)) {
      el = app.$elem("link", "rel", "stylesheet", "type", "text/css", "href", url, "load", ev, "error", ev);
    } else {
      el = app.$elem("script", "async", !!options?.async, "src", url, "load", ev, "error", ev);
    }
    for (const p in options?.attrs) app.$attr(el, p, options.attrs[p]);
    document.head.appendChild(el);
  }, options?.timeout > 0 ? () => {
    setTimeout(callback, options.timeout);
  } : callback);
}
function sendFile(url, options, callback) {
  var body = new FormData();
  for (const p in options.files) {
    const file = options.files[p];
    if (!file?.files?.length) continue;
    body.append(p, file.files[0]);
  }
  const add = (k, v) => {
    body.append(k, isFunction(v) ? v() : v === null || v === true ? "" : v);
  };
  const build = (key, val) => {
    if (val === void 0) return;
    if (Array.isArray(val)) {
      for (const i in val) build(`${key}[${app.isO(val[i]) ? i : ""}]`, val[i]);
    } else if (isObj(val)) {
      for (const n in val) build(`${key}[${n}]`, val[n]);
    } else {
      add(key, val);
    }
  };
  for (const p in options.body) {
    build(p, options.body[p]);
  }
  for (const p in options.json) {
    const blob = new Blob([JSON.stringify(options.json[p])], { type: "application/json" });
    body.append(p, blob);
  }
  var req = { body };
  for (const p in options) {
    req[p] ??= options[p];
  }
  app.fetch(url, req, callback);
}
function isattr(attr, list) {
  const name = attr.nodeName.toLowerCase();
  if (list.includes(name)) {
    if (sanitizer._attrs.has(name)) {
      return sanitizer._urls.test(attr.nodeValue) || sanitizer._data.test(attr.nodeValue);
    }
    return true;
  }
  return list.some((x) => x instanceof RegExp && x.test(name));
}
function sanitizer(html, list) {
  if (!isString(html)) return list ? [] : html;
  const body = app.$parse(html);
  const elements = [...body.querySelectorAll("*")];
  for (const el of elements) {
    const name = el.nodeName.toLowerCase();
    if (sanitizer._tags[name]) {
      const allow = [...sanitizer._tags["*"], ...sanitizer._tags[name] || []];
      for (const attr of [...el.attributes]) {
        if (!isattr(attr, allow)) el.removeAttribute(attr.nodeName);
      }
    } else {
      el.remove();
    }
  }
  return list ? Array.from(body.childNodes) : body.innerHTML;
}
sanitizer._attrs = /* @__PURE__ */ new Set(["background", "cite", "href", "itemtype", "longdesc", "poster", "src", "xlink:href"]);
sanitizer._urls = /^(?:(?:https?|mailto|ftp|tel|file|sms):|[^#&/:?]*(?:[#/?]|$))/i;
sanitizer._data = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[\d+/a-z]+=*$/i;
sanitizer._tags = {
  "*": [
    "class",
    "dir",
    "id",
    "lang",
    "role",
    /^aria-[\w-]*$/i,
    "data-bs-toggle",
    "data-bs-target",
    "data-bs-dismiss",
    "data-bs-parent"
  ],
  a: ["target", "href", "title", "rel"],
  area: [],
  b: [],
  blockquote: [],
  br: [],
  button: [],
  col: [],
  code: [],
  div: [],
  em: [],
  hr: [],
  img: ["src", "srcset", "alt", "title", "width", "height", "style"],
  h1: [],
  h2: [],
  h3: [],
  h4: [],
  h5: [],
  h6: [],
  i: [],
  li: [],
  ol: [],
  p: [],
  pre: [],
  s: [],
  small: [],
  span: [],
  sub: [],
  sup: [],
  strong: [],
  table: [],
  thead: [],
  tbody: [],
  th: [],
  tr: [],
  td: [],
  u: [],
  ul: []
};
app.Component = component_default;

// index.mjs
app.debug = 1;
app.start();
var index_default = app;
export {
  index_default as default
};
