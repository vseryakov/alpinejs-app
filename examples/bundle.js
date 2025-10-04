(() => {
  // ../dist/app.js
  (() => {
    var app2 = {
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
      toCamel
    };
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
    function toCamel(key) {
      return isString(key) ? key.toLowerCase().replace(/[.:_-](\w)/g, (_, c) => c.toUpperCase()) : "";
    }
    app2.noop = () => {
    };
    app2.log = (...args) => console.log(...args);
    app2.trace = (...args) => {
      app2.debug && app2.log(...args);
    };
    app2.call = (obj, method, ...arg) => {
      if (isFunction(obj)) return obj(method, ...arg);
      if (typeof obj != "object") return;
      if (isFunction(method)) return method.call(obj, ...arg);
      if (obj && isFunction(obj[method])) return obj[method].call(obj, ...arg);
    };
    var _events = {};
    app2.on = (event, callback, namespace) => {
      if (!isFunction(callback)) return;
      if (!_events[event]) _events[event] = [];
      _events[event].push([callback, isString(namespace)]);
    };
    app2.once = (event, callback, namespace) => {
      if (!isFunction(callback)) return;
      const cb = (...args) => {
        app2.off(event, cb);
        callback(...args);
      };
      app2.on(event, cb, namespace);
    };
    app2.only = (event, callback, namespace) => {
      _events[event] = isFunction(callback) ? [callback, isString(namespace)] : [];
    };
    app2.off = (event, callback) => {
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
    app2.emit = (event, ...args) => {
      app2.trace("emit:", event, ...args, app2.debug > 1 && _events[event]);
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
    app2.$param = (name, dflt) => new URLSearchParams(location.search).get(name) || dflt || "";
    var esc = (selector) => selector.replace(/#([^\s"#']+)/g, (_, id) => `#${CSS.escape(id)}`);
    app2.$ = (selector, doc) => isString(selector) ? (isElement(doc) || document).querySelector(esc(selector)) : null;
    app2.$all = (selector, doc) => isString(selector) ? (isElement(doc) || document).querySelectorAll(esc(selector)) : null;
    app2.$event = (element, name, detail = {}) => element instanceof EventTarget && element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true }));
    app2.$on = (element, event, callback, ...arg) => isFunction(callback) && element.addEventListener(event, callback, ...arg);
    app2.$off = (element, event, callback, ...arg) => isFunction(callback) && element.removeEventListener(event, callback, ...arg);
    app2.$attr = (element, attr, value) => {
      if (isString(element)) element = app2.$(element);
      if (!isElement(element)) return;
      return value === void 0 ? element.getAttribute(attr) : value === null ? element.removeAttribute(attr) : element.setAttribute(attr, value);
    };
    app2.$empty = (element, cleanup) => {
      if (isString(element)) element = app2.$(element);
      if (!isElement(element)) return;
      while (element.firstChild) {
        const node = element.firstChild;
        node.remove();
        app2.call(cleanup, node);
      }
      return element;
    };
    app2.$elem = (name, ...arg) => {
      var element = document.createElement(name), key, val, opts;
      if (isObj(arg[0])) {
        arg = Object.entries(arg[0]).flatMap((x) => x);
        opts = arg[1];
      }
      for (let i = 0; i < arg.length - 1; i += 2) {
        key = arg[i], val = arg[i + 1];
        if (!isString(key)) continue;
        if (isFunction(val)) {
          app2.$on(element, key, val, { capture: opts?.capture, passive: opts?.passive, once: opts?.once, signal: opts?.signal });
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
    app2.$parse = (html, format) => {
      html = new window.DOMParser().parseFromString(html || "", "text/html");
      return format === "doc" ? html : format === "list" ? Array.from(html.body.childNodes) : html.body;
    };
    app2.$append = (element, template, setup) => {
      if (isString(element)) element = app2.$(element);
      if (!isElement(element)) return;
      let doc;
      if (isString(template)) {
        doc = app2.$parse(template, "doc");
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
        if (setup && node.nodeType == 1) app2.call(setup, node);
      }
      return element;
    };
    var _ready = [];
    app2.$ready = (callback) => {
      _ready.push(callback);
      if (document.readyState == "loading") return;
      while (_ready.length) setTimeout(app2.call, 0, _ready.shift());
    };
    app2.$on(window, "DOMContentLoaded", () => {
      while (_ready.length) setTimeout(app2.call, 0, _ready.shift());
    });
    app2.parsePath = (path) => {
      var rc = { name: "", params: {} }, query, loc = window.location;
      if (isObj(path)) return Object.assign(rc, path);
      if (!isString(path)) return rc;
      var base = app2.base;
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
    app2.savePath = (options) => {
      if (isString(options)) options = { name: options };
      if (!options?.name) return;
      var path = [options.name];
      if (options?.params) {
        for (let i = 1; i < 7; i++) path.push(options.params[`param${i}`] || "");
      }
      while (!path.at(-1)) path.length--;
      path = path.join("/");
      app2.trace("savePath:", path, options);
      if (!path) return;
      app2.emit("path:push", window.location.origin + app2.base + path);
      window.history.pushState(null, "", window.location.origin + app2.base + path);
    };
    app2.restorePath = (path) => {
      app2.trace("restorePath:", path, app2.index);
      app2.render(path, app2.index);
    };
    app2.start = () => {
      app2.on("path:save", app2.savePath);
      app2.on("path:restore", app2.restorePath);
      app2.$ready(app2.restorePath.bind(app2, window.location.href));
    };
    app2.$on(window, "popstate", () => app2.emit("path:restore", window.location.href));
    var _plugins = {};
    var _default_plugin;
    app2.plugin = (name, options) => {
      if (!name || !isString(name)) throw Error("type must be defined");
      if (options) {
        for (const p of ["render", "cleanup", "data"]) {
          if (options[p] && !isFunction(options[p])) throw Error(p + " must be a function");
        }
        if (isFunction(options?.Component)) {
          app2[`${name.substr(0, 1).toUpperCase() + name.substr(1).toLowerCase()}Component`] = options.Component;
        }
      }
      var plugin = _plugins[name] = _plugins[name] || {};
      if (options?.default) _default_plugin = plugin;
      return Object.assign(plugin, options);
    };
    app2.$data = (element, level) => {
      if (isString(element)) element = app2.$(element);
      for (const p in _plugins) {
        if (!_plugins[p].data) continue;
        const d = _plugins[p].data(element, level);
        if (d) return d;
      }
    };
    app2.resolve = (path, dflt) => {
      const tmpl = app2.parsePath(path);
      app2.trace("resolve:", path, dflt, tmpl);
      var name = tmpl?.name, templates = app2.templates, components = app2.components;
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
    app2.render = (options, dflt) => {
      var tmpl = app2.resolve(options, dflt);
      if (!tmpl) return;
      var params = tmpl.params = Object.assign(tmpl.params || {}, options?.params);
      params.$target = options.$target || params.$target || app2.$target;
      app2.trace("render:", options, tmpl.name, tmpl.params);
      const element = isElement(params.$target) || app2.$(params.$target);
      if (!element) return;
      var plugin = tmpl.component?.$type || options?.plugin || params.$plugin;
      plugin = _plugins[plugin] || _default_plugin;
      if (!plugin?.render) return;
      if (params.$target == app2.$target) {
        var ev = { name: tmpl.name, params };
        app2.emit(app2.event, "prepare:delete", ev);
        if (ev.stop) return;
        var plugins = Object.values(_plugins);
        for (const p of plugins.filter((x) => x.cleanup)) {
          app2.call(p.cleanup, element);
        }
        if (!(options?.$nohistory || params.$nohistory || tmpl.component?.$nohistory || app2.$nohistory)) {
          queueMicrotask(() => {
            app2.emit("path:save", tmpl);
          });
        }
      }
      app2.emit("component:render", tmpl);
      plugin.render(element, tmpl);
      return tmpl;
    };
    app2.on("alpine:init", () => {
      for (const p in _plugins) {
        app2.call(_plugins[p], "init");
      }
    });
    var Component = class {
      params = {};
      constructor(name, params) {
        this.$name = name;
        Object.assign(this.params, params);
        this._handleEvent = handleEvent.bind(this);
        this._onCreate = this.onCreate || null;
        this._onDelete = this.onDelete || null;
      }
      init(params) {
        app2.trace("init:", this.$type, this.$name);
        Object.assign(this.params, params);
        app2.emit("component:create", { type: this.$type, name: this.$name, component: this, element: this.$el, params: this.params });
        if (!this.params.$noevents) {
          app2.on(app2.event, this._handleEvent);
        }
        app2.call(this._onCreate?.bind(this, this.params));
      }
      destroy() {
        app2.trace("destroy:", this.$type, this.$name);
        app2.off(app2.event, this._handleEvent);
        app2.emit("component:delete", { type: this.$type, name: this.$name, component: this, element: this.$el, params: this.params });
        app2.call(this._onDelete?.bind(this));
        this.params = {};
        delete this.$root;
      }
    };
    function handleEvent(event, ...args) {
      if (this.onEvent) {
        app2.trace("event:", this.$type, this.$name, event, ...args);
        app2.call(this.onEvent?.bind(this.$data || this), event, ...args);
      }
      if (!isString(event)) return;
      var method = toCamel("on_" + event);
      if (!this[method]) return;
      app2.trace("event:", this.$type, this.$name, method, ...args);
      app2.call(this[method]?.bind(this.$data || this), ...args);
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
        options = app2.resolve(options);
        if (!options) return;
      }
      app2.$empty(element);
      element._x_params = Object.assign({}, options.params);
      Alpine.onElRemoved(element, () => {
        delete element._x_params;
      });
      if (!options.component) {
        Alpine.mutateDom(() => {
          app2.$append(element, options.template, Alpine.initTree);
        });
      } else {
        Alpine.data(options.name, () => new options.component(options.name));
        const node = app2.$elem("div", "x-data", options.name);
        app2.$append(node, options.template);
        Alpine.mutateDom(() => {
          element.appendChild(node);
          Alpine.initTree(node);
        });
      }
      return options;
    }
    function data(element, level) {
      if (!isElement(element)) element = app2.$(app2.$target + " div");
      if (!element) return;
      if (typeof level == "number") return element._x_dataStack?.at(level);
      return Alpine.closestDataStack(element)[0];
    }
    function init() {
      for (const [name, obj] of Object.entries(app2.components)) {
        const tag = `app-${obj?.$tag || name}`;
        if (obj?.$type != _alpine || customElements.get(tag)) continue;
        customElements.define(tag, class extends Element {
        });
        Alpine.data(name, () => new obj(name));
      }
    }
    function $render(el, value, modifiers, callback) {
      const cache = modifiers.includes("cache");
      const opts = { url: value, post: modifiers.includes("post") };
      if (!value.url && !(!cache && /^(https?:\/\/|\/|.+\.html(\?|$)).+/.test(value))) {
        if (callback(el, value)) return;
      }
      app2.fetch(opts, (err, text, info) => {
        if (err || !isString(text)) {
          return console.warn("$render: Text expected from", value, "got", err, text);
        }
        const tmpl = isString(value) ? app2.parsePath(value) : value;
        tmpl.template = text;
        tmpl.name = tmpl.params?.$name || tmpl.name;
        if (cache) {
          app2.templates[tmpl.name] = text;
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
        tmpl = app2.resolve(tmpl);
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
    app2.plugin(_alpine, { render, Component: AlpineComponent, data, init, default: 1 });
    app2.$on(document, "alpine:init", () => {
      app2.emit("alpine:init");
      Alpine.magic("app", (el) => app2);
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
          $render(el, value, modifiers, (el2, tmpl) => app2.render(tmpl));
        };
        app2.$on(el, "click", click);
        el.style.cursor = "pointer";
        cleanup(() => {
          app2.$off(el, "click", click);
        });
      });
      Alpine.directive("template", (el, { modifiers, expression }, { effect, cleanup }) => {
        const evaluate = Alpine.evaluateLater(el, expression);
        var template;
        const empty = () => {
          template = null;
          Alpine.mutateDom(() => {
            app2.$empty(el, (node) => Alpine.destroyTree(node));
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
    function parseOptions(options) {
      var url = isString(options) ? options : options?.url || "";
      var headers = options?.headers || {};
      var opts = Object.assign({
        headers,
        method: options?.method || options?.post && "POST" || "GET",
        cache: "default"
      }, options?.options);
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
    app2.fetch = function(options, callback) {
      try {
        const [url, opts] = parseOptions(options);
        app2.trace("fetch:", url, opts, options);
        window.fetch(url, opts).then(async (res) => {
          var err, data2;
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
            return app2.call(callback, err, data2, info);
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
          app2.call(callback, null, data2, info);
        }).catch((err) => {
          app2.call(callback, err);
        });
      } catch (err) {
        app2.call(callback, err);
      }
    };
    app2.afetch = function(options) {
      return new Promise((resolve, reject) => {
        app2.fetch(options, (err, data2, info) => {
          if (err) return reject(err, data2, info);
          resolve(data2, info);
        });
      });
    };
    app2.Component = component_default;
    var src_default = app2;
    window.app = src_default;
  })();

  // hello.js
  app.components.hello = class extends app.AlpineComponent {
    template = "";
    toggle() {
      this.template = !this.template ? "example" : this.template == "example" ? "hello2" : "";
    }
  };
  app.templates.hello2 = "#hello";
  app.components.hello2 = class extends app.components.hello {
    onCreate() {
      this.params.reason = "Hello2 World";
      this._timer = setInterval(() => {
        this.params.param1 = Date();
      }, 1e3);
    }
    onDelete() {
      clearInterval(this._timer);
    }
    onPrepareDelete(event) {
    }
    onToggle(data) {
      console.log("received toggle event:", data);
    }
    toggle() {
      super.toggle();
      app.emit(app.event, "toggle", this.template);
    }
  };

  // hello.html
  app.templates.hello = `<h3>Alpinejs-app: This is the standalone <span x-text=$name></span> component</h3>Param: <span x-text="params.param1"></span><br>Reason: <span x-text="params.reason"></span><br><div class="border my-3" x-template.show.nonempty="template"></div><button class="btn btn-outline-dark m-2" @click="toggle">Toggle Subcomponent</button><button class="btn btn-outline-dark m-2" x-render="'index'">Back</button><template id="hello"><h4>Alpinejs-app: This is the <span x-text=$name></span> subcomponent</h4>Param: <span x-text="params.param1"></span><br>Reason: <span x-text="params.reason"></span><br></template>`;

  // dropdown.js
  app.components.dropdown = class extends app.AlpineComponent {
    title = "";
    value = "";
    _parent = "";
    onCreate() {
      this._parent = this.$el.parentElement;
      var xdata = app.$data(this.$parent, 0);
      var options = xdata?.options || this.options;
      this.value = this._parent._x_model?.get() || xdata?.value || this._value(options[0]);
      this.title = this._title(options.find((x) => this.value == this._value(x)));
    }
    _title(item) {
      return item?.name || item || "";
    }
    _value(item) {
      return item?.value || item?.name || item || "";
    }
    _click(item) {
      this.value = this._parent.value = this._value(item);
      this.title = this._title(item);
      this._parent._x_model?.set(this.value);
      this.$dispatch("change", item);
    }
  };

  // dropdown.html
  app.templates.dropdown = `<div class="dropdown">    <button type="button" class="btn btn-outline-dark dropdown-toggle" aria-haspopup="true" aria-expanded="false" data-bs-toggle="dropdown" x-text="title">    </button>    <div class="dropdown-menu">        <template x-for="item in options">            <a tabindex=-1 class="dropdown-item py-2" :class="value == _value(item) ? 'active' : ''" @click="_click(item)">                <span x-text="_title(item)"></span>            </a>        </template>    </div></div>`;

  // example.html
  app.templates.example = `<p>This is <b>\`<span x-text=template></span>\`</b> template inside <b>\`<span x-text="$name"></span>\`</b> component.</p><div class="bg-light border mt-3" x-data="{ name: '', names: ['Dropdown', 'John', 'Mary', 'Chris', 'Natalie'] }">    <h5>This is dropdown component updating the input model:</h5>    <div class="d-flex flex-columns align-items-center">        <app-dropdown x-data="{ options: names }" x-model="name"></app-dropdown>        <div>            Name: <input x-model="name">        </div>    </div></div>`;

  // todo.js
  app.components.todo = class extends app.AlpineComponent {
    newTask = "";
    tasks = [];
    add() {
      if (this.newTask.trim()) {
        this.tasks.push({ descr: this.newTask, done: false });
        this.newTask = "";
      }
    }
    toggle(task) {
      task.done = !task.done;
    }
    remove(index) {
      this.tasks.splice(index, 1);
    }
  };

  // todo.html
  app.templates.todo = `<h3>Todo component</h3><form @submit.prevent="add">    <div class="d-flex align-items-center py-1">        <input type="text" class="form-control" placeholder="Add a new task..." x-model="newTask" required>        <button class="btn btn-outline-dark mx-2" type="submit">Add</button>    </div></form><div class="text-start">    <template x-for="(task, index) in tasks" :key="index">        <div class="d-flex align-items-center justify-content-between py-1">            <div class="form-check">                <input class="form-check-input" type="checkbox" @change="toggle(task)" :checked="task.done">                <label class="form-check-label">                    <span class="h5" x-text="task.descr" :style="{ 'text-decoration': task.done ? 'line-through': 'none' }"></span>                </label>            </div>            <button class="btn btn-outline-dark px-2" @click="remove(index)">Remove</button>        </div>    </template></div>`;

  // dashboard.js
  app.components.dashboard = class extends app.AlpineComponent {
    tab = "charts";
    charts = [
      {
        type: "line",
        data: {
          labels: ["January", "February", "March", "April", "May", "June", "July"],
          datasets: [{
            label: "Sales Over Time",
            data: [120, 190, 300, 500, 200, 300, 250],
            backgroundColor: "rgba(74, 144, 226, 0.2)",
            borderColor: "rgba(74, 144, 226, 1)",
            borderWidth: 2,
            tension: 0.4
          }]
        }
      },
      {
        type: "bar",
        data: {
          labels: ["Chrome", "Firefox", "Safari", "Edge"],
          datasets: [{
            label: "Browser Usage",
            data: [65, 59, 80, 81],
            backgroundColor: [
              "rgba(74, 144, 226, 0.8)",
              "rgba(80, 227, 194, 0.8)",
              "rgba(255, 205, 86, 0.8)",
              "rgba(255, 99, 132, 0.8)"
            ],
            borderColor: [
              "rgba(74, 144, 226, 1)",
              "rgba(80, 227, 194, 1)",
              "rgba(255, 205, 86, 1)",
              "rgba(255, 99, 132, 1)"
            ],
            borderWidth: 1
          }]
        }
      }
    ];
  };
  app.components.chart = class extends app.AlpineComponent {
    chart;
    onCreate() {
      const ctx = app.$("canvas", this.$el).getContext("2d");
      this.chart = new Chart(ctx, {
        type: this.type,
        data: this.data,
        options: {
          responsive: true,
          animation: {
            easing: "easeInOutQuart"
          },
          plugins: {
            legend: {
              display: true,
              position: "top"
            }
          },
          scales: {
            y: {
              grid: {
                color: "#eaeaea"
              },
              beginAtZero: true
            }
          }
        }
      });
    }
    onDelete() {
      if (this.chart) this.chart.destroy();
    }
  };

  // dashboard.html
  app.templates.dashboard = `<template id=chart>    <div class="fs-xs font-monospace resize-both overflow-auto">        <canvas></canvas>    </div></template><div class="dashboard">    <div class="d-flex flex-row">        <div class="bg-light p-3 h4 text-nowrap">            <div class="p-3" :class="tab=='charts'?'text-light bg-dark':''" @click="tab='charts'">Charts</div>            <div class="p-3" :class="tab=='other'?'text-light bg-dark':''" @click="tab='other'">Details</div>            <div class="p-3" :class="tab=='todo'?'text-light bg-dark':''" x-render="'todo?$target=#tabext'" @click="tab='todo'">Todo Tasks</div>            <div class="p-3" :class="tab=='ext'?'text-light bg-dark':''" x-render="'ext.html?$target=#tabext&t='+Date.now()" @click="tab='ext'">External</div>            <div class="p-3" x-render="'hello/hi?reason=World'">Say Hello</div>        </div>        <div class="container" x-show="tab=='charts'">            <div class="d-flex justify-content-center">                <template x-for="item in charts">                    <app-chart x-data="{...item}"></app-chart>                </template>            </div>        </div>        <div class="p-3" x-show="tab=='other'">            <ul class="text-start">                <li>Each chart is a component defined in dashboard.js/.html files</li>                <li>Each chart component is rendered as custom element &lt;app-chart&gt;</li>                <li>                    The chart data is passed to each compoment via x-data directive<br>                    <div class="bg-light">                        &lt;template x-for="item in charts"&gt;<br>                        &nbsp;&nbsp; &lt;app-chart x-data="{...item}"&gt;&lt;/app-chart&gt;<br>                        &lt;/template&gt;                    </div>                </li>            </ul>        </div>        <div class="p-3" x-show="tab=='ext'||tab=='todo'" id="tabext">        </div>    </div></div>`;

  // index.js
  app.debug = 1;
  app.start();
})();
