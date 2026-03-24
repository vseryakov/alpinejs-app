/**
 * Bootpopup instance returned by `bootpopup(options)` when a new popup is created.
 *
 * See https://github.com/vseryakov/bootpopup for more documentation.
 *
 */

 /* global bootstrap */

/**
 * Configuration object for a single element in a Bootpopup form/layout.
 *
 * “Special element properties” are parsed by Bootpopup to create DOM, apply Bootstrap
 * classes, add labels/groups, input-group addons, validation feedback, etc.
 *
 * @typedef {Object} BootpopupElement
 *
 * @property {string} [class]   Classes for the main element. If empty/omitted, `form-control` is used.
 * @property {string} [text]  Sets element's `textContent`.
 * @property {string} [html]   HTML to be parsed into DOM and appended (after sanitizing, if available).
 * @property {boolean} [autofocus]  Focus this element when the popup is shown.
 * @property {boolean} [nosanitize]  Skip sanitizer for `label` or `html` (if sanitizer is installed).
 * @property {boolean} [floating]   Adds `form-floating` to the group to enable floating labels.
 * @property {boolean} [checked]   When `true`, makes checkbox/radio selected.
 * @property {boolean} [switch]   When `true`, converts a checkbox into a toggle switch style.
 * @property {boolean} [inline]   When `true`, adds `form-check-inline` (checkbox/radio inline style).
 * @property {boolean} [reverse]   When `true`, adds `form-check-reverse` (checkbox style).
 * @property {string} [input_label]   Checkbox/radio specific label instead of the element's main label.
 * @property {string} [class_input_btn]   Converts checkbox into a button style. Must be one of Bootstrap `btn-*` classes.
 * @property {string} [class_check]   Adds a custom class to the checkbox/radio input element.
 * @property {string} [class_label]   Extra classes for the label element (added to default `form-label`).
 * @property {Object<string, any>} [attrs_label]   Attributes for the label element.
 * @property {number|string} [size_label]  Column width for the label (Bootstrap grid sizing).
 * @property {number|string} [size_input]  Column width for the input (Bootstrap grid sizing).
 * @property {string} [class_group]  Classes for the group wrapper div.
 *   Example: `"row my-3 py-1 border-bottom"`.
 * @property {Object<string, any>} [attrs_group] Attributes for the group wrapper div.
 *   Example: `{ id: "group1" }`.
 * @property {string} [class_prefix]  Class for a prefix span inserted as the first element in the group.
 * @property {string} [text_prefix]  Text for a prefix span inserted as the first element in the group.
 * @property {string} [class_suffix]  Class for a suffix element inserted as the last element in the group.
 * @property {string} [text_suffix]  Text for a suffix element inserted as the last element in the group.
 * @property {string} [text_valid]  Adds a “valid feedback” div (used with `validate()`).
 * @property {string} [text_invalid]  Adds an “invalid feedback” div (used with `validate()`).
 * @property {string} [class_append]   Appends a span to the element (mostly for non-input entries) with this class.
 * @property {string} [text_append]   Appends a span to the element (mostly for non-input entries) with this text.
 * @property {string} [text_input_button]   Adds a button tied to the input to perform an action.
 *   The button gets `data-formid` and `data-inputid` attributes.
 * @property {string} [class_input_button]   Button style class for the input button.
 * @property {string} [class_input_group]   Class for the input-group wrapper when using input buttons / dropdowns.
 * @property {Object<string, any>} [attrs_input_button]  Attributes for the input button (often includes `{ click: (ev) => {} }`).
 * @property {Array<string|{name:string, value:any}>} [list_input_button]  Adds a dropdown button with options; selected value is placed into an input.
 * @property {Array<string|{name:string, value:any}>} [list_input_tags]  Same as `list_input_button`, but also adds selected values as tags in the list.
 * @property {string} [class_list_button]  Class for the dropdown list button.
 * @property {string} [class_input_menu]  Class for the dropdown menu.
 */

/**
 * Bootpopup creation options.
 *
 * @typedef {Object} BootpopupOptions
 *
 * @property {Array<BootpopupElement>} [content=[]] Content of the dialog box.
 * @property {Array<BootpopupElement>} [footer=[]] Content inside the modal footer (simple elements only).
 * @property {string} [title=document.title] Title of the dialog box.
 * @property {boolean} [show_close=true] Show or hide the close button in the title.
 * @property {boolean} [show_header=true] Show or hide the dialog header with title.
 * @property {boolean} [show_footer=true] Show or hide the dialog footer with buttons.
 * @property {boolean} [keyboard=true] If false, disable closing the modal with keyboard.
 * @property {boolean|string} [backdrop=true] If false, disable modal backdrop; can be `static` as well.
 * @property {boolean} [scroll=true] Apply `modal-dialog-scrollable` if true.
 * @property {boolean} [center=false] Apply `modal-dialog-centered` if true.
 * @property {boolean} [horizontal=false] Enable/disable horizontal layout in the form element.
 * @property {("sm"|"lg"|"xl"|"")} [size=""] Size of the modal window.
 * @property {string} [size_label="col-sm-4"] Classes applied to labels in the form.
 * @property {string} [size_input="col-sm-8"] Classes applied to inputs wrapper in the form.
 * @property {("close"|"ok"|"cancel"|"yes"|"no")} [onsubmit="close"] Default action when form is submitted (overridden by `submit` callback).
 * @property {Array<"close"|"ok"|"cancel"|"yes"|"no">} [buttons=["close"]] Buttons shown in the dialog footer.
 * @property {Function} [before=function(){}] Called before the window is shown, after being created. `(popup)`.
 * @property {Function} [dismiss=function(){}] Called when the window is dismissed. `(data)`.
 * @property {Function} [submit=function(){}] Called when the form is submitted. Return `false` to cancel. `(data)`.
 * @property {Function} [close=function(){}] Called when Close button is selected. `(data)`.
 * @property {Function} [ok=function(){}] Called when OK button is selected. `(data)`.
 * @property {Function} [cancel=function(){}] Called when Cancel button is selected. `(data)`.
 * @property {Function} [yes=function(){}] Called when Yes button is selected. `(data)`.
 * @property {Function} [no=function(){}] Called when No button is selected. `(data)`.
 * @property {Function} [complete=function(){}] Always called when the dialog box has completed. `(data)`.
 * @property {boolean} [alert=false] If true, adds an alert element to be shown by `showAlert`.
 * @property {boolean} [info=false] If true, adds an info element to be shown by `showAlert(..., {type:"info"})`.
 * @property {boolean} [autofocus=true] If true, focus the first input element when shown.
 * @property {boolean} [empty=false] If true, return all input values even if empty; default returns only non-empty values.
 * @property {function(string):HTMLElement[]|null} [sanitizer=null] Called when rendering HTML content/labels; must return a list of HTMLElements to append.
 * @property {Object<string,string>|null} [tabs=null] Map of `{tabId: label, ...}` to show `nav-tabs`; content items can set `tab_id`.
 * @property {Object} [self] Context for callback functions; default is the popup object.
 * @property {boolean} [debug=false] Log input values in the console.
 * @property {string} [class_modal="modal fade"] Modal root class.
 * @property {string} [class_dialog="modal-dialog"] Modal dialog class.
 * @property {string} [class_title="modal-title"] Modal title class.
 * @property {string} [class_content="modal-content"] Modal content class.
 * @property {string} [class_body="modal-body"] Modal body class.
 * @property {string} [class_header="modal-header"] Modal header class.
 * @property {string} [class_footer="modal-footer"] Modal footer class.
 * @property {string} [class_options="options flex-grow-1 text-start"] Wrapper class for footer content.
 * @property {string} [class_alert="alert alert-danger fade show"] Class for danger alerts shown by `showAlert`.
 * @property {string} [class_info="alert alert-info fade show"] Class for info alerts shown by `showAlert`.
 * @property {string} [class_form=""] Class for the form wrapper div.
 * @property {string} [class_buttons="btn"] Base class for all buttons.
 * @property {string} [class_button="btn-outline-secondary"] Default style class for buttons (appended to `class_buttons`).
 * @property {string} [class_ok="btn-primary"] Style class for OK button.
 * @property {string} [class_yes="btn-primary"] Style class for Yes button.
 * @property {string} [class_no="btn-secondary"] Style class for No button.
 * @property {string} [class_cancel="btn-outline-secondary"] Style class for Cancel button.
 * @property {string} [class_close="btn-outline-secondary"] Style class for Close button.
 * @property {string} [class_tabs="nav nav-tabs mb-4"] Class for tab nav.
 * @property {string} [class_tablink="nav-link"] Class for tab links.
 * @property {string} [class_tabcontent="tab-content"] Class for tab content container.
 * @property {string} [class_group="row mb-3"] Wrapper class for each content element group.
 * @property {string} [class_label=""] Extra class appended to form labels.
 * @property {string} [class_row="row"] Class used for content type `row`.
 * @property {string} [class_col="col-auto"] Class used for columns in `row` content items.
 * @property {string} [class_suffix="form-text text-muted text-end"] Class used for content added to a group (suffix/help text).
 * @property {string} [class_input_button="btn btn-outline-secondary"] Default class for `text_input_button`.
 * @property {string} [class_list_button="btn btn-outline-secondary dropdown-toggle"] Default class for `list_input_button` button.
 * @property {string} [class_input_menu="dropdown-menu bg-light"] Default class for `list_input_button` dropdown.
 * @property {string} [list_input_mh="25vh"] Default max height of the dropdown in `list_input_button`.
 */


import {
    $, $all, $attr, $elem, $empty, $on, $parse,
    isFunction, isObject, isString
    } from "./index"

import { sanitizer } from "./lib"


const inputs = [
    "text", "color", "url", "password", "hidden", "file", "number",
    "email", "reset", "date", "time", "checkbox", "radio", "datetime-local",
    "week", "tel", "search", "range", "month", "image", "button"
];

const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '`': '&#x60;' };

/**
 * Create an instance of Bootpoup class and show it
 * @param {BootpopupOptions} ...args
 * @returns {Bootpopup}
 *
 * ### DOM elements
 *
 * All the following Bootpopup properties are native HTML elements:
 *
 * - `modal` - entire window, including the fade background. You can use this property in the same way as
 *  described in [Bootstrap Modals Usage](https://getbootstrap.com/docs/javascript/#modals-usage)
 * - `dialog` - entire window, without the background
 * - `content` - content of the dialog
 * - `header` - header of the dialog
 * - `body` - body of the dialog
 * - `form` - main form in the dialog, inside the `body`
 * - `footer` - footer of the dialog
 *
 * ### Buttons
 *
 * - `btn_close` - close button (if present)
 * - `btn_ok` - OK button (if present)
 * - `btn_cancel` - cancel button (if present)
 * - `btn_yes` - yes button (if present)
 * - `btn_no` - no button (if present)
 *
 * Any ad-hoc button will be added in the form `btn_Label`.
 *
 * NOTE: All actions by default close the popup window, a callback must return `null` in order to keep the popup window
 * visible, this is useful when validating the input. Manually closing the popup is done via the `close` method.
 *
 * ### About the **buttons** option:
 *
 * In addition to default buttons `ok, close, cancel, yes, no` a button can be defined in ad-hoc manner with any label as long as the
 * button callback is named the same, for example
 *
 * ```javascript
 *      bootpopup({
 *        ...
 *        buttons: ["cancel", "Order"],
 *        Order: (data) => {
 *            ...
 *        }
 *      }
 * ```
 *
 * Clicking on the `Order` button will call the Order callback.
 *
 * Customizing default button labels can be done via `text_NAME` properties, for example
 *
 * ```javascript
 * bootpopup({
 *   buttons:["ok","cancel"],
 *   text_ok: "Submit",
 * })
 * ```
 *
 * Now ok will be shown as Submit. With ad-hoc labeling this is not very useful but still can be used for default buttons.
 *
 * ### About the **content** option:
 *
 * #### The biggest flexibility of Bootpopup is the `content` option. The content is wrapped by a form allowing to create complex forms very quickly.
 * When you are submitting data via a dialog box, Bootpopup will grab all that data and deliver to you through the callbacks.
 * `content` is an array of objects and each object is represented as an entry of the form. For example, if you
 *    have the following object:

 *    ```javascript
 *    { p: {class: "bold", text: "Insert data:"}}
 *    ```

 *    This will add a `<p></p>` tag to the form. The options of `p` (`{class: "bold", text: "Insert data:"}`) are HTML
 *    attributes passed to the HTML tag. There is a special attribute for `text` which is defined as the inner text of
 *    the HTML tag. So, this example is equivalent to the following HTML:

 *    ```html
 *    <p class="bold">Insert data:</p>
 *    ```

 * #### But it is when it comes to adding inputs that things become easy. Look at this example:

 *    ```javascript
 *    { input: {type: "text", label: "Title", name: "title", placeholder: "Description" }}
 *    ```

 *    This will create an `input` element with the attributes `type: "text", label: "Title", name: "title", placeholder: "Description"`.
 *    Note there is also a special attribute `label`. This attribute is used by Bootpopup to create a label for the input form entry.
 *    The above example is equivalent to the following HTML:

 *    ```html
 *    <div class="form-group mb-3">
 *      <label for="title" class="col-form-label col-sm-4">Title</label>
 *      <div class="col-sm-10">
 *        <input label="Title" name="title" id="title" placeholder="Description" class="form-control" type="text">
 *      </div>
 *    </div>
 *    ```
 * #### In order to make it even simpler, there are shortcuts for most common input types:
 *    `"text", "color", "url", "password", "hidden", "file", "number",
 *     "email", "reset", "date", "time", "checkbox", "radio", "datetime-local",
 *     "week", "tel", "search", "range", "month", "image", "button"`.

 *    The previous example can be simply written as:

 *    ```javascript
 *    { text: {label: "Title", name: "title", placeholder: "Description" }}
 *    ```

 * #### `select`, `checkboxes` and `radios` have a special attribute named `options`. You can specify a list of options to be shown in 2 formats:
 *      - an object where the key is used as value by the input and the value is the text displayed
 *      - a list of objects with { label:, value:, name: } properties

 *    ```javascript
 *    { select: { label: "Select", name: "select", options: { a:"A", b:"B", c:"C" }}}
 *    { radios: { label: "Radios", name: "radios", options: { a:"A", b:"B", c:"C" }}}
 *    { checkboxes: { label: "Checkboxes", options: [ { name: "c1", label: "A" }, { name: "c2", label: "C", value: 2 } ]}}
 *    ```

 *  `select` with attribute `multiple` is also supported. For multi-select to make an item selected the value must match or property
 *   selected must be true in case of objects: `{ name: .., value:.., selected: true }`

 * #### Another useful feature is the ability to support functions directly as an attribute. Take the following `button` example:

 *    ```javascript
 *    { button: {name: "button", value: "Open image", class: "btn btn-info", click: (event) => {
 *        console.log(event);
 *        bootpopup.alert("Hi there");
 *    }}}
 *    ```
 *    This will create a `onclick` event for the button. The reference for the object is passed as argument to the function.

 * #### You can also insert HTML strings directly. Instead of writing an JS object, write the HTML:

 *    ```javascript
 *    '<p class="lead">Popup dialog boxes for Bootstrap.</p>'
 *    ```

 * #### List of special element properties:
 *  - `class` - to customize the style of the element just provide all classes in the `class` property, if empty `form-control` is set
 *  - `text` - set element's `textContent`
 *  - `html` - parse and add DOM elements after running thru sanitizer
 *  - `autofocus` - make this element focused on show
 *  - `nosanitize` - skip sanitizer for labels or html property if installed
 *  - `floating` - add `form-floating` to the group to make labels floating
 *  - `checked` - true to make checkbox/radios selected
 *  - `switch` - true to convert a checkbox into a toggle style
 *  - `inline` - true to add `form-check-inline` to a checkbox style
 *  - `reverse` - true to add `form-check-reverse` to checkbox style
 *  - `input_label` - checkbox/radio specific label instead of the element's label
 *  - `class_input_btn` - convert checkbox into a button style, must be one of btn- classes
 *  - `class_check` - add custom class to checkbox/radio element
 *  - `class_label` - to customize the label style, added to the default `form-label`
 *  - `attrs_label` - attributes for the label element, an object
 *  - `size_label` - set column width for the label
 *  - `size_input` - set column width for the input
 *  - `class_group` - to customize the group, example: `{ class_group: "row my-3 py-1 border-bottom" }` to set border and gaps for an element
 *  - `attrs_group` - attributes for the group div, an object, example: `{ attrs_group: { id: "group1" } }`
 *  - `class_prefix` and/or `text_prefix` - add as a first span to the group with a span with class/text
 *  - `class_suffix` and/or `text_suffix` - make it the last div in the group with class/text
 *  - `text_valid`, `text_invalid` - add divs for valid or invalid feedback, to be used with `validate` method
 *  - `class_append` and/or `text_append` - append a span to an element, mostly for non-input entries
 *  - `text_input_button` - add a button the element to perform an action on it, `data-formid` and `data-inputid` are set on the button with form and the input elem
 * ent ids for easy access in the callbacks, use `class_input_button` to change the button style, use `class_input_group` to change the input group style
 *  - `attrs_input_button` - attributes to the input button, an object, usually `{ click: (ev) => {} }`
 *  - `list_input_button` or `list_input_tags` - add a dropdown button with options to select and place into an input, use `class_list_button` to change the button
 * style, use `class_input_group` to change the input group style, use `class_input_menu` to change the dropdown menu style, the list can be an Array of strings or ob
 * jects `{ name:, value: }`. The `list_input_tags` adds a selected value in the list.
 *
 * ### Alert:
 *
 *   ```javascript
 *   bootpopup.alert("Hi there");
 *   ```
 *
 * ### Confirm:
 *
 *   ```javascript
 *   bootpopup.confirm("Do you confirm this message?", (yes) => {
 *     alert(yes);
 *   });
 *   ```
 *
 * ### Prompt:
 *
 *   ```javascript
 *   bootpopup.prompt("Name", (value) => {
 *     alert(value);
 *   });
 *   ```
 *
 * ### Customized prompt:
 *
 *   ```javascript
 *   bootpopup({
 *      title: "Add image",
 *       content: [
 *           '<p class="lead">Add an image</p>',
 *           { p: {text: "Insert image info here:"}},
 *           { input: {type: "text", label: "Title", name: "title", placeholder: "Description for image"}},
 *           { input: {type: "text", label: "Link", name: "link", placeholder: "Hyperlink for image"}}],
 *       buttons: ["ok", "cancel"],
 *       cancel: () => { alert("Cancel") },
 *       ok: (data, list) => { console.log(data, list) },
 *       complete: () => { alert("complete") },
 *   });
 *
 * ### Validation:
 *
 * ```javascript
 * var popup = bootpopup({
 *     title: "Add details",
 *     alert: 1,
 *     content: [
 *         { text: { label: "Name", name: "title", placeholder: "your name"}},
 *         { number: { label: "Age", name: "age", placeholder: "your age"}}],
 *     buttons: ["ok", "cancel"],
 *     text_ok: "Verify",
 *     ok: (data) => {
 *         if (!data.name) return popup.showAlert("name is required")
 *     },
 * });
 * ```
 *
 * See more [Examples](https://vseryakov.github.io/bootpopup/index.html).
 */

export function bootpopup(...args)
{
    return new Bootpopup(...args);
}

/**
 * Bootpopup class
 * @param {BootpopupOptions} ..args
 * @class
 */

class Bootpopup {

   /** @property {string} formid Randomly generated HTML id of the form. */
    formid = "bpf" + String(Math.random()).substr(2);
    controller = new AbortController();

    /** @property {Object} options Options used to create the window. */
    options = {
        self: null,
        id: "",
        title: document.title,
        debug: false,
        show_close: true,
        show_header: true,
        show_footer: true,
        size: "",
        size_label: "col-sm-4",
        size_input: "col-sm-8",
        content: [],
        footer: [],
        onsubmit: "close",
        buttons: ["close"],
        attrs_modal: null,
        class_h: "",
        class_modal: "modal fade",
        class_dialog: "modal-dialog",
        class_title: "modal-title",
        class_content: "modal-content",
        class_body: "modal-body",
        class_header: "modal-header",
        class_footer: "modal-footer",
        class_group: "mb-3",
        class_options: "options flex-grow-1 text-start",
        class_alert: "alert alert-danger fade show",
        class_info: "alert alert-info fade show",
        class_form: "",
        class_label: "",
        class_row: "",
        class_col: "",
        class_suffix: "form-text text-muted text-end",
        class_buttons: "btn",
        class_button: "btn-outline-secondary",
        class_ok: "btn-primary",
        class_yes: "btn-primary",
        class_no: "btn-secondary",
        class_cancel: "btn-outline-secondary",
        class_close: "btn-outline-secondary",

        class_tabs: "nav nav-tabs mb-4",
        class_tablink: "nav-link",
        class_tabcontent: "tab-content",
        class_input_button: "btn btn-outline-secondary",
        class_list_button: "btn btn-outline-secondary dropdown-toggle",
        class_input_menu: "dropdown-menu bg-light",
        list_input_mh: "25vh",
        text_ok: "OK",
        text_yes: "Yes",
        text_no: "No",
        text_cancel: "Cancel",
        text_close: "Close",
        center: false,
        scroll: false,
        horizontal: true,
        alert: false,
        info: false,
        backdrop: true,
        keyboard: true,
        autofocus: true,
        empty: false,
        data: "",
        tabs: "",
        tab: "",
        inputs: ["input", "textarea", "select"],

        sanitizer: (html) => (sanitizer(html, true)),

        before: function() {},
        dismiss: function() {},
        close: function() {},
        ok: function() {},
        cancel: function() {},
        yes: function() {},
        no: function() {},
        show: function() {},
        shown: function() {},
        showtab: function() {},
        complete: function() {},
        submit: function(e) {
            this.callback(this.options.onsubmit, e);
            e.preventDefault();
        },
    }

    constructor(...args) {
        this.addOptions(...bootpopup.plugins, ...args);
        this.create();
        this.show();
    }

    /**
     * @description Create the window and add it to the DOM, but do not show it.
     * @returns {Bootpopup} This instance.
     */
    create() {
        this.eventOptions = { signal: this.controller.signal };

        // Option for modal dialog size
        var class_dialog = this.options.class_dialog;
        if (["sm", "lg", "xl", "fullscreen"].includes(this.options.size)) class_dialog += " modal-" + this.options.size;
        if (this.options.center) class_dialog += " modal-dialog-centered";
        if (this.options.scroll) class_dialog += " modal-dialog-scrollable";

        // Create HTML elements for modal dialog
        var modalOpts = { class: this.options.class_modal, id: this.options.id || "", tabindex: "-1", "aria-labelledby": "a" + this.formid, "aria-hidden": true };
        if (this.options.backdrop !== true) modalOpts["data-bs-backdrop"] = typeof this.options.backdrop == "string" ? this.options.backdrop : false;
        if (!this.options.keyboard) modalOpts["data-bs-keyboard"] = false;
        for (const p in this.options.attrs_modal) modalOpts[p] = this.options.attrs_modal[p];

        this.modal = $elem('div', modalOpts, this.eventOptions);
        this.dialog = $elem('div', { class: class_dialog, role: "document" });
        this.content = $elem('div', { class: this.options.class_content + " " + this.options.class_h });
        this.dialog.append(this.content);
        this.modal.append(this.dialog);

        // Header
        if (this.options.show_header && this.options.title) {
            this.header = $elem('div', { class: this.options.class_header });
            const title = $elem('h5', { class: this.options.class_title, id: "a" + this.formid });
            title.append(...this.sanitize(this.options.title));
            this.header.append(title);

            if (this.options.show_close) {
                const close = $elem('button', { type: "button", class: "btn-close", "data-bs-dismiss": "modal", "aria-label": "Close" });
                this.header.append(close);
            }
            this.content.append(this.header);
        }

        // Body
        var class_form = this.options.class_form;
        if (!class_form && this.options.horizontal) class_form = "form-horizontal";
        this.body = $elem('div', { class: this.options.class_body });
        this.form = $elem("form", { id: this.formid, class: class_form, role: "form", submit: (e) => (this.options.submit(e)) });
        this.body.append(this.form);
        this.content.append(this.body);

        if (this.options.alert) {
            this.alert = $elem("div");
            this.form.append(this.alert);
        }
        if (this.options.info) {
            this.info = $elem("div");
            this.form.append(this.info);
        }

        // Tabs and panels
        if (this.options.tabs) {
            const toggle = /nav-pills/.test(this.options.class_tabs) ? "pill" : "tab";
            this.tabs = $elem("div", { class: this.options.class_tabs, role: "tablist" });
            this.form.append(this.tabs);
            this.tabContent = $elem("div", { class: this.options.class_tabcontent });
            this.form.append(this.tabContent);
            this.tabPanels = {};

            for (const p in this.options.tabs) {
                // Skip tabs with no elements
                if (!this.options.content.some((o) => {
                    for (const k in o) {
                        for (const l in o[k]) {
                            if (l == "tab_id" && p == o[k][l]) return 1;
                        }
                    }
                    return 0
                })) continue;
                const active = this.options.tab ? this.options.tab == p : !Object.keys(this.tabPanels).length;
                const tid = this.formid + "-tab" + p;

                const a = $elem("a", {
                    class: this.options.class_tablink + (active ? " active" : ""),
                    "data-bs-toggle": toggle,
                    id: tid + "0",
                    href: "#" + tid,
                    role: "tab",
                    "aria-controls": tid,
                    "aria-selected": false,
                    "data-callback": p,
                    click: (event) => { this.options.showtab(event.target.dataset.callback, event) },
                    text: this.options.tabs[p],
                }, this.eventOptions);
                this.tabs.append(a);

                this.tabPanels[p] = $elem("div", {
                    class: "tab-pane fade" + (active ? " show active": ""),
                    id: tid,
                    role: "tabpanel", "aria-labelledby":
                    tid + "0"
                });
                this.tabContent.append(this.tabPanels[p]);
            }
        }

        // Iterate over entries
        for (const c in this.options.content) {
            const entry = this.options.content[c];
            switch (typeof entry) {
            case "string":
                // HTML string
                this.form.append(...this.sanitize(entry));
                break;

            case "object":
                for (const type in entry) {
                    processEntry(this, type, entry[type]);
                }
                break;
            }
        }

        // Footer
        this.footer = $elem('div', { class: this.options.class_footer });
        if (this.options.show_footer) {
            this.content.append(this.footer);
        }

        for (const i in this.options.footer) {
            const entry = this.options.footer[i];
            let div, html, elem;
            switch (typeof entry) {
            case "string":
                this.footer.append(...this.sanitize(entry));
                break;

            case "object":
                div = $elem('div', { class: this.options.class_options });
                this.footer.append(div)
                for (const type in entry) {
                    const opts = typeof entry[type] == "string" ? { text: entry[type] } : entry[type], attrs = {};
                    for (const p in opts) {
                        if (p == "html") {
                            html = opts.nosanitize ? $parse(opts[p]) : this.sanitize(opts[p]);
                        } else
                        if (!/^(type|[0-9]+)$|^(class|text|icon|size)_/.test(p)) {
                            attrs[p] = opts[p];
                        }
                    }
                    elem = $elem(opts.type || type, attrs, this.eventOptions)
                    if (html) elem.append(...html);
                    div.append(elem);
                }
                break;
            }
        }

        // Buttons
        for (const i in this.options.buttons) {
            var name = this.options.buttons[i];
            if (!name) continue;
            const btn = $elem("button", {
                type: "button",
                class: `${this.options.class_buttons} ${this.options["class_" + name] || this.options.class_button}`,
                "data-callback": name,
                "data-formid": "#" + this.formid,
                click: (event) => { this.callback(event.target.dataset.callback, event) }
            }, this.eventOptions);

            btn.append(...this.sanitize(this.options["text_" + name] || name));
            if (this.options["icon_" + name]) {
                btn.append($elem("i", { class: this.options["icon_" + name] }));
            }
            this["btn_" + name] = btn;
            this.footer.append(btn);
        }

        // Setup events for dismiss and complete
        $on(this.modal, 'show.bs.modal', (e) => {
            this.options.show.call(this.options.self, e, this);
        }, this.eventOptions);

        $on(this.modal, 'shown.bs.modal', (e) => {
            if (this.options.autofocus) {
                var focus = this.autofocus ||
                    Array.from($all("input,select,textarea", this.form)).
                    find(el => !(el.readOnly||el.disabled||el.type=='hidden'));
                if (focus) focus.focus();
            }
            this.options.shown.call(this.options.self || this, e, this);
        }, this.eventOptions);

        $on(this.modal, 'hide.bs.modal', (e) => {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
            e.bootpopupButton = this._callback;
            this.options.dismiss.call(this.options.self, e, this);
        }, this.eventOptions);

        $on(this.modal, 'hidden.bs.modal', (e) => {
            e.bootpopupButton = this._callback;
            this.options.complete.call(this.options.self, e, this);
            this.modal.remove();
            bootstrap.Modal.getInstance(this.modal)?.dispose();
            delete this.options.data;
            this.controller.abort();
        }, this.eventOptions);
    }

    /**
    * @description Show the window and call the `before` callback.
    * @returns {Bootpopup} This instance.
    */
    show() {
        // Call before event
        this.options.before.call(this, this);

        if (isObject(this.options.data)) {
            var xdata = this.xdata = Alpine.reactive(this.options.data);
            Alpine.addScopeToNode(this.modal, xdata);
            Alpine.initTree(this.modal);
            Alpine.onElRemoved(this.modal, () => {
                delete this.modal._x_dataStack;
            });
        }

        document.body.append(this.modal);

        // Fire the modal window
        bootstrap.Modal.getOrCreateInstance(this.modal).show();
    }

    /**
    * @param {string} msg Message to display.
    * @param {Object} [options] Alert options.
    * @param {("info")} [options.type] Use `"info"` to show information message (requires `info: true`).
    * @param {boolean} [options.dismiss] If true, the message must be closed manually.
    * @param {number} [options.delay] Auto-hide after this delay (ms).
    * @returns {Bootpopup} This instance.
    */
    showAlert(text, opts) {
        const type = opts?.type || "alert", element = this[type];
        if (!element) return;
        if (text?.message) text = text.message;
        if (typeof text != "string") return;
        const alert = $elem(`div`, { class: this.options['class_' + type], role: "alert", text });
        if (opts?.dismiss) {
            alert.classList.add("alert-dismissible");
            alert.append($elem(`button`, { type: "button", class: "btn-close", 'data-bs-dismiss': "alert", 'aria-label': "Close" }));
        } else {
            setTimeout(() => { $empty(element) }, opts?.delay || this.delay || 10000);
        }
        $empty(element).append(alert);
        if (this.options.scroll) {
            element.scrollIntoView();
        }
        return null;
    }

    /**
     * @description Run `checkValidity()` and return the result.
     * @returns {boolean} Validity result.
     */
    validate() {
        this.form.classList.add('was-validated')
        return this.form.checkValidity();
    }

    sanitize(str) {
        return !str ? [] : this.options.sanitizer(str);
    }


    /**
    * @param {string} str String to escape.
    * @returns {string} Escaped string where `&<>'"` are converted into HTML entities.
    */
    escape(str) {
        if (typeof str != "string") return str;
        return str.replace(/([&<>'"`])/g, (_, n) => (escapeMap[n] || n));
    }

    /**
    * @description Return form input values from all inputs.
    * @returns {{obj: Object<string, any>, list: any[]}} Data as `{ obj: {}, list: [] }`.
    */
    data() {
        var inputs = [...this.options.inputs, ...bootpopup.inputs];
        var d = { list: [], obj: {} }, e, n, v, l = $all(inputs.join(","), this.form);
        for (let i = 0; i < l.length; i++) {
            e = l[i];
            n = e.name || $attr(e, "name") || e.id || $attr("id");
            v = e.value;
            if (this.options.debug) console.log("bootpopup:", n, e.type, e.checked, v, e);
            if (!n || e.disabled) continue;
            if (/radio|checkbox/i.test(e.type) && !e.checked) v = undefined;
            if (v === undefined || v === "") {
                if (!this.options.empty) continue;
                v = "";
            }
            d.list.push({ name: n, value: v })
        }
        for (const v of d.list) d.obj[v.name] = v.value;
        if (this.options.debug) console.log("bootpopup:", this.options.inputs, d);
        return d;
    }

    /**
    * @description Call a callback for the given action and return its result.
    * @param {"dismiss"|"submit"|"close"|"ok"|"cancel"|"yes"|"no"} name Action name.
    * @returns {any} Callback return value.
    */
    callback(name, event) {
        if (this.options.debug) console.log("bootpopup:", name, event);
        var func = isFunction(this.options[name]);
        if (!func) return;
        this._callback = name;
        var a = this.data();
        var result = func.call(this.options.self || this, a.obj, a.list, event);
        if (result instanceof Promise) {
            result.then(resolved => {
                if (resolved !== null) {
                    bootstrap.Modal.getOrCreateInstance(this.modal).hide();
                }
            })
        } else {
            // Hide window if not prevented
            if (result !== null) {
                bootstrap.Modal.getOrCreateInstance(this.modal).hide();
            }
            return result;
        }
    }

    /**
    * @param {Object} options Add/merge options into current options.
    * @returns {Bootpopup} This instance.
    */
    addOptions(...args) {
        for (const opts of args) {
            for (const key in opts) {
                if (opts[key] !== undefined) {
                    // Chaining all callbacks together, not replacing
                    if (isFunction(this.options[key])) {
                        const _old = this.options[key], _n = opts[key];
                        this.options[key] = function(...args) {
                            if (isFunction(_old)) _old.apply(this, args);
                            return _n.apply(this, args);
                        }
                    } else {
                        this.options[key] = opts[key];
                    }
                }
            }
        }
        // Determine what is the best action if none is given
        if (this.options.onsubmit == "close") {
            if (this.options.buttons.includes("ok")) this.options.onsubmit = "ok"; else
            if (this.options.buttons.includes("yes")) this.options.onsubmit = "yes";
        }
        return this.options;
    }

    /**
    * @description Close popup window (performs the `close` action).
    * @returns {void}
    */
    close() {
        return this.callback("close")
    }

}

bootpopup.plugins = [];
bootpopup.inputs = [];

/**
 * Shows an alert dialog box.
 * @Returns: instance of Bootpopup window
 * @param {string} message - message of the alert
 * @param {function} callback - `(function)()` callback when the alert is dismissed
 */
bootpopup.alert = function(text, callback)
{
    return new Bootpopup({
        show_header: false,
        content: [{ div: { text } }],
        class_footer: "modal-footer justify-content-center",
        dismiss: callback,
    });
}

/**
 * Shows a confirm dialog box.
 * @Returns: instance of Bootpopup window
 *
 * @param {string} message - message to confirm
 * @param {function} callback - `(function)(answer)` callback when the confirm is answered. `answer` will be `true`
 * if the answer was yes and `false` if it was no. If dismissed, the default answer is no
 */
bootpopup.confirm = function(text, callback)
{
    var ok;
    return new Bootpopup({
        show_header: false,
        content: [{ div: { text } }],
        buttons: ["yes", "no"],
        class_footer: "modal-footer justify-content-center",
        yes: isFunction(callback) ? () => { callback(ok = true) } : null,
        dismiss: isFunction(callback) ? () => { if (!ok) callback(false) } : null,
    });
}

/**
* Shows a prompt dialog box, asking to input a single value.
* @Returns: instance of Bootpopup window
*
* @param {string} label - label of the value being asked
* @param {function} callback - `(function)(answer)` callback with the introduced data. This is only called when OK is pressed
*/
bootpopup.prompt = function(label, callback)
{
    var ok;
    return new Bootpopup({
        show_header: false,
        content: [{ input: { name: "value", label } }],
        buttons: ["ok", "cancel"],
        ok: isFunction(callback) ? (d) => { callback(ok = d.value || "") } : null,
        dismiss: isFunction(callback) ? () => { if (ok === undefined) callback() } : null,
    });
}

function addElement(self, entry)
{
    var { type, attrs, opts, parent, children, elem, group } = entry;

    if (!self.options.inputs.includes(type)) {
        self.options.inputs.push(type);
    }
    if (opts.class_append || opts.text_append) {
        const span = $elem("span", { class: opts.class_append, text: opts.text_append });
        elem.append(span);
    }
    if (opts.list_input_button || opts.list_input_tags) {
        if (attrs.value && opts.list_input_tags) {
            $attr(elem, 'value', attrs.value.split(/[,|]/).map(x => x.trim()).filter(x => x).join(', '));
        }
        group = $elem('div', { class: `input-group ${opts.class_input_group || ""}` });
        group.append(elem);
        elem = group;

        const button = $elem('button', {
            class: opts.class_list_button || self.options.class_list_button,
            type: "button",
            'data-bs-toggle': "dropdown",
            'aria-haspopup': "true",
            'aria-expanded': "false",
            text: opts.text_input_button,
        });
        elem.append(button);

        var menu = $elem('div', {
            class: opts.class_input_menu || self.options.class_input_menu,
            "-overflowY": "auto",
            "-maxHeight": opts.list_input_mh || self.options.list_input_mh
        });
        elem.append(menu);

        var list = opts.list_input_button || opts.list_input_tags || [];
        for (const l of list) {
            let n = l, v = self.escape(n);
            if (typeof n == "object") v = self.escape(n.value), n = self.escape(n.name);
            if (n == "-") {
                menu.appendTo($elem('div', { class: "dropdown-divider" }));
            } else
            if (opts.list_input_tags) {
                const a = $elem('a', {
                    class: "dropdown-item " + (opts.class_list_input_item || ""),
                    role: "button",
                    'data-attrid': '#' + attrs.id,
                    text: n,
                    click: (ev) => {
                        var el = $(ev.target.dataset.attrid);
                        var v = ev.target.textContent;
                        if (!el.value) {
                            el.value = v;
                        } else {
                            var l = el.value.split(/[,|]/).map(x => x.trim()).filter(x => x);
                            if (!l.includes(v)) l.push(v);
                            el.value = l.join(', ');
                        }
                    },
                }, self.eventOptions);
                menu.append(a);
            } else {
                const a = $elem('a', {
                    class: "dropdown-item " + (opts.class_list_input_item || ""),
                    role: "button",
                    'data-value': v || n,
                    'data-attrid': '#' + attrs.id,
                    text: n,
                    click: (ev) => {
                        $(ev.target.dataset.attrid).value = ev.target.dataset.value
                    },
                }, self.eventOptions);
                menu.append(a);
            }
        }
    } else
    if (opts.text_input_button) {
        group = $elem('div', { class: `input-group ${opts.class_input_group || ""}` });
        group.append(elem);
        elem = group;
        const bopts = {
            class: opts.class_input_button || self.options.class_input_button,
            type: "button",
            'data-formid': '#' + self.formid,
            'data-inputid': '#' + attrs.id,
            text: opts.text_input_button
        };
        for (const b in opts.attrs_input_button) bopts[b] = opts.attrs_input_button[b];
        const button = $elem('button', bopts);
        elem.append(button);
    }

    for (const k in children) elem.append(children[k]);
    var class_group = opts.class_group || self.options.class_group;
    var class_label = (opts.class_label || self.options.class_label) + " " + (attrs.value ? "active" : "");
    var gopts = { class: class_group, title: attrs.title };
    for (const p in opts.attrs_group) gopts[p] = opts.attrs_group[p];

    group = $elem('div', gopts)
    parent.append(group);

    if (opts.class_prefix || opts.text_prefix) {
        const div = $elem("span", { class: opts.class_prefix || "" });
        if (opts.text_prefix) div.append(...self.sanitize(opts.text_prefix));
        group.append(div);
    }
    if (opts.horizontal !== undefined ? opts.horizontal : self.options.horizontal) {
        group.classList.add("row");
        class_label = " col-form-label " + (opts.size_label || self.options.size_label) + " " + class_label;
        const lopts = { for: opts.for || attrs.id, class: class_label };
        for (const p in opts.attrs_label) lopts[p] = opts.attrs_label[p];
        const label = $elem("label", lopts);
        label.append(...self.sanitize(opts.label));

        const input = $elem('div', { class: opts.size_input || self.options.size_input });
        input.append(elem);
        group.append(label, input);
    } else {
        const lopts = { for: opts.for || attrs.id, class: "form-label " + class_label };
        for (const p in opts.attrs_label) lopts[p] = opts.attrs_label[p];
        const label = $elem("label", lopts);
        label.append(...self.sanitize(opts.label));

        if (opts.floating) {
            if (!opts.placeholder) $attr(elem, "placeholder", "");
            group.classList.add("form-floating");
            group.append(elem);
            if (opts.label) group.append(label);
        } else {
            if (opts.label) group.append(label);
            group.append(elem);
        }
    }
    if (opts.text_valid) {
        group.append($elem("div", { class: "valid-feedback", text: opts.text_valid }));
    }
    if (opts.text_invalid) {
        group.append($elem("div", { class: "invalid-feedback", text: opts.text_invalid }));
    }
    if (opts.class_suffix || opts.text_suffix) {
        const div = $elem("div", { class: opts.class_suffix || self.options.class_suffix });
        if (opts.text_suffix) div.append(...self.sanitize(opts.text_suffix));
        group.append(div);
    }
    if (opts.autofocus) self.autofocus = elem;
}

function processEntry(self, type, entry)
{
    var parent = self.form, opts = {}, children = [], attrs = {}, label, elem, html;

    if (Array.isArray(entry)) {
        children = entry;
    } else
    if (typeof entry == "string") {
        opts.label = entry;
    } else {
        for (const p in entry) opts[p] = entry[p];
    }
    for (const p in opts) {
        if (p == "html") {
            html = opts.nosanitize ? $parse(opts[p]) : self.sanitize(opts[p]);
        } else
        if (!/^(tab_|attrs_|click_|list_|class_|text_|icon_|size_|label|for)/.test(p)) {
            attrs[p] = opts[p];
        }
    }

    // Create a random id for the input if none provided
    if (!attrs.id) attrs.id = "bpi" + String(Math.random()).substr(2);
    attrs["data-formid"] = "#" + self.formid;

    // Choose to the current tab content
    if (opts.tab_id && self.tabs) {
        parent = self.tabPanels[opts.tab_id] || parent;
    }

    // Check if type is a shortcut for input
    if (inputs.includes(type)) {
        attrs.type = type;
        type = "input";
    }

    switch (type) {
    case "button":
    case "submit":
    case "input":
    case "textarea":
        attrs.type = (attrs.type === undefined ? "text" : attrs.type);
        if (attrs.type == "hidden") {
            elem = $elem(type, attrs, self.eventOptions);
            parent.append(elem);
            break;
        }
        if (!attrs.class) attrs.class = self.options["class_" + attrs.type];

    case "select":
        if (type == "select" && attrs.options) {
            if (attrs.caption) {
                children.push($elem("option", { text: attrs.caption, value: "" }));
            }
            for (const j in attrs.options) {
                const option = {}, opt = attrs.options[j];
                if (typeof opt == "string") {
                    if (attrs.value === opt) option.selected = true;
                    option.text = self.escape(opt);
                    if (isString(j)) option.value = j;
                    children.push($elem("option", option));
                } else
                if (opt?.name) {
                    option.value = opt.value || "";
                    if (opt.selected || attrs.value === option.value) option.selected = true;
                    if (opt.label) option.label = opt.label;
                    if (typeof opt.disabled == "boolean") option.disabled = opt.disabled;
                    option.text = self.escape(opt.name);
                    children.push($elem("option", option));
                }
            }
            delete attrs.options;
            delete attrs.value;
        }

        // Special case for checkbox
        if (["radio", "checkbox"].includes(attrs.type) && !opts.raw) {
            if (attrs.checked === false || attrs.checked == 0) delete attrs.checked;
            label = $elem('label', {
                class: opts.class_input_btn || opts.class_input_label || "form-check-label",
                for: opts.for || attrs.id,
                text: opts.input_label || opts.label
            });
            let class_check = "form-check";
            if (opts.switch) class_check += " form-switch", attrs.role = "switch";
            if (opts.inline) class_check += " form-check-inline";
            if (opts.reverse) class_check += " form-check-reverse";
            if (opts.class_check) class_check += " " + opts.class_check;
            attrs.class = (opts.class_input_btn ? "btn-check " : "form-check-input ") + (attrs.class || "");
            elem = $elem('div', { class: class_check });
            elem.append($elem(type, attrs, self.eventOptions), label);

            if (opts.class_append || opts.text_append) {
                label.append($elem("span", { class: opts.class_append || "", text: opts.text_append }));
            }
            // Clear label to not add as header, it was added before
            if (!opts.input_label) delete opts.label;
        } else {
            if (["select", "range"].includes(attrs.type)) {
                attrs.class = `form-${attrs.type} ${attrs.class || ""}`;
            }
            attrs.class = attrs.class || "form-control";
            if (type == "textarea") {
                delete attrs.value;
                elem = $elem(type, attrs, self.eventOptions);
                if (opts.value) elem.append(opts.value);
            } else {
                elem = $elem(type, attrs, self.eventOptions);
            }
        }
        addElement(self, { type, attrs, opts, parent, children, elem });
        break;

    case "radios":
    case "checkboxes":
        elem = $elem("div", { class: opts.class_container });
        for (const i in attrs.options) {
            let o = attrs.options[i];
            if (!o) continue;
            if (isString(o)) o = { label: o };
            if (!o.value && type[0] == "r") o.value = i;
            if (o.checked === false || o.checked == 0) delete o.checked;
            const title = o.title;
            const label = $elem('label', { class: "form-check-label", for: attrs.id + "-" + i, text: o.label || o.name });
            o = Object.assign(o, {
                id: attrs.id + "-" + i,
                name: o.name || opts.name,
                class: `form-check-input ${o.class || ""}`,
                role: opts.switch && "switch",
                type: attrs.type || type[0] == "r" ? "radio" : "checkbox",
                label: undefined,
                title: undefined,
            });
            let c = "form-check";
            if (o.switch || opts.switch) c += " form-switch";
            if (o.inline || opts.inline) c += " form-check-inline";
            if (o.reverse || opts.reverse) c += " form-check-reverse";
            if (o.class_check || opts.class_check) c += " " + (o.class_check || opts.class_check);
            const div = $elem('div', { class: c, title: title });
            div.append($elem(`input`, o, self.eventOptions), label);
            children.push(div);
        }
        for (const p of ["switch", "inline", "reverse", "options", "value", "type"]) delete attrs[p];
            addElement(self, { type, attrs, opts, parent, children, elem });
        break;

    case "alert":
    case "success":
        self[type] = elem = $elem("div", attrs, self.eventOptions);
        parent.append(elem);
        break;

    case "row":
        var row = $elem("div", { class: opts.class_row || self.options.class_row || "row" });
        parent.append(row);
        for (const subEntry of children) {
            const col = $elem("div", { class: subEntry.class_col || self.options.class_col || "col-auto" });
            row.append(col);
            const oldParent = parent;
            parent = col;
            for (const type in subEntry) {
                processEntry(self, type, subEntry[type]);
            }
            parent = oldParent;
        }
        break;

    default:
        elem = $elem(type, attrs, self.eventOptions);
        if (html) {
            elem.append(...html);
        }
        if (opts.class_append || opts.text_append) {
            elem.append($elem("span", { class: opts.class_append || "", text: opts.text_append }));
        }
        if (opts.name && opts.label) {
            addElement(self, { type, attrs, opts, parent, children, elem });
        } else {
            parent.append(elem);
        }
    }
}

