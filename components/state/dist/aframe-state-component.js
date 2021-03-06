(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var AND = '&&';
var QUOTE_RE = /'/g;
var OR = '||';
var COMPARISONS = ['==', '===', '!=', '!=='];
var tempTokenArray = [];
var tokenArray = [];

/**
 * Select value from store. Handles boolean operations, calls `selectProperty`.
 *
 * @param {object} state - State object.
 * @param {string} selector - Dot-delimited store keys (e.g., game.player.health).
 */
function select(state, selector, bindFor, bindForKey) {
  var comparisonResult;
  var firstValue;
  var i;
  var runningBool;
  var secondValue;
  var tokens;
  var value;

  // If just single selector, then grab value.
  tokens = split(selector, /\s+/);
  if (tokens.length === 1) {
    return selectProperty(state, selector, bindFor, bindForKey);
  }

  // Evaluate comparisons.
  tokenArray.length = 0;
  copyArray(tempTokenArray, tokens);
  for (i = 0; i < tempTokenArray.length; i++) {
    if (COMPARISONS.indexOf(tempTokenArray[i]) === -1) {
      tokenArray.push(tempTokenArray[i]);
      continue;
    }

    // Comparison (color === 'red').
    // Pop previous value since that is one of comparsion value.
    firstValue = selectProperty(state, tokenArray.pop());
    // Lookup second value.
    secondValue = tempTokenArray[i + 1].replace(QUOTE_RE, '');
    // Evaluate (equals or not equals).
    firstValue = firstValue === undefined ? 'undefined' : firstValue.toString();
    secondValue = secondValue === undefined ? 'undefined' : secondValue.toString();
    comparisonResult = tempTokenArray[i].indexOf('!') === -1 ? firstValue === secondValue : firstValue !== secondValue;
    tokenArray.push(comparisonResult);
    i++;
  }

  // Was single comparison.
  if (tokenArray.length === 1) {
    return tokenArray[0];
  }

  // If has boolean expression, evaluate.
  runningBool = tokenArray[0].constructor === Boolean ? tokenArray[0] : selectProperty(state, tokenArray[0], bindFor, bindForKey);
  for (i = 1; i < tokenArray.length; i += 2) {
    if (tokenArray[i] !== OR && tokenArray[i] !== AND) {
      continue;
    }
    // Check if was evaluated comparison (bool) or a selector (string).
    tokenArray[i + 1] = tokenArray[i + 1].constructor === Boolean ? tokenArray[i + 1] : selectProperty(state, tokenArray[i + 1]);

    // Evaluate boolean.
    if (tokenArray[i] === OR) {
      runningBool = runningBool || tokenArray[i + 1];
    } else if (tokenArray[i] === AND) {
      runningBool = runningBool && tokenArray[i + 1];
    }
  }
  return runningBool;
}
module.exports.select = select;

/**
 * Does actual selecting and walking of state.
 */
function selectProperty(state, selector, bindFor, bindForKey) {
  var i;
  var originalSelector;
  var splitted;
  var value;

  // If bindFor, select the array. Then later, we filter the array.
  if (bindFor && selector.startsWith(bindFor.for)) {
    originalSelector = selector;
    selector = bindFor.in;
  }

  // Walk.
  value = state;
  splitted = split(stripNot(selector), '.');
  for (i = 0; i < splitted.length; i++) {
    if (i < splitted.length - 1 && !(splitted[i] in value)) {
      console.error('[state] Not found:', splitted, splitted[i]);
    }
    value = value[splitted[i]];
  }

  if (bindFor && originalSelector.startsWith(bindFor.for)) {
    // Simple array.
    if (!bindFor.key) {
      return value[bindForKey];
    }
    // Array of objects.
    for (i = 0; i < value.length; i++) {
      if (value[i][bindFor.key] !== bindForKey) {
        continue;
      }
      value = selectProperty(value[i], originalSelector.replace(bindFor.for + '.', ''));
      break;
    }
  }

  // Boolean.
  if (selector[0] === '!' && selector[1] === '!') {
    return !!value;
  }
  if (selector[0] === '!') {
    return !value;
  }
  return value;
}
module.exports.selectProperty = selectProperty;

function clearObject(obj) {
  for (var key in obj) {
    delete obj[key];
  }
}
module.exports.clearObject = clearObject;

/**
 * Helper to compose object of handlers, merging functions handling same action.
 */
function composeHandlers() {
  var actionName;
  var i;
  var inputHandlers = arguments;
  var outputHandlers;

  outputHandlers = {};
  for (i = 0; i < inputHandlers.length; i++) {
    for (actionName in inputHandlers[i]) {
      if (actionName in outputHandlers) {
        // Initial compose/merge functions into arrays.
        if (outputHandlers[actionName].constructor === Array) {
          outputHandlers[actionName].push(inputHandlers[i][actionName]);
        } else {
          outputHandlers[actionName] = [outputHandlers[actionName], inputHandlers[i][actionName]];
        }
      } else {
        outputHandlers[actionName] = inputHandlers[i][actionName];
      }
    }
  }

  // Compose functions specified via array.
  for (actionName in outputHandlers) {
    if (outputHandlers[actionName].constructor === Array) {
      outputHandlers[actionName] = composeFunctions.apply(this, outputHandlers[actionName]);
    }
  }

  return outputHandlers;
}
module.exports.composeHandlers = composeHandlers;

function composeFunctions() {
  var functions = arguments;
  return function () {
    var i;
    for (i = 0; i < functions.length; i++) {
      functions[i].apply(this, arguments);
    }
  };
}
module.exports.composeFunctions = composeFunctions;

var NO_WATCH_TOKENS = ['||', '&&', '!=', '!==', '==', '==='];
function parseKeysToWatch(keys, str, isBindItem) {
  var i;
  var tokens;
  tokens = str.split(/\s+/);
  for (i = 0; i < tokens.length; i++) {
    if (NO_WATCH_TOKENS.indexOf(tokens[i]) === -1 && !tokens[i].startsWith("'") && keys.indexOf(tokens[i]) === -1) {
      if (isBindItem && tokens[i] === 'item') {
        continue;
      }
      keys.push(parseKeyToWatch(tokens[i]));
    }
  }
}
module.exports.parseKeysToWatch = parseKeysToWatch;

function parseKeyToWatch(str) {
  var dotIndex;
  str = stripNot(str.trim());
  dotIndex = str.indexOf('.');
  if (dotIndex === -1) {
    return str;
  }
  return str.substring(0, str.indexOf('.'));
}

function stripNot(str) {
  if (str.indexOf('!!') === 0) {
    return str.replace('!!', '');
  } else if (str.indexOf('!') === 0) {
    return str.replace('!', '');
  }
  return str;
}

/**
 * Cached split.
 */
var SPLIT_CACHE = {};
function split(str, delimiter) {
  if (!SPLIT_CACHE[delimiter]) {
    SPLIT_CACHE[delimiter] = {};
  }
  if (SPLIT_CACHE[delimiter][str]) {
    return SPLIT_CACHE[delimiter][str];
  }
  SPLIT_CACHE[delimiter][str] = str.split(delimiter);
  return SPLIT_CACHE[delimiter][str];
}
module.exports.split = split;

function copyArray(dest, src) {
  var i;
  dest.length = 0;
  for (i = 0; i < src.length; i++) {
    dest[i] = src[i];
  }
}
module.exports.copyArray = copyArray;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

__webpack_require__(2);
var diff = __webpack_require__(3);
var lib = __webpack_require__(0);
var wrapArray = __webpack_require__(4).wrapArray;

// Singleton state definition.
var State = {
  initialState: {},
  nonBindedStateKeys: [],
  handlers: {},
  computeState: function computeState() {/* no-op */}
};

var STATE_UPDATE_EVENT = 'stateupdate';
var TYPE_OBJECT = 'object';
var WHITESPACE_REGEX = /s+/;

AFRAME.registerState = function (definition) {
  AFRAME.utils.extend(State, definition);
};

AFRAME.registerSystem('state', {
  init: function init() {
    var _this = this;

    var key;

    this.diff = {};
    this.state = AFRAME.utils.clone(State.initialState);
    this.subscriptions = [];
    this.initEventHandlers();

    // Wrap array to detect dirty.
    for (key in this.state) {
      if (this.state[key] && this.state[key].constructor === Array) {
        this.state[key].__dirty = true;
        wrapArray(this.state[key]);
      }
    }

    this.lastState = AFRAME.utils.clone(this.state);

    this.eventDetail = {
      lastState: this.lastState,
      state: this.state
    };

    this.el.addEventListener('loaded', function () {
      var i;
      // Initial compute.
      State.computeState(_this.state, '@@INIT');
      // Initial dispatch.
      for (i = 0; i < _this.subscriptions.length; i++) {
        _this.subscriptions[i].onStateUpdate(_this.state);
      }
    });
  },

  /**
   * Dispatch action.
   */
  dispatch: function dispatch(actionName, payload) {
    var i;
    var key;
    var subscription;

    // Modify state.
    State.handlers[actionName](this.state, payload);

    // Post-compute.
    State.computeState(this.state, actionName, payload);

    // Get a diff to optimize bind updates.
    for (key in this.diff) {
      delete this.diff[key];
    }
    diff(this.lastState, this.state, this.diff, State.nonBindedStateKeys);

    // Notify subscriptions / binders.
    for (i = 0; i < this.subscriptions.length; i++) {
      if (this.subscriptions[i].name === 'bind-for') {
        // For arrays and bind-for, check __dirty flag on array rather than the diff.
        if (!this.state[this.subscriptions[i].keysToWatch[0]].__dirty) {
          continue;
        }
      } else {
        if (!this.shouldUpdate(this.subscriptions[i].keysToWatch, this.diff)) {
          continue;
        }
      }

      this.subscriptions[i].onStateUpdate();
    }

    // Unset array dirty.
    for (key in this.state) {
      if (this.state[key] && this.state[key].constructor === Array) {
        this.state[key].__dirty = false;
      }
    }

    // Store last state.
    // TODO: copyState messes with the diff.
    this.copyState(this.lastState, this.state);

    // Emit.
    this.eventDetail.action = actionName;
    this.eventDetail.payload = payload;
    this.el.emit(STATE_UPDATE_EVENT, this.eventDetail);
  },

  /**
   * Store last state through a deep extend, but not for arrays.
   */
  copyState: function copyState(lastState, state, isRecursive) {
    var key;

    for (key in state) {
      // Don't copy pieces of state keys that are non-binded or untracked.
      if (!isRecursive && State.nonBindedStateKeys.indexOf(key) !== -1) {
        continue;
      }

      // Nested state.
      if (state[key] && state[key].constructor === Object) {
        if (!(key in lastState)) {
          // Clone object if destination does not exist.
          lastState[key] = AFRAME.utils.clone(state[key]);
          continue;
        }
        // Recursively copy state.
        this.copyState(lastState[key], state[key], true);
        continue;
      }

      // Copy by value.
      lastState[key] = state[key];
    }
  },

  subscribe: function subscribe(component) {
    this.subscriptions.push(component);
  },

  unsubscribe: function unsubscribe(component) {
    this.subscriptions.splice(this.subscriptions.indexOf(component), 1);
  },

  /**
   * Check if state changes were relevant to this binding. If not, don't call.
   */
  shouldUpdate: function shouldUpdate(keysToWatch, diff) {
    var stateKey;
    for (stateKey in diff) {
      if (keysToWatch.indexOf(stateKey) !== -1) {
        return true;
      }
    }
    return false;
  },

  /**
   * Proxy events to action dispatches so components can just bubble actions up as events.
   * Handlers define which actions they handle. Go through all and add event listeners.
   */
  initEventHandlers: function initEventHandlers() {
    var actionName;
    var registeredActions = [];
    var self = this;

    registerListener = registerListener.bind(this);

    // Use declared handlers to know what events to listen to.
    for (actionName in State.handlers) {
      // Only need to register one handler for each event.
      if (registeredActions.indexOf(actionName) !== -1) {
        continue;
      }
      registeredActions.push(actionName);
      registerListener(actionName);
    }

    function registerListener(actionName) {
      var _this2 = this;

      this.el.addEventListener(actionName, function (evt) {
        _this2.dispatch(actionName, evt.detail);
      });
    }
  },

  /**
   * Render template to string with item data.
   */
  renderTemplate: function () {
    // Braces, whitespace, optional item name, item key, whitespace, braces.
    var interpRegex = /{{\s*(\w*\.)?([\w.]+)\s*}}/g;

    return function (template, data, asString) {
      var match;
      var str;

      str = template;

      // Data will be null if initialize pool for bind-for.updateInPlace.
      if (data) {
        while (match = interpRegex.exec(template)) {
          str = str.replace(match[0], (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === TYPE_OBJECT ? lib.select(data, match[2]) || '' : data);
        }
      }

      // Return as string.
      if (asString) {
        return str;
      }

      // Return as DOM.
      return document.createRange().createContextualFragment(str);
    };
  }(),

  select: lib.select
});

/**
 * Bind component property to a value in state.
 *
 * bind="geometry.width: car.width""
 * bind__material="color: enemy.color; opacity: enemy.opacity"
 * bind__visible="player.visible"
 */
AFRAME.registerComponent('bind', {
  schema: {
    default: {},
    parse: function parse(value) {
      // Parse style-like object.
      var data;
      var i;
      var properties;
      var pair;

      // Using setAttribute with object, no need to parse.
      if (value.constructor === Object) {
        return value;
      }

      // Using instanced ID as component namespace for single-property component,
      // nothing to separate.
      if (value.indexOf(':') === -1) {
        return value;
      }

      // Parse style-like object as keys to values.
      data = {};
      properties = lib.split(value, ';');
      for (i = 0; i < properties.length; i++) {
        pair = lib.split(properties[i].trim(), ':');
        data[pair[0]] = pair[1].trim();
      }
      return data;
    }
  },

  multiple: true,

  init: function init() {
    var bindForEl;
    var bindForName;
    var componentId;
    var data = this.data;
    var key;

    this.keysToWatch = [];
    this.onStateUpdate = this.onStateUpdate.bind(this);
    this.system = this.el.sceneEl.systems.state;

    // Whether we are binding by namespace (e.g., bind__foo="prop1: true").
    if (this.id) {
      componentId = lib.split(this.id, '__')[0];
    }
    this.isNamespacedBind = this.id && componentId in AFRAME.components && !AFRAME.components[componentId].isSingleProp || componentId in AFRAME.systems;

    this.lastData = {};
    this.updateObj = {};

    // Subscribe to store and register handler to do data-binding to components.
    this.system.subscribe(this);

    this.rootEl = this.el.closest('[data-bind-for-key]');
    this.onStateUpdate = this.onStateUpdate.bind(this);
  },

  update: function update() {
    var bindForEl;
    var data = this.data;
    var key;
    var property;

    // Index `keysToWatch` to only update state on relevant changes.
    this.keysToWatch.length = 0;
    if (typeof data === 'string') {
      lib.parseKeysToWatch(this.keysToWatch, data);
    } else {
      for (key in data) {
        lib.parseKeysToWatch(this.keysToWatch, data[key]);
      }
    }

    // Check if any properties are part of an iteration in bind-for.
    bindForEl = this.el.closest('[bind-for]');
    if (bindForEl && bindForEl !== this.el) {
      this.bindForEl = bindForEl;
      this.bindRootEl = this.el.closest('[data-bind-for-key]');
      this.bindFor = this.bindForEl.getAttribute('bind-for');
      this.bindForKey = this.bindRootEl.getAttribute('data-bind-for-key');
      this.keysToWatch.push(this.bindFor.in);
      this.rootEl.addEventListener('bindforupdate', this.onStateUpdate);
    } else {
      this.bindFor = '';
      this.bindForKey = '';
    }

    // Update.
    this.onStateUpdate();
  },

  /**
   * Handle state update.
   */
  onStateUpdate: function onStateUpdate() {
    // Update component with the state.
    var hasKeys = false;
    var el = this.el;
    var propertyName;
    var stateSelector;
    var state;
    var tempNode;
    var value;

    if (!el.parentNode) {
      return;
    }
    if (this.isNamespacedBind) {
      lib.clearObject(this.updateObj);
    }

    state = this.system.state;

    // Update bind-for-key if necessary if simple list of strings.
    // Sort of a hack.
    if (this.bindFor && this.bindForKey !== undefined && !this.bindFor.key) {
      tempNode = el;
      while (tempNode.parentNode && tempNode.parentNode !== this.bindForEl) {
        if (tempNode.parentNode) {
          tempNode = tempNode.parentNode;
        }
      }
      this.bindForKey = parseInt(tempNode.dataset.bindForKey, 10);
    }

    // Single-property bind.
    if (_typeof(this.data) !== TYPE_OBJECT) {
      try {
        value = lib.select(state, this.data, this.bindFor, this.bindForKey);
      } catch (e) {
        throw new Error('[aframe-state-component] Key \'' + this.data + '\' not found in state.' + (' #' + this.el.getAttribute('id') + '[' + this.attrName + ']'));
      }

      if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== TYPE_OBJECT && _typeof(this.lastData) !== TYPE_OBJECT && this.lastData === value) {
        return;
      }

      AFRAME.utils.entity.setComponentProperty(el, this.id, value);
      this.lastData = value;
      return;
    }

    for (propertyName in this.data) {
      // Pointer to a value in the state (e.g., `player.health`).
      stateSelector = this.data[propertyName].trim();
      try {
        value = lib.select(state, stateSelector, this.bindFor, this.bindForKey);
        if (this.bindFor && value === undefined) {
          return;
        }
      } catch (e) {
        throw new Error('[aframe-state-component] Key \'' + stateSelector + '\' not found in state.' + (' #' + this.el.getAttribute('id') + '[' + this.attrName + ']'));
      }

      if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== TYPE_OBJECT && _typeof(this.lastData[propertyName]) !== TYPE_OBJECT && this.lastData[propertyName] === value) {
        continue;
      }

      // Remove component if value is `undefined`.
      if (propertyName in AFRAME.components && value === undefined) {
        el.removeAttribute(propertyName);
        return;
      }

      // Set using dot-delimited property name.
      if (this.isNamespacedBind) {
        // Batch if doing namespaced bind.
        this.updateObj[propertyName] = value;
      } else {
        AFRAME.utils.entity.setComponentProperty(el, propertyName, value);
      }

      this.lastData[propertyName] = value;
    }

    // Batch if doing namespaced bind.
    for (hasKeys in this.updateObj) {
      // See if object is empty.
    }
    if (this.isNamespacedBind && hasKeys) {
      el.setAttribute(this.id, this.updateObj);
    }
  },

  remove: function remove() {
    this.system.unsubscribe(this);
    if (this.bindForEl) {
      this.bindForEl.removeEventListener('bindforupdate', this.onStateUpdate);
    }
  }
});

/**
 * Toggle component attach and detach based on boolean value.
 *
 * bind__raycastable="isRaycastable""
 */
AFRAME.registerComponent('bind-toggle', {
  schema: { type: 'string' },

  multiple: true,

  init: function init() {
    this.system = this.el.sceneEl.systems.state;
    this.keysToWatch = [];
    this.onStateUpdate = this.onStateUpdate.bind(this);

    // Subscribe to store and register handler to do data-binding to components.
    this.system.subscribe(this);

    this.onStateUpdate();
  },

  update: function update() {
    this.keysToWatch.length = 0;
    lib.parseKeysToWatch(this.keysToWatch, this.data);
  },

  /**
   * Handle state update.
   */
  onStateUpdate: function onStateUpdate() {
    var el = this.el;
    var state;
    var value;

    state = this.system.state;

    try {
      value = lib.select(state, this.data);
    } catch (e) {
      throw new Error('[aframe-state-component] Key \'' + this.data + '\' not found in state.' + (' #' + this.el.getAttribute('id') + '[' + this.attrName + ']'));
    }

    if (value) {
      el.setAttribute(this.id, '');
    } else {
      el.removeAttribute(this.id);
    }
  },

  remove: function remove() {
    this.system.unsubscribe(this);
  }
});

module.exports = {
  composeFunctions: lib.composeFunctions,
  composeHandlers: lib.composeHandlers,
  select: lib.select
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var lib = __webpack_require__(0);

var ITEM_PREFIX_RE = /item./;
var ITEM_SELECTOR_RE = /item.(\w+)/;

/**
 * Render array from state.
 */
AFRAME.registerComponent('bind-for', {
  schema: {
    delay: { default: 0 },
    for: { type: 'string', default: 'item' },
    in: { type: 'string' },
    key: { type: 'string' },
    pool: { default: 0 },
    template: { type: 'string' },
    updateInPlace: { default: false }
  },

  init: function init() {
    // Subscribe to store and register handler to do data-binding to components.
    this.system = this.el.sceneEl.systems.state;
    this.onStateUpdate = this.onStateUpdate.bind(this);

    this.keysToWatch = [];
    this.renderedKeys = []; // Keys that are currently rendered.
    this.system.subscribe(this);

    if (this.el.children[0] && this.el.children[0].tagName === 'TEMPLATE') {
      this.template = this.el.children[0].innerHTML.trim();
    } else {
      this.template = document.querySelector(this.data.template).innerHTML.trim();
    }

    for (var _i = 0; _i < this.data.pool; _i++) {
      this.el.appendChild(this.generateFromTemplate(null, _i));
    }
  },

  update: function update() {
    this.keysToWatch[0] = lib.split(this.data.in, '.')[0];
    this.onStateUpdate();
  },

  /**
   * When items are swapped out, the old ones are removed, and new ones are added. All
   * entities will be reinitialized.
   */
  onStateUpdateNaive: function () {
    var activeKeys = [];

    return function () {
      var child;
      var data = this.data;
      var el = this.el;
      var list;
      var key;
      var keyValue;

      try {
        list = lib.select(this.system.state, data.in);
      } catch (e) {
        throw new Error('[aframe-state-component] Key \'' + data.in + '\' not found in state.' + (' #' + el.getAttribute('id') + '[' + this.attrName + ']'));
      }

      activeKeys.length = 0;
      for (var _i2 = 0; _i2 < list.length; _i2++) {
        var item = list[_i2];
        // If key not defined, use index (e.g., array of strings).
        activeKeys.push(data.key ? item[data.key].toString() : item.toString());
      }

      // Remove items by removing entities.
      var toRemoveEls = this.getElsToRemove(activeKeys, this.renderedKeys);
      for (i = 0; i < toRemoveEls.length; i++) {
        toRemoveEls[i].parentNode.removeChild(toRemoveEls[i]);
      }

      if (list.length) {
        this.renderItems(list, activeKeys, 0);
      }
    };
  }(),

  /**
   * Add or update item with delay support.
   */
  renderItems: function renderItems(list, activeKeys, i) {
    var _this = this;

    var data = this.data;
    var el = this.el;
    var itemEl;
    var item = list[i];

    // If key not defined, use index (e.g., array of strings).
    keyValue = data.key ? item[data.key].toString() : item.toString();

    if (this.renderedKeys.indexOf(keyValue) === -1) {
      // Add.
      itemEl = this.generateFromTemplate(item, i);
      el.appendChild(itemEl);
      this.renderedKeys.push(keyValue);
    } else {
      // Update.
      if (list.length && list[0].constructor === String) {
        // Update index for simple list.
        var _keyValue = data.key ? item[data.key].toString() : item.toString();
        itemEl = el.querySelector('[data-bind-for-value="' + _keyValue + '"]');
        itemEl.setAttribute('data-bind-for-key', i);
      } else {
        var bindForKey = this.getBindForKey(item, i);
        itemEl = el.querySelector('[data-bind-for-key="' + bindForKey + '"]');
      }
      itemEl.emit('bindforupdate', item, false);
    }

    if (!list[i + 1]) {
      return;
    }

    if (this.data.delay) {
      setTimeout(function () {
        _this.renderItems(list, activeKeys, i + 1);
      }, this.data.delay);
    } else {
      this.renderItems(list, activeKeys, i + 1);
    }
  },

  /**
   * When items are swapped out, this algorithm will update component values in-place using
   * bind-item.
   */
  onStateUpdateInPlace: function () {
    var activeKeys = [];

    return function () {
      var data = this.data;
      var el = this.el;
      var list;
      var key;
      var keyValue;

      try {
        list = lib.select(this.system.state, data.in);
      } catch (e) {
        throw new Error('[aframe-state-component] Key \'' + data.in + '\' not found in state.' + (' #' + el.getAttribute('id') + '[' + this.attrName + ']'));
      }

      // Calculate keys that should be active.
      activeKeys.length = 0;
      for (var _i3 = 0; _i3 < list.length; _i3++) {
        var item = list[_i3];
        keyValue = data.key ? item[data.key].toString() : item.toString();
        activeKeys.push(keyValue);
      }

      // Remove items by pooling. Do before adding.
      var toRemoveEls = this.getElsToRemove(activeKeys, this.renderedKeys);
      for (var _i4 = 0; _i4 < toRemoveEls.length; _i4++) {
        toRemoveEls[_i4].object3D.visible = false;
        toRemoveEls[_i4].setAttribute('data-bind-for-active', 'false');
        toRemoveEls[_i4].removeAttribute('data-bind-for-key');
        toRemoveEls[_i4].removeAttribute('data-bind-for-value');
        toRemoveEls[_i4].emit('bindfordeactivate', null, false);
        toRemoveEls[_i4].pause();
      }

      if (list.length) {
        this.renderItemsInPlace(list, activeKeys, 0);
      }
    };
  }(),

  /**
   * Add, takeover, or update item with delay support.
   */
  renderItemsInPlace: function renderItemsInPlace(list, activeKeys, i) {
    var _this2 = this;

    var data = this.data;
    var el = this.el;
    var itemEl;

    var item = list[i];
    var bindForKey = this.getBindForKey(item, i);
    var keyValue = data.key ? item[data.key].toString() : item.toString();

    // Add item.
    if (this.renderedKeys.indexOf(keyValue) === -1) {
      if (!el.querySelector(':scope > [data-bind-for-active="false"]')) {
        // No items available in pool. Generate new entity.
        var _itemEl = this.generateFromTemplate(item, i);
        _itemEl.addEventListener('loaded', function () {
          _itemEl.emit('bindforupdateinplace', item, false);
        });
        el.appendChild(_itemEl);
      } else {
        // Take over inactive item.
        itemEl = el.querySelector('[data-bind-for-active="false"]');
        itemEl.setAttribute('data-bind-for-key', bindForKey);
        itemEl.setAttribute('data-bind-for-value', keyValue);
        itemEl.object3D.visible = true;
        itemEl.play();
        itemEl.setAttribute('data-bind-for-active', 'true');
        itemEl.emit('bindforupdateinplace', item, false);
      }
      this.renderedKeys.push(keyValue);
    } else if (activeKeys.indexOf(keyValue) !== -1) {
      // Update item.
      if (list.length && list[0].constructor === String) {
        // Update index for simple list.
        itemEl = el.querySelector('[data-bind-for-value="' + keyValue + '"]');
        itemEl.setAttribute('data-bind-for-key', i);
      } else {
        itemEl = el.querySelector('[data-bind-for-key="' + bindForKey + '"]');
      }
      itemEl.emit('bindforupdateinplace', item, false);
    }

    if (!list[i + 1]) {
      return;
    }

    if (this.data.delay) {
      setTimeout(function () {
        _this2.renderItemsInPlace(list, activeKeys, i + 1);
      }, this.data.delay);
    } else {
      this.renderItemsInPlace(list, activeKeys, i + 1);
    }
  },

  /**
   * Generate entity from template.
   */
  generateFromTemplate: function generateFromTemplate(item, i) {
    var data = this.data;

    this.el.appendChild(this.system.renderTemplate(this.template, item));
    var newEl = this.el.children[this.el.children.length - 1];;

    // From pool.true
    if (!item) {
      newEl.setAttribute('data-bind-for-key', '');
      newEl.setAttribute('data-bind-for-active', 'false');
      return newEl;
    }

    var bindForKey = this.getBindForKey(item, i);
    newEl.setAttribute('data-bind-for-key', bindForKey);
    if (!data.key) {
      newEl.setAttribute('data-bind-for-value', item);
    }

    // Keep track of pooled and non-pooled entities if updating in place.
    newEl.setAttribute('data-bind-for-active', 'true');
    return newEl;
  },

  /**
   * Get entities marked for removal.
   *
   * @param {array} activeKeys - List of key values that should be active.
   * @param {array} renderedKeys - List of key values currently rendered.
   */
  getElsToRemove: function () {
    var toRemove = [];

    return function (activeKeys, renderedKeys) {
      var data = this.data;
      var el = this.el;

      toRemove.length = 0;
      for (var _i5 = 0; _i5 < el.children.length; _i5++) {
        if (el.children[_i5].tagName === 'TEMPLATE') {
          continue;
        }
        var key = data.key ? el.children[_i5].getAttribute('data-bind-for-key') : el.children[_i5].getAttribute('data-bind-for-value');
        if (activeKeys.indexOf(key) === -1 && renderedKeys.indexOf(key) !== -1) {
          toRemove.push(el.children[_i5]);
          renderedKeys.splice(renderedKeys.indexOf(key), 1);
        }
      }
      return toRemove;
    };
  }(),

  /**
   * Get value to use as the data-bind-for-key.
   * For items, will be value specified by `bind-for.key`.
   * For simple list, will be the index.
   */
  getBindForKey: function getBindForKey(item, i) {
    return this.data.key ? item[this.data.key].toString() : i.toString();
  },

  /**
   * Handle state update.
   */
  onStateUpdate: function onStateUpdate() {
    if (this.data.updateInPlace) {
      this.onStateUpdateInPlace();
    } else {
      this.onStateUpdateNaive();
    }
  }
});

/**
 * Handle parsing and update in-place updates under bind-for.
 */
AFRAME.registerComponent('bind-item', {
  schema: {
    type: 'string'
  },

  multiple: true,

  init: function init() {
    this.itemData = null;
    this.keysToWatch = [];
    this.prevValues = {};

    // Listen to root item for events.
    var rootEl = this.rootEl = this.el.closest('[data-bind-for-key]');
    if (!rootEl) {
      throw new Error('bind-item component must be attached to entity under a bind-for item.');
    }
    rootEl.addEventListener('bindforupdateinplace', this.updateInPlace.bind(this));
    rootEl.addEventListener('bindfordeactivate', this.deactivate.bind(this));

    this.el.sceneEl.systems.state.subscribe(this);
  },

  update: function update() {
    this.parseSelector();
  },

  /**
   * Run with bind-for tells to via event `bindforupdateinplace`, passing item data.
   */
  updateInPlace: function updateInPlace(evt) {
    var propertyMap = this.propertyMap;

    if (this.rootEl.getAttribute('data-bind-for-active') === 'false') {
      return;
    }

    if (evt) {
      this.itemData = evt.detail;
    }

    for (var property in propertyMap) {
      // Get value from item.
      var value = this.select(this.itemData, propertyMap[property]);

      // Diff against previous value.
      if (value === this.prevValues[property]) {
        continue;
      }

      // Update.
      AFRAME.utils.entity.setComponentProperty(this.el, property, value);

      this.prevValues[property] = value;
    }
  },

  onStateUpdate: function onStateUpdate() {
    this.updateInPlace();
  },

  select: function select(itemData, selector) {
    var value;

    if (selector.indexOf('=') !== -1) {
      // Interpolate.
      var match = selector.match(ITEM_SELECTOR_RE);
      if (match) {
        value = lib.select(itemData, match[0].replace(ITEM_PREFIX_RE, ''));
        selector = selector.replace(ITEM_SELECTOR_RE, "'" + value + "'");
      }

      value = lib.select(this.el.sceneEl.systems.state.state, selector);
    } else {
      // Get value from item.
      value = selector === 'item' ? itemData // Simple list.
      : lib.select(itemData, selector.replace(ITEM_PREFIX_RE, ''));
    }

    return value;
  },

  deactivate: function deactivate() {
    this.prevValues = {};
  },

  parseSelector: function parseSelector() {
    var propertyMap = this.propertyMap = {};
    this.keysToWatch.length = 0;

    var componentName = lib.split(this.id, '__')[0];

    // Different parsing for multi-prop components.
    if (componentName in AFRAME.components && !AFRAME.components[componentName].isSingleProp) {
      var propertySplitList = lib.split(this.data, ';');
      for (var _i6 = 0; _i6 < propertySplitList.length; _i6++) {
        var propertySplit = lib.split(propertySplitList[_i6], ':');
        propertyMap[this.id + '.' + propertySplit[0].trim()] = propertySplit[1].trim();
        lib.parseKeysToWatch(this.keysToWatch, propertySplit[1].trim(), true);
      }
      return;
    }

    propertyMap[this.id] = this.data;
    lib.parseKeysToWatch(this.keysToWatch, this.data, true);
  }
});

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Computes the difference between two objects with ability to ignore keys.
 *
 * @param {object} a - First object to compare (e.g., oldData).
 * @param {object} b - Second object to compare (e.g., newData).
 * @returns {object}
 *   Difference object where set of keys note which values were not equal, and values are
 *   `b`'s values.
 */
module.exports = function () {
  var keys = [];

  return function (a, b, targetObject, ignoreKeys) {
    var aVal;
    var bVal;
    var bKey;
    var diff;
    var key;
    var i;
    var isComparingObjects;

    diff = targetObject || {};

    // Collect A keys.
    keys.length = 0;
    for (key in a) {
      keys.push(key);
    }

    if (!b) {
      return diff;
    }

    // Collect B keys.
    for (bKey in b) {
      if (keys.indexOf(bKey) === -1) {
        keys.push(bKey);
      }
    }

    for (i = 0; i < keys.length; i++) {
      key = keys[i];

      // Ignore specified keys.
      if (ignoreKeys && ignoreKeys.indexOf(key) !== -1) {
        continue;
      }

      aVal = a[key];
      bVal = b[key];
      isComparingObjects = aVal && bVal && aVal.constructor === Object && bVal.constructor === Object;
      if (isComparingObjects && !AFRAME.utils.deepEqual(aVal, bVal) || !isComparingObjects && aVal !== bVal) {
        diff[key] = bVal;
      }
    }
    return diff;
  };
}();

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var fns = ['push', 'pop', 'shift', 'unshift', 'splice'];

function wrapArray(arr) {
  var i;
  if (arr.__wrapped) {
    return;
  }
  for (i = 0; i < fns.length; i++) {
    makeCallDirty(arr, fns[i]);
  }
  arr.__wrapped = true;
}
module.exports.wrapArray = wrapArray;

function makeCallDirty(arr, fn) {
  var originalFn = arr[fn];
  arr[fn] = function () {
    originalFn.apply(arr, arguments);
    arr.__dirty = true;
  };
}

/***/ })
/******/ ]);
});