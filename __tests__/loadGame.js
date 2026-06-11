/**
 * Test helper: loads game.js in a sandboxed VM context with mocked browser
 * globals so that every global function / variable defined in the game script
 * becomes accessible to tests without a real DOM or Canvas.
 */

const fs = require('fs');
const vm = require('vm');
const path = require('path');

function createMockElement(id) {
  const style = {};
  const children = [];
  return {
    id,
    style,
    width: 800,
    height: 600,
    innerHTML: '',
    textContent: '',
    className: '',
    value: '',
    dataset: {},
    getContext() {
      return {
        clearRect() {},
        fillRect() {},
        beginPath() {},
        arc() {},
        fill() {},
        stroke() {},
        save() {},
        restore() {},
        translate() {},
        scale() {},
        rotate() {},
        setTransform() {},
        createLinearGradient() {
          return { addColorStop() {} };
        },
        createRadialGradient() {
          return { addColorStop() {} };
        },
        roundRect() {},
        ellipse() {},
        moveTo() {},
        lineTo() {},
        fillText() {},
        strokeRect() {},
        measureText() { return { width: 50 }; },
        drawImage() {},
        getImageData() { return { data: new Uint8ClampedArray(4) }; },
        putImageData() {},
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        lineCap: 'butt',
        font: '',
        textAlign: 'start',
        shadowColor: '',
        shadowBlur: 0,
      };
    },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    classList: {
      toggle() {},
      add() {},
      remove() {},
    },
    appendChild() {},
    remove() {},
    addEventListener() {},
    focus() {},
    click() {},
    get children() { return children; },
    get childNodes() { return children; },
  };
}

function loadGame() {
  const code = fs.readFileSync(
    path.join(__dirname, '..', 'game.js'),
    'utf-8'
  );

  const elements = {};

  const sandbox = {
    // Window / global stubs
    innerWidth: 800,
    innerHeight: 600,
    devicePixelRatio: 1,
    onresize: null,
    onkeydown: null,
    onkeyup: null,
    onmousemove: null,
    onmousedown: null,
    onmouseup: null,
    requestAnimationFrame: () => 0,  // no-op: prevent async render loop
    cancelAnimationFrame: () => {},
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    performance: { now: () => Date.now() },
    console,
    Math,
    Date,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    Number,
    String,
    Array,
    Object,
    Map,
    Set,
    Error,
    Uint8ClampedArray,
    Uint8Array,
    Uint16Array,
    Uint32Array,
    Float32Array,
    Float64Array,

    // localStorage stub
    localStorage: {
      _store: {},
      getItem(k) { return this._store[k] ?? null; },
      setItem(k, v) { this._store[k] = String(v); },
      removeItem(k) { delete this._store[k]; },
      get ATTACK_COOPERS_SETTINGS() { return this._store.ATTACK_COOPERS_SETTINGS; },
      set ATTACK_COOPERS_SETTINGS(v) { this._store.ATTACK_COOPERS_SETTINGS = v; },
      get ATTACK_COOPERS_META() { return this._store.ATTACK_COOPERS_META; },
      set ATTACK_COOPERS_META(v) { this._store.ATTACK_COOPERS_META = v; },
      get NEON_RELIC_SELECTED_CHAR() { return this._store.NEON_RELIC_SELECTED_CHAR; },
      set NEON_RELIC_SELECTED_CHAR(v) { this._store.NEON_RELIC_SELECTED_CHAR = v; },
      get NEON_RELIC_DIFFICULTY() { return this._store.NEON_RELIC_DIFFICULTY; },
      set NEON_RELIC_DIFFICULTY(v) { this._store.NEON_RELIC_DIFFICULTY = v; },
    },

    // Image stub
    Image: class {
      constructor() { this.src = ''; this.decoding = ''; this.onload = null; this.onerror = null; }
    },

    // Audio stub
    Audio: class {
      constructor() { this.src = ''; this.volume = 1; }
      play() { return Promise.resolve(); }
      pause() {}
      cloneNode() { return new sandbox.Audio(); }
    },

    // document stub
    document: {
      getElementById(id) {
        if (!elements[id]) elements[id] = createMockElement(id);
        return elements[id];
      },
      createElement(tag) { return createMockElement(tag); },
      querySelectorAll() { return []; },
      querySelector() { return null; },
      body: {
        appendChild() {},
        removeChild() {},
        style: {},
      },
    },
  };

  // In a VM context, const/let/class at the top level are script-scoped and
  // do NOT become properties of the sandbox.  Replace them with var so every
  // identifier is reachable from the returned context object.
  let patched = code
    .replace(/^const /gm, 'var ')
    .replace(/^let /gm, 'var ')
    // Handle class declarations (both at line start and inline after ;)
    .replace(/\bclass (\w+)\s*\{/g, 'var $1 = class $1 {');

  // Create context and run.  game.js has top-level side effects (render
  // calls, requestAnimationFrame loop) that crash without a full DOM/canvas.
  // All function definitions we care about are hoisted before those calls, so
  // we swallow the init-time error and continue with the context.
  const ctx = vm.createContext(sandbox);
  try {
    vm.runInContext(patched, ctx, { filename: 'game.js' });
  } catch (_) {
    // Initialization render errors are expected in a headless environment.
  }
  return ctx;
}

module.exports = { loadGame };
