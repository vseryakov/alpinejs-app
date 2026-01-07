//
//  Author: Vlad Seryakov vseryakov@gmail.com
//  backendjs 2018
//

/* global bootstrap */

import {
    $, $all, $elem, $empty, $on, $parse, $ready,
    escape, isElement, isObject,
    on, stylePlugin } from "./index"

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
    var alerts = $(element, isElement(container) || document.body);
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
    if (o.clear) $empty(alerts);
    var alert = $parse(html).firstElementChild;
    var instance = bootstrap.Alert.getOrCreateInstance(alert);
    alerts.prepend(alert);
    if (o.delay) {
        setTimeout(() => { instance.close() }, o.delay);
    }
    $on(alert, 'closed.bs.alert', (ev) => { cleanupAlerts(alerts, o) });
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
    var alerts = $(options?.element || ".alerts", container);
    if (!alerts) return;
    $empty(alerts);
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
        container = $(".toast-container");
        if (!container) {
            container = $elem("div", "aria-live", "polite");
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
    if (o.clear) $empty(container);
    var toast = $parse(html).firstElementChild;
    bootstrap.Toast.getOrCreateInstance(toast).show();
    container.prepend(toast);
    toast._timer = o.notimer ? "" : setInterval(() => {
        if (!toast.parentElement) return clearInterval(toast._timer);
        $(".timer", toast).textContent = o.countdown ? toDuration(delay - (Date.now() - o.now)) : toDuration(o.now, 1) + " ago";
    }, o.countdown ? o.delay/2 : o.delay);
    $on(toast, "hidden.bs.toast", (ev) => { clearInterval(ev.target._timer); ev.target.remove() });
    return toast;
}

/**
 * Hide active toasts inside first .toast-container
 */
export function hideToast()
{
    $empty($(".toast-container"));
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
    $all(".carousel", element).forEach(el => (bootstrap.Carousel.getOrCreateInstance(el)));
    $all(`[data-bs-toggle="popover"]`, element).forEach(el => (bootstrap.Popover.getOrCreateInstance(el)));
}

$ready(() => {
    stylePlugin(applyPlugins);
    on("dom:changed", (ev) => {
        document.documentElement.setAttribute("data-bs-theme", ev.colorScheme);
    });
    on("alert", showAlert);
});
