
import { app, isObject, toNumber, trace } from "./app"
import { $on } from "./dom"
import { emit } from "./events"

/**
 * Websockets client
 * @param {object} [options] - config params
 * @param {string} [options.path=/] - connect url path name
 * @param {object} [options.query] - query parameters to send on connect in the url
 * @param {number} [options.retry_timeout=250] - ms between retries to connect
 * @param {number} [options.retry_factor] - multiplier for retry timeout
 * @param {number} [options.max_timeout=30000] - ms for max timeout on retries, once reached restart with retry_timeout
 * @param {number} [options.max_retries] - how many retries to perform until connected
 * @param {number} [options.max_pending=10] - how many request to keep in pending queue until connected
 * @param {number} [options.ping_interval=300000] - ms between pings
 * @class
 *
 * @example
 * app.$ready(async () => {
 *
 *   app.ws = new app.WS({ path: "/ws" });
 *   app.ws.connect();
 *   app.ws.on("ws:message", (data) => { ...});
 *
 * });
 * ....
 *
 * app.ws.send("/route/action")
 * app.ws.send({ path: "/some/path", data: { ...} })
 */

class WS {
    path = "/"
    query = {}
    retry_timeout = 500
    retry_factor = 2
    max_timeout = 30000
    max_retries = Infinity
    max_pending = 10
    ping_interval = 300000
    _retries = 0
    _pending = []

    constructor(options)
    {
        for (const p in options) {
            if (p[0] != "_" &&
                this[p] !== undefined &&
                typeof this[p] === typeof options[p]) {
                this[p] = options[p];
            }
        }

        $on(window, "online", this.online.bind(this));
    }

    /**
     * Open a new websocket connection
     */
    connect()
    {
        if (this._timer) {
            clearTimeout(this._timer);
            delete this._timer;
        }
        if (this.disabled) return;

        const host = this.host || window.location.hostname;

        if (navigator.onLine === false && !/^(localhost|127.0.0.1)$/.test(host)) {
            return this.timer(0);
        }

        if (!this.query) this.query = {};
        for (const p in this.headers) {
            if (this.query[p] === undefined) this.query[p] = this.headers[p];
        }

        const port = this.port || window.location.port;
        const proto = this.protocol || window.location.protocol.replace("http", "ws");
        const url = `${proto}//${host}:${port}${this.path}?${this.query ? new URLSearchParams(this.query).toString() : ""}`;

        const ws = this.ws = new WebSocket(url);
        ws.onopen = () => {
            trace("ws.open:", url);
            emit("ws:open", url);
            this._ctime = Date.now();
            this._timeout = toNumber(this.retry_timeout);
            this._retries = 0;
            while (this._pending.length) {
                this.send(this.pending.shift());
            }
            this.ping();
        }
        ws.onclose = () => {
            trace("ws.closed:", url, this._timeout, this._retries);
            this.ws = null;
            emit("ws:close", url);
            if (++this._retries < this.max_retries) this.timer();
        }
        ws.onmessage = (msg) => {
            var data = msg.data;
            if (data === "bye") return this.close(1);
            if (typeof data == "string" && (data[0] == "{" || data[0] == "[")) data = JSON.parse(data);
            trace('ws.message:', data);
            emit("ws:message", data);
            if (data.event) {
                emit(app.event, data.event, data);
            }
        }
        ws.onerror = (err) => {
            trace('ws.error:', url, err);
        }
    }

    /**
     * Restart websocket reconnect timer, increase timeout according to reconnect policy (retry_factor, max_timeout)
     * @param {number} timeout
     */
    timer(timeout)
    {
        clearTimeout(this._timer);
        if (this.disabled) return;
        if (typeof timeout == "number") this._timeout = timeout;
        this._timer = setTimeout(this.connect.bind(this), this._timeout);
        this._timeout *= this._timeout == this.max_timeout ? 0 : toNumber(this.retry_factor);
        this._timeout = toNumber(this._timeout, { min: this.retry_timeout, max: this.max_timeout });
    }

    /**
     * Send a ping and shcedule next one
     */
    ping()
    {
        clearTimeout(this._ping);
        if (this.disabled || !this.ping_interval) return;
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(this.ping_path || "/ping");
        }
        this._ping = setTimeout(this.ping.bind(this), this.ping_interval);
    }

    /**
     * Closes and possibly disables WS connection, to reconnect again must delete .disabled property
     * @param {boolean} [disable]
     */
    close(disable)
    {
        this.disabled = disable;
        if (!this.ws) return;
        this.ws.close();
        delete this.ws;
    }

    /**
     * Send a string data or an object
     * @param {object|string} data
     */
    send(data)
    {
        if (this.ws?.readyState != WebSocket.OPEN) {
            if (!this.max_pending || this._pending.length < this.max_pending) {
                this._pending.push(data);
            }
            return;
        }
        if (isObject(data)) {
            if (data.url && data.url[0] == "/") {
                data = data.url;
                if (isObject(data.data)) {
                    data += "?" + new URLSearchParams(data.data).toString();
                }
            } else {
                data = JSON.stringify(data);
            }
        }
        this.ws.send(data);
    }

    /**
     * Check the status of websocket connection, reconnect if needed
     */
    online()
    {
        trace('ws.online:', navigator.onLine, this.ws?.readyState, this.path, this._ctime);
        if (this.ws?.readyState !== WebSocket.OPEN && this._ctime) {
            this.connect();
        }
    }
}

export { WS };
export default WS;
