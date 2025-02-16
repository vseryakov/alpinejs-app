(() => {
  // ../dist/app.js
  (() => {
    var app2 = {
      base: "/app/",
      main: "#app-main",
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
      return typeof str == "string";
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
    app2.on = (event, callback) => {
      if (!isFunction(callback)) return;
      if (!_events[event]) _events[event] = [];
      _events[event].push(callback);
    };
    app2.once = (event, callback) => {
      if (!isFunction(callback)) return;
      const cb = (...args) => {
        app2.off(event, cb);
        callback(...args);
      };
      app2.on(event, cb);
    };
    app2.only = (event, callback) => {
      _events[event] = isFunction(callback) ? [callback] : [];
    };
    app2.off = (event, callback) => {
      if (!_events[event] || !callback) return;
      const i = _events[event].indexOf(callback);
      if (i > -1) return _events[event].splice(i, 1);
    };
    app2.emit = (event, ...args) => {
      app2.trace("emit:", event, ...args);
      if (_events[event]) {
        for (const cb of _events[event]) cb(...args);
      } else if (isString(event) && event.endsWith(":*")) {
        event = event.slice(0, -1);
        for (const p in _events) {
          if (p.startsWith(event)) {
            for (const cb of _events[p]) cb(...args);
          }
        }
      }
    };
    app2.$param = (name, dflt) => {
      return new URLSearchParams(location.search).get(name) || dflt || "";
    };
    var esc = (selector) => isString(selector) ? selector.replace(/#([^\s"#']+)/g, (_, id) => `#${CSS.escape(id)}`) : "";
    app2.$ = (selector, doc) => (isElement(doc) || document).querySelector(esc(selector));
    app2.$all = (selector, doc) => (isElement(doc) || document).querySelectorAll(esc(selector));
    app2.$event = (element, name, detail = {}) => isElement(element) && element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true }));
    app2.$on = (element, event, callback, ...arg) => {
      return isFunction(callback) && element.addEventListener(event, callback, ...arg);
    };
    app2.$off = (element, event, callback, ...arg) => {
      return isFunction(callback) && element.removeEventListener(event, callback, ...arg);
    };
    app2.$attr = (element, attr, value) => {
      if (isString(element) && element) element = app2.$(element);
      if (!isElement(element)) return;
      return value === void 0 ? element.getAttribute(attr) : value === null ? element.removeAttribute(attr) : element.setAttribute(attr, value);
    };
    app2.$empty = (element, cleanup) => {
      if (isString(element) && element) element = app2.$(element);
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
      if (!isString(path)) return rc;
      var base = app2.base;
      if (path.startsWith(loc.origin)) path = path.substr(loc.origin.length);
      if (path.includes("://")) path = path.replace(/^(.*:\/\/[^\/]*)/, "");
      if (path.startsWith(base)) path = path.substr(base.length);
      if (path.startsWith("/")) path = path.substr(1);
      if (path == base.slice(1, -1)) path = "";
      const q = path.indexOf("?");
      if (q > 0) {
        query = path.substr(q + 1, 1024);
        rc.name = path = path.substr(0, q);
      }
      if (path.includes("/")) {
        path = path.split("/").slice(0, 5);
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
        for (let i = 1; i < 5; i++) path.push(options.params[`param${i}`] || "");
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
      if (isString(element) && element) element = app2.$(element);
      for (const p in _plugins) {
        if (!_plugins[p].data) continue;
        const d = _plugins[p].data(element, level);
        if (d) return d;
      }
    };
    app2.resolve = (path, dflt) => {
      const rc = app2.parsePath(path);
      app2.trace("resolve:", path, dflt, rc);
      var name = rc.name, templates = app2.templates, components = app2.components;
      var template = templates[name] || document.getElementById(name)?.innerHTML;
      if (!template && dflt) {
        template = templates[dflt] || document.getElementById(dflt)?.innerHTML;
        if (template) rc.name = dflt;
      }
      if (template?.startsWith("#")) {
        template = document.getElementById(template.substr(1))?.innerHTML;
      } else if (template?.startsWith("$")) template = templates[template.substr(1)];
      if (!template) return;
      rc.template = template;
      var component = components[name] || components[rc.name];
      if (isString(component)) component = components[component];
      rc.component = component;
      return rc;
    };
    app2.render = (options, dflt) => {
      var tmpl = app2.resolve(options?.name || options, dflt);
      if (!tmpl) return;
      var params = tmpl.params;
      Object.assign(params, options?.params);
      app2.trace("render:", options, tmpl.name, tmpl.params);
      const element = app2.$(params.$target || app2.main);
      if (!element) return;
      var plugin = tmpl.component?.$type || options?.plugin || params.$plugin;
      plugin = _plugins[plugin] || _default_plugin;
      if (!plugin?.render) return;
      if (!params.$target || params.$target == app2.main) {
        var ev = { name: tmpl.name, params };
        app2.emit(app2.event, "prepare:delete", ev);
        if (ev.stop) return;
        var plugins = Object.values(_plugins);
        for (const p of plugins.filter((x) => x.cleanup)) {
          app2.call(p.cleanup, element);
        }
        if (!(options?.nohistory || params.$nohistory || tmpl.component?.$nohistory)) {
          queueMicrotask(() => {
            app2.emit("path:save", tmpl);
          });
        }
      }
      app2.emit("component:render", tmpl);
      plugin.render(element, tmpl);
      return tmpl;
    };
    var _alpine = "alpine";
    var Component = class {
      // x-template dynamic rendering
      template = "";
      // Render options
      params = {};
      static $type = _alpine;
      constructor(name, params) {
        this.$name = name;
        Object.assign(this.params, params);
        this._handleEvent = this.handleEvent.bind(this);
      }
      init() {
        app2.trace("init:", this.$name);
        Object.assign(this.params, this.$el._x_params);
        app2.call(this.onCreate?.bind(this));
        if (!this.params.$noevents) {
          app2.on(app2.event, this._handleEvent);
        }
        app2.emit("component:create", { type: _alpine, name: this.$name, component: this, element: this.$el, params: Alpine.raw(this.params) });
      }
      destroy() {
        app2.trace("destroy:", this.$name);
        app2.off(app2.event, this._handleEvent);
        app2.emit("component:delete", { type: _alpine, name: this.$name, component: this, element: this.$el, params: Alpine.raw(this.params) });
        app2.call(this.onDelete?.bind(this));
        this.params = {};
      }
      handleEvent(event, ...args) {
        if (this.onEvent) {
          app2.trace("event:", this.$name, event, ...args);
          app2.call(this.onEvent?.bind(this.$data), event, ...args);
        }
        if (!isString(event)) return;
        var method = toCamel("on_" + event);
        if (!this[method]) return;
        app2.trace("event:", this.$name, method, ...args);
        app2.call(this[method]?.bind(this.$data), ...args);
      }
    };
    var Element = class extends HTMLElement {
      connectedCallback() {
        queueMicrotask(() => {
          render(this, this.getAttribute("template") || this.localName.substr(4));
        });
      }
    };
    function render(element, options) {
      if (isString(options)) {
        options = app2.resolve(options);
        if (!options) return;
      }
      app2.$empty(element);
      const doc = app2.$parse(options.template, "doc");
      if (!options.component) {
        Alpine.mutateDom(() => {
          while (doc.head.firstChild) {
            element.appendChild(doc.head.firstChild);
          }
          while (doc.body.firstChild) {
            const node = doc.body.firstChild;
            element.appendChild(node);
            if (node.nodeType != 1) continue;
            Alpine.initTree(node);
          }
        });
      } else {
        Alpine.data(options.name, () => new options.component(options.name));
        const node = app2.$elem("div", "x-data", options.name, "._x_params", options.params);
        while (doc.head.firstChild) {
          element.appendChild(doc.head.firstChild);
        }
        while (doc.body.firstChild) {
          node.appendChild(doc.body.firstChild);
        }
        Alpine.mutateDom(() => {
          element.appendChild(node);
          Alpine.initTree(node);
          delete node._x_params;
        });
      }
    }
    function data(element, level) {
      if (!isElement(element)) element = app2.$(app2.main + " div");
      if (!element) return;
      if (typeof level == "number") return element._x_dataStack?.at(level);
      return Alpine.closestDataStack(element)[0];
    }
    app2.plugin(_alpine, { render, Component, data, default: 1 });
    app2.on("alpine:init", () => {
      for (const [name, obj] of Object.entries(app2.components)) {
        const tag = `app-${obj?.$tag || name}`;
        if (obj?.$type != _alpine || customElements.get(tag)) continue;
        customElements.define(tag, class extends Element {
        });
        Alpine.data(name, () => new obj(name));
      }
    });
    app2.$on(document, "alpine:init", () => {
      app2.emit("alpine:init");
      Alpine.magic("app", (el) => app2);
      Alpine.directive("render", (el, { modifiers, expression }, { evaluate, cleanup }) => {
        const click = (e) => {
          e.preventDefault();
          app2.render(evaluate(expression));
        };
        app2.$on(el, "click", click);
        el.style.cursor = "pointer";
        cleanup(() => {
          app2.$off(el, "click", click);
        });
      });
      Alpine.directive("template", (el, { expression }, { effect, cleanup }) => {
        const evaluate = Alpine.evaluateLater(el, expression || "template");
        var template;
        const hide = () => {
          template = null;
          Alpine.mutateDom(() => {
            app2.$empty(el, (node) => Alpine.destroyTree(node));
          });
        };
        effect(() => evaluate((value) => {
          if (!value) return hide();
          if (value !== template) render(el, value);
          template = value;
        }));
        cleanup(hide);
      });
      Alpine.directive("scope-level", (el, { expression }, { evaluate }) => {
        const scope = Alpine.closestDataStack(el);
        el._x_dataStack = scope.slice(0, parseInt(evaluate(expression)) || 0);
      });
    });
    app2.fetchOpts = function(options) {
      var headers = options.headers || {};
      var opts = Object.assign({
        headers,
        method: options.type || "POST",
        cache: "default"
      }, options.fetchOptions);
      var data2 = options.data;
      if (opts.method == "GET" || opts.method == "HEAD") {
        if (isObj(data2)) {
          options.url += "?" + new URLSearchParams(data2).toString();
        }
      } else if (isString(data2)) {
        opts.body = data2;
        headers["content-type"] = options.contentType || "application/x-www-form-urlencoded; charset=UTF-8";
      } else if (data2 instanceof FormData) {
        opts.body = data2;
        delete headers["content-type"];
      } else if (isObj(data2)) {
        opts.body = JSON.stringify(data2);
        headers["content-type"] = "application/json; charset=UTF-8";
      } else if (data2) {
        opts.body = data2;
        headers["content-type"] = options.contentType || "application/octet-stream";
      }
      return opts;
    };
    app2.fetch = function(options, callback) {
      try {
        const opts = app2.fetchOpts(options);
        window.fetch(options.url, opts).then(async (res) => {
          var err, data2;
          var info = { status: res.status, headers: {}, type: res.type };
          for (const h of res.headers) info.headers[h[0].toLowerCase()] = h[1];
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
          switch (options.dataType) {
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
    var src_default = app2;
    window.app = src_default;
  })();

  // hello.js
  app.components.hello = class extends app.AlpineComponent {
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

  // dropdown.js
  app.components.dropdown = class extends app.AlpineComponent {
    title = "";
    value = "";
    parent = "";
    onCreate() {
      this.$parent = this.$el.parentElement;
      this.$xdata = app.$data(this.$parent, 0);
      var options = this.$xdata?.options || this.options;
      this.value = this.$parent._x_model?.get() || this.$xdata?.value || this._value(options[0]);
      this.title = this._title(options.find((x) => this.value == this._value(x)));
    }
    _title(item) {
      return item?.name || item || "";
    }
    _value(item) {
      return item?.value || item?.name || item || "";
    }
    _click(item) {
      this.value = this.$parent.value = this._value(item);
      this.title = this._title(item);
      this.$parent._x_model?.set(this.value);
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
  app.templates.todo = `<h3>Alpinejs-app: Todo component</h3><form @submit.prevent="add">    <input type="text" placeholder="Add a new task..." x-model="newTask" required>    <button class="btn btn-outline-dark" type="submit">Add</button></form><ul>    <template x-for="(task, index) in tasks" :key="index">        <li :style="{ 'text-decoration': task.done ? 'line-through': 'none' }">            <input type="checkbox" @change="toggle(task)" :checked="task.done">            <span x-text="task.descr"></span>            <button class="btn btn-outline-dark" @click="remove(index)">Remove</button>        </li>    </template></ul><button class="btn btn-outline-dark" x-render="'index'">Back</button>`;

  // index.js
  app.debug = 1;
  app.start();
})();
