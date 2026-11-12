(() => {
  // ../../../../Program Files (x86)/Steam/steamapps/common/wallpaper_engine/projects/myprojects/gemini_4_hydrogen/assets/script-DMzJVhEH.js
  var xn = Object.defineProperty;
  var wn = (e, t, o) => t in e ? xn(e, t, { enumerable: true, configurable: true, writable: true, value: o }) : e[t] = o;
  var K = (e, t, o) => wn(e, typeof t != "symbol" ? t + "" : t, o);
  (() => {
    var V;
    class e extends Event {
      constructor(n, a, u) {
        super("context-request", { bubbles: true, composed: true }), this.context = n, this.callback = a, this.subscribe = u;
      }
    }
    class t extends Event {
      constructor(n) {
        super("context-provider", { bubbles: true, composed: true }), this.context = n;
      }
    }
    function o(g, n, a) {
      let u, y;
      const T = /* @__PURE__ */ new Set(), I = (L, X) => {
        if (X !== y && (y == null || y()), y = X, Object.is(L, u)) return;
        const z = L;
        u = z, T.forEach((ne) => ne(z));
      }, C = () => {
        g.dispatchEvent(new e(n, I, true));
      };
      return g.ownerDocument.addEventListener("context-provider", (L) => {
        L.context === n && C();
      }, { signal: a }), a.addEventListener("abort", () => {
        y == null || y(), T.clear();
      }, { once: true }), a.aborted || C(), { get current() {
        return u;
      }, subscribe: (L) => (T.add(L), () => {
        T.delete(L);
      }) };
    }
    class s extends HTMLElement {
      constructor() {
        super();
        K(this, "internals", typeof this.attachInternals == "function" ? this.attachInternals() : void 0);
        K(this, "fallbackStates", /* @__PURE__ */ new Set());
        K(this, "connection", new AbortController());
        K(this, "isFirstConnect", true);
      }
      static register() {
        const a = this.tagName;
        if (!a) throw new Error(`[BaseElement] Cannot register ${this.name}: static tagName is not defined.`);
        window.customElements.get(a) || window.customElements.define(a, this);
      }
      connectedCallback() {
        this.connection.signal.aborted && (this.connection = new AbortController()), this.isFirstConnect && (this.setup(), this.isFirstConnect = false), this.connect(), this.setElementState("connected", true);
      }
      disconnectedCallback() {
        this.setElementState("connected", false), this.disconnect(), this.connection.abort();
      }
      get signal() {
        return this.connection.signal;
      }
      setup() {
      }
      connect() {
      }
      disconnect() {
      }
      setElementState(a, u = true) {
        this.internals && this.internals.states ? u ? this.internals.states.add(a) : this.internals.states.delete(a) : u ? this.fallbackStates.add(a) : this.fallbackStates.delete(a);
      }
      hasElementState(a) {
        return this.internals && this.internals.states ? this.internals.states.has(a) : this.fallbackStates.has(a);
      }
      emit(a, ...[u]) {
        this.dispatchEvent(new CustomEvent(`${this.localName}:${a}`, { detail: u, bubbles: true, composed: true }));
      }
      listen(a, u, y, T) {
        const I = typeof T == "boolean" ? { capture: T } : T;
        a.addEventListener(u, y, { ...I, signal: this.signal });
      }
      provide(a, u) {
        return (function(y, T, I, C) {
          let L = I;
          const X = /* @__PURE__ */ new Map();
          return y.addEventListener("context-request", (z) => {
            if (z.context !== T || z.composedPath()[0] === y) return;
            z.stopImmediatePropagation();
            const { callback: ne } = z;
            z.subscribe ? (X.has(ne) || X.set(ne, () => {
              X.delete(ne);
            }), ne(L, X.get(ne))) : ne(L);
          }, { signal: C }), C.addEventListener("abort", () => X.clear(), { once: true }), y.dispatchEvent(new t(T)), { get current() {
            return L;
          }, set(z) {
            C.aborted || Object.is(z, L) || (L = z, X.forEach((ne, me) => me(L, ne)));
          } };
        })(this, a, u, this.signal);
      }
      consume(a) {
        return o(this, a, this.signal);
      }
      $(a) {
        return this.querySelector(a);
      }
      $required(a) {
        const u = this.querySelector(a);
        if (!u) throw new Error(`[BaseElement] Required child element "${a}" not found in <${this.tagName.toLowerCase()}>.`);
        return u;
      }
      $$(a) {
        return this.querySelectorAll(a);
      }
      getAttributeAsString(a, u) {
        return this.getAttribute(a) ?? u;
      }
      getAttributeAsBoolean(a) {
        const u = this.getAttribute(a);
        return u !== null && u !== "false";
      }
      getAttributeAsNumber(a, u) {
        const y = this.getAttribute(a);
        if (y === null) return u;
        const T = parseFloat(y);
        return isNaN(T) ? u : T;
      }
    }
    let l = (function(g) {
      return g[g.DEBUG = 0] = "DEBUG", g[g.INFO = 1] = "INFO", g[g.WARN = 2] = "WARN", g[g.ERROR = 3] = "ERROR", g;
    })({});
    class c {
      log(n, a, u, ...y) {
        const T = `[${a}] ${u}`;
        switch (n) {
          case l.DEBUG:
            console.debug(T, ...y);
            break;
          case l.INFO:
            console.log(T, ...y);
            break;
          case l.WARN:
            console.warn(T, ...y);
            break;
          case l.ERROR:
            console.error(T, ...y);
        }
      }
    }
    class h {
      constructor(n) {
        K(this, "level", l.INFO);
        K(this, "handler", new c());
        this.namespace = n, this.level = l.WARN;
      }
      setLevel(n) {
        return this.level = n, this;
      }
      setHandler(n) {
        return this.handler = n, this;
      }
      debug(n, ...a) {
        this.level <= l.DEBUG && this.handler.log(l.DEBUG, this.namespace, n, ...a);
      }
      info(n, ...a) {
        this.level <= l.INFO && this.handler.log(l.INFO, this.namespace, n, ...a);
      }
      warn(n, ...a) {
        this.level <= l.WARN && this.handler.log(l.WARN, this.namespace, n, ...a);
      }
      error(n, ...a) {
        this.level <= l.ERROR && this.handler.log(l.ERROR, this.namespace, n, ...a);
      }
    }
    new h("ABC");
    const i = /* @__PURE__ */ Symbol("Scroll"), b = { scrollY: 0, deltaY: 0, direction: "idle", viewportHeight: 0, scrollHeight: 0, isProgrammatic: false }, P = class P2 {
      constructor(n) {
        K(this, "listeners", { scroll: /* @__PURE__ */ new Set(), scrollend: /* @__PURE__ */ new Set(), resize: /* @__PURE__ */ new Set() });
        K(this, "observer", null);
        K(this, "idleTimeout", null);
        K(this, "isListening", false);
        K(this, "currentState", b);
        K(this, "onScroll", () => {
          this.syncScroll(window.scrollY), this.scheduleIdleScrollEnd();
          const n2 = this.currentState;
          for (const a of [...this.listeners.scroll]) this.listeners.scroll.has(a) && a(n2);
        });
        K(this, "onScrollEnd", () => {
          this.clearIdleTimeout(), this.currentState = { ...this.currentState, deltaY: 0, direction: "idle" };
          const n2 = this.currentState;
          for (const a of [...this.listeners.scrollend]) this.listeners.scrollend.has(a) && a(n2);
        });
        K(this, "onResize", () => {
          this.syncDimensions();
          const n2 = this.currentState;
          for (const a of [...this.listeners.resize]) this.listeners.resize.has(a) && a(n2);
          for (const a of [...this.listeners.scroll]) this.listeners.scroll.has(a) && a(n2);
        });
        if (n !== i) throw new Error("Use Scroll.getInstance() instead of new Scroll().");
      }
      static getInstance() {
        return P2.instance || (P2.instance = new P2(i)), P2.instance;
      }
      static resetInstance() {
        P2.instance && (P2.instance.cleanup(), P2.instance = null);
      }
      get state() {
        return this.isListening || this.syncDimensions(), this.currentState;
      }
      setProgrammaticState(n) {
        this.currentState.isProgrammatic !== n && (this.currentState = { ...this.currentState, isProgrammatic: n }, n && this.scheduleIdleScrollEnd());
      }
      on(n, a) {
        return this.attachListeners(), this.listeners[n].add(a), () => this.off(n, a);
      }
      off(n, a) {
        this.listeners[n].delete(a), this.hasListeners() || this.detachListeners();
      }
      cleanup() {
        this.detachListeners(), this.listeners.scroll.clear(), this.listeners.resize.clear(), this.listeners.scrollend.clear(), this.currentState = b;
      }
      hasListeners() {
        return this.listeners.scroll.size > 0 || this.listeners.resize.size > 0 || this.listeners.scrollend.size > 0;
      }
      attachListeners() {
        this.isListening || (this.isListening = true, this.syncDimensions(), this.syncScroll(window.scrollY), window.addEventListener("scroll", this.onScroll, { passive: true }), window.addEventListener("scrollend", this.onScrollEnd, { passive: true }), window.addEventListener("resize", this.onResize), this.observer = new ResizeObserver(this.onResize), this.observer.observe(document.body));
      }
      detachListeners() {
        var n;
        this.isListening && (this.isListening = false, this.clearIdleTimeout(), window.removeEventListener("scroll", this.onScroll), window.removeEventListener("scrollend", this.onScrollEnd), window.removeEventListener("resize", this.onResize), (n = this.observer) == null || n.disconnect(), this.observer = null);
      }
      clearIdleTimeout() {
        this.idleTimeout !== null && (clearTimeout(this.idleTimeout), this.idleTimeout = null);
      }
      scheduleIdleScrollEnd() {
        this.clearIdleTimeout(), this.idleTimeout = setTimeout(this.onScrollEnd, 140);
      }
      syncScroll(n) {
        const a = n - this.currentState.scrollY;
        let u = this.currentState.direction;
        a > 0 ? u = "down" : a < 0 && (u = "up"), this.currentState = { ...this.currentState, scrollY: n, deltaY: a, direction: u };
      }
      syncDimensions() {
        const n = window.innerHeight, a = document.documentElement.scrollHeight;
        this.currentState = { ...this.currentState, scrollY: window.scrollY, viewportHeight: n, scrollHeight: a };
      }
    };
    K(P, "instance", null);
    let p = P;
    const w = { tracks: {}, collections: {}, components: [] };
    let m = null, x = null, E = null;
    function d() {
      const g = document.getElementById("abc-page-config");
      if (x && g === m) return x;
      if (m = g, E = null, !g || !g.textContent) return x = w, x;
      try {
        const n = JSON.parse(g.textContent);
        x = { tracks: n.tracks && typeof n.tracks == "object" ? n.tracks : {}, collections: n.collections && typeof n.collections == "object" ? n.collections : {}, components: Array.isArray(n.components) ? n.components : [] };
      } catch {
        x = w;
      }
      return x;
    }
    function M() {
      if (d(), E) return E;
      const g = /* @__PURE__ */ new Map(), n = document.querySelectorAll("[data-marker], [data-marker-end]");
      for (const a of n) {
        const u = a.getAttribute("data-marker");
        u && g.set(u, { id: u, element: a, edge: "top" });
        const y = a.getAttribute("data-marker-end");
        y && g.set(y, { id: y, element: a, edge: "bottom" });
      }
      return E = g, g;
    }
    function A(g, n, a) {
      var y;
      const u = a.get(g);
      return u && ((y = u.element) != null && y.isConnected) ? u : { id: g, element: null, edge: u ? u.edge : n };
    }
    function k(g) {
      var y;
      const n = d().tracks[g];
      if (!n) return null;
      let a = M();
      const u = n.start_marker || n.end_marker;
      if (u) {
        const T = a.get(u);
        T && ((y = T.element) != null && y.isConnected) || (E = null, a = M());
      }
      return { id: g, start: n.start_marker ? A(n.start_marker, "top", a) : null, end: n.end_marker ? A(n.end_marker, "bottom", a) : null, markers: Array.isArray(n.markers) ? n.markers.map((T) => A(T, "top", a)) : [] };
    }
    function S(g) {
      const n = g.start !== null && g.end !== null && g.start.id === g.end.id && g.start.edge === g.end.edge && g.markers.length === 0;
      return [g.start, ...g.markers, n ? null : g.end].filter((a) => a !== null);
    }
    class f {
      constructor(n, a) {
        K(this, "listeners", /* @__PURE__ */ new Set());
        K(this, "measuredPoints", []);
        K(this, "startScrollY", 0);
        K(this, "endScrollY", 0);
        K(this, "state", null);
        K(this, "resized", (n2) => {
          var L, X;
          if (this.measuredPoints = [this.measure(n2)].flat(), this.measuredPoints.length === 0) return;
          const a2 = this.measuredPoints[0], u2 = this.measuredPoints[this.measuredPoints.length - 1], { viewportHeight: y, scrollHeight: T } = n2, I = this.range === "cover" || ((L = a2.marker) == null ? void 0 : L.edge) === "bottom" ? a2.y - y : a2.y, C = this.range !== "cover" && ((X = u2.marker) == null ? void 0 : X.edge) === "bottom" ? u2.y - y : u2.y;
          if (T > y) {
            const z = T - y;
            this.startScrollY = Math.min(I, z), this.endScrollY = Math.min(C, z);
          } else this.startScrollY = I, this.endScrollY = C;
        });
        K(this, "scrolled", (n2) => {
          if (this.measuredPoints.length === 0) return;
          const a2 = this.computeState(n2.scrollY, n2.viewportHeight);
          if (!this.state || this.state.progress !== a2.progress || !(function(u2, y) {
            for (const T in y) if (u2[T] !== y[T]) return false;
            for (const T in u2) if (!(T in y)) return false;
            return true;
          })(this.state.markers, a2.markers)) {
            this.state = a2;
            for (const u2 of this.listeners) u2(this.state);
          }
        });
        this.measure = n, this.range = (a == null ? void 0 : a.range) ?? "contain";
        const u = p.getInstance();
        u.on("resize", this.resized), u.on("scroll", this.scrolled), this.resized(u.state), this.scrolled(u.state);
      }
      static fromResolvedTrack(n) {
        if (!n) return null;
        const a = S(n);
        if (!a.some((y) => !!y.element)) return null;
        const u = a.some((y) => {
          var T;
          return ((T = y.element) == null ? void 0 : T.getAttribute("data-track-range")) === "cover";
        });
        return new f((function(y) {
          const T = S(y).map((I) => ({ y: 0, marker: I }));
          return (I) => {
            var X, z;
            const C = /* @__PURE__ */ new Map(), L = [];
            for (const ne of T) {
              const me = (X = ne.marker) == null ? void 0 : X.element;
              if (!me) continue;
              let ve = C.get(me);
              ve || (ve = me.getBoundingClientRect(), C.set(me, ve)), ne.y = (((z = ne.marker) == null ? void 0 : z.edge) === "bottom" ? ve.bottom : ve.top) + I.scrollY, L.push(ne);
            }
            return L;
          };
        })(n), { range: u ? "cover" : "contain" });
      }
      static byId(n) {
        return f.fromResolvedTrack(k(n));
      }
      static forElement(n) {
        return f.fromResolvedTrack((function(a) {
          const u = a.closest("[data-track]"), y = u == null ? void 0 : u.getAttribute("data-track");
          return y ? k(y) : null;
        })(n));
      }
      get points() {
        return this.measuredPoints;
      }
      get current() {
        return this.state;
      }
      subscribe(n) {
        return this.listeners.add(n), this.state && n(this.state), () => this.listeners.delete(n);
      }
      destroy() {
        const n = p.getInstance();
        n.off("resize", this.resized), n.off("scroll", this.scrolled), this.listeners.clear();
      }
      computeMarkerPositions(n, a) {
        var y;
        const u = {};
        for (const T of this.measuredPoints) {
          const I = (y = T.marker) == null ? void 0 : y.id;
          if (!I) continue;
          const C = a > 0 ? (n + a - T.y) / a : n >= T.y ? 1 : 0;
          u[I] = C === 0 ? 0 : C;
        }
        return u;
      }
      computeState(n, a) {
        const u = this.computeMarkerPositions(n, a);
        if (n < this.startScrollY) return { progress: 0, markers: u };
        const y = this.endScrollY - this.startScrollY;
        return n >= this.endScrollY || y <= 0 ? { progress: 1, markers: u } : { progress: (n - this.startScrollY) / y, markers: u };
      }
    }
    const v = "(prefers-reduced-motion: reduce)", _ = "(prefers-color-scheme: dark)", R = new h("ABCCanvasContext");
    class D {
      constructor(n, a, u, y, T) {
        K(this, "channels", /* @__PURE__ */ new Map());
        K(this, "catchUps", /* @__PURE__ */ new Set());
        this.host = n, this.signal = u, this.definition = y, this.callbacks = T;
        const I = $(n, y);
        this.live = pe(n, I.colorModes), this.value = { root: a, config: H(n), ...this.live, priority: n.hasAttribute("priority"), hasPoster: O(n), signal: u, channel: (C, L) => this.channel(C, L), emit: (C, L) => {
          u.aborted || T.onMessage(C, L);
        } };
      }
      diff() {
        const { colorModes: n } = $(this.host, this.definition), a = pe(this.host, n), u = (function(y, T) {
          const I = Object.keys(T).filter((L) => T[L] !== y[L]);
          if (I.length === 0) return null;
          const C = {};
          for (const L of I) C[L] = T[L];
          return C;
        })(this.live, a);
        return u ? (this.live = a, u) : null;
      }
      catchUpChannels() {
        this.catchUps.forEach((n) => n());
      }
      channel(n, a) {
        const u = typeof a == "string" ? a.trim() : "", y = u ? `${n}:${u}` : n, T = this.channels.get(y);
        if (T) return T;
        const I = this.createChannelSource(n, u), C = { get current() {
          return I.current;
        }, subscribe: (L) => {
          let X = I.current;
          const z = () => {
            const me = I.current;
            this.callbacks.isRunning() && me !== void 0 && !Object.is(me, X) && (X = me, L(me));
          }, ne = I.subscribe(() => {
            try {
              z();
            } catch (me) {
              this.callbacks.onError(me);
            }
          });
          return this.catchUps.add(z), () => {
            this.catchUps.delete(z), ne();
          };
        } };
        return this.channels.set(y, C), C;
      }
      createChannelSource(n, a) {
        if (n === "track" && a) {
          const y = this.signal.aborted ? null : f.byId(a);
          if (y) return this.signal.addEventListener("abort", () => y.destroy(), { once: true }), { get current() {
            return y.current ?? void 0;
          }, subscribe: (T) => y.subscribe(T) };
        }
        const u = a ? `${n}:${a}` : n;
        return o(this.host, u, this.signal);
      }
    }
    function O(g) {
      return !!g.querySelector(":scope > .poster");
    }
    function $(g, n) {
      const a = n == null ? void 0 : n.capabilities, { capabilitiesColorModes: u, capabilitiesPoster: y, capabilitiesReducedMotion: T, capabilitiesLowPower: I } = g.dataset;
      let C = ["light", "dark"];
      if (u) {
        const L = u.split(/[\s,]+/).filter((X) => X === "light" || X === "dark");
        L.length > 0 && (C = L);
      } else a != null && a.colorModes && a.colorModes.length > 0 && (C = a.colorModes);
      return { colorModes: C, poster: ae(y, a == null ? void 0 : a.poster, false), reducedMotion: ae(T, a == null ? void 0 : a.reducedMotion, false), lowPower: ae(I, a == null ? void 0 : a.lowPower, true) };
    }
    function H(g) {
      const n = g.querySelector(':scope > script[type="application/json"]');
      if (!(n != null && n.textContent)) return {};
      try {
        const u = JSON.parse(n.textContent);
        if (typeof (a = u) == "object" && a !== null && !Array.isArray(a)) return Object.freeze({ ...u });
        R.warn("Canvas config must be a JSON object; ignoring it.");
      } catch (u) {
        R.warn("Failed to parse canvas config JSON:", u);
      }
      var a;
      return {};
    }
    function Z() {
      const g = document.documentElement.dataset.reducedMotion;
      return g === "true" || g !== "false" && window.matchMedia(v).matches;
    }
    function ue() {
      var T, I, C, L;
      const g = document.documentElement.dataset.lowPower;
      if (g === "true") return true;
      if (g === "false") return false;
      const { connection: n, deviceMemory: a = 0, hardwareConcurrency: u = 0 } = navigator;
      if (n != null && n.saveData || (n == null ? void 0 : n.effectiveType) === "slow-2g" || (n == null ? void 0 : n.effectiveType) === "2g" || a > 0 && a <= 4 || u > 0 && u <= 4) return true;
      if (!((I = (T = window.matchMedia) == null ? void 0 : T.call(window, "(pointer: coarse) and (hover: none)")) != null && I.matches) || a > 4 && u > 4) return false;
      const y = Math.min(((C = window.screen) == null ? void 0 : C.width) || 0, ((L = window.screen) == null ? void 0 : L.height) || 0);
      return !(a === 0 && u >= 8 && y >= 768);
    }
    function pe(g, n) {
      const a = (function(u) {
        var T, I;
        const y = getComputedStyle(u).getPropertyValue("--abc-color-scheme").trim();
        return y === "light" || y === "dark" ? y : (I = (T = window.matchMedia) == null ? void 0 : T.call(window, _)) != null && I.matches ? "dark" : "light";
      })(g);
      return { colorMode: n.length > 0 && !n.includes(a) ? n[0] : a, reducedMotion: Z(), lowPower: ue() };
    }
    function ae(g, n, a) {
      return g !== void 0 ? g === "true" : n ?? a;
    }
    const fe = /* @__PURE__ */ new WeakMap(), oe = /* @__PURE__ */ new Map();
    let N = null;
    function q(g) {
      const n = oe.get(g) ?? 0;
      oe.set(g, n + 1), n > 0 || (document.adoptedStyleSheets = [...document.adoptedStyleSheets, g]);
    }
    function Q(g) {
      const n = (oe.get(g) ?? 1) - 1;
      n > 0 ? oe.set(g, n) : (oe.delete(g), document.adoptedStyleSheets = document.adoptedStyleSheets.filter((a) => a !== g));
    }
    const xe = new h("ABCCanvasScene");
    class ce extends Error {
      constructor(n) {
        super(`Canvas module at ${n} does not default-export a CanvasDefinition (missing mount()).`), this.name = "CanvasModuleError";
      }
    }
    class J {
      constructor(n, a, u) {
        K(this, "stage", document.createElement("div"));
        K(this, "controller", new AbortController());
        K(this, "resolved", null);
        K(this, "instance", null);
        K(this, "context", null);
        K(this, "releaseStyles", () => {
        });
        K(this, "running", false);
        this.source = n, this.host = a, this.callbacks = u, this.src = typeof n == "string" ? n : "", this.stage.className = "stage", a.append(this.stage);
      }
      get isMounted() {
        return this.instance !== null;
      }
      get isRunning() {
        return this.running;
      }
      async resolve() {
        const { signal: n } = this.controller, a = await (async function(u) {
          if (typeof u == "string") {
            const y = new URL(u, document.baseURI).href;
            return { definition: await (async function(I) {
              var L;
              const C = await import(I);
              if (typeof ((L = C.default) == null ? void 0 : L.mount) != "function") throw new ce(I);
              return C.default;
            })(y), url: y };
          }
          if (typeof (u == null ? void 0 : u.mount) != "function") throw new ce("<definition>");
          return { definition: u, url: document.baseURI };
        })(this.source);
        return n.throwIfAborted(), this.resolved = a, a.definition;
      }
      async mount() {
        if (!this.resolved) throw new Error("CanvasScene.mount() called before resolve().");
        const { signal: n } = this.controller, { definition: a, url: u } = this.resolved;
        n.throwIfAborted();
        const y = a.renderRoot === "light" ? this.stage : this.stage.attachShadow({ mode: "open" });
        this.releaseStyles = (function(C, L, X) {
          const z = (function(ne, me) {
            let ve = fe.get(ne);
            return ve || (ve = (ne.styles ?? []).map((Me) => {
              if (typeof Me != "string") return Me;
              const ke = new CSSStyleSheet({ baseURL: me });
              return ke.replaceSync(Me), ke;
            }), fe.set(ne, ve)), ve;
          })(L, X);
          return C instanceof ShadowRoot ? (C.adoptedStyleSheets = [...z, (N || (N = new CSSStyleSheet(), N.replaceSync(":host { position: absolute; inset: 0; }")), N)], () => {
          }) : (z.forEach(q), () => z.forEach(Q));
        })(y, a, u);
        const T = new D(this.host, y, n, a, { ...this.callbacks, isRunning: () => this.running });
        this.context = T;
        const I = await a.mount(T.value);
        return n.aborted && (F(I, false), n.throwIfAborted()), I ? (this.instance = I, true) : (this.destroy(), false);
      }
      setRunning(n) {
        var a;
        return !(!this.instance || n === this.running || (n ? this.instance.resume() : this.instance.pause(), this.running = n, n && ((a = this.context) == null || a.catchUpChannels()), 0));
      }
      updateContext() {
        var a, u;
        if (!this.instance || !this.context) return;
        const n = this.context.diff();
        n && ((u = (a = this.instance).update) == null || u.call(a, n));
      }
      destroy() {
        this.controller.abort();
        const n = this.running;
        this.running = false, F(this.instance, n), this.instance = null, this.context = null, this.releaseStyles(), this.releaseStyles = () => {
        }, this.stage.remove();
      }
    }
    function F(g, n) {
      if (g) {
        if (n) try {
          g.pause();
        } catch (a) {
          xe.error("Error pausing canvas scene before destroy:", a);
        }
        try {
          g.destroy();
        } catch (a) {
          xe.error("Error destroying canvas scene:", a);
        }
      }
    }
    const G = /* @__PURE__ */ new Map();
    function ee(g, n, a, u = 0) {
      const y = `${n}:${u}`, T = (function(I, C, L) {
        const X = G.get(I);
        if (X) return X;
        const z = /* @__PURE__ */ new Map(), ne = { observer: new IntersectionObserver((me) => {
          var ve;
          for (const Me of me) {
            const ke = Me.isIntersecting && (L <= 0 || Me.intersectionRatio >= L);
            (ve = z.get(Me.target)) == null || ve(ke);
          }
        }, { rootMargin: C, threshold: L }), callbacks: z };
        return G.set(I, ne), ne;
      })(y, n, u);
      return T.callbacks.set(g, a), T.observer.observe(g), () => {
        T.callbacks.get(g) === a && (T.callbacks.delete(g), T.observer.unobserve(g), T.callbacks.size > 0 || (T.observer.disconnect(), G.delete(y)));
      };
    }
    const be = /* @__PURE__ */ new Set(["autoplay", "hibernate", "data-poster-mode"]), we = new h("ABCCanvas");
    (V = class extends s {
      constructor() {
        super(...arguments);
        K(this, "scene", null);
        K(this, "explicitDefinition", null);
        K(this, "loadedDefinition", null);
        K(this, "failedSource", null);
        K(this, "declinedSource", null);
        K(this, "explicitPaused", null);
        K(this, "announcedPaused", true);
        K(this, "hasCurrentScenePlayed", false);
        K(this, "isNearViewport", false);
        K(this, "isInViewport", false);
        K(this, "isUpdateQueued", false);
        K(this, "unobserveViewport", []);
      }
      get src() {
        return this.getAttributeAsString("src", "");
      }
      set src(n) {
        this.setAttribute("src", n);
      }
      get definition() {
        return this.explicitDefinition ?? this.loadedDefinition;
      }
      set definition(n) {
        this.explicitDefinition !== n && (this.explicitDefinition = n, this.resetPlayback(), this.requestUpdate());
      }
      get autoplay() {
        return this.getAttributeAsBoolean("autoplay");
      }
      set autoplay(n) {
        this.toggleAttribute("autoplay", n);
      }
      get hibernate() {
        return this.getAttributeAsBoolean("hibernate");
      }
      set hibernate(n) {
        this.toggleAttribute("hibernate", n);
      }
      get priority() {
        return this.getAttributeAsBoolean("priority");
      }
      set priority(n) {
        this.toggleAttribute("priority", n);
      }
      get posterMode() {
        return this.getAttributeAsString("data-poster-mode", "eager") === "fallback" ? "fallback" : "eager";
      }
      set posterMode(n) {
        this.setAttribute("data-poster-mode", n);
      }
      get paused() {
        if (this.explicitPaused !== null) return this.explicitPaused;
        if (!this.autoplay) return true;
        const n = $(this, this.definition);
        return !(!Z() || n.reducedMotion) || !(!ue() || n.lowPower);
      }
      get state() {
        const n = this.scene;
        return n ? n.isMounted ? n.isRunning ? "running" : "ready" : "loading" : this.failedSource !== null ? "error" : "idle";
      }
      get wantedSource() {
        return this.isConnected ? this.explicitDefinition ?? this.src : "";
      }
      get shouldMountScene() {
        const n = $(this, this.definition).poster && !O(this);
        return !this.paused || n;
      }
      get isPosterHidden() {
        var n, a;
        return this.posterMode === "eager" ? !!((n = this.scene) != null && n.isMounted) : !!((a = this.scene) != null && a.isMounted && this.hasCurrentScenePlayed) || !this.paused && this.failedSource === null && this.declinedSource === null;
      }
      play() {
        this.explicitPaused = false, this.requestUpdate();
      }
      pause() {
        this.explicitPaused = true, this.requestUpdate();
      }
      load() {
        this.unload(), this.resetPlayback(), this.requestUpdate();
      }
      attributeChangedCallback(n, a, u) {
        a !== u && (n === "src" ? this.resetPlayback() : be.has(n) || (this.declinedSource = null), this.requestUpdate());
      }
      connect() {
        this.observeViewport(), this.listen(document, "visibilitychange", () => this.requestUpdate());
        const n = () => {
          this.declinedSource = null, this.requestUpdate();
        };
        for (const a of [v, _]) this.listen(window.matchMedia(a), "change", n);
        this.listen(window, "deepai:mode-change", n), this.requestUpdate();
      }
      disconnect() {
        this.unobserveViewport.forEach((n) => n()), this.unobserveViewport = [], this.requestUpdate();
      }
      requestUpdate() {
        this.isUpdateQueued || (this.isUpdateQueued = true, queueMicrotask(() => {
          this.isUpdateQueued = false, this.update();
        }));
      }
      update() {
        this.unloadStaleScene(), this.announceIntent(), this.loadWantedScene(), this.updateContext(), this.updatePlayback(), this.reflectState();
      }
      unloadStaleScene() {
        const n = this.scene;
        n && (n.source !== this.wantedSource || !this.isNearViewport && this.hibernate) && this.unload();
      }
      announceIntent() {
        const n = this.paused;
        n !== this.announcedPaused && (this.announcedPaused = n, this.emit(n ? "pause" : "play", { src: this.src }));
      }
      loadWantedScene() {
        if (this.scene) return;
        const n = this.wantedSource;
        n !== "" && n !== this.failedSource && n !== this.declinedSource && this.isNearViewport && this.shouldMountScene && this.loadScene(n);
      }
      updateContext() {
        const n = this.scene;
        if (n != null && n.isMounted) try {
          n.updateContext();
        } catch (a) {
          this.fail(n, a);
        }
      }
      updatePlayback() {
        const n = this.scene;
        if (!n) return;
        const a = n.isMounted && !this.paused && this.isInViewport && document.visibilityState === "visible";
        try {
          if (!n.setRunning(a)) return;
        } catch (u) {
          return void this.fail(n, u);
        }
        a ? (this.hasCurrentScenePlayed = true, this.emit("playing", { src: n.src })) : this.paused || this.emit("waiting", { src: n.src });
      }
      reflectState() {
        this.toggleAttribute("data-poster-hidden", this.isPosterHidden);
        const n = this.state, a = this.dataset.state;
        a !== n && (this.dataset.state = n, a && we.debug(`${a} -> ${n}`, { src: this.src, element: this }));
      }
      async loadScene(n) {
        const a = new J(n, this, { onMessage: (y, T) => this.emit("message", { src: a.src, type: y, data: T }), onError: (y) => this.fail(a, y) });
        this.scene = a, this.emit("loadstart", { src: a.src });
        let u = false;
        try {
          this.loadedDefinition = await a.resolve(), this.shouldMountScene && (u = await a.mount());
        } catch (y) {
          return void (this.scene === a && this.fail(a, y));
        }
        u ? (this.emit("load", { src: a.src }), this.requestUpdate()) : this.scene === a && (this.shouldMountScene && (this.declinedSource = a.source), this.unload(), this.requestUpdate());
      }
      fail(n, a) {
        we.error(`Canvas scene at ${n.src || "<definition>"} failed:`, a), this.failedSource = n.source, this.destroyScene(), this.emit("error", { src: n.src, error: a }), this.requestUpdate();
      }
      unload() {
        const n = this.scene;
        if (!n) return;
        const a = n.isMounted ? "unload" : "abort";
        this.destroyScene(), this.emit(a, { src: n.src });
      }
      destroyScene() {
        const n = this.scene;
        this.scene = null, this.hasCurrentScenePlayed = false, n == null || n.destroy();
      }
      resetPlayback() {
        this.loadedDefinition = null, this.explicitPaused = null, this.failedSource = null, this.declinedSource = null, this.hasCurrentScenePlayed = false;
      }
      observeViewport() {
        this.unobserveViewport = [ee(this, "100%", (n) => {
          this.isNearViewport = n, this.requestUpdate();
        }), ee(this, "0px", (n) => {
          this.isInViewport = n, this.requestUpdate();
        }, 0.15)];
      }
    }, K(V, "tagName", "abc-canvas"), K(V, "observedAttributes", ["src", "autoplay", "hibernate", "priority", "data-poster-mode", "data-capabilities-color-modes", "data-capabilities-poster", "data-capabilities-reduced-motion", "data-capabilities-low-power"]), V).register();
  })();
  var Sn = /^#(?:[\da-f]{3}){1,2}$/i;
  var jo = /^\d{4}-\d\d-\d\d$/;
  var Mn = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
  function To(e) {
    if (typeof e != "string") return null;
    const t = e.trim();
    if (!t) return null;
    const o = Date.parse(jo.test(t) ? `${t}T00:00` : t);
    return Number.isNaN(o) ? null : o;
  }
  function En(e) {
    if (typeof e != "string") return null;
    const t = Mn.exec(e.trim());
    return t ? +t[1] * 3600 + +t[2] * 60 + +(t[3] ?? 0) : null;
  }
  function Ao(e) {
    if (typeof e != "string") return null;
    const t = e.trim();
    if (!t) return null;
    try {
      const { protocol: o } = new URL(t, "https://relative.invalid");
      return /^(?:https?|blob):$/.test(o) ? t : null;
    } catch {
      return null;
    }
  }
  function kn(e, t) {
    var s;
    const o = typeof t == "string" ? t.trim() : "";
    switch (e.type) {
      case "string":
      case "text":
      case "richtext":
        return o || null;
      case "number":
      case "integer": {
        if (typeof t != "number" || !Number.isFinite(t)) return null;
        const l = e.type === "integer" ? Math.round(t) : t;
        return Math.min(e.max ?? 1 / 0, Math.max(e.min ?? -1 / 0, l));
      }
      case "boolean":
        return typeof t == "boolean" ? t : null;
      case "color":
        return Sn.test(o) ? o : null;
      case "choice":
        return (s = e.choices.find(([l]) => l === t)) == null ? void 0 : s[0];
      case "multichoice": {
        if (!Array.isArray(t)) return null;
        const l = e.choices.map(([c]) => c).filter((c) => t.includes(c));
        return l.length ? l : null;
      }
      case "date":
        return jo.test(o) && To(o) !== null ? o : null;
      case "time":
        return En(o) !== null ? o : null;
      case "datetime":
        return To(o) !== null ? o : null;
      case "url":
      case "file":
      case "document":
      case "page":
        return Ao(t);
      case "image":
      case "media": {
        const l = Ao(t == null ? void 0 : t.url);
        return l ? { ...t, url: l } : null;
      }
    }
  }
  function Tn(e, t) {
    const o = t && typeof t == "object" ? t : {}, s = {};
    for (const [l, c] of Object.entries(e)) {
      const h = kn(c, o[l]) ?? c.default ?? (c.type === "boolean" ? false : c.type === "multichoice" ? [] : null);
      s[l] = c.transform ? c.transform(h) : h;
    }
    return s;
  }
  var An = Object.freeze({ current: void 0, subscribe: () => () => {
  } });
  function Pn(e) {
    const t = e.config;
    return { ...e, mount(o) {
      return e.mount({ ...o, colorMode: o.colorMode === "dark" ? "dark" : "light", reducedMotion: !!o.reducedMotion, lowPower: !!o.lowPower, priority: !!o.priority, hasPoster: !!o.hasPoster, channel: o.channel ?? (() => An), emit: o.emit ?? (() => {
      }), config: t ? Tn(t, o.config) : o.config });
    } };
  }
  var Rn = [["tier_l", "Model Tier L"], ["tier_m", "Model Tier M"], ["tier_s", "Model Tier S"], ["tier_xs", "Model Tier XS"]];
  var Ln = [["halo", "Focal Halo (Around Centerpiece)"], ["scatter", "Wide Drift (Soft 2D Float)"], ["x_step", "Scattered X-Step (Carbon Grid)"]];
  var Cn = [["interactive", "Pointer Reactive (Tilt / Phase / Repel)"], ["orbit", "3D Drag Orbit + Pointer Reactive"], ["off", "Off (Ambient Only)"]];
  function On(e = {}) {
    return { palette: { type: "choice", label: "Brand Tonal Palette", description: "Selects the Gemini 4 tonal brand background (Model Tiers L, M, S, and XS).", choices: Rn, default: e.palette ?? "tier_l" }, gradient_motion: { type: "number", label: "Gradient Motion", description: "Volumetric diagonal wave and orbital breathing intensity (0 = static poster, 75 = studio default).", default: e.motion ?? 75, min: 0, max: 100, step: 1 }, gradient_softness: { type: "number", label: "Gradient Softness", description: "Atmospheric spread and blend radius across the volumetric Gaussian colour lobes (80 = studio default).", default: e.softness ?? 80, min: 15, max: 100, step: 1 }, gradient_bloom: { type: "number", label: "Gradient Bloom", description: "Highlight intensity of the upper-right volumetric bloom and lower-right rim lobes (20 = studio default).", default: e.bloom ?? 20, min: 0, max: 100, step: 1 }, grain: { type: "number", label: "Film Grain", description: "Screen-space 1px TPDF photographic film grain intensity (35 = studio default).", default: e.grain ?? 35, min: 0, max: 100, step: 1 }, grain_animate: { type: "boolean", label: "Animate Film Grain", description: "Adds a subtle low-framerate organic shimmer over an anchored base grain texture while playing (stays static when paused).", default: e.grainAnimate ?? false }, grain_fps: { type: "number", label: "Grain Cadence (FPS)", description: "Independent stepped frame rate for animated film grain while the main scene runs at 60/120 Hz (6\u20138 FPS = subtle tactile texture).", default: e.grainFps ?? 8, min: 1, max: 24, step: 1 } };
  }
  function In(e = {}) {
    return { focal_scale: { type: "number", label: "Focal Scale (%)", description: "Overall scale of the active centerpiece layer (40..180%).", default: e.focalScale ?? 100, min: 40, max: 180, step: 1 }, focal_offset_x: { type: "number", label: "Focal Offset X (%)", description: "Horizontal framing offset of the centerpiece (-50..50%).", default: e.focalOffsetX ?? 0, min: -50, max: 50, step: 1 }, focal_offset_y: { type: "number", label: "Focal Offset Y (%)", description: "Vertical framing offset of the centerpiece (-50..50%).", default: e.focalOffsetY ?? 0, min: -50, max: 50, step: 1 }, seed: { type: "integer", label: "Variation Seed", description: "Deterministic variation seed for backdrop grain, particle constellations, and shape geometry (1..99, 12 = reference).", default: e.seed ?? 12, min: 1, max: 99, step: 1 }, motion_speed: { type: "number", label: "Motion Speed", description: "Ambient motion speed across centerpiece and particle drift (0..100, 0 = poised still).", default: e.motionSpeed ?? 35, min: 0, max: 100, step: 1 } };
  }
  function Dn(e = {}) {
    return { interaction: { type: "choice", label: "Pointer Interaction", description: "Hover reactivity (3D tilt, surface wake & particle dodge), 360\xB0 drag orbit, or ambient-only.", choices: Cn, default: e.interaction ?? "interactive" }, interaction_effect: { type: "number", label: "Pointer Effect Intensity", description: "Scales the 3D pointer surface wake, click shockwave, and reactive particle emission (0..100).", default: e.effect ?? 65, min: 0, max: 100, step: 1 }, interaction_tilt: { type: "number", label: "Pointer Tilt", description: "Scales physical 3D tilt in response to pointer movement and tap impulses (0..100).", default: e.tilt ?? 55, min: 0, max: 100, step: 1 }, interaction_tilt_invert: { type: "boolean", label: "Invert Pointer Tilt Axes", description: "Flips horizontal and vertical 3D pointer-tilt axes (enabled: pointer left tilts right and up tilts down; disabled: tilts toward pointer).", default: e.invertTilt ?? true }, interaction_ripple: { type: "boolean", label: "Click / Tap Ripple & Pulse", description: "Emits a surface wave ripple and 3D acoustic shockwave on click or tap.", default: e.ripple ?? true } };
  }
  function Fn(e = {}) {
    return { particles: { type: "boolean", label: 'Show "4" Particles', description: 'Displays the scattered "4" glyph constellation layer.', default: e.particles ?? true }, particle_mode: { type: "choice", label: "Particle Mode", description: "Focal Halo frames the centerpiece with soft depth drift; Wide Drift floats across the stage; Scattered X-Step tiles the stage and slides along the X-axis.", choices: Ln, default: e.mode ?? "x_step" }, particle_seed: { type: "integer", label: "Particle Seed", description: 'Independent seed for the "4" particle constellation (0 = follow Variation Seed / canonical layout; 1..99 = custom variant).', default: e.seed ?? 0, min: 0, max: 99, step: 1 }, particle_density: { type: "number", label: "Particle Density", description: 'Controls the density of "4" particles across the active arrangement (10..100).', default: e.density ?? 45, min: 10, max: 100, step: 1 }, particle_opacity: { type: "number", label: "Particle Opacity (%)", description: 'Overall opacity of the "4" particle constellation (5..100%).', default: e.opacity ?? 85, min: 5, max: 100, step: 1 }, particle_reactivity: { type: "number", label: "Particle Dodge Reactivity", description: 'How strongly and quickly "4" particles dodge or repel from the cursor (0..100, 0 = off).', default: e.reactivity ?? 85, min: 0, max: 100, step: 1 }, particle_dodge_radius: { type: "number", label: "Particle Dodge Radius", description: "Cleared cursor radius in reference pixels around the pointer (20..150, default 48).", default: e.dodgeRadius ?? 48, min: 20, max: 150, step: 1 } };
  }
  var Nn = [["sway", "Sway (Holds the Pose)"], ["tumble", "Tumble (Full Rotation)"]];
  var Un = { ...On({ palette: "tier_s", motion: 77, grain: 20, grainAnimate: true, grainFps: 16 }), ...In(), ...Dn({ effect: 50, tilt: 50, invertTilt: true }), motion: { type: "choice", label: "Gel Motion", description: "Sway rocks around the composed key-art pose; Tumble turns the gel all the way round.", choices: Nn, default: "sway" }, roundness: { type: "number", label: "Roundness", description: "Blends the fitted, tapered key-art egg toward a sphere under the lumps (0..100, 0 = key-art egg).", default: 4, min: 0, max: 100, step: 1 }, gloopiness: { type: "number", label: "Gloopiness", description: "Slime: broad soft swellings sliding and breathing over the body, a wet sheen, and melted small lumps (0..100, 0 = firm gel, 50 = canonical).", default: 26, min: 0, max: 100, step: 1 }, lumpiness: { type: "number", label: "Lumpiness", description: "Lumps and surface peaks; higher adds more, finer peaks while the body stays round (0..100, 50 = canonical).", default: 14, min: 0, max: 100, step: 1 }, knobs: { type: "number", label: "Knobbliness", description: "Rounded swellings that knuckle the outline (0..100, 50 = canonical).", default: 91, min: 0, max: 100, step: 1 }, knob_size: { type: "number", label: "Knob Size (%)", description: "Size of the swellings in % (50..200%, smaller = more, finer knobs).", default: 125, min: 50, max: 200, step: 5 }, folds: { type: "number", label: "Folds", description: "Broad layered folds that arch over the body, each ending in a rolled lip (0..100, 0 = none and compiled out, 50 = canonical).", default: 50, min: 0, max: 100, step: 1 }, frost: { type: "number", label: "Frost Coverage", description: "How much of the surface is matte and frosted rather than wet and glossy (0..100).", default: 59, min: 0, max: 100, step: 1 }, stress: { type: "number", label: "Compressed Zones", description: "Cloudy, pressed regions inside the body that break up the clear ice (0..100, 0 = evenly clear).", default: 17, min: 0, max: 100, step: 1 }, refraction: { type: "number", label: "Internal Refraction", description: "Brightness of the colour-fringed fracture sheets inside the body (0..100, 0 = none).", default: 87, min: 0, max: 100, step: 1 }, milkiness: { type: "number", label: "Milkiness", description: "Cloudy white scatter inside the gel (0..100, 0 = clear, 50 = canonical).", default: 50, min: 0, max: 100, step: 1 }, iridescence: { type: "number", label: "Iridescence", description: "Pastel mint and lilac sheen in the body (0..100, 0 = none, 50 = canonical).", default: 15, min: 0, max: 100, step: 1 }, clarity: { type: "number", label: "Clarity", description: "Drifting windows where the liquid runs clear and only the membrane shows, keeping the body light; above 75 the windows run clearer still and the milk thins everywhere (0..100, 0 = milky all over).", default: 95, min: 0, max: 100, step: 1 }, deep_pockets: { type: "number", label: "Deep Pockets", description: "Long lenses of thick liquid inside the body that sink to deep blue under rolled, bright lips (0..100, 0 = none and compiled out, 50 = canonical).", default: 65, min: 0, max: 100, step: 1 }, specularity: { type: "number", label: "Specularity", description: "Strength of the studio highlights and wet sheen on the membrane; lower reads less glossy and plastic (0..100).", default: 50, min: 0, max: 100, step: 1 }, dispersion: { type: "number", label: "Dispersion", description: "How far apart the colours bend inside the body, fringing its clouds, veils and glints (0..100, 0 = none, 50 = canonical).", default: 35, min: 0, max: 100, step: 1 }, membrane_sheen: { type: "number", label: "Membrane Sheen", description: "Thin-film colour in what the outer membrane mirrors, strongest toward its edges (0..100, 0 = none).", default: 30, min: 0, max: 100, step: 1 }, morph: { type: "number", label: "Shape Morph", description: "How far the lumps and knobs slowly drift from the composed silhouette over time (0..100, 0 = holds the fitted shape).", default: 83, min: 0, max: 100, step: 1 }, inner_flow: { type: "number", label: "Inner Flow", description: "How far the liquid inside slowly drifts and folds over: its clouds and veils (0..100, 0 = still, 50 = canonical).", default: 50, min: 0, max: 100, step: 1 }, viscosity: { type: "number", label: "Viscosity", description: "How thick the liquid feels under the pointer: higher is slower, longer, softer ripples and a more damped wobble (0..100).", default: 82, min: 0, max: 100, step: 1 }, hover_ripples: { type: "number", label: "Pointer Ripples", description: "How much the membrane gives under the pointer (pressing in or swelling out) and ripples as it moves over it (0..100, 0 = none, 50 = canonical).", default: 100, min: 0, max: 100, step: 1 }, pointer_press: { type: "boolean", label: "Pointer Presses In", description: "On: the pointer presses a dent into the membrane and the displaced liquid bulges out around it. Off: the membrane swells out toward the pointer.", default: true }, click_wave: { type: "number", label: "Click Wave", description: "Strength of the wave, wobble and light pulse a click sends through the gel (0..100, 0 = none, 50 = canonical).", default: 50, min: 0, max: 100, step: 1 }, soft_focus: { type: "number", label: "Soft Focus", description: "Shallow depth of field melting the lower right into haze (0..100, 0 = sharp all over).", default: 45, min: 0, max: 100, step: 1 }, ...Fn() };
  var ft = 9;
  var Y = (e, t, o) => [e / 255, t / 255, o / 255];
  var Xe = (e) => [(e >> 16 & 255) / 255, (e >> 8 & 255) / 255, (e & 255) / 255];
  function de(e, t, o, s, l, c, h = 0.96) {
    return { color: e, center: t, radii: o, angleRad: s, cosAngle: Math.cos(s), sinAngle: Math.sin(s), weight: l, beamModulated: c, maxAlpha: h };
  }
  var Xn = { tier_l: { id: "tier_l", label: "Model Tier L", default: { softScale: 1 / 1.34, beamRange: [1, 1.22], corners: { topLeft: Y(32.1, 69, 161.1), topRight: Y(129, 217.7, 252.2), bottomLeft: Y(9.8, 36, 78), bottomRight: Y(0, 32.5, 135.9) }, lobes: [de(Y(14, 68, 162), [0.681, 0.203], [0.329, 0.349], 1.117, 0.662, true), de(Y(115.9, 206.6, 255), [0.945, 0.144], [0.388, 0.42], 0.033, 0.712, true), de(Y(0, 66.2, 252.1), [0.853, 0.693], [0.55, 0.729], -0.437, 0.334, true), de(Y(3, 34, 112), [0.308, 0.57], [0.444, 0.414], -0.062, 0.86, false), de(Y(2, 18, 62), [0.21, 0.825], [0.393, 0.619], -0.689, 0.8, false), de(Y(2, 22, 72), [0.658, 0.941], [0.491, 0.395], -0.359, 0.72, false), de(Y(83.5, 208.7, 255), [1.173, 0.898], [0.242, 0.808], 0.033, 0.96, true)], particleTint: Xe(16054783), motifCoreTint: Xe(16054783), motifGlowTint: Xe(7649535), isLightBackdrop: false } }, tier_m: { id: "tier_m", label: "Model Tier M", default: { softScale: 1 / 1.34, beamRange: [1, 1.2], corners: { topLeft: Y(53.8, 90.2, 209.3), topRight: Y(174.3, 246.4, 255), bottomLeft: Y(0, 77, 137.1), bottomRight: Y(0, 88.6, 255) }, lobes: [de(Y(21.2, 158.5, 255), [0.409, 0.022], [0.324, 0.499], 0.579, 0.96, true), de(Y(150.7, 205.5, 250.8), [0.483, -0.023], [0.451, 0.233], -0.856, 0.96, true), de(Y(209.1, 249.4, 255), [0.949, 0.25], [0.349, 0.547], -0.072, 0.897, true), de(Y(69.8, 189.2, 255), [0.618, 0.501], [0.22, 0.599], 0.103, 0.834, true), de(Y(0, 52.5, 165.6), [0.321, 0.639], [0.409, 0.318], 0.696, 0.958, false), de(Y(2, 23, 82), [0.19, 0.845], [0.291, 0.489], -0.377, 0.935, false), de(Y(0, 27, 102), [0.665, 0.939], [0.484, 0.308], -0.271, 0.934, false), de(Y(13.4, 182.2, 238.3), [-0.069, 1.128], [0.85, 0.22], 0.175, 0.801, false), de(Y(61.6, 212.7, 255), [1.055, 0.843], [0.22, 0.584], -0.047, 0.833, true)], particleTint: Xe(16777215), motifCoreTint: Xe(16777215), motifGlowTint: Xe(12903935), isLightBackdrop: false } }, tier_s: { id: "tier_s", label: "Model Tier S", default: { softScale: 1 / 1.34, beamRange: [1, 1.19], corners: { topLeft: Y(56, 148, 236), topRight: Y(206, 246, 255), bottomLeft: Y(8, 56, 146), bottomRight: Y(18, 96, 214) }, lobes: [de(Y(84, 184, 248), [0.42, 0.08], [0.42, 0.39], 0.42, 0.9, true), de(Y(224, 250, 255), [0.935, 0.195], [0.38, 0.5], -0.14, 0.9, true), de(Y(86, 186, 252), [0.665, 0.445], [0.29, 0.54], -0.18, 0.86, true), de(Y(36, 118, 218), [0.315, 0.535], [0.41, 0.35], 0.54, 0.9, false), de(Y(60, 155, 242), [0.515, 0.485], [0.33, 0.36], -0.36, 0.78, true), de(Y(7, 54, 144), [0.22, 0.855], [0.36, 0.44], -0.35, 0.92, false), de(Y(11, 62, 152), [0.64, 0.94], [0.49, 0.31], -0.25, 0.91, false), de(Y(104, 216, 255), [1.06, 0.82], [0.24, 0.56], -0.06, 0.84, true)], particleTint: Xe(16777215), motifCoreTint: Xe(16777215), motifGlowTint: Xe(14217471), isLightBackdrop: false } }, tier_xs: { id: "tier_xs", label: "Model Tier XS", default: { softScale: 1 / 1.34, beamRange: [1, 1.18], corners: { topLeft: Y(118, 198, 252), topRight: Y(246, 253, 255), bottomLeft: Y(42, 124, 206), bottomRight: Y(96, 184, 246) }, lobes: [de(Y(176, 232, 255), [0.49, 0.09], [0.46, 0.34], -0.28, 0.92, true), de(Y(250.5, 253.5, 255), [0.895, 0.185], [0.44, 0.45], -0.38, 0.92, true), de(Y(232, 248, 255), [0.695, 0.335], [0.38, 0.3], -0.44, 0.85, true), de(Y(148, 212, 253.5), [0.535, 0.515], [0.45, 0.28], -0.37, 0.88, true), de(Y(96, 186, 252), [0.31, 0.495], [0.39, 0.32], 0.26, 0.88, false), de(Y(44, 126, 208), [0.225, 0.875], [0.39, 0.38], -0.34, 0.9, false), de(Y(56, 142, 218), [0.585, 0.945], [0.48, 0.27], -0.24, 0.86, false), de(Y(168, 228, 255), [1.02, 0.76], [0.32, 0.48], -0.42, 0.88, true)], particleTint: Xe(2121936), motifCoreTint: Xe(16777215), motifGlowTint: Xe(7647999), isLightBackdrop: true } } };
  function Zt(e, t, o = Xn) {
    const s = o[e] ?? o.tier_l;
    return t === "dark" && s.dark ? s.dark : s.default;
  }
  function Ut(e, t, o, s) {
    const l = e.createShader(e.VERTEX_SHADER), c = e.createShader(e.FRAGMENT_SHADER), h = e.createProgram();
    return !l || !c || !h ? (l && e.deleteShader(l), c && e.deleteShader(c), h && e.deleteProgram(h), null) : (e.shaderSource(l, o), e.compileShader(l), e.shaderSource(c, s), e.compileShader(c), e.attachShader(h, l), e.attachShader(h, c), e.linkProgram(h), e.getProgramParameter(h, e.LINK_STATUS) ? (e.deleteShader(l), e.deleteShader(c), h) : (console.warn(`[${t}] Shader link failed:`, e.getProgramInfoLog(h), e.getShaderInfoLog(l), e.getShaderInfoLog(c)), e.deleteShader(l), e.deleteShader(c), e.deleteProgram(h), null));
  }
  var co = `#version 300 es
out vec2 v_uv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  v_uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;
  function zn(e, t, o = 1.5, s = 16e5) {
    const l = Math.max(1, e), c = Math.max(1, t), h = typeof window < "u" && window.devicePixelRatio || 1, i = Math.min(h, o), b = l * i * (c * i), p = b > s ? Math.sqrt(s / b) : 1, w = i * p;
    return { width: Math.max(1, Math.round(l * w)), height: Math.max(1, Math.round(c * w)), dpr: w };
  }
  function Bn(e) {
    const t = { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "default", preserveDrawingBuffer: false, ...e.contextAttributes };
    let o = null, s = null, l = null, c = false;
    const h = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Map();
    let p = null;
    const w = () => {
      if (!o || i.size === 0) return;
      let d = 1, M = 1;
      for (const A of i) A.width > d && (d = A.width), A.height > M && (M = A.height);
      (o.width > d || o.height > M) && (o.width = d, o.height = M);
    }, m = { acquirePlugin(d, M, A) {
      if (!s || c) return null;
      const k = b.get(d);
      if (k) return k.instance === null && (k.instance = k.create(s)), k.instance;
      const S = M(s);
      return S ? (b.set(d, { instance: S, create: M, dispose: A }), S) : null;
    } }, x = () => {
      if (s) return true;
      o = document.createElement("canvas"), o.width = 1, o.height = 1;
      const d = o.getContext("webgl2", t);
      if (!d) return console.warn(`[${e.id}] WebGL2 is not available.`), o.width = 0, o.height = 0, o = null, false;
      s = d, c = false, p == null || p.abort(), p = new AbortController();
      const { signal: M } = p;
      return o.addEventListener("webglcontextlost", (A) => {
        A.preventDefault(), c = true, l = null;
        for (const k of b.values()) k.instance = null;
      }, { signal: M }), o.addEventListener("webglcontextrestored", () => {
        if (s && (c = false, l = e.setup(s), !!l)) {
          for (const A of b.values()) A.instance = A.create(s);
          for (const A of h) A();
        }
      }, { signal: M }), l = e.setup(s), l ? true : (E(), false);
    }, E = () => {
      var d, M, A;
      if (p == null || p.abort(), p = null, s) {
        if (!c) {
          for (const k of b.values()) k.instance !== null && ((d = k.dispose) == null || d.call(k, s, k.instance), k.instance = null);
          l && ((M = e.dispose) == null || M.call(e, s, l));
        }
        s.isContextLost() || (A = s.getExtension("WEBGL_lose_context")) == null || A.loseContext();
      }
      b.clear(), o && (o.width = 0, o.height = 0), s = null, o = null, l = null, c = false;
    };
    return { mount(d, M) {
      const A = d.getContext("2d", { alpha: !!t.alpha });
      if (!A) return console.warn(`[${e.id}] Canvas 2D context is not available.`), null;
      if (!x()) return null;
      const k = M ?? (() => {
      });
      h.add(k), i.add(d);
      let S = false;
      return { render(f) {
        if (S || c || !s || !o || !l) return;
        if (s.isContextLost()) {
          c = true;
          return;
        }
        const v = d.width, _ = d.height;
        if (v < 1 || _ < 1) return;
        (o.width < v || o.height < _) && (o.width = Math.max(o.width, v), o.height = Math.max(o.height, _)), s.disable(s.SCISSOR_TEST), s.viewport(0, 0, v, _), f(s, l, m, v, _), s.disable(s.SCISSOR_TEST), t.alpha && A.clearRect(0, 0, v, _);
        const R = o.height - _;
        A.drawImage(o, 0, R, v, _, 0, 0, v, _);
      }, trim() {
        S || w();
      }, destroy() {
        S || (S = true, h.delete(k), i.delete(d), h.size === 0 ? E() : w());
      } };
    } };
  }
  var Zo = `
uniform vec2 u_bgViewScale;              // 16:9 cover camera scale
uniform vec2 u_bgPreOffset;              // flowOffset - shift * 0.55
uniform vec3 u_bgRotZoom;                // x = cos(rot), y = sin(rot), z = 1.0 / zoom
uniform vec2 u_bgPostCenter;             // vec2(0.5) - focusShift
uniform vec4 u_bgWave;                   // x = phaseRad, y = rayAmp, z = crossAmp, w = stageAspect
uniform vec4 u_bgTap;                    // xy = tap screenUv (top-left), z = tapAgeSec, w = tapStrength
uniform vec3 u_bgCorners[4];             // 0: topLeft, 1: topRight, 2: bottomLeft, 3: bottomRight
uniform int u_bgLobeCount;
uniform vec3 u_bgLobeColors[9];
uniform vec4 u_bgLobeCentersInvRadii[9]; // xy = center, zw = sqrt(2.0) / (radii * effSoft)
uniform vec2 u_bgLobeCosSin[9];          // x = cos(angle), y = sin(angle)
uniform vec2 u_bgLobeParams[9];          // x = effectiveGain, y = maxAlpha

float bgRotBellSq(vec2 p, vec2 c, vec2 invRSqrt2, vec2 cs) {
  vec2 d = p - c;
  vec2 q = vec2(cs.x * d.x + cs.y * d.y, -cs.y * d.x + cs.x * d.y) * invRSqrt2;
  return dot(q, q);
}

vec3 sampleTonalGradient(vec2 screenUv, vec2 ptrOffset) {
  vec2 p = (screenUv - 0.5) * u_bgViewScale + 0.5;
  float tapCrest = 0.0;

  if (u_bgTap.w > 0.001 && u_bgTap.z < 3.8) {
    vec2 fromTapIso = vec2((screenUv.x - u_bgTap.x) * u_bgWave.w, screenUv.y - u_bgTap.y);
    float dTap = length(fromTapIso);
    float onset = smoothstep(0.0, 0.03, u_bgTap.z);
    float damp = exp(-u_bgTap.z * 2.4) * onset * u_bgTap.w;
    float wave = sin(dTap * 35.0 - u_bgTap.z * 7.0) * damp;
    vec2 tapScene = (u_bgTap.xy - 0.5) * u_bgViewScale + 0.5;
    p += normalize(p - tapScene + vec2(0.00001)) * (wave * 0.0028);
    // Subtle traveling caustic packet keeps the wave perceptible across deep nocturnal basins
    float front = 0.02 + 0.68 * (1.0 - exp(-u_bgTap.z * 1.45));
    float pktQ = (dTap - front) / (0.16 + u_bgTap.z * 0.08);
    float packet = exp(-pktQ * pktQ);
    tapCrest = wave * packet * 0.016;
  }

  p += vec2(ptrOffset.x, -ptrOffset.y) * u_bgViewScale * 0.018 + u_bgPreOffset;
  mat2 rotM = mat2(u_bgRotZoom.x, -u_bgRotZoom.y, u_bgRotZoom.y, u_bgRotZoom.x);
  vec2 pSky = rotM * (p - 0.5) * u_bgRotZoom.z + u_bgPostCenter;

  float diagCoord = pSky.x * 0.78 + pSky.y * 0.62;
  float rayDrift = sin(u_bgWave.x + diagCoord * 2.6) * u_bgWave.y;
  vec2 pWave = pSky + vec2(rayDrift, -rayDrift * 0.75);
  if (u_bgWave.z > 0.00001) {
    float crossCoord = pSky.x * 0.62 - pSky.y * 0.78;
    float crossDrift = cos(u_bgWave.x * 2.0 - crossCoord * 3.1) * u_bgWave.z;
    pWave += vec2(crossDrift, crossDrift * 0.65);
  }

  // 1. 4-corner bilinear atmospheric base canvas
  float pxClamped = clamp(pWave.x, 0.0, 1.0);
  vec3 topRow = mix(u_bgCorners[0], u_bgCorners[1], pxClamped);
  vec3 botRow = mix(u_bgCorners[2], u_bgCorners[3], pxClamped);
  vec3 col = mix(topRow, botRow, clamp(pWave.y, 0.0, 1.0));

  // 2. Multi-lobe rotated Gaussian volumetric colour field
  for (int i = 0; i < 9; i++) {
    if (i >= u_bgLobeCount) break;
    vec4 cr = u_bgLobeCentersInvRadii[i];
    float q2 = bgRotBellSq(pWave, cr.xy, cr.zw, u_bgLobeCosSin[i]);
    if (q2 > 9.2) continue;
    vec2 pr = u_bgLobeParams[i];
    float lobeAlpha = min(exp(-q2) * pr.x, pr.y);
    col = mix(col, u_bgLobeColors[i], lobeAlpha);
  }

  if (tapCrest != 0.0) {
    vec3 waveTint = mix(u_bgCorners[1], vec3(0.72, 0.92, 1.0), 0.35);
    col = clamp(col + (waveTint - col * 0.35) * tapCrest, 0.0, 1.0);
  }
  return col;
}
`;
  var Xt = 512;
  var Lt = 15;
  var qn = Math.SQRT2;
  var lo = 0.5;
  var uo = 0.26;
  var Qo = 0.75;
  var Jo = 0.68;
  var en = Qo - lo;
  var tn = Jo - uo;
  var Yn = Math.atan2(tn, en);
  var Gn = Math.hypot(en, tn);
  var Qt = null;
  function Hn() {
    if (Qt) return Qt;
    const e = Xt * Xt, t = new Uint8Array(e * 2);
    let o = 1831565813;
    const s = () => {
      o = o + 2654435769 | 0;
      let l = o;
      return l = Math.imul(l ^ l >>> 16, 569420461), l = Math.imul(l ^ l >>> 15, 1935289751), (l ^ l >>> 15) >>> 24 & 255;
    };
    for (let l = 0; l < e; l++) t[l * 2] = s(), t[l * 2 + 1] = s(), s();
    return Qt = t, t;
  }
  var Wn = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform vec2 u_res;
uniform vec2 u_pointer;
uniform float u_grain;
uniform vec4 u_grainOffset;
uniform vec2 u_grainOffsetNext;
uniform vec3 u_grainWeights;
uniform sampler2D u_noiseMap;

${Zo}

float smooth01(float a, float b, float x) {
  float t = clamp((x - a) / (b - a), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

void main() {
  vec2 screenUv = vec2(v_uv.x, 1.0 - v_uv.y);
  vec2 ptrOffset = u_pointer - 0.5;

  vec3 col = sampleTonalGradient(screenUv, ptrOffset);

  // Sub-bit TPDF Interleaved Gradient Noise dither eliminates 8-bit Mach banding
  float ign1 = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  float ign2 = fract(52.9829189 * fract(dot(gl_FragCoord.xy + vec2(17.3, 31.7), vec2(0.06711056, 0.00583715))));
  vec3 dither = vec3(
    ign1 - ign2,
    (ign2 - 0.5) + (ign1 - 0.5),
    fract(ign1 + 0.37) - fract(ign2 + 0.73)
  ) * (1.35 / 255.0);

  // Screen-space pixel-locked TPDF film grain with prime tile-ID decorrelation
  if (u_grain > 0.001) {
    float pxScale = max(1.0, max(u_res.x, u_res.y) / 2560.0);
    vec2 grainPx = floor(gl_FragCoord.xy / pxScale);
    vec2 tileId = floor(grainPx / 512.0);
    vec2 tileShift = floor(vec2(tileId.x * 173.0 + tileId.y * 311.0, tileId.x * 257.0 - tileId.y * 139.0));
    vec2 noiseUV1 = (grainPx + u_grainOffset.xy + 0.5) / 512.0;
    vec2 noiseUV2 = (grainPx + u_grainOffset.zw + tileShift + 0.5) / 512.0;
    float n1 = texture(u_noiseMap, noiseUV1).r - 0.5;
    float n2 = texture(u_noiseMap, noiseUV2).g - 0.5;
    float grainSignal = n1 * u_grainWeights.x + n2 * u_grainWeights.y;
    if (u_grainWeights.z > 0.0001) {
      vec2 noiseUV3 = (grainPx + u_grainOffsetNext + tileShift + 0.5) / 512.0;
      float n3 = texture(u_noiseMap, noiseUV3).g - 0.5;
      grainSignal += n3 * u_grainWeights.z;
    }
    float grainAmp = u_grain * 0.24; // grain = 35 (0.35) -> 0.084 (= 35 * 0.0024 in Studio)
    float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
    float lumShift = -0.30 * smooth01(0.92, 0.995, lum) + 0.30 * smooth01(0.08, 0.005, lum);
    col = clamp(col + vec3((grainSignal + lumShift) * grainAmp), 0.0, 1.0);
  }

  outColor = vec4(clamp(col + dither, 0.0, 1.0), 1.0);
}
`;
  var Po = /* @__PURE__ */ new WeakMap();
  var vt = new Float32Array(ft * 4);
  var Jt = new Float32Array(ft * 2);
  function Kn(e) {
    const t = Po.get(e);
    if (t) return t;
    const o = new Float32Array(12), { topLeft: s, topRight: l, bottomLeft: c, bottomRight: h } = e.corners;
    o[0] = s[0], o[1] = s[1], o[2] = s[2], o[3] = l[0], o[4] = l[1], o[5] = l[2], o[6] = c[0], o[7] = c[1], o[8] = c[2], o[9] = h[0], o[10] = h[1], o[11] = h[2];
    const i = Math.min(ft, e.lobes.length), b = new Float32Array(ft * 3), p = new Float32Array(ft * 2);
    for (let m = 0; m < i; m++) {
      const x = e.lobes[m];
      b[m * 3] = x.color[0], b[m * 3 + 1] = x.color[1], b[m * 3 + 2] = x.color[2], p[m * 2] = x.cosAngle, p[m * 2 + 1] = x.sinAngle;
    }
    const w = { lobeCount: i, corners: o, lobeColors: b, lobeCosSin: p };
    return Po.set(e, w), w;
  }
  function on(e, t) {
    return { uBgViewScale: e.getUniformLocation(t, "u_bgViewScale"), uBgPreOffset: e.getUniformLocation(t, "u_bgPreOffset"), uBgRotZoom: e.getUniformLocation(t, "u_bgRotZoom"), uBgPostCenter: e.getUniformLocation(t, "u_bgPostCenter"), uBgWave: e.getUniformLocation(t, "u_bgWave"), uBgTap: e.getUniformLocation(t, "u_bgTap"), uBgCorners: e.getUniformLocation(t, "u_bgCorners[0]"), uBgLobeCount: e.getUniformLocation(t, "u_bgLobeCount"), uBgLobeColors: e.getUniformLocation(t, "u_bgLobeColors[0]"), uBgLobeCentersInvRadii: e.getUniformLocation(t, "u_bgLobeCentersInvRadii[0]"), uBgLobeCosSin: e.getUniformLocation(t, "u_bgLobeCosSin[0]"), uBgLobeParams: e.getUniformLocation(t, "u_bgLobeParams[0]"), lastSpec: null, lastEffSoft: -1, lastEffBeam: -1 };
  }
  function Ct(e) {
    const t = Math.sin(e * 127.1 + 311.7) * 43758.5453;
    return t - Math.floor(t);
  }
  var Vn = { shiftX: 0, shiftY: 0, rotCos: 1, rotSin: 0, zoom: 1, invZoom: 1 };
  var eo = /* @__PURE__ */ new Map();
  function $n(e) {
    const t = e | 0;
    if (!t || t === 12) return Vn;
    const o = eo.get(t);
    if (o) return o;
    const s = Ct(t * 1.13 + 0.7) - 0.5, l = Ct(t * 2.41 + 1.9) - 0.5, c = Ct(t * 3.89 + 4.3) - 0.5, h = Ct(t * 5.17 + 7.1) - 0.5, i = Math.max(0.24, Math.min(0.76, lo + s * 0.16)), b = Math.max(0.16, Math.min(0.46, uo + l * 0.12)), p = Math.max(0.42, Math.min(0.88, Qo + c * 0.16)), w = Math.max(0.44, Math.min(0.84, Jo + h * 0.14)), m = p - i, x = w - b, E = Math.atan2(x, m) - Yn, d = Math.max(0.82, 1 + (Math.hypot(m, x) - Gn) * 0.22), M = { shiftX: (i - lo) * 0.44, shiftY: (b - uo) * 0.44, rotCos: Math.cos(E), rotSin: Math.sin(E), zoom: d, invZoom: 1 / d };
    return eo.size < 128 && eo.set(t, M), M;
  }
  function Ro(e, t, o, s, l, c, h, i) {
    const b = t / Math.max(1, o), p = b / (16 / 9), w = p < 1 ? p : 1, m = p < 1 ? 1 : 1 / p, { shiftX: x, shiftY: E, rotCos: d, rotSin: M, zoom: A, invZoom: k } = $n(c), S = (h == null ? void 0 : h.softness) ?? 80, f = S <= 80 ? 0.76 + (1.34 - 0.76) * Math.max(0, (S - 15) / 65) : 1.34 + 0.24 * Math.min(1, (S - 80) / 20), v = Math.max(0.35, f * e.softScale), _ = (h == null ? void 0 : h.bloom) ?? 20, [R, D] = e.beamRange, O = _ < 20 ? R * (0.82 + 0.18 * Math.max(0, _ / 20)) : R + (D - R) * Math.min(1, (_ - 20) / 80), H = (s % Lt + Lt) % Lt / Lt * Math.PI * 2, Z = Math.max(0, l) * 100, ue = Math.max(0, Z - 75), pe = Z + ue * 1.65, ae = pe * 32e-5, fe = ae > 0 ? (Math.sin(H) * 1.15 + 0.35 * Math.cos(H * 2)) * ae : 0, oe = ae > 0 ? (Math.cos(H) * 0.95 - 0.3 * Math.sin(H * 2)) * ae : 0, N = pe * 45e-5, q = ue * 55e-5, Q = Math.max(0, Math.min(1, (h == null ? void 0 : h.focusAmount) ?? 0));
    let xe = 0, ce = 0;
    if (Q > 1e-4) {
      const F = (((h == null ? void 0 : h.focusX) ?? 0.5) - 0.5) * w + 0.5, G = (((h == null ? void 0 : h.focusY) ?? 0.5) - 0.5) * m + 0.5;
      xe = (F - 0.5) * Q * 0.026, ce = (G - 0.5) * Q * 0.026;
    }
    const J = h == null ? void 0 : h.tap;
    return i ? (i.spec = e, i.viewScaleX = w, i.viewScaleY = m, i.shiftX = x, i.shiftY = E, i.flowOffsetX = fe, i.flowOffsetY = oe, i.rotCos = d, i.rotSin = M, i.zoom = A, i.invZoom = k, i.focusShiftX = xe, i.focusShiftY = ce, i.phaseRad = H, i.rayAmp = N, i.crossAmp = q, i.effSoft = v, i.effBeam = O, i.stageAspect = b, i.tapX = J ? J.x : 0.5, i.tapY = J ? J.y : 0.5, i.tapAge = J ? J.age : 10, i.tapStrength = J ? J.strength : 0, i) : { spec: e, viewScaleX: w, viewScaleY: m, shiftX: x, shiftY: E, flowOffsetX: fe, flowOffsetY: oe, rotCos: d, rotSin: M, zoom: A, invZoom: k, focusShiftX: xe, focusShiftY: ce, phaseRad: H, rayAmp: N, crossAmp: q, effSoft: v, effBeam: O, stageAspect: b, tapX: J ? J.x : 0.5, tapY: J ? J.y : 0.5, tapAge: J ? J.age : 10, tapStrength: J ? J.strength : 0 };
  }
  function nn(e, t, o) {
    const { spec: s } = o;
    e.uniform2f(t.uBgViewScale, o.viewScaleX, o.viewScaleY), e.uniform2f(t.uBgPreOffset, o.flowOffsetX - o.shiftX, o.flowOffsetY - o.shiftY), e.uniform3f(t.uBgRotZoom, o.rotCos, o.rotSin, o.invZoom), e.uniform2f(t.uBgPostCenter, 0.5 - o.focusShiftX, 0.5 - o.focusShiftY), e.uniform4f(t.uBgWave, o.phaseRad, o.rayAmp, o.crossAmp, o.stageAspect), e.uniform4f(t.uBgTap, o.tapX, o.tapY, o.tapAge, o.tapStrength);
    const l = t.lastSpec !== s;
    if (l) {
      const c = Kn(s);
      e.uniform3fv(t.uBgCorners, c.corners), e.uniform1i(t.uBgLobeCount, c.lobeCount), e.uniform3fv(t.uBgLobeColors, c.lobeColors), e.uniform2fv(t.uBgLobeCosSin, c.lobeCosSin), t.lastSpec = s;
    }
    if (l || Math.abs(t.lastEffSoft - o.effSoft) > 1e-6 || Math.abs(t.lastEffBeam - o.effBeam) > 1e-6) {
      const c = Math.min(ft, s.lobes.length), h = qn / o.effSoft;
      for (let i = 0; i < c; i++) {
        const b = s.lobes[i], p = i * 4;
        vt[p] = b.center[0], vt[p + 1] = b.center[1], vt[p + 2] = h / Math.max(0.05, b.radii[0]), vt[p + 3] = h / Math.max(0.05, b.radii[1]);
        const w = i * 2;
        Jt[w] = b.weight * (b.beamModulated ? o.effBeam : 1), Jt[w + 1] = b.maxAlpha;
      }
      e.uniform4fv(t.uBgLobeCentersInvRadii, vt), e.uniform2fv(t.uBgLobeParams, Jt), t.lastEffSoft = o.effSoft, t.lastEffBeam = o.effBeam;
    }
  }
  function jn(e) {
    const t = Ut(e, "gemini-4-core:gradient", co, Wn);
    if (!t) return null;
    const o = e.createTexture();
    if (!o) return e.deleteProgram(t), null;
    e.bindTexture(e.TEXTURE_2D, o), e.pixelStorei(e.UNPACK_ALIGNMENT, 1), e.texImage2D(e.TEXTURE_2D, 0, e.RG8, Xt, Xt, 0, e.RG, e.UNSIGNED_BYTE, Hn()), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.REPEAT), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.REPEAT), e.bindTexture(e.TEXTURE_2D, null);
    const s = e.getUniformLocation(t, "u_noiseMap");
    return e.useProgram(t), e.uniform1i(s, 0), e.useProgram(null), { program: t, noiseTex: o, bgLocs: on(e, t), uRes: e.getUniformLocation(t, "u_res"), uPointer: e.getUniformLocation(t, "u_pointer"), uGrain: e.getUniformLocation(t, "u_grain"), uGrainOffset: e.getUniformLocation(t, "u_grainOffset"), uGrainOffsetNext: e.getUniformLocation(t, "u_grainOffsetNext"), uGrainWeights: e.getUniformLocation(t, "u_grainWeights"), uNoiseMap: s };
  }
  function Lo(e, t) {
    e.deleteTexture(t.noiseTex), e.deleteProgram(t.program);
  }
  var zt = 0.76;
  var Co = Math.sqrt(2 * 0.65 * 0.65 - zt * zt);
  var Zn = { ox1: 0, oy1: 0, ox2: 0, oy2: 0, nextOx2: 0, nextOy2: 0, wBase: 0.65, wCurr: 0.65, wNext: 0 };
  function Oo(e, t, o) {
    if (t === 0) return o;
    let s = (Math.imul(t + 4099, 3266489909) ^ Math.imul((e | 0) ^ 668265263, 374761393)) >>> 0;
    return s = Math.imul(s ^ s >>> 16, 569420461) >>> 0, o + (s & 511) & 511;
  }
  function Io(e, t, o) {
    if (t === 0) return o;
    let s = (Math.imul(t + 4099, 3266489909) ^ Math.imul((e | 0) ^ 668265263, 374761393)) >>> 0;
    return s = Math.imul(s ^ s >>> 16, 569420461) >>> 0, o + (s >>> 10 & 511) & 511;
  }
  function Qn(e, t = 0, o = false, s = 8, l = 120, c) {
    const h = !e || e === 12, i = h ? 0 : e * 37 & 511, b = h ? 0 : e * 91 & 511, p = h ? 0 : e * 173 + 29 & 511, w = h ? 0 : e * 251 + 113 & 511;
    if (!o) return c ? (c.ox1 = i, c.oy1 = b, c.ox2 = p, c.oy2 = w, c.nextOx2 = p, c.nextOy2 = w, c.wBase = 0.65, c.wCurr = 0.65, c.wNext = 0, c) : { ox1: i, oy1: b, ox2: p, oy2: w, nextOx2: p, nextOy2: w, wBase: 0.65, wCurr: 0.65, wNext: 0 };
    const m = Math.max(1, Math.min(24, Math.round(s))), x = Math.max(0.1, l), E = Math.max(1, Math.round(m * x)), M = (t % x + x) % x / x * E, A = Math.floor(M), k = A % E, S = (k + 1) % E, f = M - A, v = Oo(e, k, p), _ = Io(e, k, w), R = Oo(e, S, p), D = Io(e, S, w), O = Math.max(0, Math.min(1, (f - 0.45) / 0.55)), $ = O * O * (3 - 2 * O), H = 1 / Math.sqrt(Math.max(0.5, 1 - 2 * $ * (1 - $))), Z = Co * (1 - $) * H, ue = Co * $ * H;
    return c ? (c.ox1 = i, c.oy1 = b, c.ox2 = v, c.oy2 = _, c.nextOx2 = R, c.nextOy2 = D, c.wBase = zt, c.wCurr = Z, c.wNext = ue, c) : { ox1: i, oy1: b, ox2: v, oy2: _, nextOx2: R, nextOy2: D, wBase: zt, wCurr: Z, wNext: ue };
  }
  function Do(e, t, o, s, l, c, h, i, b, p, w = 0, m = false, x = 8, E = 120) {
    e.disable(e.BLEND), e.useProgram(t.program), e.bindVertexArray(o), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, t.noiseTex), nn(e, t.bgLocs, c), e.uniform2f(t.uRes, s, l), e.uniform2f(t.uPointer, h, i), e.uniform1f(t.uGrain, b);
    const d = Qn(p, w, m, x, E, Zn);
    e.uniform4f(t.uGrainOffset, d.ox1, d.oy1, d.ox2, d.oy2), e.uniform2f(t.uGrainOffsetNext, d.nextOx2, d.nextOy2), e.uniform3f(t.uGrainWeights, d.wBase, d.wCurr, d.wNext), e.drawArrays(e.TRIANGLES, 0, 3);
  }
  function Yt(e) {
    let t = (Math.imul(e | 0, 2654435769) ^ 1831565813) >>> 0;
    return () => {
      t = t + 1831565749 >>> 0;
      let o = t;
      return o = Math.imul(o ^ o >>> 15, o | 1), o ^= o + Math.imul(o ^ o >>> 7, o | 61), ((o ^ o >>> 14) >>> 0) / 4294967296;
    };
  }
  var ho = 64;
  var to = null;
  function Ot(e, t, o, s, l, c) {
    const h = Math.abs(e - o) - l, i = Math.abs(t - s) - c, b = Math.max(h, 0), p = Math.max(i, 0);
    return Math.hypot(b, p) + Math.min(Math.max(h, i), 0);
  }
  function Jn(e, t, o, s, l, c) {
    const h = e - o, i = t - s, b = l - o, p = c - s, w = Math.max(0, Math.min(1, (h * b + i * p) / (b * b + p * p)));
    return Math.hypot(h - b * w, i - p * w);
  }
  function es(e, t) {
    const o = Ot(e, t, 0.088, 0, 0.044, 0.355), s = Ot(e, t, -5e-3, 0.125, 0.245, 0.041), l = Ot(e, t, 0.056, -0.314, 0.076, 0.041), c = Ot(e, t, -0.206, 0.095, 0.044, 0.071), h = Jn(e, t, 0.048, -0.318, -0.208, 0.092) - 0.043, i = Math.max(-0.355 - t, t - 0.166, -0.25 - e, e - 0.132), b = Math.max(h, i);
    return Math.min(o, s, l, c, b);
  }
  function ts() {
    if (to) return to;
    const e = ho, t = new Uint8Array(e * e), o = 0.22;
    for (let s = 0; s < e; s++) {
      const l = (s + 0.5) / e - 0.5;
      for (let c = 0; c < e; c++) {
        const h = (c + 0.5) / e - 0.5, i = es(h, l), b = Math.max(0, Math.min(1, 0.5 - i / (o * 2)));
        t[s * e + c] = Math.round(b * 255);
      }
    }
    return to = t, t;
  }
  var wt = 600;
  var Ne = 608;
  var st = 10.484 * (Ne / 836);
  var Ze = 0.75 * st;
  var os = 1;
  var ns = 0.95 * st;
  var ss = 0.382;
  var gt = 1280;
  var _t = new Uint16Array([252, 42, 574, 44, 536, 46, 1183, 56, 861, 57, 895, 62, 932, 66, 609, 68, 1148, 72, 285, 76, 38, 91, 322, 114, 216, 129, 1114, 148, 502, 153, 824, 153, 968, 163, 178, 165, 789, 171, 396, 173, 364, 189, 643, 192, 680, 253, 144, 279, 756, 283, 466, 305, 74, 310, 1072, 317, 431, 361, 755, 368, 1038, 385, 1002, 397, 1035, 426, 722, 468, 108, 498, 397, 505, 1002, 559, 713, 581, 73, 611, 112, 617, 317, 617, 432, 640, 37, 699, 1112, 701, 1074, 708, 677, 709, 966, 723, 40, 776, 355, 780, 356, 811, 469, 859, 71, 862, 645, 861, 675, 863, 932, 883, 791, 887, 389, 931, 319, 949, 607, 955, 107, 999, 713, 999, 894, 1039, 827, 1051, 1148, 1051, 429, 1054, 1034, 1058, 574, 1071, 287, 1072, 1182, 1075, 747, 1103, 145, 1107, 249, 1123, 861, 1139, 1071, 1141, 1186, 1145, 465, 1146, 535, 1157, 1146, 1160, 787, 1161, 177, 1163, 215, 1167, 824, 1167, 503, 1173, 1105, 1173]);
  var It = _t.length >> 1;
  function as(e, t) {
    const o = Math.max(10, Math.min(100, t)), s = o <= 45 ? 15 + (o - 10) / 35 * 30 : 45 + (o - 45) / 55 * 115, l = Math.max(6, Math.round(It * (s / 100)));
    if (e === 0 && l <= It) {
      const x = new Float32Array(l * 2), E = 53;
      for (let d = 0; d < l; d++) {
        const M = d * E % It * 2;
        x[d * 2] = _t[M] * 0.5, x[d * 2 + 1] = _t[M + 1] * 0.5;
      }
      return x;
    }
    const c = [];
    if (e === 0) for (let x = 0; x < It; x++) c.push(_t[x * 2] * 0.5, _t[x * 2 + 1] * 0.5);
    const h = Yt(e === 0 ? 2654435769 : e * 2654435761 >>> 0), i = 12, b = new Float32Array(i * 4);
    for (let x = 0; x < i; x++) b[x * 4] = 28 + h() * (wt - 56), b[x * 4 + 1] = 28 + h() * (Ne - 56), b[x * 4 + 2] = 22 + h() * 54, b[x * 4 + 3] = 18 + h() * 44;
    const p = l - (c.length >> 1), w = Math.max(0, p) * 45 + 200;
    let m = 0;
    for (; c.length >> 1 < l && m < w; ) {
      m++;
      let x, E;
      if (h() < 0.72) {
        const S = Math.floor(h() * i) * 4;
        x = b[S] + (h() + h() - 1) * b[S + 2], E = b[S + 1] + (h() + h() - 1) * b[S + 3];
      } else x = 18 + h() * (wt - 36), E = 20 + h() * (Ne - 40);
      x = Math.round(Math.max(16, Math.min(wt - 10, x)) * 2) * 0.5, E = Math.round(Math.max(18, Math.min(Ne - 18, E)) * 2) * 0.5;
      const d = m > p * 20 ? 0.65 : 1, M = 15.5 * d, A = 8.2 * d;
      let k = false;
      for (let S = 0; S < c.length; S += 2) if (Math.abs(c[S + 1] - E) < A && Math.abs(c[S] - x) < M) {
        k = true;
        break;
      }
      k || c.push(x, E);
    }
    return new Float32Array(c);
  }
  function sn(e) {
    const t = e.particleSeed > 0 ? e.particleSeed : e.sceneSeed === 12 ? 0 : e.sceneSeed, o = e.maxParticles;
    return { maxParticles: o, tilePoints: as(t, e.density), jitterRng: Yt(t * 1597334677 + e.sceneSeed * 7919 + 101 >>> 0), gx: new Float32Array(o), gy: new Float32Array(o), shareRoll: new Float32Array(o), stepDur: new Float32Array(o), stepPhase: new Float32Array(o), stepCells: new Int8Array(o), side: new Int8Array(o), curO: new Int16Array(o), targetO: new Int16Array(o), wantO: new Int16Array(o), solvedT: new Int16Array(o), avoidO: new Int16Array(o), prio: new Uint8Array(o), eff: new Float32Array(o), fast: new Uint8Array(o), nextStepSec: new Float64Array(o), renderO: new Float32Array(o), pairL: new Uint16Array(gt), pairR: new Uint16Array(gt), pairM: new Int16Array(gt), adjStart: new Uint16Array(o + 1), adjPairIdx: new Uint16Array(gt * 2), count: -1, pairCount: 0, builtAspect: -1, elapsedSec: 0, stepClockSec: 0, dodgeCooldownSec: 0, settlingDodge: false, hasPendingSteps: false, lastGpuData: null, lastHalfSizePx: -1, lastAlpha: -1, lastPackedCount: -1 };
  }
  function Gt(e, t) {
    const { pairCount: o, pairL: s, pairR: l, pairM: c, solvedT: h, eff: i } = e;
    if (!(o === 0 || t === 0)) for (let b = 0; b < 12; b++) {
      let p = false;
      for (let w = 0; w < o; w++) {
        const m = s[w], x = l[w], E = c[w] - (h[x] - h[m]);
        E <= 0 || (p = true, i[m] > i[x] ? (h[x] += E, i[m] - 0.01 > i[x] && (i[x] = i[m] - 0.01)) : i[x] > i[m] ? (h[m] -= E, i[x] - 0.01 > i[m] && (i[m] = i[x] - 0.01)) : (h[x] += Math.ceil(E * 0.5), h[m] -= Math.floor(E * 0.5)));
      }
      if (!p) break;
    }
  }
  function an(e, t, o) {
    const s = Ne * t, l = Math.ceil(s / wt) + 1, c = 2, h = e.tilePoints, i = h.length >> 1, b = [];
    let p = 0;
    for (let f = 0; f < c; f++) for (let v = -1; v < l; v++) {
      const _ = (v + f * ss % 1) * wt, R = f * Ne;
      for (let D = 0; D < i; D++) {
        const O = _ + h[D * 2], $ = R + h[D * 2 + 1];
        if (p++, O >= -st && O <= s + st && $ >= -st && $ <= Ne + st) {
          const H = Yt(p * 1664525 + 1013904223 >>> 0);
          b.push({ x: O, y: $, shareRoll: H(), stepCells: (H() < 0.5 ? -1 : 1) * (1 + Math.floor(H() * 4)), stepDur: 3 + H() * 5, stepPhase: H(), side: H() < 0.5 ? -1 : 1 });
        }
      }
    }
    let w = b;
    if (b.length > e.maxParticles) {
      w = [];
      const f = b.length / e.maxParticles;
      for (let v = 0; v < e.maxParticles; v++) w.push(b[Math.floor(v * f)]);
    }
    w.sort((f, v) => f.x - v.x);
    const m = w.length;
    e.count = m, e.builtAspect = t;
    for (let f = 0; f < m; f++) {
      const v = w[f];
      e.gx[f] = v.x, e.gy[f] = v.y, e.shareRoll[f] = v.shareRoll, e.stepCells[f] = v.stepCells, e.stepDur[f] = v.stepDur, e.stepPhase[f] = v.stepPhase, e.side[f] = v.side, e.nextStepSec[f] = 0, e.fast[f] = 0, e.avoidO[f] = 0;
    }
    const x = st + os, E = x + 48 * Ze, d = [];
    for (let f = 0; f < m; f++) {
      const v = e.gx[f], _ = e.gy[f];
      for (let R = f + 1; R < m; R++) {
        const D = e.gx[R] - v;
        if (D > E) break;
        Math.abs(e.gy[R] - _) >= ns || d.push({ l: f, r: R, dx: D, m: Math.ceil((x - D) / Ze) });
      }
    }
    d.sort((f, v) => f.dx - v.dx);
    const M = Math.min(gt, d.length);
    e.pairCount = M;
    const A = new Uint16Array(m);
    for (let f = 0; f < M; f++) {
      const v = d[f];
      e.pairL[f] = v.l, e.pairR[f] = v.r, e.pairM[f] = v.m, A[v.l]++, A[v.r]++;
    }
    let k = 0;
    for (let f = 0; f < m; f++) e.adjStart[f] = k, k += A[f];
    e.adjStart[m] = k;
    const S = new Uint16Array(e.adjStart.subarray(0, m));
    for (let f = 0; f < M; f++) {
      const v = e.pairL[f], _ = e.pairR[f];
      e.adjPairIdx[S[v]++] = f, e.adjPairIdx[S[_]++] = f;
    }
    for (let f = 0; f < m; f++) {
      const v = e.shareRoll[f] < o, _ = (e.stepClockSec / e.stepDur[f] + e.stepPhase[f]) % 1, R = v && _ < 0.5 ? e.stepCells[f] : 0;
      e.wantO[f] = R, e.solvedT[f] = R, e.prio[f] = R !== 0 ? 2 : 1, e.eff[f] = e.prio[f];
    }
    Gt(e, m);
    for (let f = 0; f < m; f++) {
      const v = e.solvedT[f];
      e.curO[f] = v, e.targetO[f] = v, e.renderO[f] = v;
    }
    e.hasPendingSteps = false, e.lastPackedCount = -1;
  }
  function is(e, t, o, s, l, c, h, i, b, p, w) {
    const m = Math.max(0.2, l / Math.max(1, c)), x = s > 1e-3, E = x ? Math.min(0.92, 0.35 + s * 1.55) : 0, d = x ? 0.33 + s * 1.35 : 0.21;
    (e.count < 0 || Math.abs(m - e.builtAspect) > 0.015) && an(e, m, E);
    const M = e.count;
    if (M === 0) return e.settlingDodge = false, 0;
    const A = Ne * m, k = Math.max(0, i / 100), S = Math.max(8, b), f = S * S, v = Math.max(1, Math.round(8 * Math.min(1.5, k))), _ = p !== null && k > 5e-3, R = _ ? p[0] * A : -1e9, D = _ ? (1 - p[1]) * Ne : -1e9, O = w != null && w.age < 0.42 && w.strength > 0.01 && k > 5e-3, $ = O ? w.x * A : -1e9, H = O ? w.y * Ne : -1e9, Z = S * 1.38, ue = Z * Z, pe = O ? Math.min(1.4, w.strength) * (1 - w.age / 0.42) : 0;
    if (o > 0) {
      e.elapsedSec += o, x && (e.stepClockSec += o * d);
      const N = e.elapsedSec, q = e.stepClockSec;
      let Q = false, xe = false;
      for (let F = 0; F < M; F++) {
        let G = 0;
        if (_) {
          const P = e.gx[F] - R, V = e.gy[F] - D;
          if (Math.abs(P) < S && Math.abs(V) < S && P * P + V * V < f) {
            const g = Math.sign(P + e.curO[F] * Ze) || Math.sign(P) || e.side[F], n = Math.sqrt(f - V * V) - g * P;
            G = g * Math.min(v, Math.max(1, Math.ceil(n / Ze * k))), Q = true;
          }
        }
        if (O) {
          const P = e.gx[F] - $, V = e.gy[F] - H;
          if (Math.abs(P) < Z && Math.abs(V) < Z && P * P + V * V < ue) {
            const g = Math.sign(P + e.curO[F] * Ze) || Math.sign(P) || e.side[F], n = Math.sqrt(ue - V * V) - g * P, a = g * Math.min(v + 2, Math.max(1, Math.ceil(n / Ze * k * pe)));
            Math.abs(a) > Math.abs(G) && (G = a), Q = true;
          }
        }
        e.avoidO[F] = G;
        let ee = 0;
        e.shareRoll[F] < E && (ee = (q / e.stepDur[F] + e.stepPhase[F]) % 1 < 0.5 ? e.stepCells[F] : 0);
        const be = G !== 0 ? G : ee, we = G !== 0 ? 3 : ee !== 0 ? 2 : 1;
        (be !== e.wantO[F] || we !== e.prio[F]) && (e.wantO[F] = be, e.prio[F] = we, xe = true);
      }
      if (Q ? e.dodgeCooldownSec = 1.6 : e.dodgeCooldownSec = Math.max(0, e.dodgeCooldownSec - o), xe) {
        for (let F = 0; F < M; F++) e.eff[F] = e.prio[F], e.solvedT[F] = e.wantO[F];
        Gt(e, M);
      }
      if (xe || e.hasPendingSteps) {
        const F = 0.16 / Math.max(0.25, k), G = 1 / Math.max(0.35, k), ee = 1 / Math.max(0.15, d), be = e.jitterRng;
        let we = false;
        for (let P = 0; P < M; P++) {
          if (xe) {
            const V = e.solvedT[P];
            if (V !== e.targetO[P]) {
              if (e.curO[P] === e.targetO[P]) {
                const a = e.avoidO[P];
                if (a !== 0 && V === a) {
                  const u = _ ? Math.hypot(e.gx[P] - R, e.gy[P] - D) / S : 1, y = O ? Math.hypot(e.gx[P] - $, e.gy[P] - H) / Z : 1, T = Math.min(1, u, y);
                  e.nextStepSec[P] = Math.max(e.nextStepSec[P], N + T * F);
                } else V !== e.wantO[P] ? e.nextStepSec[P] = Math.max(e.nextStepSec[P], N + be() * 0.04 * G) : e.prio[P] === 1 && (e.nextStepSec[P] = Math.max(e.nextStepSec[P], N + be() * 0.43));
              }
              const n = e.shareRoll[P] < E && (e.curO[P] === 0 || e.curO[P] === e.stepCells[P]);
              e.fast[P] = e.prio[P] !== 3 && V === e.wantO[P] && n ? 0 : 1, e.targetO[P] = V;
            }
          }
          if (e.curO[P] !== e.targetO[P]) {
            if (N >= e.nextStepSec[P]) {
              const V = Math.sign(e.targetO[P] - e.curO[P]);
              let g = false;
              const n = e.adjStart[P], a = e.adjStart[P + 1];
              for (let u = n; u < a; u++) {
                const y = e.adjPairIdx[u], T = e.pairL[y], I = e.pairR[y], C = e.curO[I] - e.curO[T], L = T === P ? C - V : C + V;
                if (L < e.pairM[y] && L < C) {
                  g = true;
                  break;
                }
              }
              if (g) e.nextStepSec[P] = N + 0.016;
              else {
                e.curO[P] += V;
                const u = e.fast[P] !== 0, y = u ? 0.045 * G : 0.14 * ee, T = u ? 0.095 * G : 0.26 * ee;
                e.nextStepSec[P] = N + y + be() * (T - y);
              }
            }
            e.curO[P] !== e.targetO[P] && (we = true);
          }
        }
        e.hasPendingSteps = we;
      }
      const ce = 1 - Math.exp(-22.8 * o);
      let J = e.hasPendingSteps;
      for (let F = 0; F < M; F++) {
        const G = e.curO[F], ee = G - e.renderO[F];
        ee !== 0 && (Math.abs(ee) < 2e-3 ? e.renderO[F] = G : (e.renderO[F] += ee * ce, J = true));
      }
      e.settlingDodge = e.dodgeCooldownSec > 0 && J;
    }
    const ae = Math.max(4.1, Math.min(11.5, c * 65e-4)), fe = Math.max(0, Math.min(1, h)), oe = 1 / A;
    if (e.lastGpuData !== t || e.lastPackedCount !== M || e.lastHalfSizePx !== ae || e.lastAlpha !== fe) {
      const N = 1 / Ne;
      for (let q = 0; q < M; q++) {
        const Q = q * 5;
        t[Q] = (e.gx[q] + e.renderO[q] * Ze) * oe, t[Q + 1] = e.gy[q] * N, t[Q + 2] = ae, t[Q + 3] = fe, t[Q + 4] = 0;
      }
      e.lastGpuData = t, e.lastPackedCount = M, e.lastHalfSizePx = ae, e.lastAlpha = fe;
    } else for (let N = 0; N < M; N++) t[N * 5] = (e.gx[N] + e.renderO[N] * Ze) * oe;
    return M;
  }
  function oo(e) {
    let t = e + 1831565813 >>> 0;
    return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function rn(e, t) {
    const { state: o, nextStepFrame: s, cycles: l, loopIdleShare: c, fps: h, dtSec: i, stepScale: b, maxReturnDelayFrames: p, maxStepFrames: w } = e, m = o.count;
    if (m <= 0 || c <= 0) return;
    const x = e.stepCounter++;
    for (let d = 0; d < m; d++) {
      let M = 0;
      o.shareRoll[d] < c && (M = (t * l + o.stepPhase[d]) % 1 < 0.5 ? o.stepCells[d] : 0);
      const A = M !== 0 ? 2 : 1;
      o.wantO[d] = M, o.prio[d] = A, o.eff[d] = A, o.solvedT[d] = M;
    }
    Gt(o, m);
    for (let d = 0; d < m; d++) {
      const M = o.solvedT[d];
      if (M !== o.targetO[d]) {
        if (o.curO[d] === o.targetO[d]) {
          if (M !== o.wantO[d]) {
            const S = Math.max(1, Math.round(oo(d * 4099 + (M & 255) * 131) * 0.04 * h));
            s[d] = Math.max(s[d], x + S);
          } else if (o.prio[d] === 1) {
            const S = Math.min(p, Math.round(oo(d * 7919 + 17) * 0.36 * h));
            s[d] = Math.max(s[d], x + S);
          }
        }
        const k = o.shareRoll[d] < c && (o.curO[d] === 0 || o.curO[d] === o.stepCells[d]);
        o.fast[d] = M === o.wantO[d] && k ? 0 : 1, o.targetO[d] = M;
      }
      if (o.curO[d] !== o.targetO[d] && x >= s[d]) {
        const A = Math.sign(o.targetO[d] - o.curO[d]);
        let k = false;
        const S = o.adjStart[d], f = o.adjStart[d + 1];
        for (let v = S; v < f; v++) {
          const _ = o.adjPairIdx[v], R = o.pairL[_], D = o.pairR[_], O = o.curO[D] - o.curO[R], $ = R === d ? O - A : O + A;
          if ($ < o.pairM[_] && $ < O) {
            k = true;
            break;
          }
        }
        if (k) s[d] = x + 1;
        else {
          o.curO[d] += A;
          const v = o.fast[d] !== 0, _ = oo(d * 1597 + (o.curO[d] + 32 & 63) * 97 + (A > 0 ? 1 : 0)), R = v ? 0.045 : 0.14 * b, D = v ? 0.095 : 0.24 * b, O = Math.max(1, Math.min(w, Math.round((R + _ * (D - R)) * h)));
          s[d] = x + O;
        }
      }
    }
    const E = 1 - Math.exp(-22.8 * i);
    for (let d = 0; d < m; d++) {
      const M = o.curO[d] - o.renderO[d];
      Math.abs(M) < 1e-6 ? o.renderO[d] = o.curO[d] : o.renderO[d] += M * E;
    }
  }
  function rs(e) {
    const t = sn({ sceneSeed: e.sceneSeed, particleSeed: e.particleSeed, density: e.density, maxParticles: e.maxParticles }), o = Math.max(0.2, e.widthPx / Math.max(1, e.heightPx)), s = e.motionSpeed01 > 1e-3, l = s ? Math.min(0.92, 0.35 + e.motionSpeed01 * 1.55) : 0, c = s ? 0.33 + e.motionSpeed01 * 1.35 : 0.21, h = 1, i = e.duration, b = Math.min(1, Math.max(0.52, (e.duration - 1) / 5.5)), p = l * 0.73 * Math.min(1, i * c / 7) * b;
    if (t.stepClockSec = 0, an(t, o, p), e.duration <= 6) {
      const k = e.duration <= 3 ? 1 : e.duration <= 5 ? 2 : 3;
      for (let S = 0; S < t.count; S++) {
        t.stepCells[S] = Math.sign(t.stepCells[S]) * Math.min(k, Math.abs(t.stepCells[S]));
        const v = t.shareRoll[S] < p && t.stepPhase[S] % 1 < 0.5 ? t.stepCells[S] : 0;
        t.wantO[S] = v, t.solvedT[S] = v, t.prio[S] = v !== 0 ? 2 : 1, t.eff[S] = t.prio[S];
      }
      Gt(t, t.count);
      for (let S = 0; S < t.count; S++) {
        const f = t.solvedT[S];
        t.curO[S] = f, t.targetO[S] = f, t.renderO[S] = f;
      }
    }
    const w = Math.max(1, e.fps), m = 1 / w, x = Math.min(1.85, 1.3 / Math.max(0.32, c)), E = i * 0.5, d = Math.max(1, Math.floor(Math.min(0.32, E * 0.16) * w)), M = Math.max(1, Math.floor(Math.min(0.24, E * 0.55 / 4) * w)), A = { state: t, nextStepFrame: new Int32Array(e.maxParticles), cycles: h, loopIdleShare: p, fps: w, dtSec: m, stepScale: x, maxReturnDelayFrames: d, maxStepFrames: M, stepCounter: 0 };
    if (p > 0 && e.totalFrames > 0) for (let S = 0; S < 3; S++) for (let f = 0; f < e.totalFrames; f++) rn(A, f / e.totalFrames);
    return A;
  }
  function cs(e, t, o, s, l, c) {
    const { state: h } = e, i = h.count;
    if (i <= 0) return 0;
    rn(e, o);
    const b = Math.max(0.2, s / Math.max(1, l)), p = Ne * b, w = Math.max(4.1, Math.min(11.5, l * 65e-4)), m = Math.max(0, Math.min(1, c)), x = 1 / p, E = 1 / Ne;
    for (let d = 0; d < i; d++) {
      const M = d * 5;
      t[M] = (h.gx[d] + h.renderO[d] * Ze) * x, t[M + 1] = h.gy[d] * E, t[M + 2] = w, t[M + 3] = m, t[M + 4] = 0;
    }
    return i;
  }
  var Bt = 320;
  var Fo = 96;
  var ls = `#version 300 es
precision highp float;

layout(location = 0) in vec4 a_particle; // xy = screen pos [0..1] top-left, z = halfSizePx, w = alpha
layout(location = 1) in float a_blur;    // optical DoF softness [0..1]

uniform vec2 u_res;

out vec2 v_tc;
out float v_alpha;
out float v_blur;

void main() {
  int vid = gl_VertexID & 3;
  vec2 corner = vec2(float(vid & 1), float((vid >> 1) & 1)); // (0,0), (1,0), (0,1), (1,1)
  v_tc = corner;
  v_alpha = a_particle.w;
  v_blur = a_blur;

  vec2 centerPx = vec2(a_particle.x * u_res.x, (1.0 - a_particle.y) * u_res.y);
  // Flip corner.y so v_tc.y = 0 maps to top of glyph and v_tc.y = 1 maps to bottom
  vec2 offsetPx = vec2(corner.x - 0.5, 0.5 - corner.y) * (a_particle.z * 2.0);
  vec2 clip = ((centerPx + offsetPx) / u_res) * 2.0 - 1.0;
  gl_Position = vec4(clip, 0.0, 1.0);
}
`;
  var us = `#version 300 es
precision highp float;

in vec2 v_tc;
in float v_alpha;
in float v_blur;

uniform sampler2D u_sdfTex;
uniform vec3 u_tint;

out vec4 outColor;

void main() {
  float sdf = texture(u_sdfTex, v_tc).r;
  // Screen-space derivative gives crisp 1px AA when v_blur = 0, widening smoothly for DoF depth particles
  float aa = max(0.012, fwidth(sdf) * 0.92) + v_blur * 0.11;
  float mask = smoothstep(0.5 - aa, 0.5 + aa * 0.65, sdf);
  float a = mask * v_alpha;
  if (a <= 0.002) discard;
  // Premultiplied alpha output
  outColor = vec4(u_tint * a, a);
}
`;
  function No(e) {
    const t = e.reactivity ?? 85, o = e.dodgeRadius ?? 48, s = e.particleSeed ?? 0;
    if (e.mode === "x_step") return { mode: "x_step", count: 0, anchors: [], repelX: new Float32Array(0), repelY: new Float32Array(0), gpuData: new Float32Array(Bt * 5), reactivity: t, dodgeRadius: o, xStep: sn({ sceneSeed: e.seed, particleSeed: s, density: e.density, maxParticles: Bt }), settlingRepel: false };
    const l = s > 0 ? s : e.seed, c = Math.max(0, Math.min(1, (e.density - 10) / 90)), h = e.mode === "halo" ? 18 : 22, i = e.mode === "halo" ? 68 : Fo, b = Math.min(Fo, Math.max(8, Math.round(h + c * (i - h)))), p = Yt(l * 7919 + (e.mode === "halo" ? 17 : 53)), w = 0.5 + e.focalOffsetX / 100, m = 0.5 + e.focalOffsetY / 100, x = Math.max(0.55, Math.min(1.6, e.focalScalePct / 100)), E = [];
    if (e.mode === "halo") {
      const A = [2.45, 2.88, 3.32, 2.08, -0.42, -0.12, 0.24, -0.78].map((v) => {
        const _ = (p() - 0.5) * 0.28, R = v + _, D = (0.25 + p() * 0.085) * x;
        return { x: w + Math.cos(R) * D * 1.06, y: m - Math.sin(R) * D * 0.92, spreadX: 0.048 + p() * 0.045, spreadY: 0.044 + p() * 0.05 };
      }), k = 0.026 * 0.026;
      let S = 0;
      const f = b * 36;
      for (; E.length < b && S < f; ) {
        S++;
        const v = A[Math.floor(p() * A.length)], _ = p() + p() - 1, R = p() + p() - 1, D = v.x + _ * v.spreadX, O = v.y + R * v.spreadY;
        if (D < 0.06 || D > 0.94 || O < 0.14 || O > 0.82) continue;
        const $ = (D - w) / (0.17 * x), H = (O - m) / (0.21 * x);
        if ($ * $ + H * H < 1) continue;
        const Z = S > b * 18 ? 0.55 : 1;
        let ue = false;
        for (let oe = 0; oe < E.length; oe++) {
          const N = E[oe].ax - D, q = E[oe].ay - O;
          if (N * N + q * q < k * Z) {
            ue = true;
            break;
          }
        }
        if (ue) continue;
        const pe = p(), ae = p() * Math.PI * 2, fe = p() * Math.PI * 2;
        E.push({ ax: D, ay: O, depth: pe, phaseX: ae, phaseY: fe, sinPhaseX: Math.sin(ae), cosPhaseY: Math.cos(fe), sizeScale: 1.1 - pe * 0.28, depthAlpha: 1 - pe * 0.48, blur: pe > 0.58 ? (pe - 0.58) / 0.42 : 0, freqMult: 1 + Math.floor(p() * 3), amp: 6e-3 + p() * 0.011 });
      }
    } else {
      const A = [];
      for (let v = 0; v < 10; v++) A.push({ x: 0.08 + p() * 0.84, y: 0.08 + p() * 0.84, sx: 0.05 + p() * 0.08, sy: 0.05 + p() * 0.08 });
      const k = 0.032 * 0.032;
      let S = 0;
      const f = b * 32;
      for (; E.length < b && S < f; ) {
        S++;
        let v, _;
        if (p() < 0.72) {
          const Z = A[Math.floor(p() * 10)];
          v = Z.x + (p() + p() - 1) * Z.sx, _ = Z.y + (p() + p() - 1) * Z.sy;
        } else v = 0.05 + p() * 0.9, _ = 0.06 + p() * 0.88;
        if (v < 0.04 || v > 0.96 || _ < 0.05 || _ > 0.95) continue;
        const R = S > b * 16 ? 0.55 : 1;
        let D = false;
        for (let Z = 0; Z < E.length; Z++) {
          const ue = E[Z].ax - v, pe = E[Z].ay - _;
          if (ue * ue + pe * pe < k * R) {
            D = true;
            break;
          }
        }
        if (D) continue;
        const O = p(), $ = p() * Math.PI * 2, H = p() * Math.PI * 2;
        E.push({ ax: v, ay: _, depth: O, phaseX: $, phaseY: H, sinPhaseX: Math.sin($), cosPhaseY: Math.cos(H), sizeScale: 1.1 - O * 0.28, depthAlpha: 1 - O * 0.48, blur: O > 0.58 ? (O - 0.58) / 0.42 : 0, freqMult: 1 + Math.floor(p() * 3), amp: 8e-3 + p() * 0.014 });
      }
    }
    const d = E.length;
    return { mode: e.mode, count: d, anchors: E, repelX: new Float32Array(d), repelY: new Float32Array(d), gpuData: new Float32Array(d * 5), reactivity: t, dodgeRadius: o, xStep: null, settlingRepel: false };
  }
  function hs(e) {
    return e.xStep !== null ? e.xStep.settlingDodge : e.settlingRepel;
  }
  function fs(e, t, o, s, l, c, h, i, b) {
    if (e.xStep !== null) {
      e.count = is(e.xStep, e.gpuData, t, s, l, c, h, e.reactivity, e.dodgeRadius, i, b);
      return;
    }
    const p = e.count;
    if (p === 0) return;
    const w = l / Math.max(1, c), m = Math.max(0, e.reactivity / 85), x = 3.5 + 5 * Math.min(1.3, m), E = t > 0 ? 1 - Math.exp(-x * t) : 0, d = Math.min(l, c), M = Math.max(3.6, Math.min(10.5, d * 82e-4)), A = Math.PI * 2 / 20, k = s, S = Math.max(20, e.dodgeRadius) / 608 * 1.71, f = 0.052 * m, v = i !== null && m > 5e-3, _ = v ? i[0] : -10, R = v ? 1 - i[1] : -10, D = b != null && b.age < 1.25 && b.strength > 0.01 && m > 5e-3, O = D ? b.x : -10, $ = D ? b.y : -10, H = D ? 0.02 + 0.52 * (1 - Math.exp(-b.age * 2.2)) : 0, Z = D ? 0.075 + b.age * 0.035 : 0.1, ue = D ? Math.exp(-b.age * 2.1) * 0.034 * m * Math.min(1.4, b.strength) : 0, { anchors: pe, repelX: ae, repelY: fe, gpuData: oe } = e;
    let N = false;
    for (let q = 0; q < p; q++) {
      const Q = pe[q], xe = A * Q.freqMult, ce = k > 0 ? (Math.sin(o * xe + Q.phaseX) - Q.sinPhaseX) * Q.amp * k : 0, J = k > 0 ? (Math.cos(o * xe * 0.5 + Q.phaseY) - Q.cosPhaseY) * Q.amp * k : 0, F = Q.ax + ce, G = Q.ay + J;
      let ee = 0, be = 0;
      if (v) {
        const V = (F - _) * w, g = G - R, n = V * V + g * g;
        if (n < S * S && n > 1e-8) {
          const a = Math.sqrt(n), u = Math.pow(1 - a / S, 1.6) * f;
          ee = V / a * u / Math.max(0.4, w), be = g / a * u;
        }
      }
      if (D) {
        const V = (F - O) * w, g = G - $, n = Math.hypot(V, g);
        if (Math.abs(n - H) < Z * 3 && n > 1e-4) {
          const a = (n - H) / Z, u = Math.exp(-a * a) * ue;
          ee += V / n * u / Math.max(0.4, w), be += g / n * u;
        }
      }
      E > 0 && (ae[q] += (ee - ae[q]) * E, fe[q] += (be - fe[q]) * E), !v && !D && ae[q] * ae[q] + fe[q] * fe[q] > 36e-8 && (N = true);
      const we = k > 0 ? 1 - 0.16 * k * (0.5 - 0.5 * Math.cos(o * xe + Q.phaseX * 1.7)) : 1, P = q * 5;
      oe[P] = F + ae[q], oe[P + 1] = G + fe[q], oe[P + 2] = M * Q.sizeScale, oe[P + 3] = Math.max(0, Math.min(1, h * Q.depthAlpha * we)), oe[P + 4] = Q.blur;
    }
    e.settlingRepel = N;
  }
  function ds(e, t, o, s, l, c, h, i) {
    if (e.mode === "x_step") {
      i && (e.count = cs(i, e.gpuData, t, l, c, h));
      return;
    }
    const b = e.count;
    if (b === 0) return;
    const p = Math.min(l, c), w = Math.max(3.6, Math.min(10.5, p * 82e-4)), m = t * Math.PI * 2, x = Math.min(1, Math.max(0.52, (o - 1) / 5.5)), E = s > 1e-3 ? s * Math.min(0.9, o / 24 * 1.05) * x : 0, { anchors: d, gpuData: M } = e;
    for (let A = 0; A < b; A++) {
      const k = d[A], S = E > 0 ? (Math.sin(m + k.phaseX) - k.sinPhaseX) * k.amp * E : 0, f = E > 0 ? (Math.cos(m + k.phaseY) - k.cosPhaseY) * k.amp * E : 0, v = 1 - 0.14 * E * (0.5 - 0.5 * Math.cos(m + k.phaseX * 1.7)), _ = A * 5;
      M[_] = k.ax + S, M[_ + 1] = k.ay + f, M[_ + 2] = w * k.sizeScale, M[_ + 3] = Math.max(0, Math.min(1, h * k.depthAlpha * v)), M[_ + 4] = k.blur;
    }
  }
  function ps(e) {
    const t = Ut(e, "gemini-4-core:particles", ls, us);
    if (!t) return null;
    const o = e.createVertexArray(), s = e.createBuffer(), l = e.createTexture();
    if (!o || !s || !l) return e.deleteProgram(t), o && e.deleteVertexArray(o), s && e.deleteBuffer(s), l && e.deleteTexture(l), null;
    e.bindVertexArray(o), e.bindBuffer(e.ARRAY_BUFFER, s), e.bufferData(e.ARRAY_BUFFER, Bt * 5 * Float32Array.BYTES_PER_ELEMENT, e.DYNAMIC_DRAW);
    const c = 5 * Float32Array.BYTES_PER_ELEMENT;
    e.enableVertexAttribArray(0), e.vertexAttribPointer(0, 4, e.FLOAT, false, c, 0), e.vertexAttribDivisor(0, 1), e.enableVertexAttribArray(1), e.vertexAttribPointer(1, 1, e.FLOAT, false, c, 4 * Float32Array.BYTES_PER_ELEMENT), e.vertexAttribDivisor(1, 1), e.bindVertexArray(null), e.bindBuffer(e.ARRAY_BUFFER, null);
    const h = ts();
    e.bindTexture(e.TEXTURE_2D, l), e.pixelStorei(e.UNPACK_ALIGNMENT, 1), e.texImage2D(e.TEXTURE_2D, 0, e.R8, ho, ho, 0, e.RED, e.UNSIGNED_BYTE, h), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.bindTexture(e.TEXTURE_2D, null);
    const i = e.getUniformLocation(t, "u_sdfTex");
    return e.useProgram(t), e.uniform1i(i, 0), e.useProgram(null), { program: t, vao: o, instanceBuffer: s, sdfTexture: l, uRes: e.getUniformLocation(t, "u_res"), uSdfTex: i, uTint: e.getUniformLocation(t, "u_tint") };
  }
  function ms(e, t) {
    e.deleteTexture(t.sdfTexture), e.deleteBuffer(t.instanceBuffer), e.deleteVertexArray(t.vao), e.deleteProgram(t.program);
  }
  function Uo(e, t, o, s, l, c) {
    o.count < 1 || (e.enable(e.BLEND), e.blendFunc(e.ONE, e.ONE_MINUS_SRC_ALPHA), e.useProgram(t.program), e.bindVertexArray(t.vao), e.bindBuffer(e.ARRAY_BUFFER, t.instanceBuffer), e.bufferSubData(e.ARRAY_BUFFER, 0, o.gpuData, 0, o.count * 5), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, t.sdfTexture), e.uniform2f(t.uRes, s, l), e.uniform3f(t.uTint, c[0], c[1], c[2]), e.drawArraysInstanced(e.TRIANGLE_STRIP, 0, 4, o.count), e.bindVertexArray(null), e.disable(e.BLEND));
  }
  var no = 120;
  var Xo = 15;
  var zo = 3.8;
  var bs = { x: 0.5, y: 0.5, age: 10, strength: 0 };
  function ys(e, t) {
    return { palette: (t == null ? void 0 : t.palette) ?? e.palette ?? "tier_l", gradient_motion: (t == null ? void 0 : t.gradient_motion) ?? (typeof e.gradient_motion == "number" ? e.gradient_motion : 75), gradient_softness: (t == null ? void 0 : t.gradient_softness) ?? (typeof e.gradient_softness == "number" ? e.gradient_softness : 80), gradient_bloom: (t == null ? void 0 : t.gradient_bloom) ?? (typeof e.gradient_bloom == "number" ? e.gradient_bloom : 20), grain: (t == null ? void 0 : t.grain) ?? (typeof e.grain == "number" ? e.grain : 35), grain_animate: (t == null ? void 0 : t.grain_animate) ?? (typeof e.grain_animate == "boolean" ? e.grain_animate : false), grain_fps: (t == null ? void 0 : t.grain_fps) ?? (typeof e.grain_fps == "number" ? e.grain_fps : 8), focal_scale: (t == null ? void 0 : t.focal_scale) ?? (typeof e.focal_scale == "number" ? e.focal_scale : 100), focal_offset_x: (t == null ? void 0 : t.focal_offset_x) ?? (typeof e.focal_offset_x == "number" ? e.focal_offset_x : 0), focal_offset_y: (t == null ? void 0 : t.focal_offset_y) ?? (typeof e.focal_offset_y == "number" ? e.focal_offset_y : 0), seed: (t == null ? void 0 : t.seed) ?? (typeof e.seed == "number" ? e.seed : 12), motion_speed: (t == null ? void 0 : t.motion_speed) ?? (typeof e.motion_speed == "number" ? e.motion_speed : 35), interaction: (t == null ? void 0 : t.interaction) ?? e.interaction ?? "interactive", interaction_effect: (t == null ? void 0 : t.interaction_effect) ?? (typeof e.interaction_effect == "number" ? e.interaction_effect : 65), interaction_ripple: (t == null ? void 0 : t.interaction_ripple) ?? (typeof e.interaction_ripple == "boolean" ? e.interaction_ripple : true), particles: (t == null ? void 0 : t.particles) ?? (typeof e.particles == "boolean" ? e.particles : true), particle_mode: (t == null ? void 0 : t.particle_mode) ?? e.particle_mode ?? "x_step", particle_seed: (t == null ? void 0 : t.particle_seed) ?? (typeof e.particle_seed == "number" ? e.particle_seed : 0), particle_density: (t == null ? void 0 : t.particle_density) ?? (typeof e.particle_density == "number" ? e.particle_density : 45), particle_opacity: (t == null ? void 0 : t.particle_opacity) ?? (typeof e.particle_opacity == "number" ? e.particle_opacity : 85), particle_reactivity: (t == null ? void 0 : t.particle_reactivity) ?? (typeof e.particle_reactivity == "number" ? e.particle_reactivity : 85), particle_dodge_radius: (t == null ? void 0 : t.particle_dodge_radius) ?? (typeof e.particle_dodge_radius == "number" ? e.particle_dodge_radius : 48) };
  }
  function Bo(e, t, o) {
    e.bindFramebuffer(e.FRAMEBUFFER, null), e.viewport(0, 0, t, o), e.bindVertexArray(null), e.activeTexture(e.TEXTURE0), e.disable(e.SCISSOR_TEST), e.disable(e.BLEND), e.disable(e.DEPTH_TEST), e.disable(e.CULL_FACE);
  }
  function vs(e) {
    const t = Bn({ id: e.id, setup(o) {
      const s = o.createVertexArray();
      if (!s) return null;
      const l = jn(o);
      if (!l) return o.deleteVertexArray(s), null;
      const c = ps(o);
      return c ? { emptyVao: s, gradientPass: l, particlePass: c } : (Lo(o, l), o.deleteVertexArray(s), null);
    }, dispose(o, s) {
      ms(o, s.particlePass), Lo(o, s.gradientPass), o.deleteVertexArray(s.emptyVao);
    } });
    return Pn({ styles: [...e.styles], capabilities: { colorModes: ["light", "dark"], poster: true, lowPower: true }, defaults: { aspectRatio: "16-9", hibernate: true, isPresentational: true }, loop: e.loop ?? { durations: [3, 4, 5, 6, 10, 15], defaultSeconds: 4 }, config: e.config, async mount(o) {
      var tt, Qe, Je;
      const s = ys(o.config, (tt = e.extractCoreConfig) == null ? void 0 : tt.call(e, o.config)), l = s.seed, c = new AbortController(), { signal: h } = c;
      let i = null;
      try {
        i = await e.createCenterpiece(o, h), o.signal.throwIfAborted();
      } catch (U) {
        throw c.abort(), (Qe = i == null ? void 0 : i.destroy) == null || Qe.call(i), U;
      }
      const b = s.interaction !== "off", p = b ? s.interaction_effect / 65 : 0, w = s.interaction === "orbit" && !!(i != null && i.canOrbit), m = document.createElement("canvas");
      m.setAttribute("aria-hidden", "true"), w && m.setAttribute("data-orbit", "true"), o.root.append(m);
      let x = o.colorMode, E = o.lowPower;
      const d = s.gradient_motion / 100, M = s.gradient_softness, A = s.gradient_bloom, k = s.grain / 100, S = s.motion_speed / 100, f = s.particle_opacity / 100, v = s.particles ? No({ seed: l, particleSeed: s.particle_seed, mode: s.particle_mode, density: s.particle_density, focalScalePct: s.focal_scale, focalOffsetX: s.focal_offset_x, focalOffsetY: s.focal_offset_y, reactivity: s.particle_reactivity, dodgeRadius: s.particle_dodge_radius }) : null;
      let _ = 1, R = 1, D = 0.5, O = 0.5, $ = 0.5, H = 0.5, Z = 0, ue = 0, pe = 0.5, ae = 0.5, fe = 0.5, oe = 0.5, N = false, q = 0, Q = 0.5, xe = 0.5, ce = 10;
      const J = { x: 0.5, y: 0.5, age: 10, strength: 0 }, F = { softness: M, bloom: A, focusX: 0.5, focusY: 0.5, focusAmount: 0, tap: J };
      let G = false, ee = 0, be = 0, we = 0, P = 0, V = 0, g = 0, n = false, a = 0, u = 0, y = 0;
      const T = [0.5, 0.5], C = { spec: Zt(s.palette, x), viewScaleX: 1, viewScaleY: 1, shiftX: 0, shiftY: 0, flowOffsetX: 0, flowOffsetY: 0, rotCos: 1, rotSin: 0, zoom: 1, invZoom: 1, focusShiftX: 0, focusShiftY: 0, phaseRad: 0, rayAmp: 0, crossAmp: 0, effSoft: 1, effBeam: 1, stageAspect: 16 / 9, tapX: 0.5, tapY: 0.5, tapAge: 10, tapStrength: 0 }, L = { ...C }, X = { cursorInside: false, isDragging: false, rawTopLeftX: 0.5, rawTopLeftY: 0.5, rawBottomLeftX: 0.5, rawBottomLeftY: 0.5, glideBottomLeftX: 0.5, glideBottomLeftY: 0.5, smoothTopLeftX: 0.5, smoothTopLeftY: 0.5, hoverActive01: 0 }, z = { topLeftX: 0.5, topLeftY: 0.5, bottomLeftY: 0.5, ageSec: 10, strength: 0, rippleEnabled: false }, ne = t.mount(m, () => ve(0));
      if (!ne) return c.abort(), (Je = i == null ? void 0 : i.destroy) == null || Je.call(i), m.remove(), m.width = 0, m.height = 0, null;
      const me = ne;
      function ve(U) {
        const te = Zt(s.palette, x), j = b && s.interaction_ripple && !E, Ee = j ? Math.min(1.5, p) : 0;
        J.x = Q, J.y = xe, J.age = ce, J.strength = Ee, F.focusX = fe, F.focusY = oe, F.focusAmount = q, X.cursorInside = N, X.isDragging = G, X.rawTopLeftX = pe, X.rawTopLeftY = ae, X.rawBottomLeftX = D, X.rawBottomLeftY = O, X.glideBottomLeftX = $, X.glideBottomLeftY = H, X.smoothTopLeftX = fe, X.smoothTopLeftY = oe, X.hoverActive01 = q, z.topLeftX = Q, z.topLeftY = xe, z.bottomLeftY = 1 - xe, z.ageSec = ce, z.strength = Ee, z.rippleEnabled = j, me.render((Se, he, Te, Re, ge) => {
          const Le = Ro(te, Re, ge, V, d, l, F, C);
          if (Do(Se, he.gradientPass, he.emptyVao, Re, ge, Le, $, H, E ? k * 0.65 : k, l, g, s.grain_animate, s.grain_fps), v) {
            let qe = null;
            N && b && (T[0] = D, T[1] = O, qe = T), fs(v, U, we, S, Re, ge, f, qe, Ee > 1e-3 && ce < 1.3 ? J : null), Uo(Se, he.particlePass, v, Re, ge, te.particleTint);
          }
          i && (i.renderLive({ gl: Se, plugins: Te, vao: he.emptyVao, targetFbo: null, width: Re, height: ge, cssWidth: _, cssHeight: R, dtSec: U, simPhaseSec: we, cycle15Phase01: P / Xo, motionSpeed01: S, running: n, lowPower: E, colorMode: x, gradientSpec: te, gradientFrame: Le, pointer: X, tap: z }), Bo(Se, Re, ge));
        });
      }
      let Me = false, ke = 0, Ie = 0, De = null, Pe = null;
      const ze = { softness: M, bloom: A, focusX: 0.5, focusY: 0.5, focusAmount: 0, tap: bs };
      function rt(U, te) {
        const j = Zt(s.palette, x), Ee = Math.min(1, Math.max(0.62, (te - 1) / 5.5)), Se = d * Math.min(0.95, te / 15 * 0.91) * Ee;
        me.render((he, Te, Re, ge, Le) => {
          const qe = Ro(j, ge, Le, U * 15, Se, l, ze, L);
          Do(he, Te.gradientPass, Te.emptyVao, ge, Le, qe, 0.5, 0.5, k, l, U * te, s.grain_animate, s.grain_fps, te);
          const Ve = De ?? v;
          Ve && (ds(Ve, U, te, S, ge, Le, f, Pe), Uo(he, Te.particlePass, Ve, ge, Le, j.particleTint)), i && (i.renderLoop({ gl: he, plugins: Re, vao: Te.emptyVao, targetFbo: null, width: ge, height: Le, progress01: U, duration: te, timeSec: U * te, motionSpeed01: S, colorMode: x, gradientSpec: j, gradientFrame: qe }), Bo(he, ge, Le));
        });
      }
      const Ke = e.maxDesktopPixels ?? (i !== null ? 285e4 : 24e5);
      function Be() {
        var ge;
        if (Me) return;
        _ = Math.max(1, m.clientWidth), R = Math.max(1, m.clientHeight);
        const U = typeof window < "u" ? Math.min(window.innerWidth || 9999, window.innerHeight || 9999) : 9999, te = typeof navigator < "u" && navigator.maxTouchPoints > 0 && U <= 900, j = E || te || U <= 540, Ee = j ? 1.25 : 1.75, Se = j ? 11e5 : Ke, { width: he, height: Te } = zn(_, R, Ee, Se), Re = he < m.width || Te < m.height;
        (m.width !== he || m.height !== Te) && (m.width = he, m.height = Te, Re && me.trim()), (ge = i == null ? void 0 : i.onResize) == null || ge.call(i, _, R, E, () => ve(0)), ve(0);
      }
      const Ue = new ResizeObserver(Be);
      if (Ue.observe(m), Be(), b && (m.addEventListener("pointermove", (U) => {
        const te = Math.max(0, Math.min(1, U.offsetX / _)), j = Math.max(0, Math.min(1, U.offsetY / R));
        if (!N && q < 0.01 && (fe = te, oe = j), D = te, O = 1 - j, pe = te, ae = j, N = true, G && w && (i != null && i.onDragPixels)) {
          const Ee = U.clientX - ee, Se = U.clientY - be;
          ee = U.clientX, be = U.clientY, i.onDragPixels(Ee, Se, _, R);
        }
      }, { signal: h, passive: true }), m.addEventListener("pointerleave", () => {
        N = false, G = false, m.removeAttribute("data-dragging");
      }, { signal: h, passive: true }), m.addEventListener("pointerdown", (U) => {
        var Se;
        const te = Math.max(0, Math.min(1, U.offsetX / _)), j = Math.max(0, Math.min(1, U.offsetY / R)), Ee = 1 - j;
        if (!N && q < 0.01 && (fe = te, oe = j), D = te, O = Ee, pe = te, ae = j, s.interaction_ripple && !E && (Q = te, xe = j, ce = 0, (Se = i == null ? void 0 : i.onTap) == null || Se.call(i, { topLeftX: te, topLeftY: j, bottomLeftY: Ee, cssWidth: _, cssHeight: R })), w) {
          G = true, ee = U.clientX, be = U.clientY, m.setAttribute("data-dragging", "true");
          try {
            m.setPointerCapture(U.pointerId);
          } catch {
          }
        }
      }, { signal: h }), w)) {
        const U = (te) => {
          if (G) {
            G = false, m.removeAttribute("data-dragging");
            try {
              m.hasPointerCapture(te.pointerId) && m.releasePointerCapture(te.pointerId);
            } catch {
            }
          }
        };
        m.addEventListener("pointerup", U, { signal: h }), m.addEventListener("pointercancel", U, { signal: h });
      }
      const Fe = (U) => {
        var ie, re;
        if (!n) return;
        a = requestAnimationFrame(Fe);
        const te = s.interaction_ripple && !E && ce < zo, j = G || N || q > 5e-3 || te || !!((ie = i == null ? void 0 : i.isSettling) != null && ie.call(i)) || v !== null && hs(v), Ee = G || !E && j ? 0 : 30;
        if (Ee > 0 && U - y < Ee) return;
        const Se = u > 0 ? (U - u) / 1e3 : 1 / 60, he = Math.max(0, Math.min(0.1, Se));
        if (u = U, y = U, ce < zo && (ce += he), S > 1e-3) {
          const _e = 0.35 + S * 1.45, Ae = ((re = i == null ? void 0 : i.getAmbientScale) == null ? void 0 : re.call(i)) ?? 1;
          we = (we + he * _e * Ae) % no;
          const Ce = 0.3 + S / 0.35 * 0.7;
          P = (P + he * Ce) % Xo;
        }
        d > 1e-3 && (V = (V + he) % no), s.grain_animate && k > 1e-3 && (g = (g + he) % no);
        const Te = N ? D : 0.5, Re = N ? O : 0.5, ge = N ? 3.4 : 0.82, Le = Math.exp(-ge * he), qe = $ - Te, Ve = Z + ge * qe;
        $ = Te + (qe + Ve * he) * Le, Z = (Z - Ve * ge * he) * Le;
        const r = H - Re, W = ue + ge * r;
        H = Re + (r + W * he) * Le, ue = (ue - W * ge * he) * Le, !N && Math.abs(Z) < 1e-4 && Math.abs($ - 0.5) < 1e-4 && (Z = 0, $ = 0.5), !N && Math.abs(ue) < 1e-4 && Math.abs(H - 0.5) < 1e-4 && (ue = 0, H = 0.5);
        const se = 1 - Math.exp(-6.2 * he);
        fe += (pe - fe) * se, oe += (ae - oe) * se;
        const le = N && b ? 1 : 0, ye = 1 - Math.exp(-(le > 0 ? 5.5 : 2) * he);
        q += (le - q) * ye, q < 1e-4 && le === 0 && (q = 0), ve(he);
      };
      return { resume() {
        n || (n = true, u = performance.now(), y = 0, a = requestAnimationFrame(Fe));
      }, pause() {
        n && (n = false, a && (cancelAnimationFrame(a), a = 0));
      }, update(U) {
        const te = E;
        U.colorMode !== void 0 && (x = U.colorMode), U.lowPower !== void 0 && (E = U.lowPower), te !== E ? Be() : ve(0);
      }, loop: { async begin(U) {
        var Te;
        const { duration: te, totalFrames: j, fps: Ee, width: Se, height: he } = U;
        Me = true, ke = m.width, Ie = m.height, (m.width !== Se || m.height !== he) && (m.width = Se, m.height = he), await ((Te = i == null ? void 0 : i.prepareLoop) == null ? void 0 : Te.call(i, U)), s.particles ? (De = No({ seed: l, particleSeed: s.particle_seed, mode: s.particle_mode, density: s.particle_density, focalScalePct: s.focal_scale, focalOffsetX: s.focal_offset_x, focalOffsetY: s.focal_offset_y, reactivity: s.particle_reactivity, dodgeRadius: s.particle_dodge_radius }), Pe = s.particle_mode === "x_step" ? rs({ sceneSeed: l, particleSeed: s.particle_seed, density: s.particle_density, maxParticles: Bt, widthPx: Se, heightPx: he, motionSpeed01: S, duration: te, totalFrames: j, fps: Ee }) : null) : (De = null, Pe = null);
      }, renderFrame({ progress: U, duration: te }) {
        rt(U, te);
      }, end() {
        Me = false, De = null, Pe = null, ke > 0 && Ie > 0 && (m.width !== ke || m.height !== Ie) && (m.width = ke, m.height = Ie), me.trim(), Be();
      } }, destroy() {
        var U;
        n = false, a && (cancelAnimationFrame(a), a = 0), c.abort(), Ue.disconnect(), (U = i == null ? void 0 : i.destroy) == null || U.call(i), me.destroy(), m.remove(), m.width = 0, m.height = 0;
      } };
    } });
  }
  function qo(e, t, o) {
    const s = Math.max(0, Math.min(1, (o - e) / (t - e)));
    return s * s * (3 - 2 * s);
  }
  function Dt(e, t, o, s, l) {
    if (l <= 0) return;
    const c = Math.exp(-s * l), h = e.x - t, i = e.vx + s * h;
    e.x = t + (h + i * l) * c, e.vx = (e.vx - i * s * l) * c;
    const b = e.y - o, p = e.vy + s * b;
    e.y = o + (b + p * l) * c, e.vy = (e.vy - p * s * l) * c;
  }
  function gs(e, t, o) {
    const s = e[0], l = e[1], c = e[2], h = e[3], i = e[4], b = e[5], p = e[6], w = e[7], m = e[8], x = t[0], E = t[1], d = t[2], M = t[3], A = t[4], k = t[5], S = t[6], f = t[7], v = t[8];
    o[0] = s * x + l * M + c * S, o[1] = s * E + l * A + c * f, o[2] = s * d + l * k + c * v, o[3] = h * x + i * M + b * S, o[4] = h * E + i * A + b * f, o[5] = h * d + i * k + b * v, o[6] = p * x + w * M + m * S, o[7] = p * E + w * A + m * f, o[8] = p * d + w * k + m * v;
  }
  function _s(e) {
    let t = e[0], o = e[1], s = e[2];
    const l = 1 / (Math.hypot(t, o, s) || 1);
    t *= l, o *= l, s *= l;
    let c = e[3], h = e[4], i = e[5];
    const b = t * c + o * h + s * i;
    c -= b * t, h -= b * o, i -= b * s;
    const p = 1 / (Math.hypot(c, h, i) || 1);
    c *= p, h *= p, i *= p;
    const w = o * i - s * h, m = s * c - t * i, x = t * h - o * c;
    e[0] = t, e[1] = o, e[2] = s, e[3] = c, e[4] = h, e[5] = i, e[6] = w, e[7] = m, e[8] = x;
  }
  var Ge = new Float32Array(9);
  var so = new Float32Array(9);
  function xs() {
    const e = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]), t = { yaw: 0, pitch: 0, roll: 0, vy: 0, vp: 0, vr: 0, ambientScale: 1 }, o = { x: 0, y: 0, vx: 0, vy: 0 }, s = { x: 0, y: 0, vx: 0, vy: 0 }, l = { x: 0, y: 0, vx: 0, vy: 0 }, c = { x: 0.5, y: 0.5, vx: 0, vy: 0 };
    let h = false, i = 0, b = 0, p = 0, w = 0, m = 0, x = false, E = 0, d = 0;
    const M = [0.32, 0.42], A = { wake0X: 0, wake0Y: 0, wake1X: 0, wake1Y: 0, wake2X: 0, wake2Y: 0, velX: 0, velY: 0, speed01: 0, strength: 0 }, k = { tapNdcX: 0, tapNdcY: 0, age: 10, strength: 0 };
    function S(f, v) {
      if (Math.abs(f) < 1e-7 && Math.abs(v) < 1e-7) return;
      const _ = Math.cos(f), R = Math.sin(f), D = Math.cos(v), O = Math.sin(v);
      Ge[0] = _, Ge[1] = R * O, Ge[2] = R * D, Ge[3] = 0, Ge[4] = D, Ge[5] = -O, Ge[6] = -R, Ge[7] = _ * O, Ge[8] = _ * D, gs(Ge, e, so), _s(so), e.set(so);
    }
    return { dragMat: e, fluidTilt: t, wake: A, tap: k, crystalHalfNdc: M, get crystalProximity() {
      return d;
    }, addDragPixels(f, v, _, R) {
      b += f / Math.max(220, _) * Math.PI * 1.55, p += v / Math.max(220, R) * Math.PI * 1.35;
    }, freezeOrbitForLoop() {
      S(b, p), b = 0, p = 0, w = 0, m = 0;
    }, triggerTap(f) {
      const v = Math.max(1, Math.min(f.width, f.height)), _ = (f.ptrX - 0.5) * f.width / v - f.shiftNdcX, R = (f.ptrY - 0.5) * f.height / v - f.shiftNdcY, D = Math.hypot(_ / (M[0] * 1.08), R / (M[1] * 1.08)), O = Math.max(0, Math.min(1, (1.65 - D) / 0.85)), $ = O * O * (3 - 2 * O), H = $ * f.effectScale;
      if (k.tapNdcX = _, k.tapNdcY = R, k.age = 0, k.strength = H, $ > 0.02 && f.tiltScale > 1e-3) {
        const Z = f.allowTorque ? 1 : 0.28, ue = Math.max(-1.25, Math.min(1.25, _ / Math.max(0.14, M[0]))), pe = Math.max(-1.25, Math.min(1.25, R / Math.max(0.16, M[1]))), ae = $ * f.tiltScale * Z;
        t.vy = Math.max(-1.35, Math.min(1.35, t.vy + (ue * 0.68 + 0.08) * ae)), t.vp = Math.max(-1.35, Math.min(1.35, t.vp + (-pe * 0.62 - 0.14) * ae)), t.vr = Math.max(-0.75, Math.min(0.75, t.vr + (-ue * pe * 0.28 + ue * 0.09) * ae));
      }
      return H;
    }, step(f, v) {
      const { dt: _ } = f, R = f.interactionEnabled && f.cursorInside && !f.isDragging, D = f.interactionEnabled ? f.tiltScale : 0;
      if (_ > 0) {
        let ce = 0;
        if (R) {
          h ? (Dt(c, f.targetPtrX, f.targetPtrY, 9, _), ce = Math.hypot(c.vx, c.vy), (ce > 1e-4 || i > 5e-3) && (i += (1 - i) * (1 - Math.exp(-10.5 * _)))) : (c.x = f.targetPtrX, c.y = f.targetPtrY, c.vx = 0, c.vy = 0, i = 0);
          const ee = f.invertTilt ?? true ? -1 : 1, be = i * D, we = ee * (c.x - 0.5) * 0.62 * be, P = -ee * (c.y - 0.5) * 0.5 * be, V = (-ee * (c.x - 0.5) * 0.12 - (c.y - 0.5) * t.yaw * 0.24) * be, g = we - t.yaw, n = P - t.pitch, a = V - t.roll, u = Math.hypot(g, n), y = qo(0.02, 0.16, u), T = qo(0.12, 1.15, ce), I = Math.max(y, T), C = 5.1 + 2 * I, X = 2 * (1.06 - 0.04 * I) * C, z = Math.exp(-X * _), ne = (1 - z) / X, me = 0.25 * Math.max(0.35, D), ve = 1 / Math.hypot(1, u / me), Me = g * ve, ke = n * ve, Ie = 1 / Math.hypot(1, ce / 1.25), De = c.vx * Ie, Pe = c.vy * Ie, ze = (0.08 + 0.16 * T) * be, rt = ee * De * ze, Ke = -ee * Pe * ze * 0.85, Be = -ee * De * 0.1 * be;
          t.vy = t.vy * z + (C * C * Me + C * rt * 0.6) * ne, t.vp = t.vp * z + (C * C * ke + C * Ke * 0.6) * ne, t.vr = t.vr * z + (C * C * a + C * Be * 0.5) * ne;
        } else {
          i = 0, c.vx = 0, c.vy = 0;
          const ee = 0.72, be = 1 + t.yaw / 0.5 * (t.yaw / 0.5) * 2.2, we = 1 + t.pitch / 0.4 * (t.pitch / 0.4) * 2.2, P = 1 + t.roll / 0.25 * (t.roll / 0.25) * 2, V = Math.exp(-2.15 * _);
          t.vy = (t.vy - ee * be * t.yaw * _) * V, t.vp = (t.vp - ee * we * t.pitch * _) * V, t.vr = (t.vr - ee * 1.25 * P * t.roll * _) * V;
        }
        h = R, t.yaw += t.vy * _, t.pitch += t.vp * _, t.roll += t.vr * _, !R && Math.abs(t.vy) < 1e-4 && Math.abs(t.yaw) < 1e-4 && (t.vy = 0, t.yaw = 0), !R && Math.abs(t.vp) < 1e-4 && Math.abs(t.pitch) < 1e-4 && (t.vp = 0, t.pitch = 0), !R && Math.abs(t.vr) < 1e-4 && Math.abs(t.roll) < 1e-4 && (t.vr = 0, t.roll = 0);
        const F = 1 - 0.72 * Math.min(1, ce * 0.9 + Math.hypot(t.vy, t.vp) * 1.35 + (f.isDragging ? 1 : 0)), G = F < t.ambientScale ? 5 : 0.72;
        t.ambientScale += (F - t.ambientScale) * (1 - Math.exp(-G * _));
      }
      if (_ > 0) {
        const ce = 1 - Math.exp(-22 * _), J = b * ce, F = p * ce;
        if (b -= J, p -= F, f.isDragging) {
          S(J, F);
          const G = 1 / Math.max(4e-3, _), ee = Math.max(-5.5, Math.min(5.5, J * G)), be = Math.max(-5.5, Math.min(5.5, F * G)), we = 1 - Math.exp(-14 * _);
          w += (ee - w) * we, m += (be - m) * we;
        } else {
          const G = Math.exp(-2.8 * _), ee = J + w * _, be = F + m * _;
          S(ee, be), w *= G, m *= G, Math.abs(w) < 1e-4 && (w = 0), Math.abs(m) < 1e-4 && (m = 0);
        }
      }
      const O = f.boundRadii[0], $ = f.boundRadii[1], H = f.boundRadii[2], Z = Math.hypot(v[0] * O, v[1] * $, v[2] * H), ue = Math.hypot(v[3] * O, v[4] * $, v[5] * H), pe = 1.85 / 2.55 * Math.max(0.35, f.scale * 0.94);
      M[0] = Math.max(0.14, Z * pe), M[1] = Math.max(0.16, ue * pe);
      const ae = Math.max(1, Math.min(f.width, f.height)), fe = (f.targetPtrX - 0.5) * f.width / ae - f.shiftNdcX, oe = (f.targetPtrY - 0.5) * f.height / ae - f.shiftNdcY, N = f.cursorInside && f.interactionEnabled && f.effectScale > 1e-3;
      if (N && !x && E < 0.03 && (o.x = s.x = l.x = fe, o.y = s.y = l.y = oe, o.vx = o.vy = s.vx = s.vy = l.vx = l.vy = 0), x = N, _ > 0) {
        if (N) Dt(o, fe, oe, 14.5, _);
        else {
          const ce = Math.exp(-3.6 * _);
          o.x += o.vx * _, o.y += o.vy * _, o.vx *= ce, o.vy *= ce;
        }
        Dt(s, o.x, o.y, 7.5, _), Dt(l, s.x, s.y, 3.8, _);
      }
      const q = Math.hypot(o.x / (M[0] * 1.05), o.y / (M[1] * 1.05)), Q = Math.max(0, Math.min(1, (1.52 - q) / 0.76));
      if (d = N ? Q * Q * (3 - 2 * Q) : 0, _ > 0) {
        const ce = d > E ? 8.5 : 2.2;
        E += (d - E) * (1 - Math.exp(-ce * _)), E < 1e-4 && !N && (E = 0), k.age < 10 && (k.age += _);
      }
      const xe = Math.hypot(o.vx, o.vy);
      A.wake0X = o.x, A.wake0Y = o.y, A.wake1X = s.x, A.wake1Y = s.y, A.wake2X = l.x, A.wake2Y = l.y, A.velX = o.vx, A.velY = o.vy, A.speed01 = Math.min(1, xe / 1.55), A.strength = E * f.effectScale;
    }, isSettling() {
      const f = Math.hypot(t.vy, t.vp, t.vr) > 0.022, v = Math.hypot(w, m) > 0.015 || Math.hypot(b, p) > 1e-4, _ = k.strength > 5e-3 && k.age < 2.8;
      return f || v || E > 2e-3 || _;
    } };
  }
  var Ft = 6;
  var ws = 6;
  var xt = Ft + ws;
  var Ss = ["u_res", "u_center", "u_unit", "u_bound", "u_pointer", "u_rot", "u_body", "u_seed", "u_morph", "u_morphKnobs", "u_rock1", "u_rock2", "u_rock3", "u_crawl", "u_knobRock1", "u_knobRock2", "u_sheenRock", "u_flow", "u_flowPh", "u_top", "u_bottom", "u_lumps", "u_knobs", "u_knobFreq", "u_folds", "u_foldPh", "u_spec", "u_disp", "u_frost", "u_stress", "u_inner", "u_milk", "u_irid", "u_film", "u_round", "u_clarity", "u_lobes", "u_gloop", "u_blobPh", "u_deep", "u_deepTint", "u_focus", "u_grain", "u_grainFrame", "u_swell", "u_rip", "u_ripK", "u_ripN", "u_ripMax", "u_cone", "u_coneOrigin"];
  var fo = 8;
  function Ms(e) {
    return `hydrogen:gel${e.pockets ? "+deep" : ""}${e.folds ? "+folds" : ""}${e.interact ? "+touch" : ""}${e.interact && e.press ? "+press" : ""}${e.lod ? "+lod" : ""}`;
  }
  function cn(e) {
    return [`#define MAX_RIPPLES ${xt}`, `#define CONE ${fo}`, e.lod ? "#define LOD" : "", e.pockets ? "#define POCKETS" : "", e.folds ? "#define FOLDS" : "", e.interact ? "#define INTERACT" : "", e.interact && e.press ? "#define PRESS" : ""].filter(Boolean).join(`
`);
  }
  function Es(e) {
    return `#version 300 es
${cn(e)}
${ln}
${un}
${Ts}
${As}`;
  }
  function ks(e) {
    return `#version 300 es
${cn(e)}
${ln}
${un}
${Ps}`;
  }
  var ln = `
// Gemini 4 Hydrogen, composited over the shared tonal stage. A membrane of
// liquid hydrogen is sphere-traced as a domain-warped egg, and everything
// finer than its lumps (pockets, milk, sheen) is shaded at the hit point so
// the march stays cheap. A low-resolution cone pass first marks the pixel
// blocks that can't reach the gel, so the gel pass only marches the rest.
// Every motion arrives as a phase from the CPU, so the same shaders serve the
// live clock and seamless loops.
precision highp float;

in vec2 v_uv;

uniform vec2 u_res;        // drawing buffer, device px
uniform vec2 u_center;     // gel centre, device px
uniform float u_unit;      // device px per scene unit
uniform float u_bound;     // nothing outside this sphere can be gel or halo
uniform vec2 u_pointer;    // smoothed pointer [0..1], bottom-left origin
uniform mat3 u_rot;        // world -> gel
uniform mat3 u_body;       // world -> gel, through the click wobble
uniform vec3 u_seed;       // lump phase offset, 0 for the canonical silhouette
uniform vec3 u_morph;      // slow drift of the lump phases
uniform vec3 u_morphKnobs; // slow drift of the knob phases
uniform vec3 u_rock1;      // lumps rocking about their fitted phase
uniform vec3 u_rock2;
uniform vec3 u_rock3;
uniform float u_crawl;     // the finest lumps crawl
uniform vec3 u_knobRock1;
uniform vec3 u_knobRock2;
uniform vec2 u_sheenRock;
uniform vec4 u_flow;       // xyz: drift of the liquid inside; w: how far it folds
uniform vec3 u_flowPh;     // phases the inner folds turn through
uniform vec3 u_top;        // reflection dome sky tint
uniform vec3 u_bottom;     // reflection dome floor tint
uniform float u_lumps;     // 1 = canonical
uniform float u_knobs;     // 1 = canonical
uniform float u_knobFreq;  // 1 = canonical; higher is smaller knobs
uniform float u_folds;     // height of the layered folds, 0 = none
uniform vec3 u_foldPh;     // phases the folds drift through
uniform float u_spec;      // 1 = full studio speculars; lower is less glossy
uniform float u_disp;      // how far apart the colours bend, 1 = canonical
uniform float u_frost;     // share of the surface that is frosted
uniform float u_stress;    // 1 = canonical
uniform float u_inner;     // 1 = canonical
uniform float u_milk;      // 1 = canonical
uniform float u_irid;      // 1 = canonical
uniform float u_film;      // thin-film colour in what the membrane mirrors
uniform float u_round;     // 0 = the fitted egg, 1 = a sphere under the lumps
uniform float u_gloop;     // 1 = canonical slime: swellings, settling, wet sheen
uniform float u_lobes;     // height of the gloop lobes, breathing with the morph
uniform float u_clarity;   // 0..1 share of the body that runs clear
uniform vec3 u_blobPh;     // phases the swellings slide through
uniform float u_deep;      // 1 = canonical deep pockets
uniform vec3 u_deepTint;   // the palette's deepest blue, for the pockets to sink to
uniform float u_focus;     // 1 = canonical
uniform float u_grain;     // surface grain amplitude over opaque gel
uniform float u_grainFrame; // stepped grain frame (0 when static)

#ifdef INTERACT
uniform vec4 u_swell;              // xyz gel-space anchor, w height
uniform vec4 u_rip[MAX_RIPPLES];   // xyz gel-space origin, w ring radius
uniform vec4 u_ripK[MAX_RIPPLES];  // height, wavenumber, 1 / width^2, light
uniform int u_ripN;                // live ripples, packed first
uniform float u_ripMax;            // the most the swell and ripples can raise the surface
#endif
`;
  var un = `
const float TAU = 6.28318530718;

// The camera sits far enough back that the gel reads as a long-lens macro.
const float CAM = 6.;
// The march's step budget, how close counts as a hit, and the least it
// creeps along a grazing ray, in px. Most rays need about ten steps; the
// budget is for rays skimming the silhouette, which crawl along it for a
// long way. Cut short, they would be taken as hits, which shows as hard
// slivers popping in and out of the soft edge. The low-power level settles
// for less.
#ifdef LOD
const int STEPS = 128;
const float HIT_PX = 1.;
const float CREEP_PX = .5;
#else
const int STEPS = 200;
const float HIT_PX = .5;
const float CREEP_PX = .25;
#endif
// The warp stretches distances, so steps are shortened to stay outside it.
const float RELAX = .6;
// Marks a pixel block the cone pass found empty.
const uint CONE_EMPTY = 0xFFFFFFFFu;

// The canonical gel: radii, taper and lump phases fitted to the key art's
// silhouette (with the pose in element.ts), to within 2.5% of its size.
const vec3 RADII = vec3(.731, .875, .743);
const float TAPER = .115; // narrow crown, heavy base
const vec3 LUMP_1 = vec3(.708, 5.750, 3.888);
const vec3 LUMP_2 = vec3(1.608, .599, 1.330);
const vec3 LUMP_3 = vec3(3.084, 1.986, .453);
const vec3 LUMP_4 = vec3(5.580, 4.186, 4.307);

// Studio: a softbox up and to the left in front, a panel behind the right
// shoulder. World space, camera looking down -z.
const vec3 KEY = normalize(vec3(-.50, .70, .45));
const vec3 BACK = normalize(vec3(.75, .35, -.55));

// Where the lens is focused; sharpness falls away from here.
const vec2 FOCUS_AT = vec2(-.53, .28);
// Half-width of the silhouette where it is fully out of focus, scene units.
const float SOFT_EDGE = .11;

// Milk in shade and in light, and the dim studio that steep facets look
// into: sampled from the key art.
const vec3 MILK_SHADE = vec3(.70, .79, .91);
const vec3 MILK_LIT = vec3(.93, .955, .99);
const vec3 STUDIO = vec3(.40, .53, .70);

// The pointer swell's reach on the membrane, as 1 / radius^2.
const float SWELL_K = 6.;
// A ring's envelope is skipped past e^-RING_REACH of its height.
const float RING_REACH = 9.;
// Pastels a light pulse splits into as it runs through the liquid.
const vec3 PULSE_LILAC = vec3(.80, .70, 1.);
const vec3 PULSE_ICE = vec3(.86, .96, 1.);
const vec3 PULSE_MINT = vec3(.66, 1., .86);

float hash12(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * .1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float sq(float x) {
  return x * x;
}

// Six plane waves at unequal lengths, spread over the sphere: a cheap random
// field whose zero crossings meander like folds in a wet membrane, with none
// of the lattice a product of sines would show.
const mat3 KA = mat3( .31,  .89,  .42,
                     -.91,  .26,  .71,
                      .46, -.41,  .64);
const mat3 KB = mat3(-.31, -.86,  .98,
                      .85,  .33, -.17,
                     -.52,  .77, -.60);

float waves(vec3 p, vec3 pa, vec3 pb) {
  vec3 a = sin(p * KA + pa);
  vec3 b = sin(p * KB + pb);
  return (a.x + a.y + a.z + b.x + b.y + b.z) * .408;
}

// The same sum, given each wave's argument.
float waveSum(vec3 a, vec3 b) {
  vec3 sa = sin(a);
  vec3 sb = sin(b);
  return (sa.x + sa.y + sa.z + sb.x + sb.y + sb.z) * .408;
}

// The lobes and knobs: four fields of six plane waves read off the body as it
// lies (q0, before the lumps bend it). Every argument is linear in q0, so
// along a ray it is linear in t and the march advances it with a multiply-add
// instead of re-projecting the point onto all 24 waves each step.
struct Waves {
  vec3 l1a, l1b, l2a, l2b, k1a, k1b, k2a, k2b;
};

// Arguments at q0 without their phases; the knobs read q0 scaled by their
// frequency.
Waves waveArgs(vec3 q0) {
  vec3 qk = q0 * u_knobFreq;
  vec3 l1 = q0 * 2.4;
  vec3 l2 = q0.zxy * 4.1;
  vec3 k1 = qk * 3.8;
  vec3 k2 = qk.zxy * 7.6;
  return Waves(l1 * KA, l1 * KB, l2 * KA, l2 * KB, k1 * KA, k1 * KB, k2 * KA, k2 * KB);
}

Waves wavePhases(Waves w) {
  w.l1a += vec3(.4, 2.9, 5.1) + u_blobPh;
  w.l1b += vec3(3.6, 1.2, 4.4) + u_blobPh.yzx;
  w.l2a += vec3(2.2, 5.6, 1.1) + u_blobPh.zxy;
  w.l2b += vec3(.8, 3.9, 2.5) - u_blobPh;
  w.k1a += LUMP_2 + u_seed.yzx + u_morphKnobs + u_knobRock1;
  w.k1b += LUMP_3 + u_seed.zxy;
  w.k2a += LUMP_4 + u_seed;
  w.k2b += LUMP_1 + u_seed.yzx + u_knobRock2;
  return w;
}

// w0 + w1 * t, wave by wave.
Waves waveAlong(Waves w0, Waves w1, float t) {
  return Waves(
    w0.l1a + w1.l1a * t, w0.l1b + w1.l1b * t, w0.l2a + w1.l2a * t, w0.l2b + w1.l2b * t,
    w0.k1a + w1.k1a * t, w0.k1b + w1.k1b * t, w0.k2a + w1.k2a * t, w0.k2b + w1.k2b * t);
}

#ifdef INTERACT
// How far the membrane stands off its rest shape: a swell drawn up toward the
// pointer, and rings running out from wherever it was disturbed. Each ring is
// one soft crest with a slow wake behind it, as a thick liquid carries it.
float membrane(vec3 q) {
  vec3 s = q - u_swell.xyz;
  float r2 = dot(s, s);
#ifdef PRESS
  // The pointer presses in, and the liquid it pushes aside rises in a soft
  // rim around the dent and, faintly, over the rest of the body.
  float h = u_swell.w * (.5 * exp(-SWELL_K * .3 * r2) - 1.4 * exp(-SWELL_K * r2));
#else
  float h = u_swell.w * exp(-SWELL_K * r2);
#endif
  for (int i = 0; i < MAX_RIPPLES; i++) {
    if (i >= u_ripN) break;
    vec4 r = u_rip[i];
    vec4 k = u_ripK[i];
    float x = length(q - r.xyz) - r.w;
    // Well clear of its crest a ring adds nothing the eye could see.
    float a = x * x * k.z * (x > 0. ? 2. : 1.);
    if (a < RING_REACH) h += k.x * exp(-a) * cos(x * k.y);
  }
  return h;
}

// The membrane's slope in gel space, worked out directly so a normal needn't
// evaluate every ring at four more points. Taps e apart blur a ring's slope,
// so each ring is scaled by what such taps would have measured.
vec3 membraneSlope(vec3 q, float e) {
  vec3 s = q - u_swell.xyz;
  float r2 = dot(s, s);
#ifdef PRESS
  vec3 g = u_swell.w * s * (-SWELL_K * .3 * exp(-SWELL_K * .3 * r2) + SWELL_K * 2.8 * exp(-SWELL_K * r2));
#else
  vec3 g = u_swell.w * s * (-2. * SWELL_K * exp(-SWELL_K * r2));
#endif
  for (int i = 0; i < MAX_RIPPLES; i++) {
    if (i >= u_ripN) break;
    vec4 r = u_rip[i];
    vec4 k = u_ripK[i];
    vec3 v = q - r.xyz;
    float len = max(length(v), 1e-5);
    float x = len - r.w;
    float side = x > 0. ? 2. : 1.;
    float a = x * x * k.z * side;
    if (a < RING_REACH) {
      float kx = x * k.y;
      float w = k.y * e * 1.732;
      float blur = w > 1e-3 ? sin(w) / w : 1.;
      float dh = k.x * exp(-a) * (-2. * x * k.z * side * cos(kx) - k.y * sin(kx));
      g += (blur * dh / len) * v;
    }
  }
  return g;
}
#endif

#ifdef FOLDS
// Folds: the membrane gathered into broad, overlapping layers that arch over
// the body and sweep down across its face, each ending in a rolled lip
// (after the droplet study). The layers stack along one leaning axis,
// bent and pinched so they fan out and crowd together like gathered sheet
// rather than running as parallel stripes.
const vec3 FOLD_POLE = vec3(.221, .864, -.452);
const float FOLD_STEPS = 1.4;
const float FOLD_LIP = .2;
const float FOLD_ROLL = .08;

float folds(vec3 p) {
  p += .32 * sin(p.yzx * 1.9 + vec3(.5, 2.1, 4.) + u_foldPh);
  float a = dot(p, FOLD_POLE);
  vec3 q = (FOLD_POLE * a + (p - FOLD_POLE * a) * .5) * 1.6;
  q += .35 * sin(q.yzx * 1.31 + u_foldPh.yzx);
  float g = dot(sin(q), cos(q.yzx * 1.07 + .7)) * .48;
  float bend = .3 * sin(dot(p, vec3(1.7, -1.1, .6)) + u_foldPh.x) +
    .2 * sin(dot(p, vec3(-.6, 2.3, 1.4)) + 2. + u_foldPh.z);
  // The height climbs along the axis so the steps cut it into long layers,
  // not closed rings; the climb itself is taken back off at the end.
  float climb = .72 * (a + bend);
  float h = (g + climb) * FOLD_STEPS;
  float i = floor(h);
  float x = (h - i - .5) / FOLD_LIP;
  float st = (i + smoothstep(-1., 1., x) + FOLD_ROLL * x * exp(-.7 * x * x)) / FOLD_STEPS;
  // Lips bite in places; elsewhere the folds stay soft swells.
  float bite = .55 + .45 * smoothstep(-.45, .3, dot(sin(p * 1.7 + vec3(1, 3, 5)), vec3(.4)));
  return mix(g + climb, st, bite) - climb;
}
#endif

// How far beyond a displacement's reach this point lies, 0 within it to 1
// well clear. Displacements ease from their exact height to their full reach
// across this band rather than switching: a hard switch leaves a seam in
// the field, and wherever a normal tap straddles it the surface shades as a
// flat false ring. The band starts clear of the reach, so every hit and its
// normal taps read the exact height, and easing toward the full reach only
// ever shortens steps, never overshoots.
float outside(float d, float reach) {
  return smoothstep(reach + .02, reach + .12, d);
}

// Everything but the pointer's membrane.
float mapShape(vec3 q0, Waves w) {
  // Knobs and folds read the body as it lies, before any of the bending
  // below: bent space would stretch them unevenly over the lumps.
  vec3 q = q0;
  q.xz *= 1. + TAPER * (1. - u_round) * q.y;
  // Slime has no small hard lumps: the finer warps melt as it gets gloopier.
  float melt = clamp(1. - .4 * u_gloop, .2, 1.);
  // Each warp bends the space the next one reads, so the lumps fold into
  // each other instead of stacking as ripples. The big ones only rock about
  // their fitted phase (and drift with the morph); the smallest crawl. The
  // broadest warp stretches the whole body, so lumpiness barely grows it:
  // more lumps means more peaks, not a longer shape.
  q += (.075 + .03 * u_lumps) * sin(q.yzx * 2.3 + LUMP_1 + u_seed + u_morph + u_rock1);
  q += u_lumps * .0507 * sin(q.zxy * 4.7 + LUMP_2 + u_seed.yzx * 1.3 + u_morph.yzx * .7 + u_rock2);
#ifndef LOD
  // The two finest warps are a pixel or two tall: low power drops them.
  q += u_lumps * melt * .0376 * sin(q.yzx * 9.5 + LUMP_3 + u_seed.zxy * 1.7 + u_rock3);
  q += u_lumps * melt * melt * .0180 * sin(q.zxy * 17. + LUMP_4 + u_seed * 2.3 + u_crawl);
#endif
  vec3 radii = mix(RADII, vec3(.783), u_round);
  float k0 = length(q / radii);
  float k1 = length(q / (radii * radii));
  float d = k0 * (k0 - 1.) / max(k1, 1e-3);

  // Gloop: soft lobes of a similar size all round, sliding slowly over the
  // body, so it reads as an irregular sphere that bulges and slumps like
  // something thick rather than holding a shape.
  d -= u_lobes * (.085 * waveSum(w.l1a, w.l1b) + .03 * waveSum(w.l2a, w.l2b));

  // Knobs: rounded swellings at two sizes, pushed out of the surface with
  // flats between. They are smooth all over, so they knuckle the outline
  // without creasing the form.
  float k1w = waveSum(w.k1a, w.k1b);
  float k2w = waveSum(w.k2a, w.k2b);
  d -= u_knobs * (.06 * smoothstep(-.3, .9, k1w) + .02 * smoothstep(-.2, .9, k2w) - .03);

#ifdef FOLDS
  // The folds only reach a thin shell, so further out the march takes their
  // full height as given instead of evaluating them.
  float foldReach = 2. * u_folds;
  float fs = outside(d, foldReach);
  d -= fs < 1. ? mix(u_folds * folds(q0), foldReach, fs) : foldReach;
#endif
  return d;
}

float mapAt(vec3 q0, Waves w) {
  float d = mapShape(q0, w);
#ifdef INTERACT
  // The same for the swell and ripples: further out the march takes their
  // largest height as given instead of evaluating every ring.
  if (u_ripMax > 0.) {
    float rs = outside(d, u_ripMax);
    d -= rs < 1. ? mix(membrane(q0), u_ripMax, rs) : u_ripMax;
  }
#endif
  return d;
}

// map() along one ray, with everything linear in t set up once: q0 and the
// wave arguments advance with a multiply-add per step.
struct Ray {
  vec3 q0, dq;
  Waves w0, dw;
};

Ray rayFrom(vec3 ro, vec3 rd) {
  vec3 q0 = u_body * ro;
  vec3 dq = u_body * rd;
  return Ray(q0, dq, wavePhases(waveArgs(q0)), waveArgs(dq));
}

float mapRay(Ray r, float t) {
  return mapAt(r.q0 + r.dq * t, waveAlong(r.w0, r.dw, t));
}

float shapeAt(vec3 p) {
  vec3 q0 = u_body * p;
  return mapShape(q0, wavePhases(waveArgs(q0)));
}

vec3 normal(vec3 p, float e) {
  const vec2 k = vec2(1, -1);
  vec3 n = k.xyy * shapeAt(p + k.xyy * e) + k.yyx * shapeAt(p + k.yyx * e) +
    k.yxy * shapeAt(p + k.yxy * e) + k.xxx * shapeAt(p + k.xxx * e);
#ifdef INTERACT
  // The four taps measure 4e times the gradient; the membrane adds its own.
  if (u_ripMax > 0.) n -= 4. * e * (membraneSlope(u_body * p, e) * u_body);
#endif
  return normalize(n);
}
`;
  var Ts = `
${Zo}

vec3 stageBackdrop(vec2 uv) {
  vec2 fragUv = (uv * u_unit + u_center) / u_res;
  vec2 screenUv = clamp(vec2(fragUv.x, 1. - fragUv.y), 0., 1.);
  return sampleTonalGradient(screenUv, u_pointer - .5);
}

vec3 backdrop(vec2 uv) {
  return stageBackdrop(uv);
}

// hash13 for a lattice corner whose fract(corner * .1031) is already known.
// Across a cube's eight corners each axis takes only two such values, so
// noise() works them out once instead of per corner.
float hashCorner(vec3 h) {
  h += dot(h, h.zyx + 31.32);
  return fract((h.x + h.y) * h.z);
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * f * (f * (f * 6. - 15.) + 10.);
  vec3 a = fract(i * .1031);
  vec3 b = fract((i + 1.) * .1031);
  return mix(
    mix(mix(hashCorner(a), hashCorner(vec3(b.x, a.yz)), u.x), mix(hashCorner(vec3(a.x, b.y, a.z)), hashCorner(vec3(b.xy, a.z)), u.x), u.y),
    mix(mix(hashCorner(vec3(a.xy, b.z)), hashCorner(vec3(b.x, a.y, b.z)), u.x), mix(hashCorner(vec3(a.x, b.yz)), hashCorner(b), u.x), u.y),
    u.z);
}

// Where the surface is frosted rather than wet: patches fixed to the body,
// with ragged borders.
float frost(vec3 p) {
  float n = .6 * noise(p * 2.7 + u_seed + 7.3) + .4 * noise(p * 6.9 + 3.1);
  return smoothstep(-.07, .07, n - mix(.82, .18, u_frost));
}

// Inside the body: zones where the liquid is pressed cloudy, and the folded
// veils that hang in it. The liquid is thick, so both drift and fold over
// slowly rather than swirl. Returns (cloud, veil).
vec2 inside(vec3 p) {
  p += u_flow.xyz + u_flow.w * sin(p.zxy * 2.3 + u_flowPh);
  float n = noise(p * 2.9 + u_seed.yzx + 19.);
  float r = 1. - abs(2. * noise(p * 5.7 + 3.5 * n + 5.) - 1.);
  float r2 = r * r;
  return vec2(smoothstep(.40, .66, n), r2 * r2);
}

// What one colour of light meets on its way in: a shallow and a deep sample
// along its refracted path, the deep one seen through the shallow. reach
// stretches the path, since the colours that bend least also travel furthest.
vec2 within(vec3 po, vec3 dir, float reach) {
  vec2 a = inside(po + dir * (.13 * reach));
  vec2 b = inside(po + dir * (.38 * reach));
  return vec2(1. - (1. - .6 * a.x) * (1. - .45 * b.x), a.y + .6 * (1. - .6 * a.x) * b.y);
}

// Pastel sheen as a tint on the milk: lilac one way, mint the other.
vec3 sheen(vec3 po, float ndv) {
#ifdef LOD
  // Low power keeps the sheen's turn with the viewing angle, not its drift.
  float x = .3 * ndv;
#else
  float x = .45 * waves(po * 2.4, vec3(2.5, .7, 4.2) + u_sheenRock.x, vec3(.9, 3.3, 5.8) + u_sheenRock.y) + .3 * ndv;
#endif
  return 1. + u_irid * vec3(.025, -.04, .012) * cos(TAU * x);
}

// The membrane is a thin film, so what it mirrors picks up colour that shifts
// with the viewing angle and with how thick the film runs here.
vec3 film(vec3 po, float ndv) {
#ifdef LOD
  float th = 1.3 * (1. - ndv);
#else
  float th = .45 * waves(po * 1.7, vec3(1.2, 3.4, .3) + u_flowPh, vec3(4.6, .8, 2.2)) + 1.3 * (1. - ndv);
#endif
  return 1. + u_film * .5 * cos(TAU * (th + vec3(0., .33, .67)));
}

// What the studio looks like in a mirror. The lights are far brighter than
// anything else in it, so even a few percent of reflection reads as white.
vec3 env(vec3 d) {
  vec3 col = mix(u_bottom * .9, mix(u_top, vec3(1), .55), smoothstep(-.6, .9, d.y));
  // Toned with u_spec: at full strength the softboxes read as hard, glossy
  // highlights, which tips the membrane toward plastic.
  float lights = .35 + .65 * u_spec;
  col += 5. * lights * smoothstep(.955, .995, dot(d, KEY));
  col += vec3(.9, .96, 1) * 1.6 * lights * smoothstep(.7, .97, dot(d, BACK));
  return col;
}

// How much of the panel's light reaches this point: onto surfaces that
// face it, and through the body on the side nearest it, which glows
// whichever way its surface faces.
float backlit(vec3 n, vec3 po) {
  vec3 p = po * u_rot;
  return clamp(smoothstep(-.3, .85, dot(n, BACK)) + .85 * smoothstep(.05, .7, dot(p.xy, vec2(.906, .423))), 0., 1.);
}

#ifdef POCKETS
// Deep pockets: lenses where the liquid runs thick and the view sinks into
// navy. They are stretched along the body like the folds, so they read as
// long pools tucked under the lips rather than round blots.
float pockets(vec3 p) {
  vec3 w = p * vec3(1, .45, 1);
  w += .1 * sin(w.zxy * 3.7 + u_seed + vec3(4.1, 1.2, 2.6));
  float a = noise(w * 3.6 + u_seed.yzx + vec3(23.1, 7.7, 13.3));
  return .72 * a + .28 * noise(w * 7.4 + vec3(3.3, 41.2, 9.1) + 1.4 * a);
}

// Where the field opens into a pocket: at canonical strength about a third
// of the body, more and larger as u_deep rises.
float pocketFloor() {
  return .64 - .1 * clamp(u_deep, 0., 2.);
}

// The pocket's own blue: pale at its rim, deepest at its core.
vec3 pocketColour(float core) {
  return mix(mix(STUDIO, u_deepTint, .5), u_deepTint * .8, core);
}
#endif

// Clear windows: where the liquid runs clear and only the membrane shows,
// so the body stays light. They drift with the liquid, so no part of it
// reads as solid for long.
// Clarity past its old ceiling: the windows run clearer still, open into
// the backlit side too, and the milk and studio grey thin everywhere, so the
// light areas read as thin jelly against the deep pockets.
float clearExtra() {
  return max(u_clarity - 1., 0.);
}

float clearing(vec3 p) {
  float a = noise(p * 1.9 + u_flow.xyz * .8 + u_seed.zxy + vec3(5.3, 17.9, 2.2));
  float n = .7 * a + .3 * noise(p * 4.3 + vec3(11.4, 3.8, 27.5) + 1.2 * a);
  float lo = .66 - .3 * min(u_clarity, 1.);
  return smoothstep(lo, lo + .16, n) * min(u_clarity * 2., 1.);
}

// The gel as the lens sees it out of focus: no detail, only milk lit from
// behind. Returns (milkHazeCol, veilAlpha) so main() can composite cleanly
// over the shared tonal gradient + particle stage.
vec4 hazeLayer(vec3 n, vec3 po, vec3 rd, float ndv) {
  float lit = backlit(n, po);
  // Out of focus the lumps still model: lit on the side that faces the
  // softbox, and the pressed zones show through as soft shapes.
  float press = inside(po + (u_rot * rd) * .25).x;
  float veil = .60 + .40 * lit + .16 * dot(n, KEY) + .35 * u_stress * (press - .25);
  veil *= 1. - (.5 + .6 * clearExtra()) * clearing(po + (u_rot * rd) * .2);
  veil = clamp(veil * u_milk, 0., .97);
  vec3 milkCol = mix(MILK_SHADE, MILK_LIT, clamp(lit + .3, 0., 1.)) * sheen(po, ndv);
#ifdef POCKETS
  // Out of focus a pocket is only a soft shadow of blue in the milk.
  float pf = pockets(po + (u_rot * rd) * .3 + u_flow.xyz * .5);
  float pk = smoothstep(pocketFloor(), pocketFloor() + .22, pf) * min(u_deep, 1.);
  milkCol = mix(milkCol, pocketColour(.3), .55 * pk * smoothstep(.05, .5, ndv));
#endif
  return vec4(milkCol, veil);
}

vec3 sharp(vec3 po, vec3 n, vec3 rd, vec2 uv, float keep) {
  // Detail lives in gel space so it turns with the body.
  vec3 no = u_rot * n;
  vec3 nd = no;

  // Where the backlight floods the body the liquid stays milky, so the
  // windows open mostly on the shadowed, front-lit side.
  float lit = backlit(n, po);
  float extra = clearExtra();
  float clear = clearing(po) * keep * (1. - (.55 - .9 * extra) * lit);
  // Frost and milk give way in the clear windows, where the liquid is thin.
  float rough = frost(po) * keep * (1. - .6 * clear);

#ifdef POCKETS
  // The membrane sinks a little over each pocket, so its edge rolls over as
  // a lip that catches the light.
  const vec2 kp = vec2(1, -1);
  const float pe = .02;
  float pa = pockets(po + kp.xyy * pe);
  float pb2 = pockets(po + kp.yyx * pe);
  float pc = pockets(po + kp.yxy * pe);
  float pd = pockets(po + kp.xxx * pe);
  float pSurf = .25 * (pa + pb2 + pc + pd);
  vec3 pGrad = (kp.xyy * pa + kp.yyx * pb2 + kp.yxy * pc + kp.xxx * pd) / (4. * pe);
  float floorAt = pocketFloor();
  float dent = smoothstep(floorAt - .1, floorAt + .03, pSurf) * min(u_deep, 1.) * keep;
  vec3 pTan = pGrad - no * dot(pGrad, no);
  nd += pTan * (.045 * dent);
  // Only the edge above a pool rolls into a lit lip; the pool runs out
  // softly below it, as the liquid settles.
  float above = smoothstep(.1, .7, dot(normalize(pTan + 1e-5), normalize(u_rot * vec3(0, -1, 0))));
  float lip = exp(-sq((pSurf - floorAt + .02) / .025)) * above *
    smoothstep(.1, .5, -dot(n, rd)) * min(u_deep, 1.) * keep;
#endif

  vec3 ndo = normalize(nd);
  nd = ndo * u_rot;

  float ndv = clamp(-dot(nd, rd), 0., 1.);

  // Clear ice: the backdrop, pulled toward wherever the surface leans, and
  // greyed by the dim studio it also lets through, most of all on steep
  // facets.
  vec3 col = mix(backdrop(uv - nd.xy * .3), STUDIO, (.34 + .26 * smoothstep(.25, .85, 1. - ndv)) * (1. - (.65 + .6 * extra) * clear) * (1. - .6 * extra));

  // Light bends on the way in, each colour by its own amount (more than
  // real ice would), so what lies inside is seen three times, a little apart:
  // cloud edges and veils fringe into pastel, and all of it slides against
  // the surface as the body turns.
  vec3 rdo = u_rot * rd;
  vec3 tgr = refract(rdo, ndo, .76);
  vec2 cg = within(po, tgr, 1.);
#ifdef LOD
  vec2 cr = cg;
  vec2 cb = cg;
#else
  vec2 cr = within(po, refract(rdo, ndo, .76 + .07 * u_disp), 1.18);
  vec2 cb = within(po, refract(rdo, ndo, .76 - .07 * u_disp), .85);
#endif
  // Thin edges have no inside to speak of, and frost hides it.
  float deep = smoothstep(.05, .6, ndv) * (1. - .6 * rough) * keep;
  vec3 sh = sheen(po, ndv);
  vec3 milk = mix(MILK_SHADE, MILK_LIT, lit) * sh;
  col = mix(col, milk, clamp(vec3(cr.x, cg.x, cb.x) * (.6 * u_stress * deep * (1. - (.7 + .6 * extra) * clear) * (1. - .6 * extra)), 0., .95));
  col += (vec3(cr.y, cg.y, cb.y) - .12) * ((.35 + .65 * lit) * .34 * u_inner * deep);

  // Milk: thicker where the backlight reaches, in drifting clouds, and
  // embossed by the folds so each has a lit side and a clear side.
  float cloud = waves(po * 2.2 + u_flow.xyz * .6, vec3(4.1, 1.3, 2.9), vec3(.4, 5.5, 3.1));
  float facet = dot(nd - n, KEY);
  // The lower body is the cloudiest, as if the milk had settled.
  float veil = .6 * lit + .2 * cloud + .5 * facet + .3 * smoothstep(.1, -.5, (po * u_rot).y);
  // Frost scatters white of its own, in soft mottles.
#ifdef LOD
  veil += rough * .34;
#else
  veil += rough * (.34 + .16 * (noise(po * 13. + 5.) - .5));
#endif
#ifdef POCKETS
  // Seen through the membrane, a little way in, so the pool slides under
  // its lip as the body turns, and drifts with the liquid.
  float pDeep = pockets(po + tgr * .3 + u_flow.xyz * .5);
  float pocket = smoothstep(floorAt, floorAt + .16, pDeep) *
    min(u_deep, 1.) * smoothstep(.1, .55, ndv) * (1. - .4 * rough) * (1. - .25 * clear) * keep;
  // Thick liquid holds no milk: the pool stays clear down to its blue.
  veil -= .8 * pocket;
#endif
  veil *= (1. - (.8 + .45 * extra) * clear) * (1. - .9 * extra);
  veil = clamp(veil * u_milk, 0., .96);
  col = mix(col, mix(MILK_SHADE, MILK_LIT, clamp(lit + .6 * facet, 0., 1.)) * sh, veil);
#ifdef POCKETS
  col = mix(col, pocketColour(smoothstep(floorAt + .05, floorAt + .22, pDeep)), .75 * pocket);
#ifndef LOD
  // Threads of light hang in the deep, folding slowly with the liquid.
  float th = 1. - abs(waves((po + tgr * .36) * 6.5 + u_flow.xyz, vec3(.9, 2.8, 4.4) + u_flowPh, vec3(3.7, 1.5, .2)));
  th *= th;
  th *= th;
  th *= th;
  col += vec3(.62, .82, 1.) * th * pocket * .35 * u_inner;
#endif
#endif

  // Frost blurs what it mirrors, so it reflects off the smooth form, dimly.
  vec3 nr = normalize(mix(nd, n, .7 * rough));
  float fres = pow(1. - ndv, 5.);
  vec3 tint = film(po, ndv);
  col = mix(col, env(reflect(rd, nr)) * tint, (.04 + .96 * fres) * (1. - .5 * rough));

  // Crests catch the softbox as hairlines of light, wherever they face it.
  float crest = 0.;
#ifdef POCKETS
  crest += .6 * lip;
#endif
  float line = crest * keep * (.3 + .7 * smoothstep(-.3, .7, dot(n, KEY)));
  col = mix(col, vec3(1), .85 * min(line, 1.));

  vec3 hv = normalize(KEY - rd);
  col += u_spec * pow(max(dot(nr, hv), 0.), 260.) * (1. - .7 * rough) * tint;
  // Slime is wet all over: a broad sheen of the softbox rolls over each swelling.
  col += u_spec * u_gloop * .1 * pow(max(dot(nr, hv), 0.), 36.) * (1. - .7 * rough) * tint;
  col += .1 * rough * max(dot(n, KEY), 0.);

#ifdef INTERACT
  // A click sends a pulse of light through the liquid with its wave. It is
  // read a little beneath the membrane, so it slides against the ring that
  // carries it, and each colour runs a little apart.
  vec3 pulse = vec3(0);
  vec3 under = po + tgr * .12;
  for (int i = 0; i < MAX_RIPPLES; i++) {
    if (i >= u_ripN) break;
    float g = u_ripK[i].w;
    if (g <= 0.) continue;
    float x = length(under - u_rip[i].xyz) - u_rip[i].w;
    vec3 xs = x + vec3(.045, 0., -.045);
    pulse += g * exp(-xs * xs * u_ripK[i].z * 1.6);
  }
  col += (pulse.r * PULSE_LILAC + pulse.g * PULSE_ICE + pulse.b * PULSE_MINT) * (.3 + .7 * veil) * (.4 + .6 * keep);
#endif
  return col;
}
`;
  var As = `
uniform highp usampler2D u_cone; // cone pass result per pixel block
uniform vec2 u_coneOrigin;       // device px of the block grid's corner

out vec4 outColor;

void main() {
  // The cone pass proved nothing in this block can come near the gel, or
  // else how far along every ray in it stays clear.
  uint cone = texelFetch(u_cone, ivec2(gl_FragCoord.xy - u_coneOrigin) / CONE, 0).r;
  if (cone == CONE_EMPTY) discard;

  vec2 uv = (gl_FragCoord.xy - u_center) / u_unit;
  float px = 1. / u_unit;

  vec3 premul = vec3(0);
  float outA = 0.;

  vec3 ro = vec3(0, 0, CAM);
  vec3 rd = normalize(vec3(uv, -CAM));

  float b = dot(ro, rd);
  float disc = b * b - (CAM * CAM - u_bound * u_bound);
  if (disc > 0.) {
    float sq = sqrt(disc);
    // Nothing before the cone's clear stretch can be a hit or the halo, so
    // the march starts where it ends.
    float t = max(-b - sq, uintBitsToFloat(cone));
    float tFar = -b + sq;
    float dMin = 1e5;
    float tMin = t;
    bool hit = false;
    bool spent = true;
    float dLast = 1e5;
    Ray ray = rayFrom(ro, rd);
    for (int i = 0; i < STEPS; i++) {
      float d = mapRay(ray, t);
      dLast = d;
      if (d < dMin) {
        dMin = d;
        tMin = t;
      }
      if (d < HIT_PX * px) {
        hit = true;
        spent = false;
        break;
      }
      // Rays skimming a silhouette or a fold's lip creep in ever smaller
      // steps; a floor of a fraction of a pixel keeps them moving.
      t += max(d * RELAX, CREEP_PX * px);
      if (t > tFar) {
        spent = false;
        break;
      }
    }
    // A ray that runs out of steps this close is lying along the surface as
    // far as the eye can tell; dropping it would cut a hole in the gel.
    if (spent && dLast < 6. * px) {
      hit = true;
    }

    float blur = min(u_focus * smoothstep(.55, 1.3, length(uv - FOCUS_AT)), 1.);
    float soft = max(px, blur * sqrt(blur) * SOFT_EDGE);
    if (hit || dMin < soft) {
      // A near miss is shaded where the ray came closest, so the halo
      // carries the silhouette's own colour.
      vec3 p = ro + rd * (hit ? t : tMin);
      vec3 n = normal(p, 2. * px);
      vec3 po = u_rot * p;
      float ndv = clamp(-dot(n, rd), 0., 1.);
      // Distance in from the silhouette, as on a sphere of the gel's size.
      float edge = hit ? .7 * (1. - sqrt(1. - ndv * ndv)) : -dMin;

      // Blur can't show the outline's kinks, so the haze is shaded on the
      // form as a wide sample sees it.
      float melt = hit ? max(smoothstep(.45, 1., blur), 1. - smoothstep(0., soft, edge)) : 1.;
      // In focus and in from the edge the haze has no weight, so skip it.
      vec4 hz = vec4(0);
      if (melt > 0.) {
#ifdef LOD
        hz = hazeLayer(n, po, rd, ndv);
#else
        hz = hazeLayer(blur > .3 ? normal(p, .07) : n, po, rd, ndv);
#endif
      }
      vec3 sharpCol = vec3(0.);
      if (melt < .995) {
        float keep = 1. - smoothstep(.2, 1., blur);
        sharpCol = sharp(po, n, rd, uv, keep);
      }
      float edgeCov = smoothstep(-soft, soft, edge);
      float wSharp = edgeCov * (1. - melt);
      float wHaze = edgeCov * melt * hz.w;
      float gelA = wSharp + wHaze;
      vec3 gelPremul = wSharp * sharpCol + wHaze * hz.rgb;
      premul = gelPremul + premul * (1. - gelA);
      outA = gelA + outA * (1. - gelA);
    }
  }

  if (outA <= .0005) discard;

  // Triangular dither + tactile surface grain over the gel so its milky body
  // matches Pass 0's photographic grain tooth without double-graining backdrop.
  float n1 = hash12(gl_FragCoord.xy + u_grainFrame * 17.13);
  float n2 = hash12(gl_FragCoord.xy + 91.7 + u_grainFrame * 29.71);
  premul = clamp(premul + (n1 + n2 - 1.) * (u_grain * .55 + 1. / 255.) * outA, 0., outA);

  outColor = vec4(premul, outA);
}
`;
  var Ps = `
// One ray per CONE x CONE block of pixels, widened into a cone that holds
// every pixel ray in the block. Where the cone stays clear of anything the
// gel pass reacts to (a hit, the soft halo, a ray running out of steps close
// by), every pixel in the block would be discarded, so the gel pass skips
// them without marching.
uniform vec2 u_coneOrigin; // device px of the block grid's corner

out uint outCone;

// The march trusts map() to change no faster than 1 / RELAX per unit; the
// cone trusts it a little less, so it never clears what the march would hit.
const float CONE_L = 2.;
const int CONE_STEPS = 64;

void main() {
  float px = 1. / u_unit;
  vec2 uv = (u_coneOrigin + (floor(gl_FragCoord.xy) + .5) * float(CONE) - u_center) / u_unit;
  // The furthest a pixel ray in the block leans from the cone's axis, as a
  // radius per unit along it.
  float lean = float(CONE) * .7072 * px;
  float k = lean / CAM * 1.01;
  float blur = min(u_focus * smoothstep(.55, 1.3, length(uv - FOCUS_AT) + lean), 1.);
  float reach = max(max(px, blur * sqrt(blur) * SOFT_EDGE), 6. * px) * 1.01;

  vec3 ro = vec3(0, 0, CAM);
  vec3 rd = normalize(vec3(uv, -CAM));
  float bound = u_bound + k * (CAM + u_bound);
  float b = dot(ro, rd);
  float disc = b * b - (CAM * CAM - bound * bound);
  uint result = CONE_EMPTY;
  if (disc > 0.) {
    float sq = sqrt(disc);
    float t = max(-b - sq, 0.);
    float tFar = -b + sq;
    bool clear = false;
    Ray ray = rayFrom(ro, rd);
    for (int i = 0; i < CONE_STEPS; i++) {
      float d = mapRay(ray, t);
      // How far the whole cone can advance and stay beyond reach.
      float s = ((d - reach) / CONE_L - k * t) / (1. + k);
      if (s <= 0.) break;
      t += s;
      if (t > tFar) {
        clear = true;
        break;
      }
    }
    if (!clear) result = floatBitsToUint(t);
  }
  outCone = result;
}
`;
  var yo = 120;
  var it = Math.PI * 2;
  var Rs = it / yo;
  var vo = 9;
  var Ls = 0.5;
  var Cs = 0.373;
  var Os = 0.02;
  var Is = 0.045;
  var Ds = 0.521;
  var Fs = -0.097;
  var Ns = -0.74;
  var Oe = 6;
  var Us = 0.11;
  var We = 0.8;
  var hn = Oe * We / Math.sqrt(Oe * Oe - We * We);
  var po = Math.acos(We / Oe);
  function go(e) {
    const t = Math.hypot(e, Oe), o = -Oe * Oe / t, s = -o - Math.sqrt(Math.max(0, o * o - (Oe * Oe - We * We)));
    return Math.atan2(e / t * s, Oe - Oe / t * s);
  }
  var Mt = 0.9 * hn;
  var qt = go(Mt);
  var Nt = (qt - go(Mt - 1e-4)) / 1e-4;
  var Xs = Mt + 2 * (po - qt) / Nt;
  function zs(e) {
    if (e <= Mt) return go(e);
    if (e >= Xs) return po;
    const t = e - Mt;
    return qt + Nt * t - Nt * Nt / (4 * (po - qt)) * t * t;
  }
  var Bs = 1.5;
  var qs = 0.12;
  var Ys = 0.035;
  var ao = 0.3;
  var Gs = 0.22;
  var Hs = 0.08;
  var Yo = 35;
  var Ws = 0.135;
  var Ks = 2e-3;
  var Vs = 2e-3;
  var $s = 0.22;
  var js = 0.025;
  var Zs = 55;
  var Qs = 0.45;
  var Go = 1 / 120;
  var Ho = { height: 0.011, wavelength: 0.36, speed: 0.42, damp: 1.3, life: 2.2, glow: 0.04 };
  var Js = { height: 0.032, wavelength: 0.55, speed: 0.6, damp: 0.95, life: 3, glow: 0.5 };
  var mo = 1;
  function Wo(e, t) {
    const o = {};
    for (const s of Ss) o[s] = e.getUniformLocation(t, s);
    return o;
  }
  function Ko(e) {
    return { key: Ms(e), create(t) {
      const o = Ut(t, "gemini-4-element-hydrogen:gel", co, Es(e)), s = Ut(t, "gemini-4-element-hydrogen:cone", co, ks(e)), l = t.createTexture(), c = t.createFramebuffer();
      if (!o || !s || !l || !c) return o && t.deleteProgram(o), s && t.deleteProgram(s), l && t.deleteTexture(l), c && t.deleteFramebuffer(c), null;
      t.bindTexture(t.TEXTURE_2D, l), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.bindTexture(t.TEXTURE_2D, null);
      const h = Wo(t, o);
      return t.useProgram(o), t.uniform1i(h.u_cone, mo), { program: o, bgLocs: on(t, o), u: h, cone: s, coneU: Wo(t, s), coneTex: l, coneFbo: c, coneW: 0, coneH: 0 };
    }, dispose(t, o) {
      t.deleteProgram(o.program), t.deleteProgram(o.cone), t.deleteTexture(o.coneTex), t.deleteFramebuffer(o.coneFbo);
    } };
  }
  function ea(e, t, o, s) {
    o <= t.coneW && s <= t.coneH || (t.coneW = Math.max(t.coneW, Math.ceil(o / 64) * 64), t.coneH = Math.max(t.coneH, Math.ceil(s / 64) * 64), e.bindTexture(e.TEXTURE_2D, t.coneTex), e.texImage2D(e.TEXTURE_2D, 0, e.R32UI, t.coneW, t.coneH, 0, e.RED_INTEGER, e.UNSIGNED_INT, null), e.bindTexture(e.TEXTURE_2D, null), e.bindFramebuffer(e.FRAMEBUFFER, t.coneFbo), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, t.coneTex, 0));
  }
  function ta(e, t) {
    e[0] = 0;
    for (let o = 1; o <= vo; o++) e[o] = Rs * o * t % it;
  }
  function oa(e, t, o, s) {
    const l = t * it, c = Math.sin(l);
    e[0] = 0;
    for (let h = 1; h <= vo; h++) {
      const i = h * s * o / yo, b = Math.round(i);
      e[h] = (b * l + (i - b) * c) % it;
    }
  }
  function ut(e) {
    return e[0] * 0.3 + e[1] * 0.59 + e[2] * 0.11;
  }
  function io(e, t, o) {
    const s = Math.max(0, Math.min(1, (o - e) / (t - e)));
    return s * s * (3 - 2 * s);
  }
  function ht(e, t, o) {
    const s = Math.cos(o), l = Math.sin(o), c = (t + 1) % 3, h = (t + 2) % 3;
    for (let i = 0; i < 9; i += 3) {
      const b = e[i + c], p = e[i + h];
      e[i + c] = b * s + p * l, e[i + h] = p * s - b * l;
    }
  }
  function Vo(e, t, o, s) {
    for (let l = 0; l < 3; l++) for (let c = 0; c < 3; c++) s[l * 3 + c] = e[l * 3] * t[c] + e[l * 3 + 1] * t[3 + c] + e[l * 3 + 2] * t[6 + c];
    o.set(s);
  }
  function na(e) {
    const t = e.interaction !== "off", o = e.interaction === "orbit", s = { pockets: e.deep_pockets > 0, folds: e.folds > 0, interact: t, press: e.pointer_press, lod: false }, l = Ko(s), c = Ko({ ...s, lod: true }), h = e.focal_scale / 100, i = e.focal_offset_x / 100, b = e.focal_offset_y / 100, p = e.motion_speed / 35, w = e.seed === 12 ? 0 : e.seed, m = w * 1.618, x = w * 2.399, E = w * 3.141, d = e.lumpiness / 50, M = e.knobs / 50, A = 100 / e.knob_size, k = e.frost / 100, S = e.stress / 50, f = e.refraction / 50, v = e.milkiness / 50, _ = e.iridescence / 50, R = e.membrane_sheen / 100 * 0.6, D = e.roundness / 100, O = e.gloopiness / 50, $ = e.clarity / 75, H = e.folds / 50 * Ys, Z = e.specularity / 100, ue = e.dispersion / 50, pe = e.deep_pockets / 50, ae = e.soft_focus / 70, fe = e.grain / 100 * 0.1, oe = e.morph / 100, N = oe * Bs, q = e.inner_flow / 50, Q = t ? e.interaction_effect / 50 : 0, xe = Hs * (e.hover_ripples / 50) * Q, ce = e.pointer_press ? Ws : 1, J = e.hover_ripples / 50 * Q, F = e.click_wave / 50 * Q, G = e.viscosity / 100, ee = 4 + 5 * G, be = 2.5 + 4 * G, we = 1.3 - 0.6 * G, P = 0.7 + 0.6 * G, V = 0.85 + 0.3 * G, g = xs(), n = [0.8, 0.8, 0.8], a = { dt: 0, cursorInside: false, targetPtrX: 0.5, targetPtrY: 0.5, isDragging: false, interactionEnabled: t, tiltScale: t ? e.interaction_tilt / 55 : 0, invertTilt: e.interaction_tilt_invert, effectScale: t ? e.interaction_effect / 65 : 0, width: 1, height: 1, shiftNdcX: 0, shiftNdcY: 0, scale: h, boundRadii: n }, u = new Float64Array(vo + 1), y = new Float32Array(9), T = new Float32Array(9), I = new Float32Array(9), C = new Float32Array(9);
    let L = 1, X = 0, z = 0, ne = 1, me = 1, ve = 0, Me = 0, ke = 0, Ie = 0, De = 0, Pe = 0, ze = 0, rt = false, Ke = 0, Be = 0;
    const Ue = new Float64Array(6), Fe = new Float64Array(6), tt = Array.from({ length: xt }, () => ({ x: 0, y: 0, z: 0, age: 1 / 0, life: 1, speed: 0, height: 0, wavelength: 1, damp: 0, glow: 0 })), Qe = new Float32Array(xt * 4), Je = new Float32Array(xt * 4);
    let U = 0, te = 0;
    const j = new Float64Array(6);
    function Ee(r, W) {
      const se = Math.hypot(r, W), le = zs(se), ye = Math.sin(le) / Math.max(se, 1e-6) * We, ie = r * ye, re = W * ye, _e = Math.cos(le) * We;
      return j[0] = y[0] * ie + y[3] * re + y[6] * _e, j[1] = y[1] * ie + y[4] * re + y[7] * _e, j[2] = y[2] * ie + y[5] * re + y[8] * _e, j[3] = ie, j[4] = re, j[5] = _e, 1 - io(hn, 1.6 * We, se);
    }
    function Se(r, W, se, le) {
      let ye = W, ie = -1;
      for (let _e = W; _e < se; _e++) {
        const Ae = tt[_e], Ce = Ae.age / Ae.life;
        Ce > ie && (ie = Ce, ye = _e);
      }
      const re = tt[ye];
      re.x = j[0], re.y = j[1], re.z = j[2], re.age = 0, re.life = r.life, re.speed = r.speed * we, re.height = r.height * le, re.wavelength = r.wavelength * V, re.damp = r.damp * P, re.glow = r.glow * le;
    }
    function he() {
      U = 0, te = 0;
      for (const r of tt) {
        if (r.age >= r.life) continue;
        const W = r.age * r.speed, se = (1 - r.age / r.life) ** 2, le = r.height * io(0, 0.12, r.age) * Math.exp(-r.damp * r.age) * se / Math.sqrt(1 + W / r.wavelength), ye = r.glow * io(0, 0.05, r.age) * Math.exp(-1.6 * r.age) * se;
        if (r.age > 0.12 && Math.abs(le) * (it / r.wavelength) < Ks && ye < Vs) {
          r.age = r.life;
          continue;
        }
        const ie = 0.55 * r.wavelength, re = U * 4;
        Qe[re] = r.x, Qe[re + 1] = r.y, Qe[re + 2] = r.z, Qe[re + 3] = W, Je[re] = le, Je[re + 1] = it / r.wavelength, Je[re + 2] = 1 / (ie * ie), Je[re + 3] = ye, te += Math.abs(le), U++;
      }
    }
    function Te() {
      let r = false;
      for (let se = 0; se < 6; se++) if (Math.abs(Ue[se]) > 1e-4 || Math.abs(Fe[se]) > 1e-3) {
        r = true;
        break;
      }
      const W = Math.abs(Pe - ze) > 1e-4 || Pe > 1e-4 && Math.hypot(Ie, De) > 1e-3;
      return g.isSettling() || U > 0 || r || W;
    }
    function Re(r, W) {
      ne = r, me = W, L = Math.min(r * Ls, W * Cs) * h, X = (0.5 + Os + i) * r + L * 0.012 * Math.sin(u[3]), z = (0.5 + Is - b) * W + L * 0.022 * Math.sin(u[5]);
    }
    function ge(r, W, se, le) {
      y.fill(0), y[0] = y[4] = y[8] = 1, ht(y, 2, se), ht(y, 0, W), ht(y, 1, r), Vo(y, g.dragMat, y, C), ht(y, 0, Fs + 0.07 * Math.sin(u[4])), ht(y, 2, Ds + 0.06 * Math.sin(u[2])), ht(y, 1, Ns + le);
    }
    function Le() {
      const r = Ue[0], W = Ue[1], se = Ue[2], le = Ue[3], ye = Ue[4], ie = Ue[5];
      return I[0] = 1 + r, I[4] = 1 + W, I[8] = 1 + se, I[1] = I[3] = le, I[2] = I[6] = ye, I[5] = I[7] = ie, Vo(I, y, T, C), Math.sqrt(r * r + W * W + se * se + 2 * (le * le + ye * ye + ie * ie));
    }
    function qe(r, W, se) {
      for (let le = r; le > 1e-6; le -= Go) {
        const ye = Math.min(le, Go);
        Ie += ((W - Me) * Yo - Ie * ee) * ye, De += ((se - ke) * Yo - De * ee) * ye, Me += Ie * ye, ke += De * ye;
        for (let ie = 0; ie < 6; ie++) Fe[ie] += (-Ue[ie] * Zs - Fe[ie] * be) * ye, Ue[ie] += Fe[ie] * ye;
      }
    }
    function Ve(r, W, se, le, ye, ie, re, _e, Ae, Ce, Ye, Ht, Et, Wt) {
      const ot = Wt ? c : l, $e = W.acquirePlugin(ot.key, ot.create, ot.dispose);
      if (!$e) return;
      const _o = Math.sin(u[1]), nt = Math.sin(u[2]), et = Math.sin(u[3]), ct = Math.sin(u[4]), kt = Math.sin(u[5]), xo = Math.sin(u[6]), Kt = Math.sin(u[7]), dn = Math.sin(u[8]), pn = Math.sin(u[9]), wo = d * (1 + qs * oe * nt);
      let So = 0;
      Ae ? So = Le() : T.set(y);
      const Mo = Ae ? Pe : 0, Vt = Ae ? te + Mo * ce : 0, Tt = 0.9 + 0.08 + 0.14 * Math.max(wo, d) + 0.06 * M + 2 * H + Us + Vt + 0.5 * O * (1 + 0.35 * oe) + 0.9 * So, { topLeft: At, topRight: dt, bottomLeft: pt, bottomRight: mt } = Ht.corners, mn = At[0] * 0.75 + dt[0] * 0.25, bn = At[1] * 0.75 + dt[1] * 0.25, yn = At[2] * 0.75 + dt[2] * 0.25, vn = (pt[0] + mt[0]) * 0.5, gn = (pt[1] + mt[1]) * 0.5, _n = (pt[2] + mt[2]) * 0.5;
      let je = At;
      ut(dt) < ut(je) && (je = dt), ut(pt) < ut(je) && (je = pt), ut(mt) < ut(je) && (je = mt);
      const Pt = Tt * Oe / Math.sqrt(Math.max(1e-6, Oe * Oe - Tt * Tt)) * L + 2, bt = Math.max(0, Math.floor(X - Pt)), yt = Math.max(0, Math.floor(z - Pt)), $t = Math.min(ye, Math.ceil(X + Pt)), jt = Math.min(ie, Math.ceil(z + Pt));
      if ($t <= bt || jt <= yt) return;
      const Eo = Math.ceil(($t - bt) / fo), ko = Math.ceil((jt - yt) / fo);
      ea(r, $e, Eo, ko), r.bindVertexArray(se);
      for (let lt = 0; lt < 2; lt++) {
        const B = lt === 0 ? $e.coneU : $e.u;
        if (r.useProgram(lt === 0 ? $e.cone : $e.program), lt === 1 && nn(r, $e.bgLocs, Et), r.uniform2f(B.u_res, ye, ie), r.uniform2f(B.u_center, X, z), r.uniform1f(B.u_unit, L), r.uniform1f(B.u_bound, Tt), r.uniform2f(B.u_pointer, Ce, Ye), r.uniformMatrix3fv(B.u_rot, false, y), r.uniformMatrix3fv(B.u_body, false, T), r.uniform3f(B.u_seed, m, x, E), r.uniform3f(B.u_morph, N * (0.6 * et + 0.4 * ct), N * (0.6 * ct - 0.4 * nt), N * (0.5 * nt - 0.5 * et)), r.uniform3f(B.u_morphKnobs, N * 1.2 * (0.7 * ct + 0.3 * nt), N * 1.2 * (0.4 * ct - 0.6 * et), N * 1.2 * (0.5 * nt + 0.5 * et)), r.uniform3f(B.u_rock1, 0.28 * et, 0.28 * ct, 0.28 * kt), r.uniform3f(B.u_rock2, 0.45 * kt, 0.45 * Kt, 0.45 * xo), r.uniform3f(B.u_rock3, 0.8 * dn, 0.8 * pn, 0.8 * Kt), r.uniform1f(B.u_crawl, u[6]), r.uniform3f(B.u_knobRock1, 0.3 * ct, 0.3 * et, 0.3 * kt), r.uniform3f(B.u_knobRock2, 0.25 * xo, 0.25 * Kt, 0.25 * kt), r.uniform2f(B.u_sheenRock, _o, nt), r.uniform4f(B.u_flow, q * ao * nt, q * ao * 0.8 * et, q * ao * 0.9 * _o, q * Gs), r.uniform3f(B.u_flowPh, u[2], u[3], u[1]), r.uniform3f(B.u_top, mn, bn, yn), r.uniform3f(B.u_bottom, vn, gn, _n), r.uniform1f(B.u_lumps, wo), r.uniform1f(B.u_knobs, M), r.uniform1f(B.u_knobFreq, A), r.uniform1f(B.u_folds, H), r.uniform3f(B.u_foldPh, u[2], u[3], u[4]), r.uniform1f(B.u_spec, Z), r.uniform1f(B.u_disp, ue), r.uniform1f(B.u_frost, k), r.uniform1f(B.u_stress, S), r.uniform1f(B.u_inner, f), r.uniform1f(B.u_milk, v), r.uniform1f(B.u_irid, _), r.uniform1f(B.u_film, R), r.uniform1f(B.u_round, D), r.uniform1f(B.u_gloop, O), r.uniform1f(B.u_lobes, O * (1 + 0.35 * oe * et)), r.uniform3f(B.u_blobPh, u[3], u[4], u[5]), r.uniform1f(B.u_clarity, $), r.uniform1f(B.u_deep, pe), r.uniform3f(B.u_deepTint, je[0], je[1], je[2]), r.uniform1f(B.u_focus, ae), r.uniform1f(B.u_grain, re), r.uniform1f(B.u_grainFrame, _e), s.interact) {
          const Rt = Ae ? U : 0;
          r.uniform4f(B.u_swell, j[0], j[1], j[2], Mo), Rt > 0 && (r.uniform4fv(B.u_rip, Qe, 0, Rt * 4), r.uniform4fv(B.u_ripK, Je, 0, Rt * 4)), r.uniform1i(B.u_ripN, Rt), r.uniform1f(B.u_ripMax, Vt > 1e-5 ? Vt : 0);
        }
        r.uniform2f(B.u_coneOrigin, bt, yt), lt === 0 ? (r.bindFramebuffer(r.FRAMEBUFFER, $e.coneFbo), r.viewport(0, 0, Eo, ko), r.disable(r.BLEND), r.disable(r.SCISSOR_TEST)) : (r.bindFramebuffer(r.FRAMEBUFFER, le), r.viewport(0, 0, ye, ie), r.activeTexture(r.TEXTURE0 + mo), r.bindTexture(r.TEXTURE_2D, $e.coneTex), r.activeTexture(r.TEXTURE0), r.enable(r.BLEND), r.blendFunc(r.ONE, r.ONE_MINUS_SRC_ALPHA), r.enable(r.SCISSOR_TEST), r.scissor(bt, yt, $t - bt, jt - yt)), r.drawArrays(r.TRIANGLES, 0, 3);
      }
      r.activeTexture(r.TEXTURE0 + mo), r.bindTexture(r.TEXTURE_2D, null), r.activeTexture(r.TEXTURE0);
    }
    return { canOrbit: o, onDragPixels(r, W, se, le) {
      g.addDragPixels(r, W, se, le);
    }, onTap(r) {
      const W = Math.max(1, Math.min(ne, me)), se = (r.topLeftX * ne - X) / L, le = (r.bottomLeftY * me - z) / L, ie = Ee(se, le) * F;
      if (ie > 0.01) {
        Se(Js, Ft, xt, ie);
        const re = Math.max(1e-4, Math.hypot(j[3], j[4], j[5])), _e = j[3] / re, Ae = j[4] / re, Ce = j[5] / re, Ye = Qs * ie;
        Fe[0] += Ye * (1.5 * _e * _e - 0.5), Fe[1] += Ye * (1.5 * Ae * Ae - 0.5), Fe[2] += Ye * (1.5 * Ce * Ce - 0.5), Fe[3] += Ye * 1.5 * _e * Ae, Fe[4] += Ye * 1.5 * _e * Ce, Fe[5] += Ye * 1.5 * Ae * Ce;
      }
      g.triggerTap({ ptrX: r.topLeftX, ptrY: r.bottomLeftY, width: ne, height: me, shiftNdcX: (X - ne / 2) / W, shiftNdcY: (z - me / 2) / W, tiltScale: a.tiltScale, effectScale: a.effectScale, allowTorque: !o });
    }, isSettling: Te, prepareLoop() {
      g.freezeOrbitForLoop();
    }, renderLive(r) {
      const W = r.dtSec;
      W > 0 && (ve = (ve + W * p) % yo), ta(u, ve), Re(r.width, r.height);
      const se = Math.max(1, Math.min(r.width, r.height));
      a.dt = W, a.cursorInside = r.pointer.cursorInside, a.targetPtrX = r.pointer.rawBottomLeftX, a.targetPtrY = r.pointer.rawBottomLeftY, a.isDragging = r.pointer.isDragging, a.width = r.width, a.height = r.height, a.shiftNdcX = (X - r.width / 2) / se, a.shiftNdcY = (z - r.height / 2) / se;
      const le = 1.85 / 2.55 * Math.max(0.35, h * 0.94);
      n[0] = n[1] = n[2] = We * L / se / le, g.step(a, y);
      const ye = e.motion === "tumble" ? u[2] : 0.32 * Math.sin(u[3]);
      if (ge(g.fluidTilt.yaw, g.fluidTilt.pitch, g.fluidTilt.roll, ye), t) {
        const _e = r.pointer.cursorInside && !r.pointer.isDragging, Ae = (r.pointer.rawBottomLeftX * r.width - X) / L, Ce = (r.pointer.rawBottomLeftY * r.height - z) / L;
        _e && !rt && Pe < 1e-3 && (Me = Ae, ke = Ce, Ie = De = 0), rt = _e;
        const Ye = Me, Ht = ke;
        W > 0 && qe(W, _e ? Ae : Me, _e ? Ce : ke);
        const Et = Ee(Me, ke);
        if (ze = _e ? Et * xe : 0, W > 0) {
          const Wt = ze > Pe ? 4 : 2.5;
          Pe += (ze - Pe) * (1 - Math.exp(-Wt * W)), Pe < 1e-5 && ze === 0 && (Pe = 0), Be += W, Ke = Ke * Math.exp(-1.2 * W) + Math.hypot(Me - Ye, ke - Ht) * Et, _e && J > 0 && Ke > js && Be > Ho.life / Ft && (Se(Ho, 0, Ft, Math.min(1, Ke / $s) * J), Ke = 0, Be = 0);
          for (const ot of tt) ot.age < ot.life && (ot.age += W);
        }
        he();
      }
      const ie = r.lowPower ? fe * 0.65 : fe, re = e.grain_animate && r.running ? Math.floor(ve * e.grain_fps) : 0;
      Ve(r.gl, r.plugins, r.vao, r.targetFbo, r.width, r.height, ie, re, true, r.pointer.glideBottomLeftX, r.pointer.glideBottomLeftY, r.gradientSpec, r.gradientFrame, r.lowPower);
    }, renderLoop(r) {
      const W = p > 1e-4;
      W ? oa(u, r.progress01, r.duration, p) : u.fill(0), Re(r.width, r.height);
      const se = e.motion === "tumble" ? W ? r.progress01 * it : 0 : 0.32 * Math.sin(u[3]);
      ge(0, 0, 0, se);
      const le = Math.max(1, Math.round(e.grain_fps * r.duration)), ye = e.grain_animate ? Math.floor(r.progress01 * le) % le : 0;
      Ve(r.gl, r.plugins, r.vao, r.targetFbo, r.width, r.height, fe, ye, false, 0.5, 0.5, r.gradientSpec, r.gradientFrame, false);
    } };
  }
  var sa = ":host{display:block;width:100%;height:100%;overflow:hidden}canvas{display:block;width:100%;height:100%;touch-action:pan-y}canvas[data-orbit=true]{cursor:grab;touch-action:none}canvas[data-orbit=true]:active{cursor:grabbing}";
  var aa = vs({ id: "gemini-4-element-hydrogen", styles: [sa], config: Un, maxDesktopPixels: 15e5, createCenterpiece(e) {
    return na(e.config);
  } });
  var ia = /^#(?:[\da-f]{3}){1,2}$/i;
  var ra = /^\d{4}-\d\d-\d\d$/;
  var ca = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
  var la = /* @__PURE__ */ new Set(["layout", "colorMode", "reducedMotion", "lowPower"]);
  function ua(e) {
    return la.has(e) ? `c.${e}` : e;
  }
  function bo(e) {
    if (e === "true" || e === "1") return true;
    if (e === "false" || e === "0") return false;
  }
  function ha(e, t) {
    switch (e.type) {
      case "richtext":
      case "url":
      case "file":
      case "document":
      case "page":
      case "image":
      case "media":
        return { valid: false };
      case "boolean": {
        const o = bo(t);
        return o !== void 0 ? { valid: true, value: o } : { valid: false };
      }
      case "number":
      case "integer": {
        const o = t.trim(), s = o === "" ? NaN : Number(o);
        if (!Number.isFinite(s)) return { valid: false };
        const l = e.type === "integer" ? Math.round(s) : s;
        return { valid: true, value: Math.min(e.max ?? 1 / 0, Math.max(e.min ?? -1 / 0, l)) };
      }
      case "color": {
        const o = t.trim();
        return ia.test(o) ? { valid: true, value: o } : { valid: false };
      }
      case "choice":
        return e.choices.some(([o]) => o === t) ? { valid: true, value: t } : !e.required && e.default === void 0 && t === "" ? { valid: true, value: null } : { valid: false };
      case "multichoice": {
        const o = new Set(t === "" ? [] : t.split(",")), s = e.choices.filter(([l]) => o.has(l)).map(([l]) => l);
        return t !== "" && s.length === 0 ? { valid: false } : { valid: true, value: s };
      }
      case "date": {
        const o = t.trim();
        return ra.test(o) && !Number.isNaN(Date.parse(`${o}T00:00`)) ? { valid: true, value: o } : { valid: false };
      }
      case "time": {
        const o = t.trim();
        return ca.test(o) ? { valid: true, value: o } : { valid: false };
      }
      case "datetime": {
        const o = t.trim();
        return o !== "" && !Number.isNaN(Date.parse(o)) ? { valid: true, value: o } : { valid: false };
      }
      case "string":
      case "text":
        return t.trim().toLowerCase().startsWith("blob:") ? { valid: false } : { valid: true, value: t };
    }
  }
  function fa(e, t, o) {
    const s = o.get("colorMode") ?? ("theme" in e ? null : o.get("theme")), l = s === "light" || s === "dark" || s === "system" ? s : void 0, c = bo(o.get("reducedMotion")), h = bo(o.get("lowPower")), i = { ...t };
    let b = false;
    for (const [p, w] of Object.entries(e)) {
      const m = o.get(ua(p));
      if (m === null) continue;
      const x = ha(w, m);
      x.valid && JSON.stringify(i[p]) !== JSON.stringify(x.value) && (i[p] = x.value, b = true);
    }
    return { config: i, configChanged: b, ...l !== void 0 ? { themeBehavior: l } : {}, ...c !== void 0 ? { reducedMotion: c } : {}, ...h !== void 0 ? { lowPower: h } : {} };
  }
  var fn = aa;
  var He = document.documentElement;
  var at = document.querySelector("abc-canvas");
  var St = He.dataset.themeBehavior;
  if (He.hasAttribute("data-url-params") && window.location.search) {
    const e = at == null ? void 0 : at.querySelector(':scope > script[type="application/json"]');
    let t = {};
    if (e != null && e.textContent) try {
      const s = JSON.parse(e.textContent);
      s && typeof s == "object" && !Array.isArray(s) && (t = s);
    } catch {
    }
    const o = fa(fn.config ?? {}, t, new URLSearchParams(window.location.search));
    o.themeBehavior && (St = o.themeBehavior, He.dataset.themeBehavior = St), o.reducedMotion !== void 0 && (He.dataset.reducedMotion = String(o.reducedMotion)), o.lowPower !== void 0 && (He.dataset.lowPower = String(o.lowPower)), o.configChanged && at && e && (e.textContent = JSON.stringify(o.config), at.posterMode = "fallback");
  }
  var $o = window.matchMedia("(prefers-color-scheme: dark)");
  function ro(e) {
    He.dataset.colorMode = e, He.classList.add("deepai"), He.classList.toggle("deepai--dark", e === "dark"), He.classList.toggle("deepai--light", e === "light"), He.classList.toggle("is-dark", e === "dark"), window.dispatchEvent(new CustomEvent("deepai:mode-change", { detail: { mode: e } }));
  }
  St === "light" || St === "dark" ? ro(St) : (ro($o.matches ? "dark" : "light"), $o.addEventListener("change", (e) => {
    ro(e.matches ? "dark" : "light");
  }));
  at && (at.definition = fn);
})();
