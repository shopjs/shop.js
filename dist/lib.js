'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Promise$1 = _interopDefault(require('broken'));
var esRaf = require('es-raf');
var El = _interopDefault(require('el.js'));
var esIs = require('es-is');
var store = _interopDefault(require('akasha'));
var hanzo_js = require('hanzo.js');
var commerce_js = require('commerce.js');
var selectize = _interopDefault(require('es-selectize'));
var moment = _interopDefault(require('moment'));

// src/utils/patches.coffee
var agent;
var ieMajor;
var ieMinor;
var matches;
var reg;

if (window.Promise == null) {
  window.Promise = Promise$1;
}

if (window.requestAnimationFrame == null) {
  window.requestAnimationFrame = esRaf.raf;
}

if (window.cancelAnimationFrame == null) {
  window.cancelAnimationFrame = esRaf.raf.cancel;
}

agent = navigator.userAgent;

reg = /MSIE\s?(\d+)(?:\.(\d+))?/i;

matches = agent.match(reg);

if (matches != null) {
  ieMajor = matches[1];
  ieMinor = matches[2];
}

// node_modules/es-object-assign/index.mjs
var getOwnPropertySymbols;
var hasOwnProperty;
var objectAssign;
var propIsEnumerable;
var shouldUseNative;
var toObject;
var slice = [].slice;

getOwnPropertySymbols = Object.getOwnPropertySymbols;

hasOwnProperty = Object.prototype.hasOwnProperty;

propIsEnumerable = Object.prototype.propertyIsEnumerable;

toObject = function(val) {
  if (val === null || val === void 0) {
    throw new TypeError('Object.assign cannot be called with null or undefined');
  }
  return Object(val);
};

shouldUseNative = function() {
  var err, i, j, k, len, letter, order2, ref, test1, test2, test3;
  try {
    if (!Object.assign) {
      return false;
    }
    test1 = new String('abc');
    test1[5] = 'de';
    if (Object.getOwnPropertyNames(test1)[0] === '5') {
      return false;
    }
    test2 = {};
    for (i = j = 0; j <= 9; i = ++j) {
      test2['_' + String.fromCharCode(i)] = i;
    }
    order2 = Object.getOwnPropertyNames(test2).map(function(n) {
      return test2[n];
    });
    if (order2.join('') !== '0123456789') {
      return false;
    }
    test3 = {};
    ref = 'abcdefghijklmnopqrst'.split('');
    for (k = 0, len = ref.length; k < len; k++) {
      letter = ref[k];
      test3[letter] = letter;
    }
    if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
      return false;
    }
    return true;
  } catch (error) {
    err = error;
    return false;
  }
};

var index = objectAssign = (function() {
  if (shouldUseNative()) {
    return Object.assign;
  }
  return function() {
    var from, j, k, key, len, len1, ref, source, sources, symbol, target, to;
    target = arguments[0], sources = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    to = toObject(target);
    for (j = 0, len = sources.length; j < len; j++) {
      source = sources[j];
      from = Object(source);
      for (key in from) {
        if (hasOwnProperty.call(from, key)) {
          to[key] = from[key];
        }
      }
      if (getOwnPropertySymbols) {
        ref = getOwnPropertySymbols(from);
        for (k = 0, len1 = ref.length; k < len1; k++) {
          symbol = ref[k];
          if (propIsEnumerable.call(from, symbol)) {
            to[symbol] = from[symbol];
          }
        }
      }
    }
    return to;
  };
})();

// node_modules/riot-observable/dist/es6.observable.js
var observable = function(el) {

  /**
   * Extend the original object or create a new empty one
   * @type { Object }
   */

  el = el || {};

  /**
   * Private variables
   */
  var callbacks = {},
    slice = Array.prototype.slice;

  /**
   * Public Api
   */

  // extend the el object adding the observable methods
  Object.defineProperties(el, {
    /**
     * Listen to the given `event` ands
     * execute the `callback` each time an event is triggered.
     * @param  { String } event - event id
     * @param  { Function } fn - callback function
     * @returns { Object } el
     */
    on: {
      value: function(event, fn) {
        if (typeof fn == 'function')
          (callbacks[event] = callbacks[event] || []).push(fn);
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Removes the given `event` listeners
     * @param   { String } event - event id
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    off: {
      value: function(event, fn) {
        if (event == '*' && !fn) callbacks = {};
        else {
          if (fn) {
            var arr = callbacks[event];
            for (var i = 0, cb; cb = arr && arr[i]; ++i) {
              if (cb == fn) arr.splice(i--, 1);
            }
          } else delete callbacks[event];
        }
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Listen to the given `event` and
     * execute the `callback` at most once
     * @param   { String } event - event id
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    one: {
      value: function(event, fn) {
        function on() {
          el.off(event, on);
          fn.apply(el, arguments);
        }
        return el.on(event, on)
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Execute all callback functions that listen to
     * the given `event`
     * @param   { String } event - event id
     * @returns { Object } el
     */
    trigger: {
      value: function(event) {

        // getting the arguments
        var arglen = arguments.length - 1,
          args = new Array(arglen),
          fns,
          fn,
          i;

        for (i = 0; i < arglen; i++) {
          args[i] = arguments[i + 1]; // skip first argument
        }

        fns = slice.call(callbacks[event] || [], 0);

        for (i = 0; fn = fns[i]; ++i) {
          fn.apply(el, args);
        }

        if (callbacks['*'] && event != '*')
          el.trigger.apply(el, ['*', event].concat(args));

        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    }
  });

  return el

};

// node_modules/referential/dist/referential.mjs
// src/ref.coffee
var Ref;
var nextId;
var indexOf$1 = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

nextId = (function() {
  var ids;
  ids = 0;
  return function() {
    return ids++;
  };
})();

var Ref$1 = Ref = class Ref {
  constructor(_value, parent, key1) {
    this._value = _value;
    this.parent = parent;
    this.key = key1;
    this._cache = {};
    this._children = {};
    this._numChildren = 0;
    this._id = nextId();
    if (this.parent != null) {
      this.parent._children[this._id] = this;
      this.parent._numChildren++;
    }
    observable(this);
    this;
  }

  _mutate(key) {
    var child, id, ref;
    this._cache = {};
    ref = this._children;
    for (id in ref) {
      child = ref[id];
      child._mutate();
    }
    return this;
  }

  destroy() {
    var child, id, ref;
    ref = this._children;
    for (id in ref) {
      child = ref[id];
      child.destroy();
    }
    delete this._cache;
    delete this._children;
    this.off('*');
    if (this.parent) {
      delete this.parent._children[this._id];
      this.parent._numChildren--;
    }
    return this;
  }

  value(state) {
    if (!this.parent) {
      if (state != null) {
        this._value = state;
      }
      return this._value;
    }
    if (state != null) {
      return this.parent.set(this.key, state);
    } else {
      return this.parent.get(this.key);
    }
  }

  ref(key) {
    if (!key) {
      return this;
    }
    return new Ref(null, this, key);
  }

  get(key) {
    if (!key) {
      return this.value();
    } else {
      if (this._cache[key]) {
        return this._cache[key];
      }
      return this._cache[key] = this.index(key);
    }
  }

  set(key, value) {
    var k, oldValue, v;
    if (esIs.isObject(key)) {
      for (k in key) {
        v = key[k];
        this.set(k, v);
      }
      return this;
    }
    oldValue = this.get(key);
    this._mutate(key);
    if (value == null) {
      this.value(index(this.value(), key));
    } else {
      this.index(key, value);
    }
    this._triggerSet(key, value, oldValue);
    this._triggerSetChildren(key, value, oldValue);
    return this;
  }

  _triggerSetChildren(key, value, oldValue) {
    var child, childKeys, childRemainderKey, i, id, keyPart, keyParts, partialKey, ref, ref1, regExps, results;
    if (this._numChildren === 0) {
      return this;
    }
    key = key + '';
    keyParts = key.split('.');
    partialKey = '';
    childKeys = [];
    regExps = {};
    for (i in keyParts) {
      keyPart = keyParts[i];
      if (partialKey === '') {
        partialKey = keyPart;
      } else {
        partialKey += '.' + keyPart;
      }
      childKeys[i] = partialKey;
      regExps[partialKey] = new RegExp('^' + partialKey + '\.?');
    }
    ref = this._children;
    results = [];
    for (id in ref) {
      child = ref[id];
      if (ref1 = child.key, indexOf$1.call(childKeys, ref1) >= 0) {
        childRemainderKey = key.replace(regExps[child.key], '');
        child.trigger('set', childRemainderKey, value, oldValue);
        results.push(child._triggerSetChildren(childRemainderKey, value, oldValue));
      } else {
        results.push(void 0);
      }
    }
    return results;
  }

  _triggerSet(key, value, oldValue) {
    var parentKey;
    this.trigger('set', key, value, oldValue);
    if (this.parent) {
      parentKey = this.key + '.' + key;
      return this.parent._triggerSet(parentKey, value, oldValue);
    }
  }

  extend(key, value) {
    var clone;
    this._mutate(key);
    if (value == null) {
      this.value(index(this.value(), key));
    } else {
      if (esIs.isObject(value)) {
        this.value(index((this.ref(key)).get(), value));
      } else {
        clone = this.clone();
        this.set(key, value);
        this.value(index(clone.get(), this.value()));
      }
    }
    return this;
  }

  clone(key) {
    return new Ref(index({}, this.get(key)));
  }

  index(key, value, obj = this.value(), prev) {
    var next, prop, props;
    if (this.parent) {
      return this.parent.index(this.key + '.' + key, value);
    }
    if (esIs.isNumber(key)) {
      key = String(key);
    }
    props = key.split('.');
    if (value == null) {
      while (prop = props.shift()) {
        if (!props.length) {
          return obj != null ? obj[prop] : void 0;
        }
        obj = obj != null ? obj[prop] : void 0;
      }
      return;
    }
    while (prop = props.shift()) {
      if (!props.length) {
        return obj[prop] = value;
      } else {
        next = props[0];
        if (obj[prop] == null) {
          if (isNaN(Number(next))) {
            if (obj[prop] == null) {
              obj[prop] = {};
            }
          } else {
            if (obj[prop] == null) {
              obj[prop] = [];
            }
          }
        }
      }
      obj = obj[prop];
    }
  }

};

// src/index.coffee
var methods;
var refer;

methods = ['extend', 'get', 'index', 'ref', 'set', 'value', 'on', 'off', 'one', 'trigger'];

refer = function(state, ref = null) {
  var fn, i, len, method, wrapper;
  if (ref == null) {
    ref = new Ref$1(state);
  }
  wrapper = function(key) {
    return ref.get(key);
  };
  fn = function(method) {
    return wrapper[method] = function() {
      return ref[method].apply(ref, arguments);
    };
  };
  for (i = 0, len = methods.length; i < len; i++) {
    method = methods[i];
    fn(method);
  }
  wrapper.refer = function(key) {
    return refer(null, ref.ref(key));
  };
  wrapper.clone = function(key) {
    return refer(null, ref.clone(key));
  };
  return wrapper;
};

refer.Ref = Ref$1;

var refer$1 = refer;

// src/events.coffee
var events;

var Events = events = {
  Ready: 'ready',
  SetData: 'set-data',
  TryUpdateItem: 'try-update-item',
  UpdateItem: 'update-item',
  UpdateItems: 'update-items',
  Change: 'change',
  ChangeSuccess: 'change-success',
  ChangeFailed: 'change-failed',
  Checkout: 'checkout',
  ContinueShopping: 'continue-shopping',
  Submit: 'submit',
  SubmitCart: 'submit-card',
  SubmitShippingAddress: 'submit-shipping-address',
  SubmitSuccess: 'submit-success',
  SubmitFailed: 'submit-failed',
  ForceApplyPromoCode: 'force-apply-promocode',
  ApplyPromoCode: 'apply-promocode',
  ApplyPromoCodeSuccess: 'apply-promocode-success',
  ApplyPromoCodeFailed: 'apply-promocode-failed',
  Login: 'login',
  LoginSuccess: 'login-success',
  LoginFailed: 'login-failed',
  Register: 'register',
  RegisterSuccess: 'register-success',
  RegisterFailed: 'register-failed',
  RegisterComplete: 'register-complete',
  RegisterCompleteSuccess: 'register-complete-success',
  RegisterCompleteFailed: 'register-complete-failed',
  ResetPassword: 'reset-password',
  ResetPasswordSuccess: 'reset-password-success',
  ResetPasswordFailed: 'reset-password-failed',
  ResetPasswordComplete: 'reset-password-complete',
  ResetPasswordCompleteSuccess: 'reset-password-complete-success',
  ResetPasswordCompleteFailed: 'reset-password-complete-failed',
  ProfileLoad: 'profile-load',
  ProfileLoadSuccess: 'profile-load-success',
  ProfileLoadFailed: 'profile-load-failed',
  ProfileUpdate: 'profile-update',
  ProfileUpdateSuccess: 'profile-update-success',
  ProfileUpdateFailed: 'profile-update-failed',
  ShippingAddressUpdate: 'shipping-address-update',
  ShippingAddressUpdateSuccess: 'shipping-address-update-success',
  ShippingAddressUpdateFailed: 'shipping-address-update-failed',
  SidePaneOpen: 'side-pane-open',
  SidePaneOpened: 'side-pane-opened',
  SidePaneClose: 'side-pane-close',
  SidePaneClosed: 'side-pane-closed',
  CheckoutOpen: 'checkout-open',
  CheckoutOpened: 'checkout-opened',
  CheckoutClose: 'checkout-close',
  CheckoutClosed: 'checkout-closed',
  DeleteLineItem: 'delete-line-item',
  CreateReferralProgram: 'create-referral-program',
  CreateReferralProgramSuccess: 'create-referral-program-success',
  CreateReferralProgramFailed: 'create-referral-program-failed'
};

// src/mediator.coffee
var m = observable({});

// src/controls/control.coffee
var Control;
var scrolling;
var extend$1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp = {}.hasOwnProperty;

scrolling = false;

var Control$1 = Control = (function(superClass) {
  extend$1(Control, superClass);

  function Control() {
    return Control.__super__.constructor.apply(this, arguments);
  }

  Control.prototype.init = function() {
    if ((this.input == null) && (this.lookup == null)) {
      throw new Error('No input or lookup provided');
    }
    if ((this.input == null) && (this.inputs != null)) {
      this.input = this.inputs[this.lookup];
    }
    if (this.input == null) {
      this.input = {
        name: this.lookup,
        ref: this.data.ref(this.lookup),
        validate: function(ref, name) {
          return Promise.resolve([ref, name]);
        }
      };
    }
    if (this.inputs != null) {
      return Control.__super__.init.apply(this, arguments);
    }
  };

  Control.prototype.getValue = function(event) {
    var ref1;
    return (ref1 = $(event.target).val()) != null ? ref1.trim() : void 0;
  };

  Control.prototype.error = function(err) {
    if (err instanceof DOMException) {
      console.log('WARNING: Error in riot dom manipulation ignored:', err);
      return;
    }
    Control.__super__.error.apply(this, arguments);
    if (!scrolling) {
      scrolling = true;
      $('html, body').animate({
        scrollTop: $(this.root).offset().top - $(window).height() / 2
      }, {
        complete: function() {
          return scrolling = false;
        },
        duration: 500
      });
    }
    return m.trigger(Events.ChangeFailed, this.input.name, this.input.ref.get(this.input.name));
  };

  Control.prototype.change = function() {
    Control.__super__.change.apply(this, arguments);
    return m.trigger(Events.Change, this.input.name, this.input.ref.get(this.input.name));
  };

  Control.prototype.changed = function(value) {
    m.trigger(Events.ChangeSuccess, this.input.name, value);
    return El.scheduleUpdate();
  };

  Control.prototype.value = function() {
    return this.input.ref(this.input.name);
  };

  return Control;

})(El.Input);

// src/utils/placeholder.coffee
var exports$1;
var hidePlaceholderOnFocus;
var unfocusOnAnElement;

hidePlaceholderOnFocus = function(event) {
  var target;
  target = event.currentTarget ? event.currentTarget : event.srcElement;
  if (target.value === target.getAttribute('placeholder')) {
    return target.value = '';
  }
};

unfocusOnAnElement = function(event) {
  var target;
  target = event.currentTarget ? event.currentTarget : event.srcElement;
  if (target.value === '') {
    return target.value = target.getAttribute('placeholder');
  }
};

exports$1 = function() {};

if (document.createElement("input").placeholder == null) {
  exports$1 = function(input) {
    var ref;
    input = (ref = input[0]) != null ? ref : input;
    if (input._placeholdered != null) {
      return;
    }
    Object.defineProperty(input, '_placeholdered', {
      value: true,
      writable: true
    });
    if (!input.value) {
      input.value = input.getAttribute('placeholder');
    }
    if (input.addEventListener) {
      input.addEventListener('click', hidePlaceholderOnFocus, false);
      return input.addEventListener('blur', unfocusOnAnElement, false);
    } else if (input.attachEvent) {
      input.attachEvent('onclick', hidePlaceholderOnFocus);
      return input.attachEvent('onblur', unfocusOnAnElement);
    }
  };
}

var placeholder = exports$1;

// templates/controls/text.pug
var html = "\n<input class=\"{invalid: errorMessage, valid: valid}\" id=\"{ input.name }\" name=\"{ name || input.name }\" type=\"{ type }\" onchange=\"{ change }\" onblur=\"{ change }\" riot-value=\"{ input.ref.get(input.name) }\" placeholder=\"{ placeholder }\" autocomplete=\"{ autoComplete }\">\n<yield></yield>";

// src/controls/text.coffee
var Text;
var extend$2 = function(child, parent) { for (var key in parent) { if (hasProp$1.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$1 = {}.hasOwnProperty;

var Text$1 = Text = (function(superClass) {
  extend$2(Text, superClass);

  function Text() {
    return Text.__super__.constructor.apply(this, arguments);
  }

  Text.prototype.tag = 'text-control';

  Text.prototype.html = html;

  Text.prototype.type = 'text';

  Text.prototype.formElement = 'input';

  Text.prototype.autoComplete = 'on';

  Text.prototype.init = function() {
    Text.__super__.init.apply(this, arguments);
    return this.on('updated', (function(_this) {
      return function() {
        var el;
        el = _this.root.getElementsByTagName(_this.formElement)[0];
        if (_this.type !== 'password') {
          return placeholder(el);
        }
      };
    })(this));
  };

  return Text;

})(Control$1);

// templates/controls/textarea.pug
var html$1 = "\n<textarea class=\"{invalid: errorMessage, valid: valid}\" id=\"{ input.name }\" name=\"{ name || input.name }\" rows=\"{ rows }\" cols=\"{ cols }\" type=\"text\" onchange=\"{ change }\" onblur=\"{ change }\" placeholder=\"{ placeholder }\">{ input.ref.get(input.name) }</textarea>\n<yield></yield>";

// src/controls/textarea.coffee
var TextArea;
var extend$3 = function(child, parent) { for (var key in parent) { if (hasProp$2.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$2 = {}.hasOwnProperty;

TextArea = (function(superClass) {
  extend$3(TextArea, superClass);

  function TextArea() {
    return TextArea.__super__.constructor.apply(this, arguments);
  }

  TextArea.prototype.tag = 'textarea-control';

  TextArea.prototype.html = html$1;

  TextArea.prototype.formElement = 'textarea';

  return TextArea;

})(Text$1);

var TextArea$1 = TextArea;

// templates/controls/checkbox.pug
var html$2 = "\n<input class=\"{invalid: errorMessage, valid: valid}\" id=\"{ input.name }\" name=\"{ name || input.name }\" type=\"checkbox\" onchange=\"{ change }\" onblur=\"{ change }\" checked=\"{ input.ref.get(input.name) }\">\n<yield></yield>";

// src/controls/checkbox.coffee
var Checkbox;
var extend$4 = function(child, parent) { for (var key in parent) { if (hasProp$3.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$3 = {}.hasOwnProperty;

var Checkbox$1 = Checkbox = (function(superClass) {
  extend$4(Checkbox, superClass);

  function Checkbox() {
    return Checkbox.__super__.constructor.apply(this, arguments);
  }

  Checkbox.prototype.tag = 'checkbox-control';

  Checkbox.prototype.html = html$2;

  Checkbox.prototype.getValue = function(event) {
    return event.target.checked;
  };

  return Checkbox;

})(Control$1);

// templates/controls/select.pug
var html$3 = "\n<select class=\"{invalid: errorMessage, valid: valid}\" id=\"{ input.name }\" style=\"display: none;\" name=\"{ name || input.name }\" onchange=\"{ change }\" onblur=\"{ change }\" placeholder=\"{ placeholder }\"></select>\n<yield></yield>";

// src/controls/select.coffee
var Select;
var coolDown;
var isABrokenBrowser;
var extend$5 = function(child, parent) { for (var key in parent) { if (hasProp$4.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$4 = {}.hasOwnProperty;

isABrokenBrowser = window.navigator.userAgent.indexOf('MSIE') > 0 || window.navigator.userAgent.indexOf('Trident') > 0;

coolDown = -1;

var Select$1 = Select = (function(superClass) {
  extend$5(Select, superClass);

  function Select() {
    return Select.__super__.constructor.apply(this, arguments);
  }

  Select.prototype.tag = 'select-control';

  Select.prototype.html = html$3;

  Select.prototype.selectOptions = {};

  Select.prototype.options = function() {
    return this.selectOptions;
  };

  Select.prototype.readOnly = false;

  Select.prototype.ignore = false;

  Select.prototype.events = {
    updated: function() {
      return this.onUpdated();
    },
    mount: function() {
      return this.onUpdated();
    }
  };

  Select.prototype.getValue = function(event) {
    var ref;
    return (ref = $(event.target).val()) != null ? ref.trim().toLowerCase() : void 0;
  };

  Select.prototype.initSelect = function($select) {
    var $input, invertedOptions, name, options, ref, select, value;
    options = [];
    invertedOptions = {};
    ref = this.options();
    for (value in ref) {
      name = ref[value];
      options.push({
        text: name,
        value: value
      });
      invertedOptions[name] = value;
    }
    selectize($select, {
      dropdownParent: 'body'
    }).on('change', (function(_this) {
      return function(event) {
        if (coolDown !== -1) {
          return;
        }
        coolDown = setTimeout(function() {
          return coolDown = -1;
        }, 100);
        _this.change(event);
        event.preventDefault();
        event.stopPropagation();
        return false;
      };
    })(this));
    select = $select[0];
    select.selectize.addOption(options);
    select.selectize.addItem([this.input.ref.get(this.input.name)] || [], true);
    select.selectize.refreshOptions(false);
    $input = $select.parent().find('.selectize-input input:first');
    $input.on('change', function(event) {
      var val;
      val = $(event.target).val();
      if (invertedOptions[val] != null) {
        return $select[0].selectize.setValue(invertedOptions[val]);
      }
    });
    if (this.readOnly) {
      return $input.attr('readonly', true);
    }
  };

  Select.prototype.init = function(opts) {
    Select.__super__.init.apply(this, arguments);
    return this.style = this.style || 'width:100%';
  };

  Select.prototype.onUpdated = function() {
    var $control, $select, select, v;
    if (this.input == null) {
      return;
    }
    $select = $(this.root).find('select');
    select = $select[0];
    if (select != null) {
      v = this.input.ref.get(this.input.name);
      if (!this.initialized) {
        return esRaf.raf((function(_this) {
          return function() {
            _this.initSelect($select);
            return _this.initialized = true;
          };
        })(this));
      } else if ((select.selectize != null) && v !== select.selectize.getValue()) {
        select.selectize.clear(true);
        return select.selectize.addItem(v, true);
      }
    } else {
      $control = $(this.root).find('.selectize-control');
      if ($control[0] == null) {
        return esRaf.raf((function(_this) {
          return function() {
            return _this.scheduleUpdate();
          };
        })(this));
      }
    }
  };

  return Select;

})(Text$1);

// src/controls/quantity-select.coffee
var QuantitySelect;
var i;
var j;
var opts;
var extend$6 = function(child, parent) { for (var key in parent) { if (hasProp$5.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$5 = {}.hasOwnProperty;

opts = {};

for (i = j = 1; j < 100; i = ++j) {
  opts[i] = i;
}

var QuantitySelect$1 = QuantitySelect = (function(superClass) {
  extend$6(QuantitySelect, superClass);

  function QuantitySelect() {
    return QuantitySelect.__super__.constructor.apply(this, arguments);
  }

  QuantitySelect.prototype.tag = 'quantity-select-control';

  QuantitySelect.prototype.lookup = 'quantity';

  QuantitySelect.prototype.options = function() {
    return opts;
  };

  QuantitySelect.prototype.init = function() {
    return QuantitySelect.__super__.init.apply(this, arguments);
  };

  QuantitySelect.prototype.readOnly = true;

  QuantitySelect.prototype.getValue = function(event) {
    var ref;
    return parseFloat((ref = $(event.target).val()) != null ? ref.trim() : void 0);
  };

  QuantitySelect.prototype.change = function(e) {
    var newValue, oldValue;
    if (e.target == null) {
      return;
    }
    oldValue = this.data.get('quantity');
    QuantitySelect.__super__.change.apply(this, arguments);
    newValue = this.data.get('quantity');
    this.data.set('quantity', oldValue);
    return this.cart.set(this.data.get('productId'), newValue);
  };

  return QuantitySelect;

})(Select$1);

// src/data/countries.coffee
var countries = {
  data: {
    af: "Afghanistan",
    ax: "Åland Islands",
    al: "Albania",
    dz: "Algeria",
    as: "American Samoa",
    ad: "Andorra",
    ao: "Angola",
    ai: "Anguilla",
    aq: "Antarctica",
    ag: "Antigua and Barbuda",
    ar: "Argentina",
    am: "Armenia",
    aw: "Aruba",
    au: "Australia",
    at: "Austria",
    az: "Azerbaijan",
    bs: "Bahamas",
    bh: "Bahrain",
    bd: "Bangladesh",
    bb: "Barbados",
    by: "Belarus",
    be: "Belgium",
    bz: "Belize",
    bj: "Benin",
    bm: "Bermuda",
    bt: "Bhutan",
    bo: "Bolivia",
    bq: "Bonaire, Sint Eustatius and Saba",
    ba: "Bosnia and Herzegovina",
    bw: "Botswana",
    bv: "Bouvet Island",
    br: "Brazil",
    io: "British Indian Ocean Territory",
    bn: "Brunei Darussalam",
    bg: "Bulgaria",
    bf: "Burkina Faso",
    bi: "Burundi",
    kh: "Cambodia",
    cm: "Cameroon",
    ca: "Canada",
    cv: "Cabo Verde",
    ky: "Cayman Islands",
    cf: "Central African Republic",
    td: "Chad",
    cl: "Chile",
    cn: "China",
    cx: "Christmas Island",
    cc: "Cocos (Keeling) Islands",
    co: "Colombia",
    km: "Comoros",
    cg: "Congo",
    cd: "Congo (Democratic Republic)",
    ck: "Cook Islands",
    cr: "Costa Rica",
    ci: "Côte d'Ivoire",
    hr: "Croatia",
    cu: "Cuba",
    cw: "Curaçao",
    cy: "Cyprus",
    cz: "Czech Republic",
    dk: "Denmark",
    dj: "Djibouti",
    dm: "Dominica",
    "do": "Dominican Republic",
    ec: "Ecuador",
    eg: "Egypt",
    sv: "El Salvador",
    gq: "Equatorial Guinea",
    er: "Eritrea",
    ee: "Estonia",
    et: "Ethiopia",
    fk: "Falkland Islands",
    fo: "Faroe Islands",
    fj: "Fiji",
    fi: "Finland",
    fr: "France",
    gf: "French Guiana",
    pf: "French Polynesia",
    tf: "French Southern Territories",
    ga: "Gabon",
    gm: "Gambia",
    ge: "Georgia",
    de: "Germany",
    gh: "Ghana",
    gi: "Gibraltar",
    gr: "Greece",
    gl: "Greenland",
    gd: "Grenada",
    gp: "Guadeloupe",
    gu: "Guam",
    gt: "Guatemala",
    gg: "Guernsey",
    gn: "Guinea",
    gw: "Guinea-Bissau",
    gy: "Guyana",
    ht: "Haiti",
    hm: "Heard Island and McDonald Islands",
    va: "Holy See",
    hn: "Honduras",
    hk: "Hong Kong",
    hu: "Hungary",
    is: "Iceland",
    "in": "India",
    id: "Indonesia",
    ir: "Iran",
    iq: "Iraq",
    ie: "Ireland",
    im: "Isle of Man",
    il: "Israel",
    it: "Italy",
    jm: "Jamaica",
    jp: "Japan",
    je: "Jersey",
    jo: "Jordan",
    kz: "Kazakhstan",
    ke: "Kenya",
    ki: "Kiribati",
    kp: "Korea (Democratic People's Republic of)",
    kr: "Korea (Republic of)",
    kw: "Kuwait",
    kg: "Kyrgyzstan",
    la: "Lao People's Democratic Republic",
    lv: "Latvia",
    lb: "Lebanon",
    ls: "Lesotho",
    lr: "Liberia",
    ly: "Libya",
    li: "Liechtenstein",
    lt: "Lithuania",
    lu: "Luxembourg",
    mo: "Macao",
    mk: "Macedonia",
    mg: "Madagascar",
    mw: "Malawi",
    my: "Malaysia",
    mv: "Maldives",
    ml: "Mali",
    mt: "Malta",
    mh: "Marshall Islands",
    mq: "Martinique",
    mr: "Mauritania",
    mu: "Mauritius",
    yt: "Mayotte",
    mx: "Mexico",
    fm: "Micronesia",
    md: "Moldova",
    mc: "Monaco",
    mn: "Mongolia",
    me: "Montenegro",
    ms: "Montserrat",
    ma: "Morocco",
    mz: "Mozambique",
    mm: "Myanmar",
    na: "Namibia",
    nr: "Nauru",
    np: "Nepal",
    nl: "Netherlands",
    nc: "New Caledonia",
    nz: "New Zealand",
    ni: "Nicaragua",
    ne: "Niger",
    ng: "Nigeria",
    nu: "Niue",
    nf: "Norfolk Island",
    mp: "Northern Mariana Islands",
    no: "Norway",
    om: "Oman",
    pk: "Pakistan",
    pw: "Palau",
    ps: "Palestine",
    pa: "Panama",
    pg: "Papua New Guinea",
    py: "Paraguay",
    pe: "Peru",
    ph: "Philippines",
    pn: "Pitcairn",
    pl: "Poland",
    pt: "Portugal",
    pr: "Puerto Rico",
    qa: "Qatar",
    re: "Réunion",
    ro: "Romania",
    ru: "Russian Federation",
    rw: "Rwanda",
    bl: "Saint Barthélemy",
    sh: "Saint Helena, Ascension and Tristan da Cunha",
    kn: "Saint Kitts and Nevis",
    lc: "Saint Lucia",
    mf: "Saint Martin (French)",
    pm: "Saint Pierre and Miquelon",
    vc: "Saint Vincent and the Grenadines",
    ws: "Samoa",
    sm: "San Marino",
    st: "Sao Tome and Principe",
    sa: "Saudi Arabia",
    sn: "Senegal",
    rs: "Serbia",
    sc: "Seychelles",
    sl: "Sierra Leone",
    sg: "Singapore",
    sx: "Sint Maarten (Dutch)",
    sk: "Slovakia",
    si: "Slovenia",
    sb: "Solomon Islands",
    so: "Somalia",
    za: "South Africa",
    gs: "South Georgia and the South Sandwich Islands",
    ss: "South Sudan",
    es: "Spain",
    lk: "Sri Lanka",
    sd: "Sudan",
    sr: "Suriname",
    sj: "Svalbard and Jan Mayen",
    sz: "Swaziland",
    se: "Sweden",
    ch: "Switzerland",
    sy: "Syrian Arab Republic",
    tw: "Taiwan",
    tj: "Tajikistan",
    tz: "Tanzania",
    th: "Thailand",
    tl: "Timor-Leste",
    tg: "Togo",
    tk: "Tokelau",
    to: "Tonga",
    tt: "Trinidad and Tobago",
    tn: "Tunisia",
    tr: "Turkey",
    tm: "Turkmenistan",
    tc: "Turks and Caicos Islands",
    tv: "Tuvalu",
    ug: "Uganda",
    ua: "Ukraine",
    ae: "United Arab Emirates",
    gb: "United Kingdom of Great Britain and Northern Ireland",
    us: "United States of America",
    um: "United States Minor Outlying Islands",
    uy: "Uruguay",
    uz: "Uzbekistan",
    vu: "Vanuatu",
    ve: "Venezuela",
    vn: "Viet Nam",
    vg: "Virgin Islands (British)",
    vi: "Virgin Islands (U.S.)",
    wf: "Wallis and Futuna",
    eh: "Western Sahara",
    ye: "Yemen",
    zm: "Zambia",
    zw: "Zimbabwe"
  }
};

// src/controls/country-select.coffee
var CountrySelect;
var extend$7 = function(child, parent) { for (var key in parent) { if (hasProp$6.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$6 = {}.hasOwnProperty;

var CountrySelect$1 = CountrySelect = (function(superClass) {
  extend$7(CountrySelect, superClass);

  function CountrySelect() {
    return CountrySelect.__super__.constructor.apply(this, arguments);
  }

  CountrySelect.prototype.tag = 'country-select-control';

  CountrySelect.prototype.options = function() {
    return countries.data;
  };

  CountrySelect.prototype.init = function() {
    CountrySelect.__super__.init.apply(this, arguments);
    return this.on('update', (function(_this) {
      return function() {
        var country, k, ref, v;
        country = _this.input.ref.get('order.shippingAddress.country');
        if (country) {
          country = country.toLowerCase();
          if (country.length === 2) {
            return _this.input.ref.set('order.shippingAddress.country', country);
          } else {
            ref = countries.data;
            for (k in ref) {
              v = ref[k];
              if (v.toLowerCase() === country) {
                _this.input.ref.set('order.shippingAddress.country', k);
                return;
              }
            }
          }
        }
      };
    })(this));
  };

  return CountrySelect;

})(Select$1);

// src/data/states.coffee
var states = {
  data: {
    ak: 'Alaska',
    al: 'Alabama',
    ar: 'Arkansas',
    az: 'Arizona',
    ca: 'California',
    co: 'Colorado',
    ct: 'Connecticut',
    dc: 'District of Columbia',
    de: 'Delaware',
    fl: 'Florida',
    ga: 'Georgia',
    hi: 'Hawaii',
    ia: 'Iowa',
    id: 'Idaho',
    il: 'Illinois',
    "in": 'Indiana',
    ks: 'Kansas',
    ky: 'Kentucky',
    la: 'Louisiana',
    ma: 'Massachusetts',
    md: 'Maryland',
    me: 'Maine',
    mi: 'Michigan',
    mn: 'Minnesota',
    mo: 'Missouri',
    ms: 'Mississippi',
    mt: 'Montana',
    nc: 'North Carolina',
    nd: 'North Dakota',
    ne: 'Nebraska',
    nh: 'New Hampshire',
    nj: 'New Jersey',
    nm: 'New Mexico',
    nv: 'Nevada',
    ny: 'New York',
    oh: 'Ohio',
    ok: 'Oklahoma',
    or: 'Oregon',
    pa: 'Pennsylvania',
    ri: 'Rhode Island',
    sc: 'South Carolina',
    sd: 'South Dakota',
    tn: 'Tennessee',
    tx: 'Texas',
    ut: 'Utah',
    va: 'Virginia',
    vt: 'Vermont',
    wa: 'Washington',
    wi: 'Wisconsin',
    wv: 'West Virginia',
    wy: 'Wyoming',
    aa: 'U.S. Armed Forces – Americas',
    ae: 'U.S. Armed Forces – Europe',
    ap: 'U.S. Armed Forces – Pacific'
  }
};

// templates/controls/state-select.pug
var html$4 = "\n<input class=\"{invalid: errorMessage, valid: valid}\" if=\"{ input.ref.get(countryField) !== &quot;us&quot; }\" id=\"{ input.name }\" name=\"{ name || input.name }\" type=\"text\" onchange=\"{ change }\" onblur=\"{ change }\" riot-value=\"{ input.ref.get(input.name) }\" placeholder=\"{ placeholder }\">\n<select class=\"{invalid: errorMessage, valid: valid}\" if=\"{ input.ref.get(countryField) == &quot;us&quot; }\" id=\"{ input.name }\" name=\"{ name || input.name }\" style=\"display: none;\" onchange=\"{ change }\" onblur=\"{ change }\" data-placeholder=\"{ placeholder }\"></select>\n<yield></yield>";

// src/controls/state-select.coffee
var StateSelect;
var extend$8 = function(child, parent) { for (var key in parent) { if (hasProp$7.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$7 = {}.hasOwnProperty;

var Select$2 = StateSelect = (function(superClass) {
  extend$8(StateSelect, superClass);

  function StateSelect() {
    return StateSelect.__super__.constructor.apply(this, arguments);
  }

  StateSelect.prototype.tag = 'state-select-control';

  StateSelect.prototype.html = html$4;

  StateSelect.prototype.options = function() {
    return states.data;
  };

  StateSelect.prototype.countryField = 'order.shippingAddress.country';

  StateSelect.prototype.init = function() {
    StateSelect.__super__.init.apply(this, arguments);
    return this.on('update', (function(_this) {
      return function() {
        var k, ref, state, v;
        if (_this.input == null) {
          return;
        }
        state = _this.input.ref.get('order.shippingAddress.state');
        if (state) {
          state = state.toLowerCase();
          if (state.length === 2) {
            return _this.input.ref.set('order.shippingAddress.state', state);
          } else {
            ref = states.data;
            for (k in ref) {
              v = ref[k];
              if (v.toLowerCase() === state) {
                _this.input.ref.set('order.shippingAddress.state', k);
                return;
              }
            }
          }
        }
      };
    })(this));
  };

  StateSelect.prototype.onUpdated = function() {
    var value;
    if (this.input == null) {
      return;
    }
    if (this.input.ref.get(this.countryField) === 'us') {
      $(this.root).find('.selectize-control').show();
    } else {
      $(this.root).find('.selectize-control').hide();
      value = this.input.ref.get(this.input.name);
      if (value) {
        this.input.ref.set(this.input.name, value.toUpperCase());
      }
    }
    return StateSelect.__super__.onUpdated.apply(this, arguments);
  };

  return StateSelect;

})(Select$1);

// src/controls/user-email.coffee
var UserName;
var extend$9 = function(child, parent) { for (var key in parent) { if (hasProp$8.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$8 = {}.hasOwnProperty;

var UserEmail = UserName = (function(superClass) {
  extend$9(UserName, superClass);

  function UserName() {
    return UserName.__super__.constructor.apply(this, arguments);
  }

  UserName.prototype.tag = 'user-name';

  UserName.prototype.lookup = 'user.name';

  return UserName;

})(Text$1);

// src/controls/user-name.coffee
var UserEmail$1;
var extend$10 = function(child, parent) { for (var key in parent) { if (hasProp$9.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$9 = {}.hasOwnProperty;

var UserName$1 = UserEmail$1 = (function(superClass) {
  extend$10(UserEmail, superClass);

  function UserEmail() {
    return UserEmail.__super__.constructor.apply(this, arguments);
  }

  UserEmail.prototype.tag = 'user-email';

  UserEmail.prototype.lookup = 'user.email';

  return UserEmail;

})(Text$1);

// src/controls/user-current-password.coffee
var UserCurrentPassword;
var extend$11 = function(child, parent) { for (var key in parent) { if (hasProp$10.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$10 = {}.hasOwnProperty;

var UserCurrentPassword$1 = UserCurrentPassword = (function(superClass) {
  extend$11(UserCurrentPassword, superClass);

  function UserCurrentPassword() {
    return UserCurrentPassword.__super__.constructor.apply(this, arguments);
  }

  UserCurrentPassword.prototype.tag = 'user-current-password';

  UserCurrentPassword.prototype.lookup = 'user.currentPassword';

  UserCurrentPassword.prototype.type = 'password';

  UserCurrentPassword.prototype.autoComplete = 'off';

  UserCurrentPassword.prototype.init = function() {
    return UserCurrentPassword.__super__.init.apply(this, arguments);
  };

  return UserCurrentPassword;

})(Text$1);

// src/controls/user-password.coffee
var UserPassword;
var extend$12 = function(child, parent) { for (var key in parent) { if (hasProp$11.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$11 = {}.hasOwnProperty;

var UserPassword$1 = UserPassword = (function(superClass) {
  extend$12(UserPassword, superClass);

  function UserPassword() {
    return UserPassword.__super__.constructor.apply(this, arguments);
  }

  UserPassword.prototype.tag = 'user-password';

  UserPassword.prototype.lookup = 'user.password';

  UserPassword.prototype.type = 'password';

  return UserPassword;

})(Text$1);

// src/controls/user-password-confirm.coffee
var UserPasswordConfirm;
var extend$13 = function(child, parent) { for (var key in parent) { if (hasProp$12.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$12 = {}.hasOwnProperty;

var UserPasswordConfirm$1 = UserPasswordConfirm = (function(superClass) {
  extend$13(UserPasswordConfirm, superClass);

  function UserPasswordConfirm() {
    return UserPasswordConfirm.__super__.constructor.apply(this, arguments);
  }

  UserPasswordConfirm.prototype.tag = 'user-password-confirm';

  UserPasswordConfirm.prototype.lookup = 'user.passwordConfirm';

  UserPasswordConfirm.prototype.type = 'password';

  UserPasswordConfirm.prototype.autoComplete = 'off';

  UserPasswordConfirm.prototype.init = function() {
    return UserPasswordConfirm.__super__.init.apply(this, arguments);
  };

  return UserPasswordConfirm;

})(Text$1);

// src/controls/shippingaddress-name.coffee
var ShippingAddressName;
var extend$14 = function(child, parent) { for (var key in parent) { if (hasProp$13.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$13 = {}.hasOwnProperty;

var ShippingAddressName$1 = ShippingAddressName = (function(superClass) {
  extend$14(ShippingAddressName, superClass);

  function ShippingAddressName() {
    return ShippingAddressName.__super__.constructor.apply(this, arguments);
  }

  ShippingAddressName.prototype.tag = 'shippingaddress-name';

  ShippingAddressName.prototype.lookup = 'order.shippingAddress.name';

  return ShippingAddressName;

})(Text$1);

// src/controls/shippingaddress-line1.coffee
var ShippingAddressLine1;
var extend$15 = function(child, parent) { for (var key in parent) { if (hasProp$14.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$14 = {}.hasOwnProperty;

var ShippingAddressLine1$1 = ShippingAddressLine1 = (function(superClass) {
  extend$15(ShippingAddressLine1, superClass);

  function ShippingAddressLine1() {
    return ShippingAddressLine1.__super__.constructor.apply(this, arguments);
  }

  ShippingAddressLine1.prototype.tag = 'shippingaddress-line1';

  ShippingAddressLine1.prototype.lookup = 'order.shippingAddress.line1';

  return ShippingAddressLine1;

})(Text$1);

// src/controls/shippingaddress-line2.coffee
var ShippingAddressLine2;
var extend$16 = function(child, parent) { for (var key in parent) { if (hasProp$15.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$15 = {}.hasOwnProperty;

var ShippingAddressLine2$1 = ShippingAddressLine2 = (function(superClass) {
  extend$16(ShippingAddressLine2, superClass);

  function ShippingAddressLine2() {
    return ShippingAddressLine2.__super__.constructor.apply(this, arguments);
  }

  ShippingAddressLine2.prototype.tag = 'shippingaddress-line2';

  ShippingAddressLine2.prototype.lookup = 'order.shippingAddress.line2';

  return ShippingAddressLine2;

})(Text$1);

// src/controls/shippingaddress-city.coffee
var ShippingAddressCity;
var extend$17 = function(child, parent) { for (var key in parent) { if (hasProp$16.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$16 = {}.hasOwnProperty;

var ShippingAddressCity$1 = ShippingAddressCity = (function(superClass) {
  extend$17(ShippingAddressCity, superClass);

  function ShippingAddressCity() {
    return ShippingAddressCity.__super__.constructor.apply(this, arguments);
  }

  ShippingAddressCity.prototype.tag = 'shippingaddress-city';

  ShippingAddressCity.prototype.lookup = 'order.shippingAddress.city';

  return ShippingAddressCity;

})(Text$1);

// src/controls/shippingaddress-postalcode.coffee
var ShippingAddressPostalCode;
var extend$18 = function(child, parent) { for (var key in parent) { if (hasProp$17.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$17 = {}.hasOwnProperty;

var ShippingAddressPostalCode$1 = ShippingAddressPostalCode = (function(superClass) {
  extend$18(ShippingAddressPostalCode, superClass);

  function ShippingAddressPostalCode() {
    return ShippingAddressPostalCode.__super__.constructor.apply(this, arguments);
  }

  ShippingAddressPostalCode.prototype.tag = 'shippingaddress-postalcode';

  ShippingAddressPostalCode.prototype.lookup = 'order.shippingAddress.postalCode';

  return ShippingAddressPostalCode;

})(Text$1);

// src/controls/shippingaddress-state.coffee
var ShippingAddressState;
var extend$19 = function(child, parent) { for (var key in parent) { if (hasProp$18.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$18 = {}.hasOwnProperty;

var ShippingAddressState$1 = ShippingAddressState = (function(superClass) {
  extend$19(ShippingAddressState, superClass);

  function ShippingAddressState() {
    return ShippingAddressState.__super__.constructor.apply(this, arguments);
  }

  ShippingAddressState.prototype.tag = 'shippingaddress-state';

  ShippingAddressState.prototype.lookup = 'order.shippingAddress.state';

  return ShippingAddressState;

})(Select$2);

// src/controls/shippingaddress-country.coffee
var ShippingAddressCountry;
var extend$20 = function(child, parent) { for (var key in parent) { if (hasProp$19.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$19 = {}.hasOwnProperty;

var ShippingAddressCountry$1 = ShippingAddressCountry = (function(superClass) {
  extend$20(ShippingAddressCountry, superClass);

  function ShippingAddressCountry() {
    return ShippingAddressCountry.__super__.constructor.apply(this, arguments);
  }

  ShippingAddressCountry.prototype.tag = 'shippingaddress-country';

  ShippingAddressCountry.prototype.lookup = 'order.shippingAddress.country';

  return ShippingAddressCountry;

})(CountrySelect$1);

// src/controls/card-name.coffee
var CardName;
var extend$21 = function(child, parent) { for (var key in parent) { if (hasProp$20.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$20 = {}.hasOwnProperty;

CardName = (function(superClass) {
  extend$21(CardName, superClass);

  function CardName() {
    return CardName.__super__.constructor.apply(this, arguments);
  }

  CardName.prototype.tag = 'card-name';

  CardName.prototype.lookup = 'payment.account.name';

  return CardName;

})(Text$1);

var CardName$1 = CardName;

// src/utils/keys.coffee
var keys = {
  ignore: [8, 9, 13, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40],
  numeric: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57]
};

// src/utils/card.coffee
var cards;
var defaultFormat;

defaultFormat = /(\d{1,4})/g;

cards = [
  {
    type: 'amex',
    pattern: /^3[47]/,
    format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
    length: [15],
    cvcLength: [4],
    luhn: true
  }, {
    type: 'dankort',
    pattern: /^5019/,
    format: defaultFormat,
    length: [16],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'dinersclub',
    pattern: /^(36|38|30[0-5])/,
    format: /(\d{1,4})(\d{1,6})?(\d{1,4})?/,
    length: [14],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'discover',
    pattern: /^(6011|65|64[4-9]|622)/,
    format: defaultFormat,
    length: [16],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'jcb',
    pattern: /^35/,
    format: defaultFormat,
    length: [16],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'laser',
    pattern: /^(6706|6771|6709)/,
    format: defaultFormat,
    length: [16, 17, 18, 19],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'maestro',
    pattern: /^(5018|5020|5038|6304|6703|6708|6759|676[1-3])/,
    format: defaultFormat,
    length: [12, 13, 14, 15, 16, 17, 18, 19],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'mastercard',
    pattern: /^(5[1-5]|677189)|^(222[1-9]|2[3-6]\d{2}|27[0-1]\d|2720)/,
    format: defaultFormat,
    length: [16],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'unionpay',
    pattern: /^62/,
    format: defaultFormat,
    length: [16, 17, 18, 19],
    cvcLength: [3],
    luhn: false
  }, {
    type: 'visaelectron',
    pattern: /^4(026|17500|405|508|844|91[37])/,
    format: defaultFormat,
    length: [16],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'elo',
    pattern: /^(4011|438935|45(1416|76|7393)|50(4175|6699|67|90[4-7])|63(6297|6368))/,
    format: defaultFormat,
    length: [16],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'visa',
    pattern: /^4/,
    format: defaultFormat,
    length: [13, 16, 19],
    cvcLength: [3],
    luhn: true
  }
];

var luhnCheck = function(num) {
  var digit, digits, i, len, odd, sum;
  odd = true;
  sum = 0;
  digits = (num + '').split('').reverse();
  for (i = 0, len = digits.length; i < len; i++) {
    digit = digits[i];
    digit = parseInt(digit, 10);
    if ((odd = !odd)) {
      digit *= 2;
    }
    if (digit > 9) {
      digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
};

var cardFromNumber = function(num) {
  var card, i, len;
  num = (num + '').replace(/\D/g, '');
  for (i = 0, len = cards.length; i < len; i++) {
    card = cards[i];
    if (card.pattern.test(num)) {
      return card;
    }
  }
};



var restrictNumeric = function(e) {
  var input;
  if (e.metaKey || e.ctrlKey) {
    return true;
  }
  if (e.which === 32) {
    return e.preventDefault();
  }
  if (e.which === 0) {
    return true;
  }
  if (e.which < 33) {
    return true;
  }
  input = String.fromCharCode(e.which);
  if (!/[\d\s]/.test(input)) {
    return e.preventDefault();
  }
};

// src/controls/card-number.coffee
var CardNumber;
var extend$22 = function(child, parent) { for (var key in parent) { if (hasProp$21.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$21 = {}.hasOwnProperty;
var indexOf$2 = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

CardNumber = (function(superClass) {
  extend$22(CardNumber, superClass);

  function CardNumber() {
    return CardNumber.__super__.constructor.apply(this, arguments);
  }

  CardNumber.prototype.tag = 'card-number';

  CardNumber.prototype.lookup = 'payment.account.number';

  CardNumber.prototype.cardType = '';

  CardNumber.prototype.events = {
    updated: function() {
      return this.onUpdated();
    }
  };

  CardNumber.prototype.init = function() {
    return CardNumber.__super__.init.apply(this, arguments);
  };

  CardNumber.prototype.onUpdated = function() {
    var $input, $root;
    if (!this.first) {
      $root = $(this.root);
      $input = $($root.find('input')[0]);
      $input.on('keypress', restrictNumeric);
      $input.on('keypress', (function(_this) {
        return function(e) {
          var card, i, j, k, length, newValue, ref, ref1, ref2, upperLength, value;
          if (ref = e.which, indexOf$2.call(keys.numeric, ref) < 0) {
            return true;
          }
          $root.removeClass(_this.cardType + ' identified unknown');
          value = $input.val() + String.fromCharCode(e.which);
          value = value.replace(/\D/g, '');
          length = value.length;
          upperLength = 16;
          card = cardFromNumber(value);
          if (card) {
            upperLength = card.length[card.length.length - 1];
            _this.cardType = card.type;
            if (_this.cardType) {
              $root.addClass(_this.cardType + ' identified');
            } else {
              $root.addClass('unknown');
            }
          }
          if (length > upperLength) {
            return false;
          }
          newValue = value[0];
          if (length > 1) {
            if (card && card.type === 'amex') {
              for (i = j = 1, ref1 = length - 1; 1 <= ref1 ? j <= ref1 : j >= ref1; i = 1 <= ref1 ? ++j : --j) {
                if (i === 3 || i === 9) {
                  newValue += value[i] + ' ';
                } else {
                  newValue += value[i];
                }
              }
            } else {
              for (i = k = 1, ref2 = length - 1; 1 <= ref2 ? k <= ref2 : k >= ref2; i = 1 <= ref2 ? ++k : --k) {
                if ((i + 1) % 4 === 0 && i !== length - 1) {
                  newValue += value[i] + ' ';
                } else {
                  newValue += value[i];
                }
              }
            }
          }
          $input.val(newValue);
          return e.preventDefault();
        };
      })(this));
      return this.first = true;
    }
  };

  return CardNumber;

})(Text$1);

var CardNumber$1 = CardNumber;

// src/controls/card-expiry.coffee
var CardExpiry;
var extend$23 = function(child, parent) { for (var key in parent) { if (hasProp$22.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$22 = {}.hasOwnProperty;
var indexOf$3 = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

CardExpiry = (function(superClass) {
  extend$23(CardExpiry, superClass);

  function CardExpiry() {
    return CardExpiry.__super__.constructor.apply(this, arguments);
  }

  CardExpiry.prototype.tag = 'card-expiry';

  CardExpiry.prototype.lookup = 'payment.account.expiry';

  CardExpiry.prototype.events = {
    updated: function() {
      return this.onUpdated();
    }
  };

  CardExpiry.prototype.init = function() {
    return CardExpiry.__super__.init.apply(this, arguments);
  };

  CardExpiry.prototype.onUpdated = function() {
    var $input;
    if (!this.first) {
      $input = $($(this.root).find('input')[0]);
      $input.on('keypress', restrictNumeric);
      $input.on('keypress', function(e) {
        var ref, value;
        if (ref = e.which, indexOf$3.call(keys.numeric, ref) < 0) {
          return true;
        }
        value = $input.val() + String.fromCharCode(e.which);
        if (value.length > 7) {
          return false;
        }
        if (/^\d$/.test(value) && (value !== '0' && value !== '1')) {
          $input.val('0' + value + ' / ');
          return e.preventDefault();
        } else if (/^\d\d$/.test(value)) {
          $input.val(value + ' / ');
          return e.preventDefault();
        }
      });
      return this.first = true;
    }
  };

  return CardExpiry;

})(Text$1);

var CardExpiry$1 = CardExpiry;

// src/controls/card-cvc.coffee
var CardCVC;
var extend$24 = function(child, parent) { for (var key in parent) { if (hasProp$23.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$23 = {}.hasOwnProperty;
var indexOf$4 = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

CardCVC = (function(superClass) {
  extend$24(CardCVC, superClass);

  function CardCVC() {
    return CardCVC.__super__.constructor.apply(this, arguments);
  }

  CardCVC.prototype.tag = 'card-cvc';

  CardCVC.prototype.lookup = 'payment.account.cvc';

  CardCVC.prototype.events = {
    updated: function() {
      return this.onUpdated();
    }
  };

  CardCVC.prototype.init = function() {
    return CardCVC.__super__.init.apply(this, arguments);
  };

  CardCVC.prototype.onUpdated = function() {
    var $input;
    if (!this.first) {
      $input = $($(this.root).find('input')[0]);
      $input.on('keypress', restrictNumeric);
      $input.on('keypress', function(e) {
        var ref, value;
        if (ref = e.which, indexOf$4.call(keys.numeric, ref) < 0) {
          return true;
        }
        value = $input.val() + String.fromCharCode(e.which);
        if (value.length > 4) {
          return false;
        }
      });
      return this.first = true;
    }
  };

  return CardCVC;

})(Text$1);

var CardCVC$1 = CardCVC;

// src/controls/terms.coffee
var Terms;
var extend$25 = function(child, parent) { for (var key in parent) { if (hasProp$24.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$24 = {}.hasOwnProperty;

var Terms$1 = Terms = (function(superClass) {
  extend$25(Terms, superClass);

  function Terms() {
    return Terms.__super__.constructor.apply(this, arguments);
  }

  Terms.prototype.tag = 'terms';

  Terms.prototype.lookup = 'terms';

  return Terms;

})(Checkbox$1);

// src/controls/gift-toggle.coffee
var GiftToggle;
var extend$26 = function(child, parent) { for (var key in parent) { if (hasProp$25.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$25 = {}.hasOwnProperty;

var GiftToggle$1 = GiftToggle = (function(superClass) {
  extend$26(GiftToggle, superClass);

  function GiftToggle() {
    return GiftToggle.__super__.constructor.apply(this, arguments);
  }

  GiftToggle.prototype.tag = 'gift-toggle';

  GiftToggle.prototype.lookup = 'order.gift';

  return GiftToggle;

})(Checkbox$1);

// src/controls/gift-type.coffee
var GiftType;
var extend$27 = function(child, parent) { for (var key in parent) { if (hasProp$26.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$26 = {}.hasOwnProperty;

GiftType = (function(superClass) {
  extend$27(GiftType, superClass);

  function GiftType() {
    return GiftType.__super__.constructor.apply(this, arguments);
  }

  GiftType.prototype.tag = 'gift-type';

  GiftType.prototype.lookup = 'order.giftType';

  return GiftType;

})(Select$2);

var GiftType$1 = GiftType;

// src/controls/gift-email.coffee
var GiftEmail;
var extend$28 = function(child, parent) { for (var key in parent) { if (hasProp$27.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$27 = {}.hasOwnProperty;

GiftEmail = (function(superClass) {
  extend$28(GiftEmail, superClass);

  function GiftEmail() {
    return GiftEmail.__super__.constructor.apply(this, arguments);
  }

  GiftEmail.prototype.tag = 'gift-email';

  GiftEmail.prototype.lookup = 'order.giftEmail';

  return GiftEmail;

})(Text$1);

var GiftEmail$1 = GiftEmail;

// src/controls/gift-message.coffee
var GiftMessage;
var extend$29 = function(child, parent) { for (var key in parent) { if (hasProp$28.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$28 = {}.hasOwnProperty;

var GiftMessage$1 = GiftMessage = (function(superClass) {
  extend$29(GiftMessage, superClass);

  function GiftMessage() {
    return GiftMessage.__super__.constructor.apply(this, arguments);
  }

  GiftMessage.prototype.tag = 'gift-message';

  GiftMessage.prototype.lookup = 'order.giftMessage';

  return GiftMessage;

})(TextArea$1);

// src/controls/promocode.coffee
var PromoCode;
var extend$30 = function(child, parent) { for (var key in parent) { if (hasProp$29.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$29 = {}.hasOwnProperty;

var PromoCode$1 = PromoCode = (function(superClass) {
  extend$30(PromoCode, superClass);

  function PromoCode() {
    return PromoCode.__super__.constructor.apply(this, arguments);
  }

  PromoCode.prototype.tag = 'promocode';

  PromoCode.prototype.lookup = 'order.promoCode';

  return PromoCode;

})(Text$1);

// src/controls/index.coffee
var Controls;

var Controls$1 = Controls = {
  Control: Control$1,
  Text: Text$1,
  TextArea: TextArea$1,
  Checkbox: Checkbox$1,
  Select: Select$1,
  QuantitySelect: QuantitySelect$1,
  CountrySelect: CountrySelect$1,
  StateSelect: Select$2,
  UserEmail: UserEmail,
  UserName: UserName$1,
  UserCurrentPassword: UserCurrentPassword$1,
  UserPassword: UserPassword$1,
  UserPasswordConfirm: UserPasswordConfirm$1,
  ShippingAddressName: ShippingAddressName$1,
  ShippingAddressLine1: ShippingAddressLine1$1,
  ShippingAddressLine2: ShippingAddressLine2$1,
  ShippingAddressCity: ShippingAddressCity$1,
  ShippingAddressPostalCode: ShippingAddressPostalCode$1,
  ShippingAddressState: ShippingAddressState$1,
  ShippingAddressCountry: ShippingAddressCountry$1,
  CardName: CardName$1,
  CardNumber: CardNumber$1,
  CardExpiry: CardExpiry$1,
  CardCVC: CardCVC$1,
  Terms: Terms$1,
  GiftToggle: GiftToggle$1,
  GiftType: GiftType$1,
  GiftEmail: GiftEmail$1,
  GiftMessage: GiftMessage$1,
  PromoCode: PromoCode$1,
  register: function() {
    Text$1.register();
    TextArea$1.register();
    Checkbox$1.register();
    Select$1.register();
    QuantitySelect$1.register();
    CountrySelect$1.register();
    Select$2.register();
    UserEmail.register();
    UserName$1.register();
    UserCurrentPassword$1.register();
    UserPassword$1.register();
    UserPasswordConfirm$1.register();
    ShippingAddressName$1.register();
    ShippingAddressLine1$1.register();
    ShippingAddressLine2$1.register();
    ShippingAddressCity$1.register();
    ShippingAddressPostalCode$1.register();
    ShippingAddressState$1.register();
    ShippingAddressCountry$1.register();
    CardName$1.register();
    CardNumber$1.register();
    CardExpiry$1.register();
    CardCVC$1.register();
    Terms$1.register();
    GiftToggle$1.register();
    GiftType$1.register();
    GiftEmail$1.register();
    GiftMessage$1.register();
    return PromoCode$1.register();
  }
};

// src/utils/country.coffee
var requiresPostalCode = function(code) {
  code = code.toLowerCase();
  return code === 'dz' || code === 'ar' || code === 'am' || code === 'au' || code === 'at' || code === 'az' || code === 'a2' || code === 'bd' || code === 'by' || code === 'be' || code === 'ba' || code === 'br' || code === 'bn' || code === 'bg' || code === 'ca' || code === 'ic' || code === 'cn' || code === 'hr' || code === 'cy' || code === 'cz' || code === 'dk' || code === 'en' || code === 'ee' || code === 'fo' || code === 'fi' || code === 'fr' || code === 'ge' || code === 'de' || code === 'gr' || code === 'gl' || code === 'gu' || code === 'gg' || code === 'ho' || code === 'hu' || code === 'in' || code === 'id' || code === 'il' || code === 'it' || code === 'jp' || code === 'je' || code === 'kz' || code === 'kr' || code === 'ko' || code === 'kg' || code === 'lv' || code === 'li' || code === 'lt' || code === 'lu' || code === 'mk' || code === 'mg' || code === 'm3' || code === 'my' || code === 'mh' || code === 'mq' || code === 'yt' || code === 'mx' || code === 'mn' || code === 'me' || code === 'nl' || code === 'nz' || code === 'nb' || code === 'no' || code === 'pk' || code === 'ph' || code === 'pl' || code === 'po' || code === 'pt' || code === 'pr' || code === 're' || code === 'ru' || code === 'sa' || code === 'sf' || code === 'cs' || code === 'sg' || code === 'sk' || code === 'si' || code === 'za' || code === 'es' || code === 'lk' || code === 'nt' || code === 'sx' || code === 'uv' || code === 'vl' || code === 'se' || code === 'ch' || code === 'tw' || code === 'tj' || code === 'th' || code === 'tu' || code === 'tn' || code === 'tr' || code === 'tm' || code === 'vi' || code === 'ua' || code === 'gb' || code === 'us' || code === 'uy' || code === 'uz' || code === 'va' || code === 'vn' || code === 'wl' || code === 'ya';
};

// src/forms/middleware.coffee
var emailRe;
var indexOf$5 = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

emailRe = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

var isRequired = function(value) {
  if (value && value !== '') {
    return value;
  }
  throw new Error('Required');
};

var isEmail = function(value) {
  if (!value) {
    return value;
  }
  if (emailRe.test(value)) {
    return value.toLowerCase();
  }
  throw new Error('Enter a valid email');
};

var isNewPassword = function(value) {
  if (!this.get('user.currentPassword')) {
    if (value) {
      throw new Error('Current password required');
    }
    return value;
  }
  return middleware.isPassword(value);
};

var isPassword = function(value) {
  if (!value) {
    throw new Error('Required');
  }
  if (value.length >= 6) {
    return value;
  }
  throw new Error('Password must be atleast 6 characters long');
};

var matchesPassword = function(value) {
  if (!this.get('user.password')) {
    return value;
  }
  if (value === this.get('user.password')) {
    return value;
  }
  throw new Error('Passwords must match');
};

var splitName = function(value) {
  var firstName, lastName, parts;
  if (!value) {
    return value;
  }
  parts = value.trim().split(' ');
  firstName = parts.shift();
  lastName = parts.join(' ');
  if (!lastName) {
    lastName = ' ';
  }
  this.set('user.firstName', firstName);
  this.set('user.lastName', lastName);
  return value;
};

var isPostalRequired = function(value) {
  if (requiresPostalCode(this.get('order.shippingAddress.country') || '') && ((value == null) || value === '')) {
    throw new Error("Required for Selected Country");
  }
};

var isEcardGiftRequired = function(value) {
  if ((!this.get('order.gift') || this.get('order.giftType') !== 'ecard') || (value && value !== '')) {
    return value;
  }
  throw new Error('Required');
};

var requiresStripe = function(value) {
  if (this('order.type') === 'stripe' && ((value == null) || value === '')) {
    throw new Error("Required");
  }
  return value;
};



var cardNumber = function(value) {
  var card, length, number;
  if (!value) {
    return value;
  }
  if (this.get('order.type') !== 'stripe') {
    return value;
  }
  card = cardFromNumber(value);
  if (!card) {
    throw new Error('Enter a valid card number');
  }
  number = value.replace(/\D/g, '');
  length = number.length;
  if (!/^\d+$/.test(number)) {
    throw new Error('Enter a valid card number');
  }
  if (!(indexOf$5.call(card.length, length) >= 0 && (card.luhn === false || luhnCheck(number)))) {
    throw new Error('Enter a valid card number');
  }
  return value;
};

var expiration = function(value) {
  var base, base1, date, digitsOnly, length, month, now, nowMonth, nowYear, year;
  if (!value) {
    return value;
  }
  if (this('order.type') !== 'stripe') {
    return value;
  }
  digitsOnly = value.replace(/\D/g, '');
  length = digitsOnly.length;
  if (length !== 4) {
    throw new Error('Enter a valid date');
  }
  date = value.split('/');
  if (date.length < 2) {
    throw new Error('Enter a valid date');
  }
  now = new Date();
  nowYear = now.getFullYear();
  nowMonth = now.getMonth() + 1;
  month = typeof (base = date[0]).trim === "function" ? base.trim() : void 0;
  year = ('' + nowYear).substr(0, 2) + (typeof (base1 = date[1]).trim === "function" ? base1.trim() : void 0);
  if (parseInt(year, 10) < nowYear) {
    throw new Error('Your card is expired');
  } else if (parseInt(year, 10) === nowYear && parseInt(month, 10) < nowMonth) {
    throw new Error('Your card is expired');
  }
  this.set('payment.account.month', month);
  this.set('payment.account.year', year);
  return value;
};

var cvc = function(value) {
  var card, cvc_, ref;
  if (!value) {
    return value;
  }
  if (this('order.type') !== 'stripe') {
    return value;
  }
  card = cardFromNumber(this.get('payment.account.number'));
  cvc_ = value.trim();
  if (!/^\d+$/.test(cvc_)) {
    throw new Error('Enter a valid cvc');
  }
  if (card && card.type) {
    if (ref = cvc_.length, indexOf$5.call(card != null ? card.cvcLength : void 0, ref) < 0) {
      throw new Error('Enter a valid cvc');
    }
  } else {
    if (!(cvc_.length >= 3 && cvc_.length <= 4)) {
      throw new Error('Enter a valid cvc');
    }
  }
  return cvc_;
};

var agreeToTerms = function(value) {
  if (value === true) {
    return value;
  }
  throw new Error('Agree to the terms and conditions');
};

// src/forms/configs.coffee
var config;

var configs = config = {
  'user.email': [isRequired, isEmail],
  'user.name': [isRequired, splitName],
  'order.shippingAddress.name': [isRequired],
  'order.shippingAddress.line1': [isRequired],
  'order.shippingAddress.line2': null,
  'order.shippingAddress.city': [isRequired],
  'order.shippingAddress.state': [isRequired],
  'order.shippingAddress.postalCode': [isPostalRequired],
  'order.shippingAddress.country': [isRequired],
  'order.gift': null,
  'order.giftType': null,
  'order.giftEmail': [isEcardGiftRequired, isEmail],
  'order.giftMessage': null,
  'order.promoCode': null,
  'payment.account.name': [isRequired],
  'payment.account.number': [requiresStripe, cardNumber],
  'payment.account.expiry': [requiresStripe, expiration],
  'payment.account.cvc': [requiresStripe, cvc],
  'terms': [agreeToTerms]
};

// templates/forms/checkout.pug
var html$5 = "\n<form onsubmit=\"{ submit }\">\n  <yield>\n    <div if=\"{ !isEmpty() }\">\n      <div class=\"contact checkout-section\">\n        <h2>Contact</h2>\n        <div class=\"fields\">\n          <user-name class=\"input\" placeholder=\"Name\"></user-name>\n          <user-email class=\"input\" placeholder=\"Email\"></user-email>\n        </div>\n      </div>\n      <div class=\"payment checkout-section\">\n        <h2>Payment</h2><span class=\"secured-text\">SSL Secure<span>Checkout</span><img class=\"lock-icon\" src=\"/img/lock-icon.svg\"></span>\n        <div class=\"fields\">\n          <card-name class=\"input\" placeholder=\"Name on Card\"></card-name>\n          <card-number class=\"input\" name=\"number\" placeholder=\"Card Number\">\n            <div class=\"cards-accepted\"><img class=\"card-logo amex-logo\" src=\"/img/card-logos/amex.svg\"><img class=\"card-logo visa-logo\" src=\"/img/card-logos/visa.svg\"><img class=\"card-logo discover-logo\" src=\"/img/card-logos/discover.svg\"><img class=\"card-logo jcb-logo\" src=\"/img/card-logos/jcb.svg\"><img class=\"card-logo mastercard-logo\" src=\"img/card-logos/mastercard.svg\"><a class=\"stripe-link\" href=\"//www.stripe.com\" target=\"_blank\"><img class=\"stripe-logo\" src=\"/img/stripelogo.png\"></a></div>\n          </card-number>\n          <card-expiry class=\"input\" name=\"expiry\" placeholder=\"MM / YY\"></card-expiry>\n          <card-cvc class=\"input\" name=\"cvc\" placeholder=\"CVC\"></card-cvc>\n        </div>\n      </div>\n      <div class=\"shipping checkout-section\">\n        <h2>Shipping</h2>\n        <div class=\"fields\">\n          <shippingaddress-name class=\"input\" placeholder=\"Recipient\"></shippingaddress-name>\n          <shippingaddress-line1 class=\"input\" placeholder=\"Address\"></shippingaddress-line1>\n          <shippingaddress-line2 class=\"input\" placeholder=\"Suite\"></shippingaddress-line2>\n        </div>\n        <div class=\"fields\">\n          <shippingaddress-city class=\"input\" placeholder=\"City\"></shippingaddress-city>\n          <shippingaddress-postalcode class=\"input\" placeholder=\"Postal Code\"></shippingaddress-postalcode>\n        </div>\n        <div class=\"fields\">\n          <shippingaddress-state class=\"input\" placeholder=\"State\"></shippingaddress-state>\n          <shippingaddress-country class=\"input\" placeholder=\"Country\"></shippingaddress-country>\n        </div>\n      </div>\n      <div class=\"complete checkout-section\">\n        <h2>Complete Checkout</h2>\n        <terms>\n          <label for=\"terms\">I have read and accept the&nbsp;<a href=\"{ termsUrl }\" target=\"_blank\">terms and conditions</a></label>\n        </terms>\n        <button class=\"{ loading: loading || checkedOut }\" __disabled=\"{ loading || checkedOut }\" type=\"submit\"><span>Checkout</span></button>\n        <div class=\"error\" if=\"{ errorMessage }\">{ errorMessage }</div>\n      </div>\n    </div>\n  </yield>\n</form>";

// src/forms/checkout.coffee
var CheckoutForm;
var extend$31 = function(child, parent) { for (var key in parent) { if (hasProp$30.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$30 = {}.hasOwnProperty;

CheckoutForm = (function(superClass) {
  extend$31(CheckoutForm, superClass);

  function CheckoutForm() {
    return CheckoutForm.__super__.constructor.apply(this, arguments);
  }

  CheckoutForm.prototype.tag = 'checkout';

  CheckoutForm.prototype.html = html$5;

  CheckoutForm.prototype.errorMessage = '';

  CheckoutForm.prototype.loading = false;

  CheckoutForm.prototype.checkedOut = false;

  CheckoutForm.prototype.configs = configs;

  CheckoutForm.prototype.init = function() {
    CheckoutForm.__super__.init.call(this);
    this.data.on('set', (function(_this) {
      return function(name, value) {
        if (name === 'user.email') {
          return _this.cart._cartUpdate({
            email: value,
            currency: _this.data.get('order.currency'),
            mailchimp: {
              checkoutUrl: _this.data.get('order.checkoutUrl')
            }
          });
        }
      };
    })(this));
    return this.data.on('set', (function(_this) {
      return function(name, value) {
        if (name === 'user.name') {
          if (!_this.data.get('payment.account.name')) {
            _this.data.set('payment.account.name', value);
          }
          if (!_this.data.get('order.shippingAddress.name')) {
            _this.data.set('order.shippingAddress.name', value);
          }
        }
        return El.scheduleUpdate();
      };
    })(this));
  };

  CheckoutForm.prototype._submit = function(event) {
    var email;
    if (this.loading || this.checkedOut) {
      return;
    }
    this.loading = true;
    m.trigger(Events.Submit, this.tag);
    this.errorMessage = '';
    this.scheduleUpdate();
    email = '';
    return this.client.account.exists(this.data.get('user.email')).then((function(_this) {
      return function(res) {
        var cart;
        if (res.exists) {
          _this.data.set('user.id', _this.data.get('user.email'));
          email = _this.data.get('user.email');
          cart = {
            userId: email,
            email: email,
            mailchimp: {
              checkoutUrl: _this.data.get('order.checkoutUrl')
            },
            currency: _this.data.get('order.currency')
          };
          _this.cart._cartUpdate(cart);
        }
        _this.data.set('order.email', email);
        _this.scheduleUpdate();
        return _this.cart.checkout().then(function(pRef) {
          return pRef.p.then(function() {
            var hasErrored;
            hasErrored = false;
            setTimeout(function() {
              if (!hasErrored) {
                _this.loading = false;
                store.clear();
                _this.checkedOut = true;
                return _this.scheduleUpdate();
              }
            }, 200);
            return m.trigger(Events.SubmitSuccess);
          })["catch"](function(err) {
            var hasErrored, ref;
            if (typeof window !== "undefined" && window !== null) {
              if ((ref = window.Raven) != null) {
                ref.captureException(err);
              }
            }
            hasErrored = true;
            _this.loading = false;
            console.log("checkout submit Error: " + err);
            _this.errorMessage = 'Unable to complete your transaction. Please try again later.';
            m.trigger(Events.SubmitFailed, err);
            return _this.scheduleUpdate();
          });
        })["catch"](function(err) {
          var ref;
          _this.loading = false;
          console.log("authorize submit Error: " + err);
          if (err.type === 'authorization-error') {
            _this.errorMessage = err.message;
          } else {
            if (typeof window !== "undefined" && window !== null) {
              if ((ref = window.Raven) != null) {
                ref.captureException(err);
              }
            }
            _this.errorMessage = 'Unable to complete your transaction. Please try again later.';
          }
          m.trigger(Events.SubmitFailed, err);
          return _this.scheduleUpdate();
        });
      };
    })(this))["catch"]((function(_this) {
      return function(err) {
        var ref;
        _this.loading = false;
        console.log("authorize submit Error: " + err);
        if (err.type === 'authorization-error') {
          _this.errorMessage = err.message;
        } else {
          if (typeof window !== "undefined" && window !== null) {
            if ((ref = window.Raven) != null) {
              ref.captureException(err);
            }
          }
          _this.errorMessage = 'Unable to complete your transaction. Please try again later.';
        }
        m.trigger(Events.SubmitFailed, err);
        return _this.scheduleUpdate();
      };
    })(this));
  };

  return CheckoutForm;

})(El.Form);

var Checkout = CheckoutForm;

// templates/forms/checkout-card.pug
var html$6 = "\n<form onsubmit=\"{ submit }\">\n  <yield></yield>\n</form>";

// src/forms/checkout-card.coffee
var CheckoutCardForm;
var extend$32 = function(child, parent) { for (var key in parent) { if (hasProp$31.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$31 = {}.hasOwnProperty;

CheckoutCardForm = (function(superClass) {
  extend$32(CheckoutCardForm, superClass);

  function CheckoutCardForm() {
    return CheckoutCardForm.__super__.constructor.apply(this, arguments);
  }

  CheckoutCardForm.prototype.tag = 'checkout-card';

  CheckoutCardForm.prototype.html = html$6;

  CheckoutCardForm.prototype.configs = {
    'user.email': [isRequired, isEmail],
    'user.name': [isRequired, splitName],
    'payment.account.name': [isRequired],
    'payment.account.number': [requiresStripe, cardNumber],
    'payment.account.expiry': [requiresStripe, expiration],
    'payment.account.cvc': [requiresStripe, cvc]
  };

  CheckoutCardForm.prototype.init = function() {
    return CheckoutCardForm.__super__.init.apply(this, arguments);
  };

  CheckoutCardForm.prototype._submit = function() {
    m.trigger(Events.SubmitCard);
    if (this.paged) {
      store.set('checkout-user', this.data.get('user'));
      store.set('checkout-payment', this.data.get('order.payment'));
    }
    return this.scheduleUpdate();
  };

  return CheckoutCardForm;

})(El.Form);

var CheckoutCard = CheckoutCardForm;

// node_modules/riot/lib/browser/common/global-variables.js
const __TAGS_CACHE = [];
const __TAG_IMPL = {};
const GLOBAL_MIXIN = '__global_mixin';
const ATTRS_PREFIX = 'riot-';
const REF_DIRECTIVES = ['ref', 'data-ref'];
const IS_DIRECTIVE = 'data-is';
const CONDITIONAL_DIRECTIVE = 'if';
const LOOP_DIRECTIVE = 'each';
const LOOP_NO_REORDER_DIRECTIVE = 'no-reorder';
const SHOW_DIRECTIVE = 'show';
const HIDE_DIRECTIVE = 'hide';
const T_STRING = 'string';
const T_OBJECT = 'object';
const T_UNDEF  = 'undefined';
const T_FUNCTION = 'function';
const XLINK_NS = 'http://www.w3.org/1999/xlink';
const XLINK_REGEX = /^xlink:(\w+)/;
const WIN = typeof window === T_UNDEF ? undefined : window;
const RE_SPECIAL_TAGS = /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?|opt(?:ion|group))$/;
const RE_SPECIAL_TAGS_NO_OPTION = /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?)$/;
const RE_RESERVED_NAMES = /^(?:_(?:item|id|parent)|update|root|(?:un)?mount|mixin|is(?:Mounted|Loop)|tags|refs|parent|opts|trigger|o(?:n|ff|ne))$/;
const RE_HTML_ATTRS = /([-\w]+) ?= ?(?:"([^"]*)|'([^']*)|({[^}]*}))/g;
const CASE_SENSITIVE_ATTRIBUTES = { 'viewbox': 'viewBox' };
const RE_BOOL_ATTRS = /^(?:disabled|checked|readonly|required|allowfullscreen|auto(?:focus|play)|compact|controls|default|formnovalidate|hidden|ismap|itemscope|loop|multiple|muted|no(?:resize|shade|validate|wrap)?|open|reversed|seamless|selected|sortable|truespeed|typemustmatch)$/;
const IE_VERSION = (WIN && WIN.document || {}).documentMode | 0;

// node_modules/riot/lib/browser/common/util/check.js
/**
 * Check Check if the passed argument is undefined
 * @param   { String } value -
 * @returns { Boolean } -
 */
function isBoolAttr(value) {
  return RE_BOOL_ATTRS.test(value)
}

/**
 * Check if passed argument is a function
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isFunction(value) {
  return typeof value === T_FUNCTION
}

/**
 * Check if passed argument is an object, exclude null
 * NOTE: use isObject(x) && !isArray(x) to excludes arrays.
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isObject$1(value) {
  return value && typeof value === T_OBJECT // typeof null is 'object'
}

/**
 * Check if passed argument is undefined
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isUndefined(value) {
  return typeof value === T_UNDEF
}

/**
 * Check if passed argument is a string
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isString(value) {
  return typeof value === T_STRING
}

/**
 * Check if passed argument is empty. Different from falsy, because we dont consider 0 or false to be blank
 * @param { * } value -
 * @returns { Boolean } -
 */
function isBlank(value) {
  return isUndefined(value) || value === null || value === ''
}

/**
 * Check if passed argument is a kind of array
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isArray(value) {
  return Array.isArray(value) || value instanceof Array
}

/**
 * Check whether object's property could be overridden
 * @param   { Object }  obj - source object
 * @param   { String }  key - object property
 * @returns { Boolean } -
 */
function isWritable(obj, key) {
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  return isUndefined(obj[key]) || descriptor && descriptor.writable
}

/**
 * Check if passed argument is a reserved name
 * @param   { String } value -
 * @returns { Boolean } -
 */
function isReservedName(value) {
  return RE_RESERVED_NAMES.test(value)
}

var check = Object.freeze({
	isBoolAttr: isBoolAttr,
	isFunction: isFunction,
	isObject: isObject$1,
	isUndefined: isUndefined,
	isString: isString,
	isBlank: isBlank,
	isArray: isArray,
	isWritable: isWritable,
	isReservedName: isReservedName
});

// node_modules/riot/lib/browser/common/util/dom.js
/**
 * Shorter and fast way to select multiple nodes in the DOM
 * @param   { String } selector - DOM selector
 * @param   { Object } ctx - DOM node where the targets of our search will is located
 * @returns { Object } dom nodes found
 */
function $$(selector, ctx) {
  return (ctx || document).querySelectorAll(selector)
}

/**
 * Shorter and fast way to select a single node in the DOM
 * @param   { String } selector - unique dom selector
 * @param   { Object } ctx - DOM node where the target of our search will is located
 * @returns { Object } dom node found
 */
function $$1(selector, ctx) {
  return (ctx || document).querySelector(selector)
}

/**
 * Create a document fragment
 * @returns { Object } document fragment
 */
function createFrag() {
  return document.createDocumentFragment()
}

/**
 * Create a document text node
 * @returns { Object } create a text node to use as placeholder
 */
function createDOMPlaceholder() {
  return document.createTextNode('')
}

/**
 * Create a generic DOM node
 * @param   { String } name - name of the DOM node we want to create
 * @returns { Object } DOM node just created
 */
function mkEl(name) {
  return document.createElement(name)
}

/**
 * Set the inner html of any DOM node SVGs included
 * @param { Object } container - DOM node where we'll inject new html
 * @param { String } html - html to inject
 */
/* istanbul ignore next */
function setInnerHTML(container, html) {
  if (!isUndefined(container.innerHTML))
    container.innerHTML = html;
    // some browsers do not support innerHTML on the SVGs tags
  else {
    const doc = new DOMParser().parseFromString(html, 'application/xml');
    const node = container.ownerDocument.importNode(doc.documentElement, true);
    container.appendChild(node);
  }
}

/**
 * Remove any DOM attribute from a node
 * @param   { Object } dom - DOM node we want to update
 * @param   { String } name - name of the property we want to remove
 */
function remAttr(dom, name) {
  dom.removeAttribute(name);
}

/**
 * Get the value of any DOM attribute on a node
 * @param   { Object } dom - DOM node we want to parse
 * @param   { String } name - name of the attribute we want to get
 * @returns { String | undefined } name of the node attribute whether it exists
 */
function getAttr(dom, name) {
  return dom.getAttribute(name)
}

/**
 * Set any DOM attribute
 * @param { Object } dom - DOM node we want to update
 * @param { String } name - name of the property we want to set
 * @param { String } val - value of the property we want to set
 */
function setAttr(dom, name, val) {
  var xlink = XLINK_REGEX.exec(name);
  if (xlink && xlink[1])
    dom.setAttributeNS(XLINK_NS, xlink[1], val);
  else
    dom.setAttribute(name, val);
}

/**
 * Insert safely a tag to fix #1962 #1649
 * @param   { HTMLElement } root - children container
 * @param   { HTMLElement } curr - node to insert
 * @param   { HTMLElement } next - node that should preceed the current node inserted
 */
function safeInsert(root, curr, next) {
  root.insertBefore(curr, next.parentNode && next);
}

/**
 * Minimize risk: only zero or one _space_ between attr & value
 * @param   { String }   html - html string we want to parse
 * @param   { Function } fn - callback function to apply on any attribute found
 */
function walkAttrs(html, fn) {
  if (!html)
    return
  var m;
  while (m = RE_HTML_ATTRS.exec(html))
    fn(m[1].toLowerCase(), m[2] || m[3] || m[4]);
}

/**
 * Walk down recursively all the children tags starting dom node
 * @param   { Object }   dom - starting node where we will start the recursion
 * @param   { Function } fn - callback to transform the child node just found
 * @param   { Object }   context - fn can optionally return an object, which is passed to children
 */
function walkNodes(dom, fn, context) {
  if (dom) {
    const res = fn(dom, context);
    var next;
    // stop the recursion
    if (res === false) return

    dom = dom.firstChild;

    while (dom) {
      next = dom.nextSibling;
      walkNodes(dom, fn, res);
      dom = next;
    }
  }
}

var dom = Object.freeze({
	$$: $$,
	$: $$1,
	createFrag: createFrag,
	createDOMPlaceholder: createDOMPlaceholder,
	mkEl: mkEl,
	setInnerHTML: setInnerHTML,
	remAttr: remAttr,
	getAttr: getAttr,
	setAttr: setAttr,
	safeInsert: safeInsert,
	walkAttrs: walkAttrs,
	walkNodes: walkNodes
});

// node_modules/riot/lib/browser/tag/styleManager.js
var styleNode;
var cssTextProp;
var byName = {};
var remainder = [];
var needsInject = false;

// skip the following code on the server
if (WIN) {
  styleNode = (function () {
    // create a new style element with the correct type
    var newNode = mkEl('style');
    setAttr(newNode, 'type', 'text/css');

    // replace any user node or insert the new one into the head
    var userNode = $$1('style[type=riot]');
    /* istanbul ignore next */
    if (userNode) {
      if (userNode.id) newNode.id = userNode.id;
      userNode.parentNode.replaceChild(newNode, userNode);
    }
    else document.getElementsByTagName('head')[0].appendChild(newNode);

    return newNode
  })();
  cssTextProp = styleNode.styleSheet;
}

/**
 * Object that will be used to inject and manage the css of every tag instance
 */
var styleManager = {
  styleNode: styleNode,
  /**
   * Save a tag style to be later injected into DOM
   * @param { String } css - css string
   * @param { String } name - if it's passed we will map the css to a tagname
   */
  add(css, name) {
    if (name) byName[name] = css;
    else remainder.push(css);
    needsInject = true;
  },
  /**
   * Inject all previously saved tag styles into DOM
   * innerHTML seems slow: http://jsperf.com/riot-insert-style
   */
  inject() {
    if (!WIN || !needsInject) return
    needsInject = false;
    var style = Object.keys(byName)
      .map(function(k) { return byName[k] })
      .concat(remainder).join('\n');
    /* istanbul ignore next */
    if (cssTextProp) cssTextProp.cssText = style;
    else styleNode.innerHTML = style;
  }
};

// node_modules/riot-tmpl/dist/es6.tmpl.js

/**
 * The riot template engine
 * @version v3.0.3
 */
/**
 * riot.util.brackets
 *
 * - `brackets    ` - Returns a string or regex based on its parameter
 * - `brackets.set` - Change the current riot brackets
 *
 * @module
 */

/* global riot */

var brackets = (function (UNDEF) {

  var
    REGLOB = 'g',

    R_MLCOMMS = /\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//g,

    R_STRINGS = /"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|`[^`\\]*(?:\\[\S\s][^`\\]*)*`/g,

    S_QBLOCKS = R_STRINGS.source + '|' +
      /(?:\breturn\s+|(?:[$\w\)\]]|\+\+|--)\s*(\/)(?![*\/]))/.source + '|' +
      /\/(?=[^*\/])[^[\/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[\/\\]*)*?(\/)[gim]*/.source,

    UNSUPPORTED = RegExp('[\\' + 'x00-\\x1F<>a-zA-Z0-9\'",;\\\\]'),

    NEED_ESCAPE = /(?=[[\]()*+?.^$|])/g,

    FINDBRACES = {
      '(': RegExp('([()])|'   + S_QBLOCKS, REGLOB),
      '[': RegExp('([[\\]])|' + S_QBLOCKS, REGLOB),
      '{': RegExp('([{}])|'   + S_QBLOCKS, REGLOB)
    },

    DEFAULT = '{ }';

  var _pairs = [
    '{', '}',
    '{', '}',
    /{[^}]*}/,
    /\\([{}])/g,
    /\\({)|{/g,
    RegExp('\\\\(})|([[({])|(})|' + S_QBLOCKS, REGLOB),
    DEFAULT,
    /^\s*{\^?\s*([$\w]+)(?:\s*,\s*(\S+))?\s+in\s+(\S.*)\s*}/,
    /(^|[^\\]){=[\S\s]*?}/
  ];

  var
    cachedBrackets = UNDEF,
    _regex,
    _cache = [],
    _settings;

  function _loopback (re) { return re }

  function _rewrite (re, bp) {
    if (!bp) bp = _cache;
    return new RegExp(
      re.source.replace(/{/g, bp[2]).replace(/}/g, bp[3]), re.global ? REGLOB : ''
    )
  }

  function _create (pair) {
    if (pair === DEFAULT) return _pairs

    var arr = pair.split(' ');

    if (arr.length !== 2 || UNSUPPORTED.test(pair)) {
      throw new Error('Unsupported brackets "' + pair + '"')
    }
    arr = arr.concat(pair.replace(NEED_ESCAPE, '\\').split(' '));

    arr[4] = _rewrite(arr[1].length > 1 ? /{[\S\s]*?}/ : _pairs[4], arr);
    arr[5] = _rewrite(pair.length > 3 ? /\\({|})/g : _pairs[5], arr);
    arr[6] = _rewrite(_pairs[6], arr);
    arr[7] = RegExp('\\\\(' + arr[3] + ')|([[({])|(' + arr[3] + ')|' + S_QBLOCKS, REGLOB);
    arr[8] = pair;
    return arr
  }

  function _brackets (reOrIdx) {
    return reOrIdx instanceof RegExp ? _regex(reOrIdx) : _cache[reOrIdx]
  }

  _brackets.split = function split (str, tmpl, _bp) {
    // istanbul ignore next: _bp is for the compiler
    if (!_bp) _bp = _cache;

    var
      parts = [],
      match,
      isexpr,
      start,
      pos,
      re = _bp[6];

    isexpr = start = re.lastIndex = 0;

    while ((match = re.exec(str))) {

      pos = match.index;

      if (isexpr) {

        if (match[2]) {
          re.lastIndex = skipBraces(str, match[2], re.lastIndex);
          continue
        }
        if (!match[3]) {
          continue
        }
      }

      if (!match[1]) {
        unescapeStr(str.slice(start, pos));
        start = re.lastIndex;
        re = _bp[6 + (isexpr ^= 1)];
        re.lastIndex = start;
      }
    }

    if (str && start < str.length) {
      unescapeStr(str.slice(start));
    }

    return parts

    function unescapeStr (s) {
      if (tmpl || isexpr) {
        parts.push(s && s.replace(_bp[5], '$1'));
      } else {
        parts.push(s);
      }
    }

    function skipBraces (s, ch, ix) {
      var
        match,
        recch = FINDBRACES[ch];

      recch.lastIndex = ix;
      ix = 1;
      while ((match = recch.exec(s))) {
        if (match[1] &&
          !(match[1] === ch ? ++ix : --ix)) break
      }
      return ix ? s.length : recch.lastIndex
    }
  };

  _brackets.hasExpr = function hasExpr (str) {
    return _cache[4].test(str)
  };

  _brackets.loopKeys = function loopKeys (expr) {
    var m = expr.match(_cache[9]);

    return m
      ? { key: m[1], pos: m[2], val: _cache[0] + m[3].trim() + _cache[1] }
      : { val: expr.trim() }
  };

  _brackets.array = function array (pair) {
    return pair ? _create(pair) : _cache
  };

  function _reset (pair) {
    if ((pair || (pair = DEFAULT)) !== _cache[8]) {
      _cache = _create(pair);
      _regex = pair === DEFAULT ? _loopback : _rewrite;
      _cache[9] = _regex(_pairs[9]);
    }
    cachedBrackets = pair;
  }

  function _setSettings (o) {
    var b;

    o = o || {};
    b = o.brackets;
    Object.defineProperty(o, 'brackets', {
      set: _reset,
      get: function () { return cachedBrackets },
      enumerable: true
    });
    _settings = o;
    _reset(b);
  }

  Object.defineProperty(_brackets, 'settings', {
    set: _setSettings,
    get: function () { return _settings }
  });

  /* istanbul ignore next: in the browser riot is always in the scope */
  _brackets.settings = typeof riot !== 'undefined' && riot.settings || {};
  _brackets.set = _reset;

  _brackets.R_STRINGS = R_STRINGS;
  _brackets.R_MLCOMMS = R_MLCOMMS;
  _brackets.S_QBLOCKS = S_QBLOCKS;

  return _brackets

})();

/**
 * @module tmpl
 *
 * tmpl          - Root function, returns the template value, render with data
 * tmpl.hasExpr  - Test the existence of a expression inside a string
 * tmpl.loopKeys - Get the keys for an 'each' loop (used by `_each`)
 */

var tmpl = (function () {

  var _cache = {};

  function _tmpl (str, data) {
    if (!str) return str

    return (_cache[str] || (_cache[str] = _create(str))).call(data, _logErr)
  }

  _tmpl.hasExpr = brackets.hasExpr;

  _tmpl.loopKeys = brackets.loopKeys;

  // istanbul ignore next
  _tmpl.clearCache = function () { _cache = {}; };

  _tmpl.errorHandler = null;

  function _logErr (err, ctx) {

    err.riotData = {
      tagName: ctx && ctx.__ && ctx.__.tagName,
      _riot_id: ctx && ctx._riot_id  //eslint-disable-line camelcase
    };

    if (_tmpl.errorHandler) _tmpl.errorHandler(err);
    else if (
      typeof console !== 'undefined' &&
      typeof console.error === 'function'
    ) {
      if (err.riotData.tagName) {
        console.error('Riot template error thrown in the <%s> tag', err.riotData.tagName);
      }
      console.error(err);
    }
  }

  function _create (str) {
    var expr = _getTmpl(str);

    if (expr.slice(0, 11) !== 'try{return ') expr = 'return ' + expr;

    return new Function('E', expr + ';')    // eslint-disable-line no-new-func
  }

  var
    CH_IDEXPR = String.fromCharCode(0x2057),
    RE_CSNAME = /^(?:(-?[_A-Za-z\xA0-\xFF][-\w\xA0-\xFF]*)|\u2057(\d+)~):/,
    RE_QBLOCK = RegExp(brackets.S_QBLOCKS, 'g'),
    RE_DQUOTE = /\u2057/g,
    RE_QBMARK = /\u2057(\d+)~/g;

  function _getTmpl (str) {
    var
      qstr = [],
      expr,
      parts = brackets.split(str.replace(RE_DQUOTE, '"'), 1);

    if (parts.length > 2 || parts[0]) {
      var i, j, list = [];

      for (i = j = 0; i < parts.length; ++i) {

        expr = parts[i];

        if (expr && (expr = i & 1

            ? _parseExpr(expr, 1, qstr)

            : '"' + expr
                .replace(/\\/g, '\\\\')
                .replace(/\r\n?|\n/g, '\\n')
                .replace(/"/g, '\\"') +
              '"'

          )) list[j++] = expr;

      }

      expr = j < 2 ? list[0]
           : '[' + list.join(',') + '].join("")';

    } else {

      expr = _parseExpr(parts[1], 0, qstr);
    }

    if (qstr[0]) {
      expr = expr.replace(RE_QBMARK, function (_, pos) {
        return qstr[pos]
          .replace(/\r/g, '\\r')
          .replace(/\n/g, '\\n')
      });
    }
    return expr
  }

  var
    RE_BREND = {
      '(': /[()]/g,
      '[': /[[\]]/g,
      '{': /[{}]/g
    };

  function _parseExpr (expr, asText, qstr) {

    expr = expr
          .replace(RE_QBLOCK, function (s, div) {
            return s.length > 2 && !div ? CH_IDEXPR + (qstr.push(s) - 1) + '~' : s
          })
          .replace(/\s+/g, ' ').trim()
          .replace(/\ ?([[\({},?\.:])\ ?/g, '$1');

    if (expr) {
      var
        list = [],
        cnt = 0,
        match;

      while (expr &&
            (match = expr.match(RE_CSNAME)) &&
            !match.index
        ) {
        var
          key,
          jsb,
          re = /,|([[{(])|$/g;

        expr = RegExp.rightContext;
        key  = match[2] ? qstr[match[2]].slice(1, -1).trim().replace(/\s+/g, ' ') : match[1];

        while (jsb = (match = re.exec(expr))[1]) skipBraces(jsb, re);

        jsb  = expr.slice(0, match.index);
        expr = RegExp.rightContext;

        list[cnt++] = _wrapExpr(jsb, 1, key);
      }

      expr = !cnt ? _wrapExpr(expr, asText)
           : cnt > 1 ? '[' + list.join(',') + '].join(" ").trim()' : list[0];
    }
    return expr

    function skipBraces (ch, re) {
      var
        mm,
        lv = 1,
        ir = RE_BREND[ch];

      ir.lastIndex = re.lastIndex;
      while (mm = ir.exec(expr)) {
        if (mm[0] === ch) ++lv;
        else if (!--lv) break
      }
      re.lastIndex = lv ? expr.length : ir.lastIndex;
    }
  }

  // istanbul ignore next: not both
  var // eslint-disable-next-line max-len
    JS_CONTEXT = '"in this?this:' + (typeof window !== 'object' ? 'global' : 'window') + ').',
    JS_VARNAME = /[,{][\$\w]+(?=:)|(^ *|[^$\w\.{])(?!(?:typeof|true|false|null|undefined|in|instanceof|is(?:Finite|NaN)|void|NaN|new|Date|RegExp|Math)(?![$\w]))([$_A-Za-z][$\w]*)/g,
    JS_NOPROPS = /^(?=(\.[$\w]+))\1(?:[^.[(]|$)/;

  function _wrapExpr (expr, asText, key) {
    var tb;

    expr = expr.replace(JS_VARNAME, function (match, p, mvar, pos, s) {
      if (mvar) {
        pos = tb ? 0 : pos + match.length;

        if (mvar !== 'this' && mvar !== 'global' && mvar !== 'window') {
          match = p + '("' + mvar + JS_CONTEXT + mvar;
          if (pos) tb = (s = s[pos]) === '.' || s === '(' || s === '[';
        } else if (pos) {
          tb = !JS_NOPROPS.test(s.slice(pos));
        }
      }
      return match
    });

    if (tb) {
      expr = 'try{return ' + expr + '}catch(e){E(e,this)}';
    }

    if (key) {

      expr = (tb
          ? 'function(){' + expr + '}.call(this)' : '(' + expr + ')'
        ) + '?"' + key + '":""';

    } else if (asText) {

      expr = 'function(v){' + (tb
          ? expr.replace('return ', 'v=') : 'v=(' + expr + ')'
        ) + ';return v||v===0?v:""}.call(this)';
    }

    return expr
  }

  _tmpl.version = brackets.version = 'v3.0.3';

  return _tmpl

})();

// node_modules/riot/lib/browser/common/util/misc.js
/**
 * Specialized function for looping an array-like collection with `each={}`
 * @param   { Array } list - collection of items
 * @param   {Function} fn - callback function
 * @returns { Array } the array looped
 */
function each(list, fn) {
  const len = list ? list.length : 0;
  let i = 0;
  for (; i < len; ++i) {
    fn(list[i], i);
  }
  return list
}

/**
 * Check whether an array contains an item
 * @param   { Array } array - target array
 * @param   { * } item - item to test
 * @returns { Boolean } -
 */
function contains(array, item) {
  return array.indexOf(item) !== -1
}

/**
 * Convert a string containing dashes to camel case
 * @param   { String } str - input string
 * @returns { String } my-string -> myString
 */
function toCamel(str) {
  return str.replace(/-(\w)/g, (_, c) => c.toUpperCase())
}

/**
 * Faster String startsWith alternative
 * @param   { String } str - source string
 * @param   { String } value - test string
 * @returns { Boolean } -
 */
function startsWith(str, value) {
  return str.slice(0, value.length) === value
}

/**
 * Helper function to set an immutable property
 * @param   { Object } el - object where the new property will be set
 * @param   { String } key - object key where the new property will be stored
 * @param   { * } value - value of the new property
 * @param   { Object } options - set the propery overriding the default options
 * @returns { Object } - the initial object
 */
function defineProperty(el, key, value, options) {
  Object.defineProperty(el, key, extend$34({
    value,
    enumerable: false,
    writable: false,
    configurable: true
  }, options));
  return el
}

/**
 * Extend any object with other properties
 * @param   { Object } src - source object
 * @returns { Object } the resulting extended object
 *
 * var obj = { foo: 'baz' }
 * extend(obj, {bar: 'bar', foo: 'bar'})
 * console.log(obj) => {bar: 'bar', foo: 'bar'}
 *
 */
function extend$34(src) {
  var obj, args = arguments;
  for (var i = 1; i < args.length; ++i) {
    if (obj = args[i]) {
      for (var key in obj) {
        // check if this property of the source object could be overridden
        if (isWritable(src, key))
          src[key] = obj[key];
      }
    }
  }
  return src
}

var misc = Object.freeze({
	each: each,
	contains: contains,
	toCamel: toCamel,
	startsWith: startsWith,
	defineProperty: defineProperty,
	extend: extend$34
});

// node_modules/riot/lib/settings.js
var settings$1 = extend$34(Object.create(brackets.settings), {
  skipAnonymousTags: true
});

// node_modules/riot/lib/browser/tag/setEventHandler.js
const EVENTS_PREFIX_REGEX = /^on/;

/**
 * Trigger DOM events
 * @param   { HTMLElement } dom - dom element target of the event
 * @param   { Function } handler - user function
 * @param   { Object } e - event object
 */
function handleEvent(dom, handler, e) {
  var ptag = this.__.parent,
    item = this.__.item;

  if (!item)
    while (ptag && !item) {
      item = ptag.__.item;
      ptag = ptag.__.parent;
    }

  // override the event properties
  /* istanbul ignore next */
  if (isWritable(e, 'currentTarget')) e.currentTarget = dom;
  /* istanbul ignore next */
  if (isWritable(e, 'target')) e.target = e.srcElement;
  /* istanbul ignore next */
  if (isWritable(e, 'which')) e.which = e.charCode || e.keyCode;

  e.item = item;

  handler.call(this, e);

  if (!e.preventUpdate) {
    var p = getImmediateCustomParentTag(this);
    // fixes #2083
    if (p.isMounted) p.update();
  }
}

/**
 * Attach an event to a DOM node
 * @param { String } name - event name
 * @param { Function } handler - event callback
 * @param { Object } dom - dom node
 * @param { Tag } tag - tag instance
 */
function setEventHandler(name, handler, dom, tag) {
  var eventName,
    cb = handleEvent.bind(tag, dom, handler);

  // avoid to bind twice the same event
  dom[name] = null;

  // normalize event name
  eventName = name.replace(EVENTS_PREFIX_REGEX, '');

  // cache the callback directly on the DOM node
  if (!dom._riotEvents) dom._riotEvents = {};

  if (dom._riotEvents[name])
    dom.removeEventListener(eventName, dom._riotEvents[name]);

  dom._riotEvents[name] = cb;
  dom.addEventListener(eventName, cb, false);
}

// node_modules/riot/lib/browser/tag/update.js
/**
 * Update dynamically created data-is tags with changing expressions
 * @param { Object } expr - expression tag and expression info
 * @param { Tag } parent - parent for tag creation
 */
function updateDataIs(expr, parent) {
  var tagName = tmpl(expr.value, parent),
    conf, isVirtual, head, ref;

  if (expr.tag && expr.tagName === tagName) {
    expr.tag.update();
    return
  }

  isVirtual = expr.dom.tagName === 'VIRTUAL';
  // sync _parent to accommodate changing tagnames
  if (expr.tag) {

    // need placeholder before unmount
    if(isVirtual) {
      head = expr.tag.__.head;
      ref = createDOMPlaceholder();
      head.parentNode.insertBefore(ref, head);
    }

    expr.tag.unmount(true);
  }

  expr.impl = __TAG_IMPL[tagName];
  conf = {root: expr.dom, parent: parent, hasImpl: true, tagName: tagName};
  expr.tag = initChildTag(expr.impl, conf, expr.dom.innerHTML, parent);
  each(expr.attrs, a => setAttr(expr.tag.root, a.name, a.value));
  expr.tagName = tagName;
  expr.tag.mount();
  if (isVirtual)
    makeReplaceVirtual(expr.tag, ref || expr.tag.root); // root exist first time, after use placeholder

  // parent is the placeholder tag, not the dynamic tag so clean up
  parent.__.onUnmount = function() {
    var delName = expr.tag.opts.dataIs,
      tags = expr.tag.parent.tags,
      _tags = expr.tag.__.parent.tags;
    arrayishRemove(tags, delName, expr.tag);
    arrayishRemove(_tags, delName, expr.tag);
    expr.tag.unmount();
  };
}

/**
 * Update on single tag expression
 * @this Tag
 * @param { Object } expr - expression logic
 * @returns { undefined }
 */
function updateExpression(expr) {
  if (this.root && getAttr(this.root,'virtualized')) return

  var dom = expr.dom,
    attrName = expr.attr,
    isToggle = contains([SHOW_DIRECTIVE, HIDE_DIRECTIVE], attrName),
    value = tmpl(expr.expr, this),
    isValueAttr = attrName === 'riot-value',
    isVirtual = expr.root && expr.root.tagName === 'VIRTUAL',
    parent = dom && (expr.parent || dom.parentNode),
    old;

  if (expr.bool)
    value = value ? attrName : false;
  else if (isUndefined(value) || value === null)
    value = '';

  if (expr._riot_id) { // if it's a tag
    if (expr.isMounted) {
      expr.update();

    // if it hasn't been mounted yet, do that now.
    } else {
      expr.mount();

      if (isVirtual)
        makeReplaceVirtual(expr, expr.root);

    }
    return
  }

  old = expr.value;
  expr.value = value;

  if (expr.update) {
    expr.update();
    return
  }

  if (expr.isRtag && value) return updateDataIs(expr, this)
  if (old === value) return
  // no change, so nothing more to do
  if (isValueAttr && dom.value === value) return

  // textarea and text nodes have no attribute name
  if (!attrName) {
    // about #815 w/o replace: the browser converts the value to a string,
    // the comparison by "==" does too, but not in the server
    value += '';
    // test for parent avoids error with invalid assignment to nodeValue
    if (parent) {
      // cache the parent node because somehow it will become null on IE
      // on the next iteration
      expr.parent = parent;
      if (parent.tagName === 'TEXTAREA') {
        parent.value = value;                    // #1113
        if (!IE_VERSION) dom.nodeValue = value;  // #1625 IE throws here, nodeValue
      }                                         // will be available on 'updated'
      else dom.nodeValue = value;
    }
    return
  }

  // remove original attribute
  if (!expr.isAttrRemoved || !value) {
    remAttr(dom, attrName);
    expr.isAttrRemoved = true;
  }

  // event handler
  if (isFunction(value)) {
    setEventHandler(attrName, value, dom, this);
  // show / hide
  } else if (isToggle) {
    if (attrName === HIDE_DIRECTIVE) value = !value;
    dom.style.display = value ? '' : 'none';
  // field value
  } else if (isValueAttr) {
    dom.value = value;
  // <img src="{ expr }">
  } else if (startsWith(attrName, ATTRS_PREFIX) && attrName !== IS_DIRECTIVE) {
    attrName = attrName.slice(ATTRS_PREFIX.length);
    if (CASE_SENSITIVE_ATTRIBUTES[attrName])
      attrName = CASE_SENSITIVE_ATTRIBUTES[attrName];
    if (value != null)
      setAttr(dom, attrName, value);
  } else {
    if (expr.bool) {
      dom[attrName] = value;
      if (!value) return
    }

    if (value === 0 || value && typeof value !== T_OBJECT) {
      setAttr(dom, attrName, value);
    }
  }
}

/**
 * Update all the expressions in a Tag instance
 * @this Tag
 * @param { Array } expressions - expression that must be re evaluated
 */
function updateAllExpressions(expressions) {
  each(expressions, updateExpression.bind(this));
}

// node_modules/riot/lib/browser/tag/if.js
var IfExpr = {
  init(dom, tag, expr) {
    remAttr(dom, CONDITIONAL_DIRECTIVE);
    this.tag = tag;
    this.expr = expr;
    this.stub = document.createTextNode('');
    this.pristine = dom;

    var p = dom.parentNode;
    p.insertBefore(this.stub, dom);
    p.removeChild(dom);

    return this
  },
  update() {
    var newValue = tmpl(this.expr, this.tag);

    if (newValue && !this.current) { // insert
      this.current = this.pristine.cloneNode(true);
      this.stub.parentNode.insertBefore(this.current, this.stub);

      this.expressions = [];
      parseExpressions.apply(this.tag, [this.current, this.expressions, true]);
    } else if (!newValue && this.current) { // remove
      unmountAll(this.expressions);
      if (this.current._tag) {
        this.current._tag.unmount();
      } else if (this.current.parentNode)
        this.current.parentNode.removeChild(this.current);
      this.current = null;
      this.expressions = [];
    }

    if (newValue) updateAllExpressions.call(this.tag, this.expressions);
  },
  unmount() {
    unmountAll(this.expressions || []);
    delete this.pristine;
    delete this.parentNode;
    delete this.stub;
  }
};

// node_modules/riot/lib/browser/tag/ref.js
var RefExpr = {
  init(dom, parent, attrName, attrValue) {
    this.dom = dom;
    this.attr = attrName;
    this.rawValue = attrValue;
    this.parent = parent;
    this.hasExp = tmpl.hasExpr(attrValue);
    this.firstRun = true;

    return this
  },
  update() {
    var value = this.rawValue;
    if (this.hasExp)
      value = tmpl(this.rawValue, this.parent);

    // if nothing changed, we're done
    if (!this.firstRun && value === this.value) return

    var customParent = this.parent && getImmediateCustomParentTag(this.parent);

    // if the referenced element is a custom tag, then we set the tag itself, rather than DOM
    var tagOrDom = this.tag || this.dom;

    // the name changed, so we need to remove it from the old key (if present)
    if (!isBlank(this.value) && customParent)
      arrayishRemove(customParent.refs, this.value, tagOrDom);

    if (isBlank(value)) {
      // if the value is blank, we remove it
      remAttr(this.dom, this.attr);
    } else {
      // add it to the refs of parent tag (this behavior was changed >=3.0)
      if (customParent) arrayishAdd(
        customParent.refs,
        value,
        tagOrDom,
        // use an array if it's a looped node and the ref is not an expression
        null,
        this.parent.__.index
      );
      // set the actual DOM attr
      setAttr(this.dom, this.attr, value);
    }

    this.value = value;
    this.firstRun = false;
  },
  unmount() {
    var tagOrDom = this.tag || this.dom;
    var customParent = this.parent && getImmediateCustomParentTag(this.parent);
    if (!isBlank(this.value) && customParent)
      arrayishRemove(customParent.refs, this.value, tagOrDom);
    delete this.dom;
    delete this.parent;
  }
};

// node_modules/riot/lib/browser/tag/each.js
/**
 * Convert the item looped into an object used to extend the child tag properties
 * @param   { Object } expr - object containing the keys used to extend the children tags
 * @param   { * } key - value to assign to the new object returned
 * @param   { * } val - value containing the position of the item in the array
 * @param   { Object } base - prototype object for the new item
 * @returns { Object } - new object containing the values of the original item
 *
 * The variables 'key' and 'val' are arbitrary.
 * They depend on the collection type looped (Array, Object)
 * and on the expression used on the each tag
 *
 */
function mkitem(expr, key, val, base) {
  var item = base ? Object.create(base) : {};
  item[expr.key] = key;
  if (expr.pos) item[expr.pos] = val;
  return item
}

/**
 * Unmount the redundant tags
 * @param   { Array } items - array containing the current items to loop
 * @param   { Array } tags - array containing all the children tags
 */
function unmountRedundant(items, tags) {
  var i = tags.length,
    j = items.length;

  while (i > j) {
    i--;
    remove.apply(tags[i], [tags, i]);
  }
}


/**
 * Remove a child tag
 * @this Tag
 * @param   { Array } tags - tags collection
 * @param   { Number } i - index of the tag to remove
 */
function remove(tags, i) {
  tags.splice(i, 1);
  this.unmount();
  arrayishRemove(this.parent, this, this.__.tagName, true);
}

/**
 * Move the nested custom tags in non custom loop tags
 * @this Tag
 * @param   { Number } i - current position of the loop tag
 */
function moveNestedTags(i) {
  each(Object.keys(this.tags), (tagName) => {
    moveChildTag.apply(this.tags[tagName], [tagName, i]);
  });
}

/**
 * Move a child tag
 * @this Tag
 * @param   { HTMLElement } root - dom node containing all the loop children
 * @param   { Tag } nextTag - instance of the next tag preceding the one we want to move
 * @param   { Boolean } isVirtual - is it a virtual tag?
 */
function move(root, nextTag, isVirtual) {
  if (isVirtual)
    moveVirtual.apply(this, [root, nextTag]);
  else
    safeInsert(root, this.root, nextTag.root);
}

/**
 * Insert and mount a child tag
 * @this Tag
 * @param   { HTMLElement } root - dom node containing all the loop children
 * @param   { Tag } nextTag - instance of the next tag preceding the one we want to insert
 * @param   { Boolean } isVirtual - is it a virtual tag?
 */
function insert(root, nextTag, isVirtual) {
  if (isVirtual)
    makeVirtual.apply(this, [root, nextTag]);
  else
    safeInsert(root, this.root, nextTag.root);
}

/**
 * Append a new tag into the DOM
 * @this Tag
 * @param   { HTMLElement } root - dom node containing all the loop children
 * @param   { Boolean } isVirtual - is it a virtual tag?
 */
function append(root, isVirtual) {
  if (isVirtual)
    makeVirtual.call(this, root);
  else
    root.appendChild(this.root);
}

/**
 * Manage tags having the 'each'
 * @param   { HTMLElement } dom - DOM node we need to loop
 * @param   { Tag } parent - parent tag instance where the dom node is contained
 * @param   { String } expr - string contained in the 'each' attribute
 * @returns { Object } expression object for this each loop
 */
function _each(dom, parent, expr) {

  // remove the each property from the original tag
  remAttr(dom, LOOP_DIRECTIVE);

  var mustReorder = typeof getAttr(dom, LOOP_NO_REORDER_DIRECTIVE) !== T_STRING || remAttr(dom, LOOP_NO_REORDER_DIRECTIVE),
    tagName = getTagName(dom),
    impl = __TAG_IMPL[tagName],
    parentNode = dom.parentNode,
    placeholder = createDOMPlaceholder(),
    child = getTag(dom),
    ifExpr = getAttr(dom, CONDITIONAL_DIRECTIVE),
    tags = [],
    oldItems = [],
    hasKeys,
    isLoop = true,
    isAnonymous = !__TAG_IMPL[tagName],
    isVirtual = dom.tagName === 'VIRTUAL';

  // parse the each expression
  expr = tmpl.loopKeys(expr);
  expr.isLoop = true;

  if (ifExpr) remAttr(dom, CONDITIONAL_DIRECTIVE);

  // insert a marked where the loop tags will be injected
  parentNode.insertBefore(placeholder, dom);
  parentNode.removeChild(dom);

  expr.update = function updateEach() {
    // get the new items collection
    var items = tmpl(expr.val, parent),
      frag = createFrag(),
      isObject$$1 = !isArray(items) && !isString(items),
      root = placeholder.parentNode;

    // object loop. any changes cause full redraw
    if (isObject$$1) {
      hasKeys = items || false;
      items = hasKeys ?
        Object.keys(items).map(function (key) {
          return mkitem(expr, items[key], key)
        }) : [];
    } else {
      hasKeys = false;
    }

    if (ifExpr) {
      items = items.filter(function(item, i) {
        if (expr.key && !isObject$$1)
          return !!tmpl(ifExpr, mkitem(expr, item, i, parent))

        return !!tmpl(ifExpr, extend$34(Object.create(parent), item))
      });
    }

    // loop all the new items
    each(items, function(item, i) {
      // reorder only if the items are objects
      var
        doReorder = mustReorder && typeof item === T_OBJECT && !hasKeys,
        oldPos = oldItems.indexOf(item),
        isNew = oldPos === -1,
        pos = !isNew && doReorder ? oldPos : i,
        // does a tag exist in this position?
        tag = tags[pos],
        mustAppend = i >= oldItems.length,
        mustCreate =  doReorder && isNew || !doReorder && !tag;

      item = !hasKeys && expr.key ? mkitem(expr, item, i) : item;

      // new tag
      if (mustCreate) {
        tag = new Tag$1(impl, {
          parent,
          isLoop,
          isAnonymous,
          tagName,
          root: dom.cloneNode(isAnonymous),
          item,
          index: i,
        }, dom.innerHTML);

        // mount the tag
        tag.mount();

        if (mustAppend)
          append.apply(tag, [frag || root, isVirtual]);
        else
          insert.apply(tag, [root, tags[i], isVirtual]);

        if (!mustAppend) oldItems.splice(i, 0, item);
        tags.splice(i, 0, tag);
        if (child) arrayishAdd(parent.tags, tagName, tag, true);
      } else if (pos !== i && doReorder) {
        // move
        if (contains(items, oldItems[pos])) {
          move.apply(tag, [root, tags[i], isVirtual]);
          // move the old tag instance
          tags.splice(i, 0, tags.splice(pos, 1)[0]);
          // move the old item
          oldItems.splice(i, 0, oldItems.splice(pos, 1)[0]);
        }

        // update the position attribute if it exists
        if (expr.pos) tag[expr.pos] = i;

        // if the loop tags are not custom
        // we need to move all their custom tags into the right position
        if (!child && tag.tags) moveNestedTags.call(tag, i);
      }

      // cache the original item to use it in the events bound to this node
      // and its children
      tag.__.item = item;
      tag.__.index = i;
      tag.__.parent = parent;

      if (!mustCreate) tag.update(item);
    });

    // remove the redundant tags
    unmountRedundant(items, tags);

    // clone the items array
    oldItems = items.slice();

    root.insertBefore(frag, placeholder);
  };

  expr.unmount = function() {
    each(tags, function(t) { t.unmount(); });
  };

  return expr
}

// node_modules/riot/lib/browser/tag/parse.js
/**
 * Walk the tag DOM to detect the expressions to evaluate
 * @this Tag
 * @param   { HTMLElement } root - root tag where we will start digging the expressions
 * @param   { Array } expressions - empty array where the expressions will be added
 * @param   { Boolean } mustIncludeRoot - flag to decide whether the root must be parsed as well
 * @returns { Object } an object containing the root noode and the dom tree
 */
function parseExpressions(root, expressions, mustIncludeRoot) {
  var tree = {parent: {children: expressions}};

  walkNodes(root, (dom, ctx) => {
    let type = dom.nodeType, parent = ctx.parent, attr, expr, tagImpl;
    if (!mustIncludeRoot && dom === root) return {parent: parent}

    // text node
    if (type === 3 && dom.parentNode.tagName !== 'STYLE' && tmpl.hasExpr(dom.nodeValue))
      parent.children.push({dom: dom, expr: dom.nodeValue});

    if (type !== 1) return ctx // not an element

    var isVirtual = dom.tagName === 'VIRTUAL';

    // loop. each does it's own thing (for now)
    if (attr = getAttr(dom, LOOP_DIRECTIVE)) {
      if(isVirtual) setAttr(dom, 'loopVirtual', true); // ignore here, handled in _each
      parent.children.push(_each(dom, this, attr));
      return false
    }

    // if-attrs become the new parent. Any following expressions (either on the current
    // element, or below it) become children of this expression.
    if (attr = getAttr(dom, CONDITIONAL_DIRECTIVE)) {
      parent.children.push(Object.create(IfExpr).init(dom, this, attr));
      return false
    }

    if (expr = getAttr(dom, IS_DIRECTIVE)) {
      if (tmpl.hasExpr(expr)) {
        parent.children.push({isRtag: true, expr: expr, dom: dom, attrs: [].slice.call(dom.attributes)});
        return false
      }
    }

    // if this is a tag, stop traversing here.
    // we ignore the root, since parseExpressions is called while we're mounting that root
    tagImpl = getTag(dom);
    if(isVirtual) {
      if(getAttr(dom, 'virtualized')) {dom.parentElement.removeChild(dom); } // tag created, remove from dom
      if(!tagImpl && !getAttr(dom, 'virtualized') && !getAttr(dom, 'loopVirtual'))  // ok to create virtual tag
        tagImpl = { tmpl: dom.outerHTML };
    }

    if (tagImpl && (dom !== root || mustIncludeRoot)) {
      if(isVirtual && !getAttr(dom, IS_DIRECTIVE)) { // handled in update
        // can not remove attribute like directives
        // so flag for removal after creation to prevent maximum stack error
        setAttr(dom, 'virtualized', true);

        var tag = new Tag$1({ tmpl: dom.outerHTML },
          {root: dom, parent: this},
          dom.innerHTML);
        parent.children.push(tag); // no return, anonymous tag, keep parsing
      } else {
        var conf = {root: dom, parent: this, hasImpl: true};
        parent.children.push(initChildTag(tagImpl, conf, dom.innerHTML, this));
        return false
      }
    }

    // attribute expressions
    parseAttributes.apply(this, [dom, dom.attributes, function(attr, expr) {
      if (!expr) return
      parent.children.push(expr);
    }]);

    // whatever the parent is, all child elements get the same parent.
    // If this element had an if-attr, that's the parent for all child elements
    return {parent: parent}
  }, tree);

  return { tree, root }
}

/**
 * Calls `fn` for every attribute on an element. If that attr has an expression,
 * it is also passed to fn.
 * @this Tag
 * @param   { HTMLElement } dom - dom node to parse
 * @param   { Array } attrs - array of attributes
 * @param   { Function } fn - callback to exec on any iteration
 */
function parseAttributes(dom, attrs, fn) {
  each(attrs, (attr) => {
    var name = attr.name, bool = isBoolAttr(name), expr;

    if (contains(REF_DIRECTIVES, name)) {
      expr =  Object.create(RefExpr).init(dom, this, name, attr.value);
    } else if (tmpl.hasExpr(attr.value)) {
      expr = {dom: dom, expr: attr.value, attr: attr.name, bool: bool};
    }

    fn(attr, expr);
  });
}

// node_modules/riot/lib/browser/tag/mkdom.js
/*
  Includes hacks needed for the Internet Explorer version 9 and below
  See: http://kangax.github.io/compat-table/es5/#ie8
       http://codeplanet.io/dropping-ie8/
*/

const reHasYield  = /<yield\b/i;
const reYieldAll  = /<yield\s*(?:\/>|>([\S\s]*?)<\/yield\s*>|>)/ig;
const reYieldSrc  = /<yield\s+to=['"]([^'">]*)['"]\s*>([\S\s]*?)<\/yield\s*>/ig;
const reYieldDest = /<yield\s+from=['"]?([-\w]+)['"]?\s*(?:\/>|>([\S\s]*?)<\/yield\s*>)/ig;
const rootEls = { tr: 'tbody', th: 'tr', td: 'tr', col: 'colgroup' };
const tblTags = IE_VERSION && IE_VERSION < 10 ? RE_SPECIAL_TAGS : RE_SPECIAL_TAGS_NO_OPTION;
const GENERIC = 'div';


/*
  Creates the root element for table or select child elements:
  tr/th/td/thead/tfoot/tbody/caption/col/colgroup/option/optgroup
*/
function specialTags(el, tmpl, tagName) {

  var
    select = tagName[0] === 'o',
    parent = select ? 'select>' : 'table>';

  // trim() is important here, this ensures we don't have artifacts,
  // so we can check if we have only one element inside the parent
  el.innerHTML = '<' + parent + tmpl.trim() + '</' + parent;
  parent = el.firstChild;

  // returns the immediate parent if tr/th/td/col is the only element, if not
  // returns the whole tree, as this can include additional elements
  /* istanbul ignore next */
  if (select) {
    parent.selectedIndex = -1;  // for IE9, compatible w/current riot behavior
  } else {
    // avoids insertion of cointainer inside container (ex: tbody inside tbody)
    var tname = rootEls[tagName];
    if (tname && parent.childElementCount === 1) parent = $$1(tname, parent);
  }
  return parent
}

/*
  Replace the yield tag from any tag template with the innerHTML of the
  original tag in the page
*/
function replaceYield(tmpl, html) {
  // do nothing if no yield
  if (!reHasYield.test(tmpl)) return tmpl

  // be careful with #1343 - string on the source having `$1`
  var src = {};

  html = html && html.replace(reYieldSrc, function (_, ref, text) {
    src[ref] = src[ref] || text;   // preserve first definition
    return ''
  }).trim();

  return tmpl
    .replace(reYieldDest, function (_, ref, def) {  // yield with from - to attrs
      return src[ref] || def || ''
    })
    .replace(reYieldAll, function (_, def) {        // yield without any "from"
      return html || def || ''
    })
}

/**
 * Creates a DOM element to wrap the given content. Normally an `DIV`, but can be
 * also a `TABLE`, `SELECT`, `TBODY`, `TR`, or `COLGROUP` element.
 *
 * @param   { String } tmpl  - The template coming from the custom tag definition
 * @param   { String } html - HTML content that comes from the DOM element where you
 *           will mount the tag, mostly the original tag in the page
 * @returns { HTMLElement } DOM element with _tmpl_ merged through `YIELD` with the _html_.
 */
function mkdom(tmpl, html) {
  var match   = tmpl && tmpl.match(/^\s*<([-\w]+)/),
    tagName = match && match[1].toLowerCase(),
    el = mkEl(GENERIC);

  // replace all the yield tags with the tag inner html
  tmpl = replaceYield(tmpl, html);

  /* istanbul ignore next */
  if (tblTags.test(tagName))
    el = specialTags(el, tmpl, tagName);
  else
    setInnerHTML(el, tmpl);

  return el
}

// node_modules/riot/lib/browser/tag/core.js
/**
 * Another way to create a riot tag a bit more es6 friendly
 * @param { HTMLElement } el - tag DOM selector or DOM node/s
 * @param { Object } opts - tag logic
 * @returns { Tag } new riot tag instance
 */
function Tag$2(el, opts) {
  // get the tag properties from the class constructor
  var {name, tmpl, css, attrs, onCreate} = this;
  // register a new tag and cache the class prototype
  if (!__TAG_IMPL[name]) {
    tag$1(name, tmpl, css, attrs, onCreate);
    // cache the class constructor
    __TAG_IMPL[name].class = this.constructor;
  }

  // mount the tag using the class instance
  mountTo(el, name, opts, this);
  // inject the component css
  if (css) styleManager.inject();

  return this
}

/**
 * Create a new riot tag implementation
 * @param   { String }   name - name/id of the new riot tag
 * @param   { String }   tmpl - tag template
 * @param   { String }   css - custom tag css
 * @param   { String }   attrs - root tag attributes
 * @param   { Function } fn - user function
 * @returns { String } name/id of the tag just created
 */
function tag$1(name, tmpl, css, attrs, fn) {
  if (isFunction(attrs)) {
    fn = attrs;

    if (/^[\w\-]+\s?=/.test(css)) {
      attrs = css;
      css = '';
    } else
      attrs = '';
  }

  if (css) {
    if (isFunction(css))
      fn = css;
    else
      styleManager.add(css);
  }

  name = name.toLowerCase();
  __TAG_IMPL[name] = { name, tmpl, attrs, fn };

  return name
}

/**
 * Create a new riot tag implementation (for use by the compiler)
 * @param   { String }   name - name/id of the new riot tag
 * @param   { String }   tmpl - tag template
 * @param   { String }   css - custom tag css
 * @param   { String }   attrs - root tag attributes
 * @param   { Function } fn - user function
 * @returns { String } name/id of the tag just created
 */
function tag2$1(name, tmpl, css, attrs, fn) {
  if (css) styleManager.add(css, name);

  __TAG_IMPL[name] = { name, tmpl, attrs, fn };

  return name
}

/**
 * Mount a tag using a specific tag implementation
 * @param   { * } selector - tag DOM selector or DOM node/s
 * @param   { String } tagName - tag implementation name
 * @param   { Object } opts - tag logic
 * @returns { Array } new tags instances
 */
function mount$1(selector, tagName, opts) {
  var tags = [];

  function pushTagsTo(root) {
    if (root.tagName) {
      var riotTag = getAttr(root, IS_DIRECTIVE);

      // have tagName? force riot-tag to be the same
      if (tagName && riotTag !== tagName) {
        riotTag = tagName;
        setAttr(root, IS_DIRECTIVE, tagName);
      }

      var tag = mountTo(root, riotTag || root.tagName.toLowerCase(), opts);

      if (tag)
        tags.push(tag);
    } else if (root.length)
      each(root, pushTagsTo); // assume nodeList
  }

  // inject styles into DOM
  styleManager.inject();

  if (isObject$1(tagName)) {
    opts = tagName;
    tagName = 0;
  }

  var elem;
  var allTags;

  // crawl the DOM to find the tag
  if (isString(selector)) {
    selector = selector === '*' ?
      // select all registered tags
      // & tags found with the riot-tag attribute set
      allTags = selectTags() :
      // or just the ones named like the selector
      selector + selectTags(selector.split(/, */));

    // make sure to pass always a selector
    // to the querySelectorAll function
    elem = selector ? $$(selector) : [];
  }
  else
    // probably you have passed already a tag or a NodeList
    elem = selector;

  // select all the registered and mount them inside their root elements
  if (tagName === '*') {
    // get all custom tags
    tagName = allTags || selectTags();
    // if the root els it's just a single tag
    if (elem.tagName)
      elem = $$(tagName, elem);
    else {
      // select all the children for all the different root elements
      var nodeList = [];

      each(elem, _el => nodeList.push($$(tagName, _el)));

      elem = nodeList;
    }
    // get rid of the tagName
    tagName = 0;
  }

  pushTagsTo(elem);

  return tags
}

// Create a mixin that could be globally shared across all the tags
const mixins = {};
const globals = mixins[GLOBAL_MIXIN] = {};
let mixins_id = 0;

/**
 * Create/Return a mixin by its name
 * @param   { String }  name - mixin name (global mixin if object)
 * @param   { Object }  mix - mixin logic
 * @param   { Boolean } g - is global?
 * @returns { Object }  the mixin logic
 */
function mixin$1(name, mix, g) {
  // Unnamed global
  if (isObject$1(name)) {
    mixin$1(`__unnamed_${mixins_id++}`, name, true);
    return
  }

  const store$$1 = g ? globals : mixins;

  // Getter
  if (!mix) {
    if (isUndefined(store$$1[name]))
      throw new Error('Unregistered mixin: ' + name)

    return store$$1[name]
  }

  // Setter
  store$$1[name] = isFunction(mix) ?
    extend$34(mix.prototype, store$$1[name] || {}) && mix :
    extend$34(store$$1[name] || {}, mix);
}

/**
 * Update all the tags instances created
 * @returns { Array } all the tags instances
 */
function update$1() {
  return each(__TAGS_CACHE, tag => tag.update())
}

function unregister$1(name) {
  delete __TAG_IMPL[name];
}

const version = 'WIP';


var core = Object.freeze({
	Tag: Tag$2,
	tag: tag$1,
	tag2: tag2$1,
	mount: mount$1,
	mixin: mixin$1,
	update: update$1,
	unregister: unregister$1,
	version: version
});

// node_modules/riot/lib/browser/tag/tag.js
// counter to give a unique id to all the Tag instances
var __uid = 0;

/**
 * We need to update opts for this tag. That requires updating the expressions
 * in any attributes on the tag, and then copying the result onto opts.
 * @this Tag
 * @param   {Boolean} isLoop - is it a loop tag?
 * @param   { Tag }  parent - parent tag node
 * @param   { Boolean }  isAnonymous - is it a tag without any impl? (a tag not registered)
 * @param   { Object }  opts - tag options
 * @param   { Array }  instAttrs - tag attributes array
 */
function updateOpts(isLoop, parent, isAnonymous, opts, instAttrs) {
  // isAnonymous `each` tags treat `dom` and `root` differently. In this case
  // (and only this case) we don't need to do updateOpts, because the regular parse
  // will update those attrs. Plus, isAnonymous tags don't need opts anyway
  if (isLoop && isAnonymous) return

  var ctx = !isAnonymous && isLoop ? this : parent || this;
  each(instAttrs, (attr) => {
    if (attr.expr) updateAllExpressions.call(ctx, [attr.expr]);
    opts[toCamel(attr.name)] = attr.expr ? attr.expr.value : attr.value;
  });
}


/**
 * Tag class
 * @constructor
 * @param { Object } impl - it contains the tag template, and logic
 * @param { Object } conf - tag options
 * @param { String } innerHTML - html that eventually we need to inject in the tag
 */
function Tag$1(impl = {}, conf = {}, innerHTML) {

  var opts = extend$34({}, conf.opts),
    parent = conf.parent,
    isLoop = conf.isLoop,
    isAnonymous = !!conf.isAnonymous,
    skipAnonymous = settings$1.skipAnonymousTags && isAnonymous,
    item = cleanUpData(conf.item),
    index = conf.index, // available only for the looped nodes
    instAttrs = [], // All attributes on the Tag when it's first parsed
    implAttrs = [], // expressions on this type of Tag
    expressions = [],
    root = conf.root,
    tagName = conf.tagName || getTagName(root),
    isVirtual = tagName === 'virtual',
    propsInSyncWithParent = [],
    dom;

  // make this tag observable
  if (!skipAnonymous) observable(this);
  // only call unmount if we have a valid __TAG_IMPL (has name property)
  if (impl.name && root._tag) root._tag.unmount(true);

  // not yet mounted
  this.isMounted = false;

  defineProperty(this, '__', {
    isAnonymous,
    instAttrs,
    innerHTML,
    tagName,
    index,
    isLoop,
    // these vars will be needed only for the virtual tags
    virts: [],
    tail: null,
    head: null,
    parent: null,
    item: null
  });

  // create a unique id to this tag
  // it could be handy to use it also to improve the virtual dom rendering speed
  defineProperty(this, '_riot_id', ++__uid); // base 1 allows test !t._riot_id
  defineProperty(this, 'root', root);
  extend$34(this, { opts }, item);
  // protect the "tags" and "refs" property from being overridden
  defineProperty(this, 'parent', parent || null);
  defineProperty(this, 'tags', {});
  defineProperty(this, 'refs', {});

  dom = isLoop && isAnonymous ? root : mkdom(impl.tmpl, innerHTML, isLoop);

  /**
   * Update the tag expressions and options
   * @param   { * }  data - data we want to use to extend the tag properties
   * @returns { Tag } the current tag instance
   */
  defineProperty(this, 'update', function tagUpdate(data) {
    const nextOpts = {},
      canTrigger = this.isMounted && !skipAnonymous;

    // make sure the data passed will not override
    // the component core methods
    data = cleanUpData(data);
    extend$34(this, data);
    updateOpts.apply(this, [isLoop, parent, isAnonymous, nextOpts, instAttrs]);
    if (this.isMounted && isFunction(this.shouldUpdate) && !this.shouldUpdate(data, nextOpts)) return this

    // inherit properties from the parent, but only for isAnonymous tags
    if (isLoop && isAnonymous) inheritFrom.apply(this, [this.parent, propsInSyncWithParent]);
    extend$34(opts, nextOpts);
    if (canTrigger) this.trigger('update', data);
    updateAllExpressions.call(this, expressions);
    if (canTrigger) this.trigger('updated');

    return this

  }.bind(this));

  /**
   * Add a mixin to this tag
   * @returns { Tag } the current tag instance
   */
  defineProperty(this, 'mixin', function tagMixin() {
    each(arguments, (mix) => {
      let instance, obj;
      let props = [];

      // properties blacklisted and will not be bound to the tag instance
      const propsBlacklist = ['init', '__proto__'];

      mix = isString(mix) ? mixin$1(mix) : mix;

      // check if the mixin is a function
      if (isFunction(mix)) {
        // create the new mixin instance
        instance = new mix();
      } else instance = mix;

      var proto = Object.getPrototypeOf(instance);

      // build multilevel prototype inheritance chain property list
      do props = props.concat(Object.getOwnPropertyNames(obj || instance));
      while (obj = Object.getPrototypeOf(obj || instance))

      // loop the keys in the function prototype or the all object keys
      each(props, (key) => {
        // bind methods to this
        // allow mixins to override other properties/parent mixins
        if (!contains(propsBlacklist, key)) {
          // check for getters/setters
          var descriptor = Object.getOwnPropertyDescriptor(instance, key) || Object.getOwnPropertyDescriptor(proto, key);
          var hasGetterSetter = descriptor && (descriptor.get || descriptor.set);

          // apply method only if it does not already exist on the instance
          if (!this.hasOwnProperty(key) && hasGetterSetter) {
            Object.defineProperty(this, key, descriptor);
          } else {
            this[key] = isFunction(instance[key]) ?
              instance[key].bind(this) :
              instance[key];
          }
        }
      });

      // init method will be called automatically
      if (instance.init)
        instance.init.bind(this)();
    });
    return this
  }.bind(this));

  /**
   * Mount the current tag instance
   * @returns { Tag } the current tag instance
   */
  defineProperty(this, 'mount', function tagMount() {
    root._tag = this; // keep a reference to the tag just created

    // Read all the attrs on this instance. This give us the info we need for updateOpts
    parseAttributes.apply(parent, [root, root.attributes, (attr, expr) => {
      if (!isAnonymous && RefExpr.isPrototypeOf(expr)) expr.tag = this;
      attr.expr = expr;
      instAttrs.push(attr);
    }]);

    // update the root adding custom attributes coming from the compiler
    implAttrs = [];
    walkAttrs(impl.attrs, (k, v) => { implAttrs.push({name: k, value: v}); });
    parseAttributes.apply(this, [root, implAttrs, (attr, expr) => {
      if (expr) expressions.push(expr);
      else setAttr(root, attr.name, attr.value);
    }]);

    // initialiation
    updateOpts.apply(this, [isLoop, parent, isAnonymous, opts, instAttrs]);

    // add global mixins
    var globalMixin = mixin$1(GLOBAL_MIXIN);

    if (globalMixin && !skipAnonymous) {
      for (var i in globalMixin) {
        if (globalMixin.hasOwnProperty(i)) {
          this.mixin(globalMixin[i]);
        }
      }
    }

    if (impl.fn) impl.fn.call(this, opts);

    if (!skipAnonymous) this.trigger('before-mount');

    // parse layout after init. fn may calculate args for nested custom tags
    parseExpressions.apply(this, [dom, expressions, isAnonymous]);

    this.update(item);

    if (!isAnonymous) {
      while (dom.firstChild) root.appendChild(dom.firstChild);
    }

    defineProperty(this, 'root', root);
    defineProperty(this, 'isMounted', true);

    if (skipAnonymous) return

    // if it's not a child tag we can trigger its mount event
    if (!this.parent) {
      this.trigger('mount');
    }
    // otherwise we need to wait that the parent "mount" or "updated" event gets triggered
    else {
      const p = getImmediateCustomParentTag(this.parent);
      p.one(!p.isMounted ? 'mount' : 'updated', () => {
        this.trigger('mount');
      });
    }

    return this

  }.bind(this));

  /**
   * Unmount the tag instance
   * @param { Boolean } mustKeepRoot - if it's true the root node will not be removed
   * @returns { Tag } the current tag instance
   */
  defineProperty(this, 'unmount', function tagUnmount(mustKeepRoot) {
    var el = this.root,
      p = el.parentNode,
      ptag,
      tagIndex = __TAGS_CACHE.indexOf(this);

    if (!skipAnonymous) this.trigger('before-unmount');

    // clear all attributes coming from the mounted tag
    walkAttrs(impl.attrs, (name) => {
      if (startsWith(name, ATTRS_PREFIX))
        name = name.slice(ATTRS_PREFIX.length);
      remAttr(root, name);
    });

    // remove this tag instance from the global virtualDom variable
    if (tagIndex !== -1)
      __TAGS_CACHE.splice(tagIndex, 1);

    if (p || isVirtual) {
      if (parent) {
        ptag = getImmediateCustomParentTag(parent);

        if (isVirtual) {
          Object.keys(this.tags).forEach(tagName => {
            arrayishRemove(ptag.tags, tagName, this.tags[tagName]);
          });
        } else {
          arrayishRemove(ptag.tags, tagName, this);
          if(parent !== ptag) // remove from _parent too
            arrayishRemove(parent.tags, tagName, this);
        }
      } else {
        while (el.firstChild) el.removeChild(el.firstChild);
      }

      if (p)
        if (!mustKeepRoot) {
          p.removeChild(el);
        } else {
          // the riot-tag and the data-is attributes aren't needed anymore, remove them
          remAttr(p, IS_DIRECTIVE);
        }
    }

    if (this.__.virts) {
      each(this.__.virts, (v) => {
        if (v.parentNode) v.parentNode.removeChild(v);
      });
    }

    // allow expressions to unmount themselves
    unmountAll(expressions);
    each(instAttrs, a => a.expr && a.expr.unmount && a.expr.unmount());

    // custom internal unmount function to avoid relying on the observable
    if (this.__.onUnmount) this.__.onUnmount();

    if (!skipAnonymous) {
      this.trigger('unmount');
      this.off('*');
    }

    defineProperty(this, 'isMounted', false);

    delete this.root._tag;

    return this

  }.bind(this));
}

// node_modules/riot/lib/browser/common/util/tags.js
/**
 * Detect the tag implementation by a DOM node
 * @param   { Object } dom - DOM node we need to parse to get its tag implementation
 * @returns { Object } it returns an object containing the implementation of a custom tag (template and boot function)
 */
function getTag(dom) {
  return dom.tagName && __TAG_IMPL[getAttr(dom, IS_DIRECTIVE) ||
    getAttr(dom, IS_DIRECTIVE) || dom.tagName.toLowerCase()]
}

/**
 * Inherit properties from a target tag instance
 * @this Tag
 * @param   { Tag } target - tag where we will inherit properties
 * @param   { Array } propsInSyncWithParent - array of properties to sync with the target
 */
function inheritFrom(target, propsInSyncWithParent) {
  each(Object.keys(target), (k) => {
    // some properties must be always in sync with the parent tag
    var mustSync = !isReservedName(k) && contains(propsInSyncWithParent, k);

    if (isUndefined(this[k]) || mustSync) {
      // track the property to keep in sync
      // so we can keep it updated
      if (!mustSync) propsInSyncWithParent.push(k);
      this[k] = target[k];
    }
  });
}

/**
 * Move the position of a custom tag in its parent tag
 * @this Tag
 * @param   { String } tagName - key where the tag was stored
 * @param   { Number } newPos - index where the new tag will be stored
 */
function moveChildTag(tagName, newPos) {
  var parent = this.parent,
    tags;
  // no parent no move
  if (!parent) return

  tags = parent.tags[tagName];

  if (isArray(tags))
    tags.splice(newPos, 0, tags.splice(tags.indexOf(this), 1)[0]);
  else arrayishAdd(parent.tags, tagName, this);
}

/**
 * Create a new child tag including it correctly into its parent
 * @param   { Object } child - child tag implementation
 * @param   { Object } opts - tag options containing the DOM node where the tag will be mounted
 * @param   { String } innerHTML - inner html of the child node
 * @param   { Object } parent - instance of the parent tag including the child custom tag
 * @returns { Object } instance of the new child tag just created
 */
function initChildTag(child, opts, innerHTML, parent) {
  var tag = new Tag$1(child, opts, innerHTML),
    tagName = opts.tagName || getTagName(opts.root, true),
    ptag = getImmediateCustomParentTag(parent);
  // fix for the parent attribute in the looped elements
  defineProperty(tag, 'parent', ptag);
  // store the real parent tag
  // in some cases this could be different from the custom parent tag
  // for example in nested loops
  tag.__.parent = parent;

  // add this tag to the custom parent tag
  arrayishAdd(ptag.tags, tagName, tag);

  // and also to the real parent tag
  if (ptag !== parent)
    arrayishAdd(parent.tags, tagName, tag);

  // empty the child node once we got its template
  // to avoid that its children get compiled multiple times
  opts.root.innerHTML = '';

  return tag
}

/**
 * Loop backward all the parents tree to detect the first custom parent tag
 * @param   { Object } tag - a Tag instance
 * @returns { Object } the instance of the first custom parent tag found
 */
function getImmediateCustomParentTag(tag) {
  var ptag = tag;
  while (ptag.__.isAnonymous) {
    if (!ptag.parent) break
    ptag = ptag.parent;
  }
  return ptag
}

/**
 * Trigger the unmount method on all the expressions
 * @param   { Array } expressions - DOM expressions
 */
function unmountAll(expressions) {
  each(expressions, function(expr) {
    if (expr instanceof Tag$1) expr.unmount(true);
    else if (expr.unmount) expr.unmount();
  });
}

/**
 * Get the tag name of any DOM node
 * @param   { Object } dom - DOM node we want to parse
 * @param   { Boolean } skipDataIs - hack to ignore the data-is attribute when attaching to parent
 * @returns { String } name to identify this dom node in riot
 */
function getTagName(dom, skipDataIs) {
  var child = getTag(dom),
    namedTag = !skipDataIs && getAttr(dom, IS_DIRECTIVE);
  return namedTag && !tmpl.hasExpr(namedTag) ?
                namedTag :
              child ? child.name : dom.tagName.toLowerCase()
}

/**
 * With this function we avoid that the internal Tag methods get overridden
 * @param   { Object } data - options we want to use to extend the tag instance
 * @returns { Object } clean object without containing the riot internal reserved words
 */
function cleanUpData(data) {
  if (!(data instanceof Tag$1) && !(data && isFunction(data.trigger)))
    return data

  var o = {};
  for (var key in data) {
    if (!RE_RESERVED_NAMES.test(key)) o[key] = data[key];
  }
  return o
}

/**
 * Set the property of an object for a given key. If something already
 * exists there, then it becomes an array containing both the old and new value.
 * @param { Object } obj - object on which to set the property
 * @param { String } key - property name
 * @param { Object } value - the value of the property to be set
 * @param { Boolean } ensureArray - ensure that the property remains an array
 * @param { Number } index - add the new item in a certain array position
 */
function arrayishAdd(obj, key, value, ensureArray, index) {
  const dest = obj[key];
  const isArr = isArray(dest);
  const hasIndex = !isUndefined(index);

  if (dest && dest === value) return

  // if the key was never set, set it once
  if (!dest && ensureArray) obj[key] = [value];
  else if (!dest) obj[key] = value;
  // if it was an array and not yet set
  else {
    if (isArr) {
      const oldIndex = dest.indexOf(value);
      // this item never changed its position
      if (oldIndex === index) return
      // remove the item from its old position
      if (oldIndex !== -1) dest.splice(oldIndex, 1);
      // move or add the item
      if (hasIndex) {
        dest.splice(index, 0, value);
      } else {
        dest.push(value);
      }
    } else obj[key] = [dest, value];
  }
}

/**
 * Removes an item from an object at a given key. If the key points to an array,
 * then the item is just removed from the array.
 * @param { Object } obj - object on which to remove the property
 * @param { String } key - property name
 * @param { Object } value - the value of the property to be removed
 * @param { Boolean } ensureArray - ensure that the property remains an array
*/
function arrayishRemove(obj, key, value, ensureArray) {
  if (isArray(obj[key])) {
    let index = obj[key].indexOf(value);
    if (index !== -1) obj[key].splice(index, 1);
    if (!obj[key].length) delete obj[key];
    else if (obj[key].length === 1 && !ensureArray) obj[key] = obj[key][0];
  } else
    delete obj[key]; // otherwise just delete the key
}

/**
 * Mount a tag creating new Tag instance
 * @param   { Object } root - dom node where the tag will be mounted
 * @param   { String } tagName - name of the riot tag we want to mount
 * @param   { Object } opts - options to pass to the Tag instance
 * @param   { Object } ctx - optional context that will be used to extend an existing class ( used in riot.Tag )
 * @returns { Tag } a new Tag instance
 */
function mountTo(root, tagName, opts, ctx) {
  var impl = __TAG_IMPL[tagName],
    implClass = __TAG_IMPL[tagName].class,
    tag = ctx || (implClass ? Object.create(implClass.prototype) : {}),
    // cache the inner HTML to fix #855
    innerHTML = root._innerHTML = root._innerHTML || root.innerHTML;

  // clear the inner html
  root.innerHTML = '';

  var conf = extend$34({ root: root, opts: opts }, { parent: opts ? opts.parent : null });

  if (impl && root) Tag$1.apply(tag, [impl, conf, innerHTML]);

  if (tag && tag.mount) {
    tag.mount(true);
    // add this tag to the virtualDom variable
    if (!contains(__TAGS_CACHE, tag)) __TAGS_CACHE.push(tag);
  }

  return tag
}

/**
 * makes a tag virtual and replaces a reference in the dom
 * @this Tag
 * @param { tag } the tag to make virtual
 * @param { ref } the dom reference location
 */
function makeReplaceVirtual(tag, ref) {
  var frag = createFrag();
  makeVirtual.call(tag, frag);
  ref.parentNode.replaceChild(frag, ref);
}

/**
 * Adds the elements for a virtual tag
 * @this Tag
 * @param { Node } src - the node that will do the inserting or appending
 * @param { Tag } target - only if inserting, insert before this tag's first child
 */
function makeVirtual(src, target) {
  var head = createDOMPlaceholder(),
    tail = createDOMPlaceholder(),
    frag = createFrag(),
    sib, el;

  this.root.insertBefore(head, this.root.firstChild);
  this.root.appendChild(tail);

  this.__.head = el = head;
  this.__.tail = tail;

  while (el) {
    sib = el.nextSibling;
    frag.appendChild(el);
    this.__.virts.push(el); // hold for unmounting
    el = sib;
  }

  if (target)
    src.insertBefore(frag, target.__.head);
  else
    src.appendChild(frag);
}

/**
 * Move virtual tag and all child nodes
 * @this Tag
 * @param { Node } src  - the node that will do the inserting
 * @param { Tag } target - insert before this tag's first child
 */
function moveVirtual(src, target) {
  var el = this.__.head,
    frag = createFrag(),
    sib;

  while (el) {
    sib = el.nextSibling;
    frag.appendChild(el);
    el = sib;
    if (el === this.__.tail) {
      frag.appendChild(el);
      src.insertBefore(frag, target.__.head);
      break
    }
  }
}

/**
 * Get selectors for tags
 * @param   { Array } tags - tag names to select
 * @returns { String } selector
 */
function selectTags(tags) {
  // select all tags
  if (!tags) {
    var keys = Object.keys(__TAG_IMPL);
    return keys + selectTags(keys)
  }

  return tags
    .filter(t => !/[^-\w]/.test(t))
    .reduce((list, t) => {
      var name = t.trim().toLowerCase();
      return list + `,[${IS_DIRECTIVE}="${name}"]`
    }, '')
}


var tags = Object.freeze({
	getTag: getTag,
	inheritFrom: inheritFrom,
	moveChildTag: moveChildTag,
	initChildTag: initChildTag,
	getImmediateCustomParentTag: getImmediateCustomParentTag,
	unmountAll: unmountAll,
	getTagName: getTagName,
	cleanUpData: cleanUpData,
	arrayishAdd: arrayishAdd,
	arrayishRemove: arrayishRemove,
	mountTo: mountTo,
	makeReplaceVirtual: makeReplaceVirtual,
	makeVirtual: makeVirtual,
	moveVirtual: moveVirtual,
	selectTags: selectTags
});

// node_modules/riot/lib/riot.js
/**
 * Riot public api
 */
const settings = settings$1;
const util = {
  tmpl,
  brackets,
  styleManager,
  vdom: __TAGS_CACHE,
  styleNode: styleManager.styleNode,
  // export the riot internal utils as well
  dom,
  check,
  misc,
  tags
};

// export the core props/methods









extend$34({}, core, {
  observable: observable,
  settings,
  util,
})

// templates/forms/checkout-shippingaddress.pug
var html$7 = "\n<form onsubmit=\"{ submit }\">\n  <yield></yield>\n</form>";

// src/forms/checkout-shippingaddress.coffee
var CheckoutShippingAddressForm;
var extend$33 = function(child, parent) { for (var key in parent) { if (hasProp$32.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$32 = {}.hasOwnProperty;

CheckoutShippingAddressForm = (function(superClass) {
  extend$33(CheckoutShippingAddressForm, superClass);

  function CheckoutShippingAddressForm() {
    return CheckoutShippingAddressForm.__super__.constructor.apply(this, arguments);
  }

  CheckoutShippingAddressForm.prototype.tag = 'checkout-shippingaddress';

  CheckoutShippingAddressForm.prototype.html = html$7;

  CheckoutShippingAddressForm.prototype.paged = false;

  CheckoutShippingAddressForm.prototype.configs = {
    'user.email': [isRequired, isEmail],
    'user.name': [isRequired, splitName],
    'order.shippingAddress.name': [isRequired],
    'order.shippingAddress.line1': [isRequired],
    'order.shippingAddress.line2': null,
    'order.shippingAddress.city': [isRequired],
    'order.shippingAddress.state': [isRequired],
    'order.shippingAddress.postalCode': [isPostalRequired],
    'order.shippingAddress.country': [isRequired]
  };

  CheckoutShippingAddressForm.prototype.init = function() {
    return CheckoutShippingAddressForm.__super__.init.apply(this, arguments);
  };

  CheckoutShippingAddressForm.prototype._submit = function() {
    m.trigger(Events.SubmitShippingAddress);
    if (this.paged) {
      store.set('checkout-user', this.data.get('user'));
      store.set('checkout-shippingAddress', this.data.get('order.shippingAddress'));
    }
    return this.scheduleUpdate();
  };

  return CheckoutShippingAddressForm;

})(El.Form);

var CheckoutShippingAddress = CheckoutShippingAddressForm;

// templates/forms/cart.pug
var html$8 = "\n<yield>\n  <h2 if=\"{ !isEmpty() }\">Your Cart</h2>\n  <h2 if=\"{ isEmpty() }\">Your Cart Is Empty</h2>\n  <lineitems if=\"{ !isEmpty() }\"></lineitems>\n  <div if=\"{ !isEmpty() }\">\n    <div class=\"promo\">\n      <div class=\"promo-label\">Coupon</div>\n      <div class=\"promo-row { applied: applied, applying: applying, failed: failed }\">\n        <promocode class=\"input\" placeholder=\"Coupon\"></promocode>\n        <button disabled=\"{ applying }\" onclick=\"{ applyPromoCode }\"><span if=\"{ !applied &amp;&amp; !applying &amp;&amp; !failed }\">+</span><span if=\"{ applied }\">&#10003;</span><span if=\"{ failed }\">&#10005;</span><span if=\"{ applying }\">...</span></button>\n      </div>\n    </div>\n    <div class=\"invoice-discount invoice-line animated fadeIn\" if=\"{ data.get('order.discount') &gt; 0 }\">\n      <div class=\"invoice-label\">Discount</div>\n      <div class=\"invoice-amount\">{ renderCurrency(data.get('order.currency'), data.get('order.discount'))} { data.get('order.currency').toUpperCase() }</div>\n    </div>\n    <div class=\"invoice-line\">\n      <div class=\"invoice-label\">Subtotal</div>\n      <div class=\"invoice-amount\">{ renderCurrency(data.get('order.currency'), data.get('order.subtotal'))} { data.get('order.currency').toUpperCase() }</div>\n    </div>\n    <div class=\"invoice-line\">\n      <div class=\"invoice-label\">Shipping</div>\n      <div class=\"invoice-amount not-bold\">{ data.get('order.shipping') == 0 ? 'FREE' : renderCurrency(data.get('order.currency'), data.get('order.shipping'))}&nbsp;{ data.get('order.shipping') == 0 ? '' : data.get('order.currency').toUpperCase() }</div>\n    </div>\n    <div class=\"invoice-line\">\n      <div class=\"invoice-label\">Tax ({ data.get('order.taxRate') * 100 }%)</div>\n      <div class=\"invoice-amount\">{ renderCurrency(data.get('order.currency'), data.get('order.tax'))} { data.get('order.currency').toUpperCase() }</div>\n    </div>\n    <div class=\"invoice-line invoice-total\">\n      <div class=\"invoice-label\">Total</div>\n      <div class=\"invoice-amount\">{ renderCurrency(data.get('order.currency'), data.get('order.total'))} { data.get('order.currency').toUpperCase() }</div>\n    </div>\n    <button class=\"submit\" onclick=\"{ checkout }\" if=\"{ showButtons }\">Checkout</button>\n  </div>\n  <div if=\"{ isEmpty() }\">\n    <button class=\"submit\" onclick=\"{ submit }\" if=\"{ showButtons }\">Continue Shopping</button>\n  </div>\n</yield>";

// src/forms/cart.coffee
var CartForm;
var extend$35 = function(child, parent) { for (var key in parent) { if (hasProp$33.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$33 = {}.hasOwnProperty;

CartForm = (function(superClass) {
  extend$35(CartForm, superClass);

  function CartForm() {
    return CartForm.__super__.constructor.apply(this, arguments);
  }

  CartForm.prototype.tag = 'cart';

  CartForm.prototype.html = html$8;

  CartForm.prototype.init = function() {
    var promoCode;
    CartForm.__super__.init.apply(this, arguments);
    promoCode = store.get('promoCode');
    if (promoCode) {
      this.data.set('order.promoCode', promoCode);
      this.applyPromoCode();
    }
    m.on(Events.ForceApplyPromoCode, (function(_this) {
      return function() {
        return _this.applyPromoCode();
      };
    })(this));
    return this.data.on('set', (function(_this) {
      return function(name, value) {
        if (name === 'order.promoCode' && _this.applied) {
          return _this.applyPromoCode();
        }
      };
    })(this));
  };

  CartForm.prototype.configs = {
    'order.promoCode': null
  };

  CartForm.prototype.promoMessage = '';

  CartForm.prototype.isEmpty = function() {
    return this.data('order.items').length === 0;
  };

  CartForm.prototype.count = function() {
    var count, i, item, len, ref;
    count = 0;
    ref = this.data('order.items');
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      count += item.quantity;
    }
    return count;
  };

  CartForm.prototype.applyPromoCode = function() {
    var promoCode;
    this.promoMessage = '';
    promoCode = this.data.get('order.promoCode');
    if (!promoCode) {
      return;
    }
    store.set('promoCode', promoCode);
    this.promoMessage = 'Applying...';
    this.applying = true;
    this.applied = false;
    this.failed = false;
    this.data.set('order.coupon', {});
    this.scheduleUpdate();
    m.trigger(Events.ApplyPromoCode, promoCode);
    return this.cart.promoCode(promoCode).then((function(_this) {
      return function() {
        var coupon;
        _this.applying = false;
        _this.applied = true;
        _this.failed = false;
        coupon = _this.data.get('order.coupon');
        if (((coupon != null ? coupon.freeProductId : void 0) != null) && coupon.freeProductId !== "" && coupon.freeQuantity > 0) {
          _this.promoMessage = coupon.freeQuantity + " Free " + freeProduct.name;
        } else {
          _this.promoMessage = promoCode + ' Applied!';
        }
        m.trigger(Events.ApplyPromoCodeSuccess, coupon);
        return _this.scheduleUpdate();
      };
    })(this))["catch"]((function(_this) {
      return function(err) {
        var coupon;
        store.remove('promoCode');
        _this.applying = false;
        _this.applied = false;
        _this.failed = true;
        coupon = _this.data.get('order.coupon');
        if (coupon != null ? coupon.enabled : void 0) {
          _this.promoMessage = 'This code is expired.';
        } else {
          _this.promoMessage = 'This code is invalid.';
        }
        m.trigger(Events.ApplyPromoCodeFailed, err);
        return _this.scheduleUpdate();
      };
    })(this));
  };

  CartForm.prototype.checkout = function() {
    return m.trigger(Events.Checkout);
  };

  CartForm.prototype.continueShopping = function() {
    return m.trigger(Events.ContinueShopping);
  };

  return CartForm;

})(El.Form);

var Cart$1 = CartForm;

// templates/forms/lineitem.pug
var html$9 = "\n<yield>\n  <div class=\"product-quantity-container\" if=\"{ !data.get('locked') }\">\n    <quantity-select-control></quantity-select-control>\n  </div>\n  <div class=\"product-quantity-container locked\" if=\"{ data.get('locked') }\">{ data.get('quantity') }</div>\n  <div class=\"product-text-container\">\n    <div class=\"product-name\">{ data.get('productName') }</div>\n    <div class=\"product-slug\">{ data.get('productSlug') }</div>\n    <div class=\"product-description\" if=\"{ data.get('description') }\">{ data.get('description') }</div>\n  </div>\n  <div class=\"product-delete\" onclick=\"{ delete }\"></div>\n  <div class=\"product-price-container\">\n    <div class=\"product-price\">{ renderCurrency(parentData.get('currency'), data.get().price * data.get().quantity) }\n      <div class=\"product-currency\">{ parentData.get('currency').toUpperCase() }</div>\n    </div>\n    <div class=\"product-list-price\" if=\"{ data.get().listPrice &gt; data.get().price }\">{ renderCurrency(parentData.get('currency'), data.get().listPrice * data.get().quantity) }\n      <div class=\"product-currency\">{ parentData.get('currency').toUpperCase() }</div>\n    </div>\n  </div>\n</yield>";

// src/forms/lineitem.coffee
var LineItemForm;
var extend$36 = function(child, parent) { for (var key in parent) { if (hasProp$34.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$34 = {}.hasOwnProperty;

LineItemForm = (function(superClass) {
  extend$36(LineItemForm, superClass);

  function LineItemForm() {
    return LineItemForm.__super__.constructor.apply(this, arguments);
  }

  LineItemForm.prototype.tag = 'lineitem';

  LineItemForm.prototype.html = html$9;

  LineItemForm.prototype.configs = {
    'quantity': null
  };

  LineItemForm.prototype.init = function() {
    return LineItemForm.__super__.init.apply(this, arguments);
  };

  LineItemForm.prototype["delete"] = function(event) {
    return m.trigger(Events.DeleteLineItem, this.data);
  };

  return LineItemForm;

})(El.Form);

var LineItem = LineItemForm;

// templates/forms/lineitems.pug
var html$10 = "\n<lineitem each=\"{ item, v in data('order.items') }\" parent-data=\"{ this.parent.data.ref('order') }\" data=\"{ this.parent.data.ref('order.items.' + v) }\" no-reorder>\n  <yield>\n    <div class=\"animated fadeIn\">\n      <div class=\"product-image-container\" if=\"{ images }\"><img src=\"{ images[data.get().productSlug] || images[data.get().productId] || images[data.get().productName] }\"></div>\n      <div class=\"product-text-container\"><span class=\"product-description\"><span class=\"product-name\">{ data.get('productName') }</span>\n          <p>{ data.get('description') }</p></span></div><span class=\"product-quantity-container locked\" if=\"{ data.get('locked') }\">{ data.get('quantity') }</span><span class=\"product-quantity-container\" if=\"{ !data.get('locked') }\">\n        <quantity-select-control></quantity-select-control></span>\n      <div class=\"product-delete\" onclick=\"{ delete }\">Remove</div>\n      <div class=\"product-price-container invoice-amount\">\n        <div class=\"product-price\">{ renderCurrency(parentData.get('currency'), data.get().price * data.get().quantity) } { parentData.get('currency').toUpperCase() }</div>\n        <div class=\"product-list-price invoice-amount\" if=\"{ data.get().listPrice &gt; data.get().price }\">{ renderCurrency(parentData.get('currency'), data.get().listPrice * data.get().quantity) } { parentData.get('currency').toUpperCase() }</div>\n      </div>\n    </div>\n  </yield>\n</lineitem>";

// src/forms/lineitems.coffee
var LineItems;
var extend$37 = function(child, parent) { for (var key in parent) { if (hasProp$35.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$35 = {}.hasOwnProperty;

LineItems = (function(superClass) {
  extend$37(LineItems, superClass);

  function LineItems() {
    return LineItems.__super__.constructor.apply(this, arguments);
  }

  LineItems.prototype.tag = 'lineitems';

  LineItems.prototype.html = html$10;

  LineItems.prototype.init = function() {
    if (this.parentData != null) {
      this.data = this.parentData;
    }
    LineItems.__super__.init.apply(this, arguments);
    return this.on('update', (function(_this) {
      return function() {
        if (_this.parentData != null) {
          return _this.data = _this.parentData;
        }
      };
    })(this));
  };

  return LineItems;

})(El.View);

var LineItems$1 = LineItems;

// templates/forms/form.pug
var html$11 = "\n<form onsubmit=\"{ submit }\">\n  <yield></yield>\n</form>";

// src/forms/login.coffee
var LoginForm;
var extend$38 = function(child, parent) { for (var key in parent) { if (hasProp$36.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$36 = {}.hasOwnProperty;

LoginForm = (function(superClass) {
  extend$38(LoginForm, superClass);

  function LoginForm() {
    return LoginForm.__super__.constructor.apply(this, arguments);
  }

  LoginForm.prototype.tag = 'login';

  LoginForm.prototype.html = html$11;

  LoginForm.prototype.configs = {
    'user.email': [isRequired, isEmail],
    'user.password': [isPassword]
  };

  LoginForm.prototype.errorMessage = '';

  LoginForm.prototype._submit = function(event) {
    var opts;
    opts = {
      email: this.data.get('user.email'),
      password: this.data.get('user.password')
    };
    this.errorMessage = '';
    this.scheduleUpdate();
    m.trigger(Events.Login);
    return this.client.account.login(opts).then((function(_this) {
      return function(res) {
        m.trigger(Events.LoginSuccess, res);
        return _this.scheduleUpdate();
      };
    })(this))["catch"]((function(_this) {
      return function(err) {
        _this.errorMessage = err.message;
        m.trigger(Events.LoginFailed, err);
        return _this.scheduleUpdate();
      };
    })(this));
  };

  return LoginForm;

})(El.Form);

var Login = LoginForm;

// templates/forms/order.pug
var html$12 = "\n<yield>\n  <div class=\"order-information\">\n    <div class=\"order-number-container\">\n      <div class=\"order-number-label\">Order Number:</div>\n      <div class=\"order-number\">{ data.get('number') }</div>\n    </div>\n    <div class=\"order-date-container\">\n      <div class=\"order-date-label\">Purchase Date:</div>\n      <div class=\"order-date\">{ renderDate(data.get('createdAt'), 'LL') }</div>\n    </div>\n    <lineitems if=\"{ !isEmpty() }\"></lineitems>\n    <div class=\"discount-container\">\n      <div class=\"discount-label\">Discount:</div>\n      <div class=\"discount\">{ renderCurrency(data.get('currency'), data.get('discount'))}</div>\n    </div>\n    <div class=\"subtotal-container\">\n      <div class=\"subtotal-label\">Subtotal:</div>\n      <div class=\"subtotal\">{ renderCurrency(data.get('currency'), data.get('subtotal'))}</div>\n    </div>\n    <div class=\"shipping-container\">\n      <div class=\"shipping-label\">Shipping:</div>\n      <div class=\"shipping\">{ renderCurrency(data.get('currency'), data.get('shipping'))}</div>\n    </div>\n    <div class=\"tax-container\">\n      <div class=\"tax-label\">Tax({ data.get('tax') / data.get('subtotal') * 100 }%):</div>\n      <div class=\"tax\">{ renderCurrency(data.get('currency'), data.get('tax'))}</div>\n    </div>\n    <div class=\"total-container\">\n      <div class=\"total-label\">Total:</div>\n      <div class=\"total\">{ renderCurrency(data.get('currency'), data.get('total'))}&nbsp;{ data.get('currency').toUpperCase() }</div>\n    </div>\n  </div>\n  <div class=\"address-information\">\n    <div class=\"street\">{ data.get('shippingAddress.line1') }</div>\n    <div class=\"apartment\" if=\"{ data.get('shippingAddress.line2') }\">{ data.get('shippingAddress.line2') }</div>\n    <div class=\"city\">{ data.get('shippingAddress.city') }</div>\n    <div class=\"state\" if=\"{ data.get('shippingAddress.state')}\">{ data.get('shippingAddress.state').toUpperCase() }</div>\n    <div class=\"state\" if=\"{ data.get('shippingAddress.postalCode')}\">{ data.get('shippingAddress.postalCode') }</div>\n    <div class=\"country\">{ data.get('shippingAddress.country').toUpperCase() }</div>\n  </div>\n</yield>";

// src/forms/order.coffee
var OrderForm;
var extend$39 = function(child, parent) { for (var key in parent) { if (hasProp$37.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$37 = {}.hasOwnProperty;

OrderForm = (function(superClass) {
  extend$39(OrderForm, superClass);

  function OrderForm() {
    return OrderForm.__super__.constructor.apply(this, arguments);
  }

  OrderForm.prototype.tag = 'order';

  OrderForm.prototype.html = html$12;

  OrderForm.prototype.parentData = null;

  OrderForm.prototype.init = function() {
    OrderForm.__super__.init.apply(this, arguments);
    this.parentData = refer$1({});
    return this.on('update', (function(_this) {
      return function() {
        var i, item, items, j, len, results;
        if (_this.data != null) {
          _this.parentData.set('order', _this.data.get());
          items = _this.data.get('items');
          if (items == null) {
            return;
          }
          results = [];
          for (i = j = 0, len = items.length; j < len; i = ++j) {
            item = items[i];
            results.push(_this.parentData.set('order.items.' + i + '.locked', true));
          }
          return results;
        }
      };
    })(this));
  };

  OrderForm.prototype["delete"] = function(event) {
    return m.trigger(Events.DeleteLineItem, this.data);
  };

  return OrderForm;

})(El.Form);

var Order = OrderForm;

// templates/forms/orders.pug
var html$13 = "\n<order each=\"{ order, v in data('user.orders') }\" parent-data=\"{ this.parent.data.get('user') }\" data=\"{ this.parent.data.ref('user.orders.' + v) }\" if=\"{ order.paymentStatus != 'unpaid' }\">\n  <yield></yield>\n</order>";

// src/forms/orders.coffee
var Orders;
var extend$40 = function(child, parent) { for (var key in parent) { if (hasProp$38.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$38 = {}.hasOwnProperty;

Orders = (function(superClass) {
  extend$40(Orders, superClass);

  function Orders() {
    return Orders.__super__.constructor.apply(this, arguments);
  }

  Orders.prototype.tag = 'orders';

  Orders.prototype.html = html$13;

  Orders.prototype.init = function() {
    return Orders.__super__.init.apply(this, arguments);
  };

  return Orders;

})(El.View);

var Orders$1 = Orders;

// src/forms/profile.coffee
var ProfileForm;
var extend$41 = function(child, parent) { for (var key in parent) { if (hasProp$39.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$39 = {}.hasOwnProperty;

ProfileForm = (function(superClass) {
  extend$41(ProfileForm, superClass);

  function ProfileForm() {
    return ProfileForm.__super__.constructor.apply(this, arguments);
  }

  ProfileForm.prototype.tag = 'profile';

  ProfileForm.prototype.html = html$11;

  ProfileForm.prototype.configs = {
    'user.email': [isRequired, isEmail],
    'user.name': [isRequired, splitName],
    'user.currentPassword': [isNewPassword],
    'user.password': [isNewPassword],
    'user.passwordConfirm': [isNewPassword, matchesPassword]
  };

  ProfileForm.prototype.errorMessage = '';

  ProfileForm.prototype.hasOrders = function() {
    var orders;
    orders = this.data.get('user.orders');
    return orders && orders.length > 0;
  };

  ProfileForm.prototype.init = function() {
    m.trigger(Events.ProfileLoad);
    this.client.account.get().then((function(_this) {
      return function(res) {
        var firstName, lastName;
        _this.data.set('user', res);
        firstName = _this.data.get('user.firstName');
        lastName = _this.data.get('user.lastName');
        _this.data.set('user.name', firstName + ' ' + lastName);
        if (_this.data.get('referralProgram') && ((res.referrers == null) || res.referrers.length === 0)) {
          return raf(function() {
            m.trigger(Events.CreateReferralProgram);
            return _this.client.referrer.create({
              program: _this.data.get('referralProgram'),
              programId: _this.data.get('referralProgram.id'),
              userId: res.id
            }).then(function(res2) {
              var refrs;
              refrs = [res2];
              _this.data.set('user.referrers', refrs);
              m.trigger(Events.CreateReferralProgramSuccess, refrs);
              m.trigger(Events.ProfileLoadSuccess, res);
              return El.scheduleUpdate();
            })["catch"](function(err) {
              _this.errorMessage = err.message;
              m.trigger(Events.CreateReferralProgramFailed, err);
              m.trigger(Events.ProfileLoadSuccess, res);
              return El.scheduleUpdate();
            });
          });
        } else {
          m.trigger(Events.ProfileLoadSuccess, res);
          return El.scheduleUpdate();
        }
      };
    })(this))["catch"]((function(_this) {
      return function(err) {
        _this.errorMessage = err.message;
        m.trigger(Events.ProfileLoadFailed, err);
        return El.scheduleUpdate();
      };
    })(this));
    return ProfileForm.__super__.init.apply(this, arguments);
  };

  ProfileForm.prototype._submit = function(event) {
    var opts;
    opts = {
      email: this.data.get('user.email'),
      firstName: this.data.get('user.firstName'),
      lastName: this.data.get('user.lastName'),
      currentPassword: this.data.get('user.currentPassword'),
      password: this.data.get('user.password'),
      passwordConfirm: this.data.get('user.passwordConfirm')
    };
    this.errorMessage = '';
    this.scheduleUpdate();
    m.trigger(Events.ProfileUpdate);
    return this.client.account.update(opts).then((function(_this) {
      return function(res) {
        _this.data.set('user.currentPassword', null);
        _this.data.set('user.password', null);
        _this.data.set('user.passwordConfirm', null);
        m.trigger(Events.ProfileUpdateSuccess, res);
        return _this.scheduleUpdate();
      };
    })(this))["catch"]((function(_this) {
      return function(err) {
        _this.errorMessage = err.message;
        m.trigger(Events.ProfileUpdateFailed, err);
        return _this.scheduleUpdate();
      };
    })(this));
  };

  return ProfileForm;

})(El.Form);

var Profile = ProfileForm;

// src/forms/register.coffee
var RegisterForm;
var extend$42 = function(child, parent) { for (var key in parent) { if (hasProp$40.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$40 = {}.hasOwnProperty;

RegisterForm = (function(superClass) {
  extend$42(RegisterForm, superClass);

  function RegisterForm() {
    return RegisterForm.__super__.constructor.apply(this, arguments);
  }

  RegisterForm.prototype.tag = 'register';

  RegisterForm.prototype.html = html$11;

  RegisterForm.prototype.immediateLogin = false;

  RegisterForm.prototype.immediateLoginLatency = 400;

  RegisterForm.prototype.configs = {
    'user.email': [isRequired, isEmail],
    'user.name': [isRequired, splitName],
    'user.password': [isPassword],
    'user.passwordConfirm': [isPassword, matchesPassword]
  };

  RegisterForm.prototype.source = '';

  RegisterForm.prototype.errorMessage = '';

  RegisterForm.prototype.init = function() {
    return RegisterForm.__super__.init.apply(this, arguments);
  };

  RegisterForm.prototype._submit = function(event) {
    var captcha, opts;
    opts = {
      email: this.data.get('user.email'),
      firstName: this.data.get('user.firstName'),
      lastName: this.data.get('user.lastName'),
      password: this.data.get('user.password'),
      passwordConfirm: this.data.get('user.passwordConfirm'),
      referrerId: this.data.get('order.referrerId'),
      metadata: {
        source: this.source
      }
    };
    captcha = this.data.get('user.g-recaptcha-response');
    if (captcha) {
      opts['g-recaptcha-response'] = captcha;
    }
    this.errorMessage = '';
    this.scheduleUpdate();
    m.trigger(Events.Register);
    return this.client.account.create(opts).then((function(_this) {
      return function(res) {
        var latency;
        m.trigger(Events.RegisterSuccess, res);
        _this.scheduleUpdate();
        if (_this.immediateLogin && res.token) {
          _this.client.setCustomerToken(res.token);
          latency = _this.immediateLoginLatency / 2;
          return setTimeout(function() {
            m.trigger(Events.Login);
            return setTimeout(function() {
              m.trigger(Events.LoginSuccess, res);
              return _this.scheduleUpdate();
            }, latency);
          }, latency);
        }
      };
    })(this))["catch"]((function(_this) {
      return function(err) {
        _this.errorMessage = err.message;
        m.trigger(Events.RegisterFailed, err);
        return _this.scheduleUpdate();
      };
    })(this));
  };

  return RegisterForm;

})(El.Form);

var Register = RegisterForm;

// src/forms/register-complete.coffee
var RegisterComplete;
var extend$43 = function(child, parent) { for (var key in parent) { if (hasProp$41.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$41 = {}.hasOwnProperty;

RegisterComplete = (function(superClass) {
  extend$43(RegisterComplete, superClass);

  function RegisterComplete() {
    return RegisterComplete.__super__.constructor.apply(this, arguments);
  }

  RegisterComplete.prototype.tag = 'register-complete';

  RegisterComplete.prototype.html = html$11;

  RegisterComplete.prototype.twoStageSignUp = false;

  RegisterComplete.prototype.configs = {
    'user.name': [isRequired, splitName],
    'user.password': [isPassword],
    'user.passwordConfirm': [isPassword, matchesPassword]
  };

  RegisterComplete.prototype.errorMessage = '';

  RegisterComplete.prototype.init = function() {
    RegisterComplete.__super__.init.apply(this, arguments);
    if (!this.twoStageSignUp) {
      return this._submit();
    }
  };

  RegisterComplete.prototype._submit = function(event) {
    var firstName, lastName, opts;
    opts = {
      password: this.data.get('user.password'),
      passwordConfirm: this.data.get('user.passwordConfirm'),
      tokenId: this.data.get('tokenId')
    };
    firstName = this.data.get('user.firstName');
    lastName = this.data.get('user.lastName');
    if (firstName) {
      opts.firstName = firstName;
    }
    if (lastName) {
      opts.lastName = lastName;
    }
    this.errorMessage = '';
    this.scheduleUpdate();
    m.trigger(Events.RegisterComplete);
    return this.client.account.enable(opts).then((function(_this) {
      return function(res) {
        if (res.token) {
          _this.client.setCustomerToken(res.token);
        }
        m.trigger(Events.RegisterCompleteSuccess, res);
        return _this.scheduleUpdate();
      };
    })(this))["catch"]((function(_this) {
      return function(err) {
        _this.errorMessage = err.message;
        m.trigger(Events.RegisterCompleteFailed, err);
        return _this.scheduleUpdate();
      };
    })(this));
  };

  return RegisterComplete;

})(El.Form);

var RegisterComplete$1 = RegisterComplete;

// src/forms/reset-password.coffee
var ResetPasswordForm;
var extend$44 = function(child, parent) { for (var key in parent) { if (hasProp$42.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$42 = {}.hasOwnProperty;

ResetPasswordForm = (function(superClass) {
  extend$44(ResetPasswordForm, superClass);

  function ResetPasswordForm() {
    return ResetPasswordForm.__super__.constructor.apply(this, arguments);
  }

  ResetPasswordForm.prototype.tag = 'reset-password';

  ResetPasswordForm.prototype.html = html$11;

  ResetPasswordForm.prototype.configs = {
    'user.email': [isRequired, isEmail]
  };

  ResetPasswordForm.prototype.errorMessage = '';

  ResetPasswordForm.prototype.init = function() {
    return ResetPasswordForm.__super__.init.apply(this, arguments);
  };

  ResetPasswordForm.prototype._submit = function(event) {
    var opts;
    opts = {
      email: this.data.get('user.email')
    };
    this.errorMessage = '';
    this.scheduleUpdate();
    m.trigger(Events.ResetPassword);
    return this.client.account.reset(opts).then((function(_this) {
      return function(res) {
        m.trigger(Events.ResetPasswordSuccess, res);
        return _this.scheduleUpdate();
      };
    })(this))["catch"]((function(_this) {
      return function(err) {
        _this.errorMessage = err.message;
        m.trigger(Events.ResetPasswordFailed, err);
        return _this.scheduleUpdate();
      };
    })(this));
  };

  return ResetPasswordForm;

})(El.Form);

var ResetPassword = ResetPasswordForm;

// src/forms/reset-password-complete.coffee
var ResetPasswordCompleteForm;
var extend$45 = function(child, parent) { for (var key in parent) { if (hasProp$43.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$43 = {}.hasOwnProperty;

ResetPasswordCompleteForm = (function(superClass) {
  extend$45(ResetPasswordCompleteForm, superClass);

  function ResetPasswordCompleteForm() {
    return ResetPasswordCompleteForm.__super__.constructor.apply(this, arguments);
  }

  ResetPasswordCompleteForm.prototype.tag = 'reset-password-complete';

  ResetPasswordCompleteForm.prototype.html = html$11;

  ResetPasswordCompleteForm.prototype.configs = {
    'user.password': [isPassword],
    'user.passwordConfirm': [isPassword, matchesPassword]
  };

  ResetPasswordCompleteForm.prototype.errorMessage = '';

  ResetPasswordCompleteForm.prototype.init = function() {
    return ResetPasswordCompleteForm.__super__.init.apply(this, arguments);
  };

  ResetPasswordCompleteForm.prototype._submit = function(event) {
    var opts;
    opts = {
      password: this.data.get('user.password'),
      passwordConfirm: this.data.get('user.passwordConfirm'),
      tokenId: this.data.get('tokenId')
    };
    this.errorMessage = '';
    this.scheduleUpdate();
    m.trigger(Events.ResetPasswordComplete);
    return this.client.account.confirm(opts).then((function(_this) {
      return function(res) {
        if (res.token) {
          _this.client.setCustomerToken(res.token);
        }
        m.trigger(Events.ResetPasswordCompleteSuccess, res);
        return _this.scheduleUpdate();
      };
    })(this))["catch"]((function(_this) {
      return function(err) {
        _this.errorMessage = err.message.replace('Token', 'Link');
        m.trigger(Events.ResetPasswordCompleteFailed, err);
        return _this.scheduleUpdate();
      };
    })(this));
  };

  return ResetPasswordCompleteForm;

})(El.Form);

var ResetPasswordComplete = ResetPasswordCompleteForm;

// src/forms/shippingaddress.coffee
var ShippingAddressForm;
var extend$46 = function(child, parent) { for (var key in parent) { if (hasProp$44.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$44 = {}.hasOwnProperty;

ShippingAddressForm = (function(superClass) {
  extend$46(ShippingAddressForm, superClass);

  function ShippingAddressForm() {
    return ShippingAddressForm.__super__.constructor.apply(this, arguments);
  }

  ShippingAddressForm.prototype.tag = 'shippingaddress';

  ShippingAddressForm.prototype.html = html$11;

  ShippingAddressForm.prototype.configs = {
    'order.shippingAddress.name': [isRequired],
    'order.shippingAddress.line1': [isRequired],
    'order.shippingAddress.line2': null,
    'order.shippingAddress.city': [isRequired],
    'order.shippingAddress.state': [isRequired],
    'order.shippingAddress.postalCode': [isPostalRequired],
    'order.shippingAddress.country': [isRequired]
  };

  ShippingAddressForm.prototype.errorMessage = '';

  ShippingAddressForm.prototype.init = function() {
    if (this.parentData != null) {
      this.data = this.parentData;
    }
    ShippingAddressForm.__super__.init.apply(this, arguments);
    return this.on('update', (function(_this) {
      return function() {
        if (_this.parentData != null) {
          return _this.data = _this.parentData;
        }
      };
    })(this));
  };

  ShippingAddressForm.prototype._submit = function() {
    var opts;
    opts = {
      id: this.data.get('order.id'),
      shippingAddress: this.data.get('order.shippingAddress')
    };
    this.errorMessage = '';
    this.scheduleUpdate();
    m.trigger(Events.ShippingAddressUpdate);
    return this.client.account.updateOrder(opts).then((function(_this) {
      return function(res) {
        m.trigger(Events.ShippingAddressUpdateSuccess, res);
        return _this.scheduleUpdate();
      };
    })(this))["catch"]((function(_this) {
      return function(err) {
        _this.errorMessage = err.message;
        m.trigger(Events.ShippingAddressUpdateFailed, err);
        return _this.scheduleUpdate();
      };
    })(this));
  };

  return ShippingAddressForm;

})(El.Form);

var ShippingAddress = ShippingAddressForm;

// src/forms/index.coffee
var Forms;

var Forms$1 = Forms = {
  Checkout: Checkout,
  CheckoutCard: CheckoutCard,
  CheckoutShippingAddress: CheckoutShippingAddress,
  Cart: Cart$1,
  LineItem: LineItem,
  LineItems: LineItems$1,
  Login: Login,
  Order: Order,
  Orders: Orders$1,
  Profile: Profile,
  Register: Register,
  RegisterComplete: RegisterComplete$1,
  ResetPassword: ResetPassword,
  ResetPasswordComplete: ResetPasswordComplete,
  ShippingAddress: ShippingAddress,
  register: function() {
    Checkout.register();
    CheckoutCard.register();
    CheckoutShippingAddress.register();
    Cart$1.register();
    LineItem.register();
    LineItems$1.register();
    Login.register();
    Order.register();
    Orders$1.register();
    Profile.register();
    Register.register();
    RegisterComplete$1.register();
    ResetPassword.register();
    ResetPasswordComplete.register();
    return ShippingAddress.register();
  }
};

// templates/widgets/cart-counter.pug
var html$14 = "\n<yield>\n  <div class=\"cart-count\">({ countItems() })</div>\n  <div class=\"cart-price\">({ renderCurrency(data.get('order.currency'), totalPrice()) })</div>\n</yield>";

// src/widgets/cart-counter.coffee
var CartCounter;
var extend$47 = function(child, parent) { for (var key in parent) { if (hasProp$45.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$45 = {}.hasOwnProperty;

CartCounter = (function(superClass) {
  extend$47(CartCounter, superClass);

  function CartCounter() {
    return CartCounter.__super__.constructor.apply(this, arguments);
  }

  CartCounter.prototype.tag = 'cart-counter';

  CartCounter.prototype.html = html$14;

  CartCounter.prototype.init = function() {
    return CartCounter.__super__.init.apply(this, arguments);
  };

  CartCounter.prototype.countItems = function() {
    var count, i, item, items, j, len;
    items = this.data.get('order.items');
    count = 0;
    for (i = j = 0, len = items.length; j < len; i = ++j) {
      item = items[i];
      count += item.quantity;
    }
    return count;
  };

  CartCounter.prototype.totalPrice = function() {
    var i, item, items, j, len, price;
    items = this.data.get('order.items');
    price = 0;
    for (i = j = 0, len = items.length; j < len; i = ++j) {
      item = items[i];
      price += item.price * item.quantity;
    }
    return price;
  };

  return CartCounter;

})(El.View);

var CartCounter$1 = CartCounter;

// templates/widgets/checkout-modal.pug
var html$15 = "\n<!-- Checkout Modal-->\n<div class=\"checkout-modal { opened: opened, closed: !opened }\">\n  <div class=\"checkout-modal-close\" onclick=\"{ close }\">&#10005;</div>\n</div>\n<!-- Checkout widget-->\n<div class=\"checkout-container\">\n  <div class=\"checkout-header\">\n    <ul class=\"checkout-steps\">\n      <li class=\"checkout-step { active: parent.step == i }\" each=\"{ name, i in names }\">\n        <div class=\"checkout-step-number\">{ i + 1 }</div>\n        <div class=\"checkout-step-description\">{ name }</div>\n      </li>\n    </ul>\n    <div class=\"checkout-back\" if=\"{ step == 0 || step == 2}\" onclick=\"{ close }\">&#10005;</div>\n    <div class=\"checkout-back\" if=\"{ step == 1 }\" onclick=\"{ back }\">&#10140;</div>\n  </div>\n  <div class=\"checkout-content\">\n    <cart>\n      <h2>You Items</h2>\n      <lineitems if=\"{ !isEmpty() }\"></lineitems>\n      <div class=\"promo\">\n        <div class=\"promo-label\">Coupon</div>\n        <div class=\"promo-row { applied: applied, applying: applying, failed: failed }\">\n          <promocode class=\"input\" placeholder=\"Coupon\"></promocode>\n          <button disabled=\"{ applying }\" onclick=\"{ applyPromoCode }\"><span if=\"{ !applied &amp;&amp; !applying &amp;&amp; !failed }\">+</span><span if=\"{ applied }\">&#10003;</span><span if=\"{ failed }\">&#10005;</span><span if=\"{ applying }\">...</span></button>\n        </div>\n      </div>\n      <div class=\"invoice-discount invoice-line animated fadeIn\" if=\"{ data.get('order.discount') &gt; 0 }\">\n        <div class=\"invoice-label\">Discount</div>\n        <div class=\"invoice-amount\">{ renderCurrency(data.get('order.currency'), data.get('order.discount'))} { data.get('order.currency').toUpperCase() }</div>\n      </div>\n      <div class=\"invoice-line\">\n        <div class=\"invoice-label\">Subtotal</div>\n        <div class=\"invoice-amount\">{ renderCurrency(data.get('order.currency'), data.get('order.subtotal'))} { data.get('order.currency').toUpperCase() }</div>\n      </div>\n      <div class=\"invoice-line\">\n        <div class=\"invoice-label\">Shipping</div>\n        <div class=\"invoice-amount not-bold\">{ data.get('order.shipping') == 0 ? 'FREE' : renderCurrency(data.get('order.currency'), data.get('order.shipping'))}&nbsp;{ data.get('order.shipping') == 0 ? '' : data.get('order.currency').toUpperCase() }</div>\n      </div>\n      <div class=\"invoice-line\">\n        <div class=\"invoice-label\">Tax ({ data.get('order.taxRate') * 100 }%)</div>\n        <div class=\"invoice-amount\">{ renderCurrency(data.get('order.currency'), data.get('order.tax'))} { data.get('order.currency').toUpperCase() }</div>\n      </div>\n      <div class=\"invoice-line invoice-total\">\n        <div class=\"invoice-label\">Total</div>\n        <div class=\"invoice-amount\">{ renderCurrency(data.get('order.currency'), data.get('order.total'))} { data.get('order.currency').toUpperCase() }</div>\n      </div>\n    </cart>\n    <div class=\"checkout-form { step-1: step == 0, step-2: step == 1, step-3: step == 2 }\">\n      <div class=\"checkout-form-parts\">\n        <checkout-card class=\"checkout-form-part\">\n          <div class=\"contact checkout-section\">\n            <h2>Contact</h2>\n            <div class=\"fields\">\n              <user-name class=\"input\" placeholder=\"Name\"></user-name>\n              <user-email class=\"input\" placeholder=\"Email\"></user-email>\n            </div>\n          </div>\n          <div class=\"payment checkout-section\">\n            <h2>Payment</h2><span class=\"secured-text\">SSL Secure<span>Checkout</span><img class=\"lock-icon\" src=\"/img/lock-icon.svg\"></span>\n            <div class=\"fields\">\n              <card-name class=\"input\" placeholder=\"Name on Card\"></card-name>\n              <card-number class=\"input\" name=\"number\" placeholder=\"Card Number\">\n                <div class=\"cards-accepted\"><img class=\"card-logo amex-logo\" src=\"/img/card-logos/amex.svg\"><img class=\"card-logo visa-logo\" src=\"/img/card-logos/visa.svg\"><img class=\"card-logo discover-logo\" src=\"/img/card-logos/discover.svg\"><img class=\"card-logo jcb-logo\" src=\"/img/card-logos/jcb.svg\"><img class=\"card-logo mastercard-logo\" src=\"img/card-logos/mastercard.svg\"><a class=\"stripe-link\" href=\"//www.stripe.com\" target=\"_blank\"><img class=\"stripe-logo\" src=\"/img/stripelogo.png\"></a></div>\n              </card-number>\n              <card-expiry class=\"input\" name=\"expiry\" placeholder=\"MM / YY\"></card-expiry>\n              <card-cvc class=\"input\" name=\"cvc\" placeholder=\"CVC\"></card-cvc>\n            </div>\n          </div>\n          <button class=\"checkout-next\" type=\"submit\">Continue &#10140;</button>\n          <div class=\"error\" if=\"{ errorMessage }\">{ errorMessage }</div>\n        </checkout-card>\n        <checkout class=\"checkout-form-part\">\n          <div class=\"shipping checkout-section\">\n            <h2>Shipping</h2>\n            <div class=\"fields\">\n              <shippingaddress-name class=\"input\" placeholder=\"Recipient\"></shippingaddress-name>\n              <shippingaddress-line1 class=\"input\" placeholder=\"Address\"></shippingaddress-line1>\n              <shippingaddress-line2 class=\"input\" placeholder=\"Suite\"></shippingaddress-line2>\n            </div>\n            <div class=\"fields\">\n              <shippingaddress-city class=\"input\" placeholder=\"City\"></shippingaddress-city>\n              <shippingaddress-postalcode class=\"input\" placeholder=\"Postal Code\"></shippingaddress-postalcode>\n            </div>\n            <div class=\"fields\">\n              <shippingaddress-state class=\"input\" placeholder=\"State\"></shippingaddress-state>\n              <shippingaddress-country class=\"input\" placeholder=\"Country\"></shippingaddress-country>\n            </div>\n          </div>\n          <terms>\n            <label for=\"terms\">I have read and accept the&nbsp;<a href=\"terms\" target=\"_blank\">terms and conditions</a></label>\n          </terms>\n          <button class=\"checkout-next { loading: loading || checkedOut }\" __disabled=\"{ loading || checkedOut }\" type=\"submit\">Checkout</button>\n          <div class=\"error\" if=\"{ errorMessage }\">{ errorMessage }</div>\n        </checkout>\n        <div class=\"completed checkout-form-part\">\n          <yield ></yield >\n        </div>\n      </div>\n    </div>\n  </div>\n</div>";

// src/widgets/checkout-modal.coffee
var CheckoutModal;
var extend$48 = function(child, parent) { for (var key in parent) { if (hasProp$46.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$46 = {}.hasOwnProperty;

CheckoutModal = (function(superClass) {
  extend$48(CheckoutModal, superClass);

  function CheckoutModal() {
    return CheckoutModal.__super__.constructor.apply(this, arguments);
  }

  CheckoutModal.prototype.tag = 'checkout-modal';

  CheckoutModal.prototype.html = html$15;

  CheckoutModal.prototype.names = null;

  CheckoutModal.prototype.step = 0;

  CheckoutModal.prototype.id = '';

  CheckoutModal.prototype.opened = false;

  CheckoutModal.prototype.init = function() {
    if (!this.names) {
      this.names = ['Payment Info', 'Shipping Info', 'Done'];
    }
    CheckoutModal.__super__.init.apply(this, arguments);
    m.on(Events.CheckoutOpen, (function(_this) {
      return function(id) {
        if (id === _this.id) {
          return _this.toggle(true);
        }
      };
    })(this));
    m.on(Events.CheckoutClose, (function(_this) {
      return function(id) {
        if (id === _this.id) {
          return _this.toggle(false);
        }
      };
    })(this));
    m.on(Events.SubmitCard, (function(_this) {
      return function(id) {
        _this.step = 1;
        return El.scheduleUpdate();
      };
    })(this));
    return m.on(Events.SubmitSuccess, (function(_this) {
      return function(id) {
        _this.step = 2;
        return El.scheduleUpdate();
      };
    })(this));
  };

  CheckoutModal.prototype.open = function() {
    return this.toggle(true);
  };

  CheckoutModal.prototype.close = function() {
    this.toggle(false);
    if (this.step === 2) {
      this.step = 0;
      return this.scheduleUpdate();
    }
  };

  CheckoutModal.prototype.back = function() {
    if (this.step === 0 || this.step === 2) {
      return this.close();
    }
    this.step--;
    return this.scheduleUpdate();
  };

  CheckoutModal.prototype.toggle = function(opened) {
    var $container;
    if (opened === true || opened === false) {
      this.opened = opened;
    } else {
      this.opened = !this.opened;
    }
    $container = $(this.root).find('.checkout-container');
    if (this.opened) {
      $container.css('top', $(window).scrollTop());
      m.trigger(Events.CheckoutOpened);
    } else {
      $container.css('top', -2000);
      m.trigger(Events.CheckoutClosed);
    }
    return this.scheduleUpdate();
  };

  return CheckoutModal;

})(El.View);

var CheckoutModal$1 = CheckoutModal;

// templates/widgets/nested-form.pug
var html$16 = "\n<form onsubmit=\"{ submit }\">\n  <yield></yield>\n</form>";

// src/widgets/nested-form.coffee
var NestedForm;
var extend$49 = function(child, parent) { for (var key in parent) { if (hasProp$47.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$47 = {}.hasOwnProperty;

NestedForm = (function(superClass) {
  extend$49(NestedForm, superClass);

  function NestedForm() {
    return NestedForm.__super__.constructor.apply(this, arguments);
  }

  NestedForm.prototype.tag = 'nested-form';

  NestedForm.prototype.html = html$16;

  return NestedForm;

})(El.View);

var NestedForm$1 = NestedForm;

// templates/widgets/side-pane.pug
var html$17 = "\n<div class=\"side-pane { opened: opened, closed: !opened }\">\n  <div class=\"side-pane-close\" onclick=\"{ close }\">&#10140;</div>\n  <div class=\"side-pane-content\">\n    <yield></yield>\n  </div>\n</div>";

// src/widgets/side-pane.coffee
var SidePane;
var extend$50 = function(child, parent) { for (var key in parent) { if (hasProp$48.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$48 = {}.hasOwnProperty;

SidePane = (function(superClass) {
  extend$50(SidePane, superClass);

  function SidePane() {
    return SidePane.__super__.constructor.apply(this, arguments);
  }

  SidePane.prototype.tag = 'side-pane';

  SidePane.prototype.html = html$17;

  SidePane.prototype.id = '';

  SidePane.prototype.opened = false;

  SidePane.prototype.init = function() {
    SidePane.__super__.init.apply(this, arguments);
    m.on(Events.SidePaneOpen, (function(_this) {
      return function(id) {
        if (id === _this.id) {
          return _this.toggle(true);
        }
      };
    })(this));
    return m.on(Events.SidePaneClose, (function(_this) {
      return function(id) {
        if (id === _this.id) {
          return _this.toggle(false);
        }
      };
    })(this));
  };

  SidePane.prototype.open = function() {
    return this.toggle(true);
  };

  SidePane.prototype.close = function() {
    return this.toggle(false);
  };

  SidePane.prototype.toggle = function(opened) {
    if (opened === true || opened === false) {
      this.opened = opened;
    } else {
      this.opened = !this.opened;
    }
    if (this.opened) {
      m.trigger(Events.SidePaneOpened);
    } else {
      m.trigger(Events.SidePaneClosed);
    }
    return this.scheduleUpdate();
  };

  return SidePane;

})(El.View);

var SidePane$1 = SidePane;

// src/widgets/index.coffee
var Widgets;

var Widgets$1 = Widgets = {
  CartCounter: CartCounter$1,
  CheckoutModal: CheckoutModal$1,
  NestedForm: NestedForm$1,
  SidePane: SidePane$1,
  register: function() {
    CartCounter$1.register();
    CheckoutModal$1.register();
    NestedForm$1.register();
    return SidePane$1.register();
  }
};

// src/utils/analytics.coffee
var analytics = {
  track: function(event, data) {
    var err;
    if ((typeof window !== "undefined" && window !== null ? window.analytics : void 0) != null) {
      try {
        return window.analytics.track(event, data);
      } catch (error) {
        err = error;
        return console.error(err);
      }
    }
  }
};

// src/data/currencies.coffee
var currencies = {
  data: {
    'aud': '$',
    'cad': '$',
    'eur': '€',
    'gbp': '£',
    'hkd': '$',
    'jpy': '¥',
    'nzd': '$',
    'sgd': '$',
    'usd': '$',
    'ghc': '¢',
    'ars': '$',
    'bsd': '$',
    'bbd': '$',
    'bmd': '$',
    'bnd': '$',
    'kyd': '$',
    'clp': '$',
    'cop': '$',
    'xcd': '$',
    'svc': '$',
    'fjd': '$',
    'gyd': '$',
    'lrd': '$',
    'mxn': '$',
    'nad': '$',
    'sbd': '$',
    'srd': '$',
    'tvd': '$',
    'bob': '$b',
    'uyu': '$u',
    'egp': '£',
    'fkp': '£',
    'gip': '£',
    'ggp': '£',
    'imp': '£',
    'jep': '£',
    'lbp': '£',
    'shp': '£',
    'syp': '£',
    'cny': '¥',
    'afn': '؋',
    'thb': '฿',
    'khr': '៛',
    'crc': '₡',
    'trl': '₤',
    'ngn': '₦',
    'kpw': '₩',
    'krw': '₩',
    'ils': '₪',
    'vnd': '₫',
    'lak': '₭',
    'mnt': '₮',
    'cup': '₱',
    'php': '₱',
    'uah': '₴',
    'mur': '₨',
    'npr': '₨',
    'pkr': '₨',
    'scr': '₨',
    'lkr': '₨',
    'irr': '﷼',
    'omr': '﷼',
    'qar': '﷼',
    'sar': '﷼',
    'yer': '﷼',
    'pab': 'b/.',
    'vef': 'bs',
    'bzd': 'bz$',
    'nio': 'c$',
    'chf': 'chf',
    'huf': 'ft',
    'awg': 'ƒ',
    'ang': 'ƒ',
    'pyg': 'gs',
    'jmd': 'j$',
    'czk': 'kč',
    'bam': 'km',
    'hrk': 'kn',
    'dkk': 'kr',
    'eek': 'kr',
    'isk': 'kr',
    'nok': 'kr',
    'sek': 'kr',
    'hnl': 'l',
    'ron': 'lei',
    'all': 'lek',
    'lvl': 'ls',
    'ltl': 'lt',
    'mzn': 'mt',
    'twd': 'nt$',
    'bwp': 'p',
    'byr': 'p.',
    'gtq': 'q',
    'zar': 'r',
    'brl': 'r$',
    'dop': 'rd$',
    'myr': 'rm',
    'idr': 'rp',
    'sos': 's',
    'pen': 's/.',
    'ttd': 'tt$',
    'zwd': 'z$',
    'pln': 'zł',
    'mkd': 'ден',
    'rsd': 'Дин.',
    'bgn': 'лв',
    'kzt': 'лв',
    'kgs': 'лв',
    'uzs': 'лв',
    'azn': 'ман',
    'rub': 'руб',
    'inr': '',
    'try': '',
    '': ''
  }
};

// src/utils/currency.coffee
var currencySigns;
var digitsOnlyRe;
var isZeroDecimal;

digitsOnlyRe = new RegExp('[^\\d.-]', 'g');

currencySigns = currencies.data;

isZeroDecimal = function(code) {
  if (code === 'bif' || code === 'clp' || code === 'djf' || code === 'gnf' || code === 'jpy' || code === 'kmf' || code === 'krw' || code === 'mga' || code === 'pyg' || code === 'rwf' || code === 'vnd' || code === 'vuv' || code === 'xaf' || code === 'xof' || code === 'xpf') {
    return true;
  }
  return false;
};



var renderUICurrencyFromJSON = function(code, jsonCurrency) {
  var currentCurrencySign;
  if (isNaN(jsonCurrency)) {
    jsonCurrency = 0;
  }
  currentCurrencySign = currencySigns[code];
  jsonCurrency = '' + jsonCurrency;
  if (isZeroDecimal(code)) {
    return currentCurrencySign + jsonCurrency;
  }
  while (jsonCurrency.length < 3) {
    jsonCurrency = '0' + jsonCurrency;
  }
  return currentCurrencySign + jsonCurrency.substr(0, jsonCurrency.length - 2) + '.' + jsonCurrency.substr(-2);
};

// src/utils/dates.coffee
var renderDate = function(date, format) {
  return moment(date).format(format);
};

// src/index.coffee
var Shop;
var children;
var elementsToMount;
var getMCIds;
var getQueries;
var getReferrer;
var k;
var ref;
var ref1;
var ref2;
var ref3;
var root;
var searchQueue;
var tagNames;
var v;
var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Shop = {};

Shop.Controls = Controls$1;

Shop.Events = Events;

Shop.Forms = Forms$1;

Shop.Widgets = Widgets$1;

El.View.prototype.renderCurrency = renderUICurrencyFromJSON;

El.View.prototype.renderDate = renderDate;

El.View.prototype.isEmpty = function() {
  return Shop.isEmpty();
};

Shop.use = function(templates) {
  var ref, ref1;
  if (templates != null ? (ref = templates.Controls) != null ? ref.Error : void 0 : void 0) {
    Shop.Controls.Control.prototype.errorHtml = templates.Controls.Error;
  }
  if (templates != null ? (ref1 = templates.Controls) != null ? ref1.Text : void 0 : void 0) {
    return Shop.Controls.Text.prototype.html = templates.Controls.Text;
  }
};

Shop.analytics = analytics;

Shop.isEmpty = function() {
  var items;
  items = this.data.get('order.items');
  return items.length === 0;
};

getQueries = function() {
  var err, k, match, q, qs, search, v;
  search = /([^&=]+)=?([^&]*)/g;
  q = window.location.href.split('?')[1];
  qs = {};
  if (q != null) {
    while ((match = search.exec(q))) {
      k = match[1];
      try {
        k = decodeURIComponent(k);
      } catch (error) {}
      v = match[2];
      try {
        v = decodeURIComponent(v);
      } catch (error) {
        err = error;
      }
      qs[k] = v;
    }
  }
  return qs;
};

getReferrer = function(qs) {
  if (qs.referrer != null) {
    return qs.referrer;
  } else {
    return store.get('referrer');
  }
};

getMCIds = function(qs) {
  return [qs['mc_eid'], qs['mc_cid']];
};

tagNames = [];

ref = Shop.Forms;
for (k in ref) {
  v = ref[k];
  if (v.prototype.tag != null) {
    tagNames.push(v.prototype.tag.toUpperCase());
  }
}

ref1 = Shop.Widgets;
for (k in ref1) {
  v = ref1[k];
  if (v.prototype.tag != null) {
    tagNames.push(v.prototype.tag.toUpperCase());
  }
}

searchQueue = [document.body];

elementsToMount = [];

while (true) {
  if (searchQueue.length === 0) {
    break;
  }
  root = searchQueue.shift();
  if (root == null) {
    continue;
  }
  if ((root.tagName != null) && (ref2 = root.tagName, indexOf.call(tagNames, ref2) >= 0)) {
    elementsToMount.push(root);
  } else if (((ref3 = root.children) != null ? ref3.length : void 0) > 0) {
    children = Array.prototype.slice.call(root.children);
    children.unshift(0);
    children.unshift(searchQueue.length);
    searchQueue.splice.apply(searchQueue, children);
  }
}

Shop.start = function(opts) {
  var cartId, checkoutPayment, checkoutShippingAddress, checkoutUser, data, i, item, items, j, k2, len, len1, meta, p, promo, ps, queries, r, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref4, ref5, ref6, ref7, ref8, ref9, referrer, settings, tag, tags, v2;
  if (opts == null) {
    opts = {};
  }
  if (opts.key == null) {
    throw new Error('Please specify your API Key');
  }
  Shop.Forms.register();
  Shop.Widgets.register();
  Shop.Controls.register();
  referrer = '';
  queries = getQueries();
  if ((ref4 = opts.config) != null ? ref4.hashReferrer : void 0) {
    r = window.location.hash.replace('#', '');
    if (r !== '') {
      referrer = r;
    } else {
      referrer = (ref5 = getReferrer(queries)) != null ? ref5 : (ref6 = opts.order) != null ? ref6.referrer : void 0;
    }
  } else {
    referrer = (ref7 = getReferrer(queries)) != null ? ref7 : (ref8 = opts.order) != null ? ref8.referrer : void 0;
  }
  store.set('referrer', referrer);
  promo = (ref9 = queries.promo) != null ? ref9 : '';
  items = store.get('items');
  cartId = store.get('cartId');
  meta = store.get('order.metadata');
  this.data = refer$1({
    taxRates: opts.taxRates || [],
    shippingRates: opts.shippingRates || [],
    tokenId: queries.tokenid,
    terms: (ref10 = opts.terms) != null ? ref10 : false,
    order: {
      giftType: 'physical',
      type: 'stripe',
      shippingRate: ((ref11 = opts.config) != null ? ref11.shippingRate : void 0) || ((ref12 = opts.order) != null ? ref12.shippingRate : void 0) || 0,
      taxRate: ((ref13 = opts.config) != null ? ref13.taxRate : void 0) || ((ref14 = opts.order) != null ? ref14.taxRate : void 0) || 0,
      currency: ((ref15 = opts.config) != null ? ref15.currency : void 0) || ((ref16 = opts.order) != null ? ref16.currency : void 0) || 'usd',
      referrerId: referrer,
      shippingAddress: {
        country: 'us'
      },
      discount: 0,
      tax: 0,
      subtotal: 0,
      total: 0,
      items: items != null ? items : [],
      cartId: cartId != null ? cartId : null,
      checkoutUrl: (ref17 = (ref18 = opts.config) != null ? ref18.checkoutUrl : void 0) != null ? ref17 : null,
      metadata: meta != null ? meta : {}
    }
  });
  data = this.data.get();
  for (k in opts) {
    v = opts[k];
    if (opts[k]) {
      if (data[k] == null) {
        data[k] = opts[k];
      } else {
        ref19 = data[k];
        for (k2 in ref19) {
          v2 = ref19[k2];
          extend(data[k][k2], opts[k][k2]);
        }
      }
    }
  }
  this.data.set(data);
  checkoutUser = store.get('checkout-user');
  checkoutShippingAddress = store.get('checkout-shippingAddress');
  checkoutPayment = store.get('checkout-payment');
  if (checkoutUser) {
    this.data.set('user', checkoutUser);
    store.remove('checkout-user');
  }
  if (checkoutShippingAddress) {
    this.data.set('order.shippingAddress', checkoutShippingAddress);
    store.remove('checkout-shippingAddress');
  }
  if (checkoutPayment) {
    this.data.set('payment', checkoutPayment);
    store.remove('checkout-payment');
  }
  settings = {};
  if (opts.key) {
    settings.key = opts.key;
  }
  if (opts.endpoint) {
    settings.endpoint = opts.endpoint;
  }
  this.client = new hanzo_js.Api(settings);
  this.cart = new commerce_js.Cart(this.client, this.data, opts.cartOptions);
  this.cart.onCart = (function(_this) {
    return function() {
      var _, cart, mcCId, ref20;
      store.set('cartId', _this.data.get('order.cartId'));
      ref20 = getMCIds(queries), _ = ref20[0], mcCId = ref20[1];
      cart = {
        mailchimp: {
          checkoutUrl: _this.data.get('order.checkoutUrl')
        },
        currency: _this.data.get('order.currency')
      };
      if (mcCId) {
        cart.mailchimp.campaignId = mcCId;
      }
      return _this.client.account.get().then(function(res) {
        return _this.cart._cartUpdate({
          email: res.email,
          userId: res.email
        });
      })["catch"](function() {});
    };
  })(this);
  tags = El.mount(elementsToMount, {
    cart: this.cart,
    client: this.client,
    data: this.data
  });
  El.update = function() {
    var i, len, results, tag;
    results = [];
    for (i = 0, len = tags.length; i < len; i++) {
      tag = tags[i];
      results.push(tag.update());
    }
    return results;
  };
  this.cart.onUpdate = (function(_this) {
    return function(item) {
      items = _this.data.get('order.items');
      store.set('items', items);
      _this.cart._cartUpdate({
        tax: _this.data.get('order.tax'),
        total: _this.data.get('order.total')
      });
      if (item != null) {
        m.trigger(Events.UpdateItem, item);
      }
      meta = _this.data.get('order.metadata');
      store.set('order.metadata', meta);
      _this.cart.invoice();
      return El.scheduleUpdate();
    };
  })(this);
  if ((referrer != null) && referrer !== '') {
    this.client.referrer.get(referrer).then((function(_this) {
      return function(res) {
        var promoCode;
        promoCode = res.affiliate.couponId;
        _this.data.set('order.promoCode', promocode);
        return m.trigger(Events.ForceApplyPromoCode);
      };
    })(this))["catch"](function() {});
  } else if (promo !== '') {
    this.data.set('order.promoCode', promo);
    m.trigger(Events.ForceApplyPromoCode);
  }
  ps = [];
  for (i = 0, len = tags.length; i < len; i++) {
    tag = tags[i];
    p = new Promise$1(function(resolve) {
      return tag.one('updated', function() {
        return resolve();
      });
    });
    ps.push(p);
  }
  Promise$1.settle(ps).then(function() {
    requestAnimationFrame(function() {
      var j, len1, tagSelectors;
      tagSelectors = tagNames.join(', ');
      for (j = 0, len1 = tags.length; j < len1; j++) {
        tag = tags[j];
        $(tag.root).addClass('ready').find(tagSelectors).addClass('ready');
      }
      return m.trigger(Events.Ready);
    });
    return El.update();
  })["catch"](function(err) {
    var ref20;
    return typeof window !== "undefined" && window !== null ? (ref20 = window.Raven) != null ? ref20.captureException(err) : void 0 : void 0;
  });
  m.data = this.data;
  m.on(Events.SetData, (function(_this) {
    return function(data1) {
      _this.data = data1;
      return _this.cart.invoice();
    };
  })(this));
  m.on(Events.DeleteLineItem, function(item) {
    var id;
    id = item.get('id');
    if (!id) {
      id = item.get('productId');
    }
    if (!id) {
      id = item.get('productSlug');
    }
    return Shop.setItem(id, 0);
  });
  m.trigger(Events.SetData, this.data);
  m.on('error', function(err) {
    var ref20;
    console.log(err);
    return typeof window !== "undefined" && window !== null ? (ref20 = window.Raven) != null ? ref20.captureException(err) : void 0 : void 0;
  });
  if ((items != null) && items.length > 0) {
    for (j = 0, len1 = items.length; j < len1; j++) {
      item = items[j];
      if (item.id != null) {
        this.cart.load(item.id);
      } else if (item.productId != null) {
        this.cart.refresh(item.productId);
      }
    }
  }
  El.scheduleUpdate();
  return m;
};

Shop.initCart = function() {
  return this.cart.initCart();
};

Shop.setItem = function(id, quantity, locked) {
  var p;
  if (locked == null) {
    locked = false;
  }
  m.trigger(Events.TryUpdateItem, id);
  p = this.cart.set(id, quantity, locked);
  if (this.promise !== p) {
    this.promise = p;
    return this.promise.then((function(_this) {
      return function() {
        El.scheduleUpdate();
        return m.trigger(Events.UpdateItems, _this.data.get('order.items'));
      };
    })(this))["catch"](function(err) {
      var ref4;
      return typeof window !== "undefined" && window !== null ? (ref4 = window.Raven) != null ? ref4.captureException(err) : void 0 : void 0;
    });
  }
};

Shop.getItem = function(id) {
  return this.cart.get(id);
};

var Shop$1 = Shop;

module.exports = Shop$1;
//# sourceMappingURL=lib.js.map
