//
//  Author: Vlad Seryakov vseryakov@gmail.com
//  backendjs 2018
//

/* global bootstrap */

import { app, call, escape, isElement, isObject } from "./app"

import { sanitizer, toDuration, toTitle } from "./lib"

/**
 * Show Bootstrap alert
 * @param {HTMLElement} [container] - show inside container or document.body
 * @param {string} type - type of alert: error, danger, warning, info, success, primary
 * @param {string} text - text to show
 * @param {Object} [options]
 */
export function showAlert(container, type, text, options)
{
    if (typeof container == "string") options = text, text = type, type = container, container = document.body;
    if (!text) return;
    var o = Object.assign({}, options, { type });
    o.type = o.type == "error" ? "danger" : o.type || "info";

    var element = o.element || ".alerts";
    var alerts = app.$(element, isElement(container) || document.body);
    if (!alerts) return;

    var html = `
        <div class="alert alert-dismissible alert-${o.type} show fade" role="alert">
        ${o.icon ? `<i class="fa fa-fw ${o.icon}"></i>` : ""}
            ${alertText(text, o)}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    if (o.hide || alerts.style.display == "none") {
        alerts.dataset.alert = "hide";
        alerts.style.display = "block";
    }
    if (o.css) alerts.classList.add(o.css);
    if (o.clear) app.$empty(alerts);
    var alert = app.$parse(html).firstElementChild;
    var instance = bootstrap.Alert.getOrCreateInstance(alert);
    alerts.prepend(alert);
    if (o.delay) {
        setTimeout(() => { instance.close() }, o.delay);
    }
    app.$on(alert, 'closed.bs.alert', (ev) => { cleanupAlerts(alerts, o) });
    if (o.scroll) alerts.scrollIntoView();
    return alert;
}

/**
 * Hide active Bootstrap alert
 * @param {HTMLElement} container
 * @param {Object} [options]
 */
export function hideAlert(container, options)
{
    var alerts = app.$(options?.element || ".alerts", container);
    if (!alerts) return;
    app.$empty(alerts);
    cleanupAlerts(alerts, options);
}

/**
 * @param {HTMLElement} [container] - show inside container or document.body
 * @param {string} type - type of alert: error, danger, warning, info, success, primary
 * @param {string} text - text to show
 * @param {Object} [options]
 */
export function showToast(container, type, text, options)
{
    if (typeof container == "string") options = text, text = type, type = container, container = null;
    if (!text) return;
    var o = Object.assign({
        type: type == "error" ? "danger" : typeof type == "string" && type || "info",
        now: Date.now(),
        delay: 5000,
        role: "alert"
    }, isObject(options));

    var t = o.type[0];
    var delay = o.delay * (t == "d" || t == "w" ? 3 : t == "i" ? 2 : 1);
    var icon = o.icon || t == "s" ? "fa-check-circle" : t == "d" ? "fa-exclamation-circle" : t == "w" ? "fa-exclamation-triangle": "fa-info-circle";
    var fmt = Intl.DateTimeFormat({ timeStyle: "short" });
    var html = `
    <div class="toast fade show ${o.type} ${o.css || ""}" role="${o.role}" aria-live="polite" aria-atomic="true" data-bs-autohide="${!o.dismiss}" data-bs-delay="${delay}">
      <div class="toast-header ${o.css_header || ""}">
        <span class="fa fa-fw ${icon} me-2 text-${o.type}" aria-hidden="true"></span>
        <strong class="me-auto toast-title">${o.title || toTitle(type)}</strong>
        <small class="timer px-1" aria-hidden="true">${o.countdown ? Math.round(delay/1000)+"s" : !o.notimer ? "just now" : ""}</small>
        <small>(${fmt.format(o.now)})</small>
        <button type="button" class="btn-close ms-2" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body ${o.css_body || ""}">
        ${alertText(text, o)}
      </div>
    </div>`;

    if (!container) {
        container = app.$(".toast-container");
        if (!container) {
            container = app.$elem("div", "aria-live", "polite");
            document.body.append(container);
        }
        var pos = o.pos == "tl" ? "top-0 start-0" :
        o.pos == "tr" ? "top-0 end-0" :
        o.pos == "ml" ? "top-50 start-0  translate-middle-y" :
        o.pos == "mc" ? "top-50 start-50 translate-middle" :
        o.pos == "mr" ? "top-50 end-0 translate-middle-y" :
        o.pos == "bl" ? "bottom-0 start-0" :
        o.pos == "bc" ? "bottom-0 start-50 translate-middle-x" :
        o.pos == "br" ? "bottom-0 end-0" : "top-0 start-50 translate-middle-x";
        container.className = `toast-container position-fixed ${pos} p-3`;
    }
    if (o.clear) app.$empty(container);
    var toast = app.$parse(html).firstElementChild;
    bootstrap.Toast.getOrCreateInstance(toast).show();
    container.prepend(toast);
    toast._timer = o.notimer ? "" : setInterval(() => {
        if (!toast.parentElement) return clearInterval(toast._timer);
        app.$(".timer", toast).textContent = o.countdown ? toDuration(delay - (Date.now() - o.now)) : toDuration(o.now, 1) + " ago";
    }, o.countdown ? o.delay/2 : o.delay);
    app.$on(toast, "hidden.bs.toast", (ev) => { clearInterval(ev.target._timer); ev.target.remove() });
    return toast;
}

/**
 * Hide active toasts inside first .toast-container
 */
export function hideToast()
{
    app.$empty(app.$(".toast-container"));
}

/**
 * Login modal popup, generic enough but built for backendjs in mind
 */
export function showLogin(options, callback)
{
    if (typeof options == "function") callback = options, options = null;

    const html = `
<div class="modal fade" tabindex="-1" aria-labelledby="hdr" aria-modal="true" role="dialog">
<div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="modal-body">
        <form class="form-horizontal" role="form">
            <h4 class="text-center py-4" id="hdr" >
            <img src="${options?.logo || "/img/logo.png"}" style="max-height: 3rem;"> ${options?.title || 'Please Sign In'}</h4>
            <div class="mb-3 row">
                <label for="login" class=" col-form-label col-sm-4">${options?.login || "Login"}</label>
                <div class="col-sm-8">
                    <input id="login" type="text" class="form-control">
                </div>
            </div>
            <div class="mb-3 row">
                <label for="secret" class=" col-form-label col-sm-4">${options?.password || "Password"}</label>
                <div class="col-sm-8">
                    <input id="secret" placeholder="Password" type="password" class="form-control">
                </div>
            </div>
        </form>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" id="submit" class="btn btn-outline-secondary">Login</button>
    </div>
    </div>
</div>
</div>`;
    var modal = app.$parse(html).firstChild;

    var login = app.$("#login", modal);
    app.$on(login, "keyup", (ev) => {
        if (ev.which == 13) { secret.focus(); ev.preventDefault() }
    });

    var secret = app.$("#secret", modal);
    app.$on(secret, "keyup", (ev) => {
        if (ev.which == 13) { submit.click(); ev.preventDefault() }
    });

    var submit = app.$("#submit", modal);
    app.$on(submit, "click", (ev) => {
        var body = { login: login.value, secret: secret.value }
        app.fetch(options?.url || "/login", { post: 1, body }, (err, rc, info) => {
            if (err) return showAlert("error", err);
            Object.assign(app.user, rc);
            call(callback, err);
            app.emit("user:login", rc, info);
            instance.hide();
        });
    });

    app.$on(modal, "shown.bs.modal", (e) => {
        queueMicrotask(() => { login.focus() });
    });
    app.$on(modal, "hide.bs.modal", (e) => {
        if (isElement(document.activeElement)) {
            document.activeElement.blur();
        }
    });
    app.$on(modal, "hidden.bs.modal", (e) => {
        modal.remove();
        instance.dispose();
    });
    document.body.append(modal);
    var instance = bootstrap.Modal.getOrCreateInstance(modal);
    instance.show();
    return modal;
}

function alertText(text, options)
{
    text = text?.message || text?.text || text?.msg || text;
    text = typeof text == "string" ? options?.safe ? text :
           escape(text.replaceAll("<br>", "\n")) :
           escape(JSON.stringify(text, null, " ").replace(/["{}[\]]/g, ""));
    return sanitizer(text).replace(/\n/g, "<br>");
}

function cleanupAlerts(alerts, options)
{
    if (alerts.firstElementChild) return;
    if (options?.css) alerts.classList.remove(options.css);
    if (options?.hide || alerts.dataset.alert == "hide") alerts.style.display = "none";
    delete alerts.dataset.alert;
}

function applyPlugins(element)
{
    app.$all(".carousel", element).forEach(el => (bootstrap.Carousel.getOrCreateInstance(el)));
    app.$all(`[data-bs-toggle="popover"]`, element).forEach(el => (bootstrap.Popover.getOrCreateInstance(el)));
}

app.$ready(() => {
    app.stylePlugin(applyPlugins);
    app.on("dom:changed", (ev) => {
        document.documentElement.setAttribute("data-bs-theme", ev.colorScheme);
    });
    app.on("alert", showAlert);
});
