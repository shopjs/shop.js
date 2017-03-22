import Promise$1 from 'broken';
import { raf as raf$1 } from 'es-raf';
import El from 'el.js';
import refer from 'referential';
import store from 'akasha';
import { Api } from 'hanzo.js';
import { Cart } from 'commerce.js';
import selectize from 'es-selectize';
import riot from 'riot';
import moment from 'moment';

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
  window.requestAnimationFrame = raf$1;
}

if (window.cancelAnimationFrame == null) {
  window.cancelAnimationFrame = raf$1.cancel;
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
  DeleteLineItem: 'delete-line-item',
  CreateReferralProgram: 'create-referral-program',
  CreateReferralProgramSuccess: 'create-referral-program-success',
  CreateReferralProgramFailed: 'create-referral-program-failed'
};

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
    if (this.input != null) {
      return Control.__super__.init.apply(this, arguments);
    }
  };

  Control.prototype.getValue = function(event) {
    var ref1;
    return (ref1 = $(event.target).val()) != null ? ref1.trim() : void 0;
  };

  Control.prototype.error = function(err) {
    if (err instanceof DOMException) {
      console.log('WARNING: Error in riot dom manipulation ignored.', err);
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
    return m.trigger(Events.ChangeSuccess, this.input.name, value);
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
var html = "\n<input class=\"{invalid: errorMessage, valid: valid}\" id=\"{ input.name }\" name=\"{ name || input.name }\" type=\"{ type }\" onchange=\"{ change }\" onblur=\"{ change }\" riot-value=\"{ input.ref(input.name) }\" placeholder=\"{ placeholder }\" autocomplete=\"{ autoComplete }\">\n<yield></yield>";

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
var html$1 = "\n<textarea class=\"{invalid: errorMessage, valid: valid}\" id=\"{ input.name }\" name=\"{ name || input.name }\" rows=\"{ rows }\" cols=\"{ cols }\" type=\"text\" onchange=\"{ change }\" onblur=\"{ change }\" placeholder=\"{ placeholder }\">{ input.ref(input.name) }</textarea>\n<yield></yield>";

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
var html$2 = "\n<input class=\"{invalid: errorMessage, valid: valid}\" id=\"{ input.name }\" name=\"{ name || input.name }\" type=\"checkbox\" onchange=\"{ change }\" onblur=\"{ change }\" checked=\"{ input.ref(input.name) }\">\n<yield></yield>";

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
var html$3 = "\n<select class=\"{invalid: errorMessage, valid: valid}\" id=\"{ input.name }\" style=\"{ style };\" name=\"{ name || input.name }\" onchange=\"{ change }\" onblur=\"{ change }\" placeholder=\"{ placeholder }\"></select>\n<yield></yield>";

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
        return raf$1((function(_this) {
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
        return raf$1((function(_this) {
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
var html$4 = "\n<input class=\"{invalid: errorMessage, valid: valid}\" if=\"{ input.ref(countryField) !== &quot;us&quot; }\" id=\"{ input.name }\" name=\"{ name || input.name }\" type=\"text\" onchange=\"{ change }\" onblur=\"{ change }\" riot-value=\"{ input.ref(input.name) }\" placeholder=\"{ placeholder }\">\n<select class=\"{invalid: errorMessage, valid: valid}\" if=\"{ input.ref(countryField) == &quot;us&quot; }\" id=\"{ input.name }\" name=\"{ name || input.name }\" onchange=\"{ change }\" onblur=\"{ change }\" data-placeholder=\"{ placeholder }\"></select>\n<yield></yield>";

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
var indexOf$1 = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
    var $input;
    if (!this.first) {
      $input = $($(this.root).find('input')[0]);
      $input.on('keypress', restrictNumeric);
      $input.on('keypress', (function(_this) {
        return function(e) {
          var card, i, j, k, length, newValue, ref, ref1, ref2, upperLength, value;
          if (ref = e.which, indexOf$1.call(keys.numeric, ref) < 0) {
            return true;
          }
          $input.removeClass(_this.cardType + ' identified unknown');
          value = $input.val() + String.fromCharCode(e.which);
          value = value.replace(/\D/g, '');
          length = value.length;
          upperLength = 16;
          card = cardFromNumber(value);
          if (card) {
            upperLength = card.length[card.length.length - 1];
            _this.cardType = card.type;
            if (_this.cardType) {
              $input.addClass(_this.cardType + ' identified');
            } else {
              $input.addClass('unknown');
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
var indexOf$2 = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
        if (ref = e.which, indexOf$2.call(keys.numeric, ref) < 0) {
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
var indexOf$3 = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
        if (ref = e.which, indexOf$3.call(keys.numeric, ref) < 0) {
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
var indexOf$4 = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
  var card, length, number, ref;
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
  if (!((ref = number.length, indexOf$4.call(card.length, ref) >= 0) && card.luhn === false || luhnCheck(cardNumber))) {
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
    if (ref = cvc_.length, indexOf$4.call(card != null ? card.cvcLength : void 0, ref) < 0) {
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

// templates/forms/form.pug
var html$5 = "\n<form onsubmit=\"{ submit }\">\n  <yield></yield>\n</form>";

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
    return m.on(Events.ChangeSuccess, (function(_this) {
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
          return _this.update();
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

// src/forms/checkout-card.coffee
var CheckoutShippingAddressForm;
var extend$32 = function(child, parent) { for (var key in parent) { if (hasProp$31.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$31 = {}.hasOwnProperty;

CheckoutShippingAddressForm = (function(superClass) {
  extend$32(CheckoutShippingAddressForm, superClass);

  function CheckoutShippingAddressForm() {
    return CheckoutShippingAddressForm.__super__.constructor.apply(this, arguments);
  }

  CheckoutShippingAddressForm.prototype.tag = 'checkout-shippingaddress';

  CheckoutShippingAddressForm.prototype.html = html$5;

  CheckoutShippingAddressForm.prototype.configs = {
    'user.email': [isRequired, isEmail],
    'user.name': [isRequired, splitName],
    'payment.account.name': [isRequired],
    'payment.account.number': [requiresStripe, cardNumber],
    'payment.account.expiry': [requiresStripe, expiration],
    'payment.account.cvc': [requiresStripe, cvc]
  };

  CheckoutShippingAddressForm.prototype.init = function() {
    return CheckoutShippingAddressForm.__super__.init.apply(this, arguments);
  };

  CheckoutShippingAddressForm.prototype._submit = function() {
    m.trigger(Events.SubmitCard);
    store.set('checkout-user', this.data.get('user'));
    store.set('checkout-payment', this.data.get('order.payment'));
    return this.scheduleUpdate();
  };

  return CheckoutShippingAddressForm;

})(El.Form);

var CheckoutCard = CheckoutShippingAddressForm;

// src/forms/checkout-shippingaddress.coffee
var CheckoutShippingAddressForm$1;
var extend$33 = function(child, parent) { for (var key in parent) { if (hasProp$32.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$32 = {}.hasOwnProperty;

CheckoutShippingAddressForm$1 = (function(superClass) {
  extend$33(CheckoutShippingAddressForm, superClass);

  function CheckoutShippingAddressForm() {
    return CheckoutShippingAddressForm.__super__.constructor.apply(this, arguments);
  }

  CheckoutShippingAddressForm.prototype.tag = 'checkout-shippingaddress';

  CheckoutShippingAddressForm.prototype.html = html$5;

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
    store.set('checkout-user', this.data.get('user'));
    store.set('checkout-shippingAddress', this.data.get('order.shippingAddress'));
    return this.scheduleUpdate();
  };

  return CheckoutShippingAddressForm;

})(El.Views.Form);

var CheckoutShippingAddress = CheckoutShippingAddressForm$1;

// templates/forms/cart.pug
var html$6 = "\n<yield>\n  <lineitems if=\"{ !isEmpty() }\"></lineitems>\n</yield>";

// src/forms/cart.coffee
var CartForm;
var extend$34 = function(child, parent) { for (var key in parent) { if (hasProp$33.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$33 = {}.hasOwnProperty;

CartForm = (function(superClass) {
  extend$34(CartForm, superClass);

  function CartForm() {
    return CartForm.__super__.constructor.apply(this, arguments);
  }

  CartForm.prototype.tag = 'cart';

  CartForm.prototype.html = html$6;

  CartForm.prototype.init = function() {
    var promoCode;
    CartForm.__super__.init.apply(this, arguments);
    promoCode = store.get('promoCode');
    if (promoCode) {
      this.data.set('order.promoCode', promoCode);
      this.applyPromoCode();
      this.scheduleUpdate();
    }
    return m.on(Events.ForceApplyPromoCode, (function(_this) {
      return function() {
        return _this.applyPromoCode();
      };
    })(this));
  };

  CartForm.prototype.configs = {
    'order.promoCode': null
  };

  CartForm.prototype.applying = false;

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
    m.trigger(Events.ApplyPromoCode, promoCode);
    return this.cart.promoCode(promoCode).then((function(_this) {
      return function() {
        var coupon;
        _this.applying = false;
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

  return CartForm;

})(El.Form);

var Cart$1 = CartForm;

// templates/forms/lineitem.pug
var html$7 = "\n<yield>\n  <div class=\"product-quantity-container\" if=\"{ !data.get('locked') }\">\n    <quantity-select-control></quantity-select-control>\n  </div>\n  <div class=\"product-quantity-container locked\" if=\"{ data.get('locked') }\">{ data.get('quantity') }</div>\n  <div class=\"product-text-container\">\n    <div class=\"product-name\">{ data.get('productName') }</div>\n    <div class=\"product-slug\">{ data.get('productSlug') }</div>\n    <div class=\"product-description\" if=\"{ data.get('description') }\">{ data.get('description') }</div>\n  </div>\n  <div class=\"product-delete\" onclick=\"{ delete }\"></div>\n  <div class=\"product-price-container\">\n    <div class=\"product-price\">{ renderCurrency(parentData.get('currency'), data.get().price * data.get().quantity) }\n      <div class=\"product-currency\">{ parentData.get('currency').toUpperCase() }</div>\n    </div>\n    <div class=\"product-list-price\" if=\"{ data.get().listPrice &gt; data.get().price }\">{ renderCurrency(parentData.get('currency'), data.get().listPrice * data.get().quantity) }\n      <div class=\"product-currency\">{ parentData.get('currency').toUpperCase() }</div>\n    </div>\n  </div>\n</yield>";

// src/forms/lineitem.coffee
var LineItemForm;
var extend$35 = function(child, parent) { for (var key in parent) { if (hasProp$34.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$34 = {}.hasOwnProperty;

LineItemForm = (function(superClass) {
  extend$35(LineItemForm, superClass);

  function LineItemForm() {
    return LineItemForm.__super__.constructor.apply(this, arguments);
  }

  LineItemForm.prototype.tag = 'lineitem';

  LineItemForm.prototype.html = html$7;

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
var html$8 = "\n<lineitem each=\"{ item, v in data('order.items') }\" parent-data=\"{ this.parent.data.ref('order') }\" data=\"{ this.parent.data.ref('order.items.' + v) }\">\n  <yield></yield>\n</lineitem>";

// src/forms/lineitems.coffee
var LineItems;
var extend$36 = function(child, parent) { for (var key in parent) { if (hasProp$35.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$35 = {}.hasOwnProperty;

LineItems = (function(superClass) {
  extend$36(LineItems, superClass);

  function LineItems() {
    return LineItems.__super__.constructor.apply(this, arguments);
  }

  LineItems.prototype.tag = 'lineitems';

  LineItems.prototype.html = html$8;

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

// src/forms/login.coffee
var LoginForm;
var extend$37 = function(child, parent) { for (var key in parent) { if (hasProp$36.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$36 = {}.hasOwnProperty;

LoginForm = (function(superClass) {
  extend$37(LoginForm, superClass);

  function LoginForm() {
    return LoginForm.__super__.constructor.apply(this, arguments);
  }

  LoginForm.prototype.tag = 'login';

  LoginForm.prototype.html = html$5;

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
var html$9 = "\n<yield>\n  <div class=\"order-information\">\n    <div class=\"order-number-container\">\n      <div class=\"order-number-label\">Order Number:</div>\n      <div class=\"order-number\">{ data.get('number') }</div>\n    </div>\n    <div class=\"order-date-container\">\n      <div class=\"order-date-label\">Purchase Date:</div>\n      <div class=\"order-date\">{ renderDate(data.get('createdAt'), 'LL') }</div>\n    </div>\n    <lineitems if=\"{ !isEmpty() }\"></lineitems>\n    <div class=\"discount-container\">\n      <div class=\"discount-label\">Discount:</div>\n      <div class=\"discount\">{ renderCurrency(data.get('currency'), data.get('discount'))}</div>\n    </div>\n    <div class=\"subtotal-container\">\n      <div class=\"subtotal-label\">Subtotal:</div>\n      <div class=\"subtotal\">{ renderCurrency(data.get('currency'), data.get('subtotal'))}</div>\n    </div>\n    <div class=\"shipping-container\">\n      <div class=\"shipping-label\">Shipping:</div>\n      <div class=\"shipping\">{ renderCurrency(data.get('currency'), data.get('shipping'))}</div>\n    </div>\n    <div class=\"tax-container\">\n      <div class=\"tax-label\">Tax({ data.get('tax') / data.get('subtotal') * 100 }%):</div>\n      <div class=\"tax\">{ renderCurrency(data.get('currency'), data.get('tax'))}</div>\n    </div>\n    <div class=\"total-container\">\n      <div class=\"total-label\">Total:</div>\n      <div class=\"total\">{ renderCurrency(data.get('currency'), data.get('total'))}&nbsp;{ data.get('currency').toUpperCase() }</div>\n    </div>\n  </div>\n  <div class=\"address-information\">\n    <div class=\"street\">{ data.get('shippingAddress.line1') }</div>\n    <div class=\"apartment\" if=\"{ data.get('shippingAddress.line2') }\">{ data.get('shippingAddress.line2') }</div>\n    <div class=\"city\">{ data.get('shippingAddress.city') }</div>\n    <div class=\"state\" if=\"{ data.get('shippingAddress.state')}\">{ data.get('shippingAddress.state').toUpperCase() }</div>\n    <div class=\"state\" if=\"{ data.get('shippingAddress.postalCode')}\">{ data.get('shippingAddress.postalCode') }</div>\n    <div class=\"country\">{ data.get('shippingAddress.country').toUpperCase() }</div>\n  </div>\n</yield>";

// src/forms/order.coffee
var OrderForm;
var extend$38 = function(child, parent) { for (var key in parent) { if (hasProp$37.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$37 = {}.hasOwnProperty;

OrderForm = (function(superClass) {
  extend$38(OrderForm, superClass);

  function OrderForm() {
    return OrderForm.__super__.constructor.apply(this, arguments);
  }

  OrderForm.prototype.tag = 'order';

  OrderForm.prototype.html = html$9;

  OrderForm.prototype.parentData = null;

  OrderForm.prototype.init = function() {
    OrderForm.__super__.init.apply(this, arguments);
    this.parentData = refer({});
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
var html$10 = "\n<order each=\"{ order, v in data('user.orders') }\" parent-data=\"{ this.parent.data.get('user') }\" data=\"{ this.parent.data.ref('user.orders.' + v) }\" if=\"{ order.paymentStatus != 'unpaid' }\">\n  <yield></yield>\n</order>";

// src/forms/orders.coffee
var Orders;
var extend$39 = function(child, parent) { for (var key in parent) { if (hasProp$38.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$38 = {}.hasOwnProperty;

Orders = (function(superClass) {
  extend$39(Orders, superClass);

  function Orders() {
    return Orders.__super__.constructor.apply(this, arguments);
  }

  Orders.prototype.tag = 'orders';

  Orders.prototype.html = html$10;

  Orders.prototype.init = function() {
    return Orders.__super__.init.apply(this, arguments);
  };

  return Orders;

})(El.View);

var Orders$1 = Orders;

// src/forms/profile.coffee
var ProfileForm;
var extend$40 = function(child, parent) { for (var key in parent) { if (hasProp$39.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$39 = {}.hasOwnProperty;

ProfileForm = (function(superClass) {
  extend$40(ProfileForm, superClass);

  function ProfileForm() {
    return ProfileForm.__super__.constructor.apply(this, arguments);
  }

  ProfileForm.prototype.tag = 'profile';

  ProfileForm.prototype.html = html$5;

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
var extend$41 = function(child, parent) { for (var key in parent) { if (hasProp$40.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$40 = {}.hasOwnProperty;

RegisterForm = (function(superClass) {
  extend$41(RegisterForm, superClass);

  function RegisterForm() {
    return RegisterForm.__super__.constructor.apply(this, arguments);
  }

  RegisterForm.prototype.tag = 'register';

  RegisterForm.prototype.html = html$5;

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
var extend$42 = function(child, parent) { for (var key in parent) { if (hasProp$41.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$41 = {}.hasOwnProperty;

RegisterComplete = (function(superClass) {
  extend$42(RegisterComplete, superClass);

  function RegisterComplete() {
    return RegisterComplete.__super__.constructor.apply(this, arguments);
  }

  RegisterComplete.prototype.tag = 'register-complete';

  RegisterComplete.prototype.html = html$5;

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
var extend$43 = function(child, parent) { for (var key in parent) { if (hasProp$42.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$42 = {}.hasOwnProperty;

ResetPasswordForm = (function(superClass) {
  extend$43(ResetPasswordForm, superClass);

  function ResetPasswordForm() {
    return ResetPasswordForm.__super__.constructor.apply(this, arguments);
  }

  ResetPasswordForm.prototype.tag = 'reset-password';

  ResetPasswordForm.prototype.html = html$5;

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
var extend$44 = function(child, parent) { for (var key in parent) { if (hasProp$43.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$43 = {}.hasOwnProperty;

ResetPasswordCompleteForm = (function(superClass) {
  extend$44(ResetPasswordCompleteForm, superClass);

  function ResetPasswordCompleteForm() {
    return ResetPasswordCompleteForm.__super__.constructor.apply(this, arguments);
  }

  ResetPasswordCompleteForm.prototype.tag = 'reset-password-complete';

  ResetPasswordCompleteForm.prototype.html = html$5;

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
var extend$45 = function(child, parent) { for (var key in parent) { if (hasProp$44.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$44 = {}.hasOwnProperty;

ShippingAddressForm = (function(superClass) {
  extend$45(ShippingAddressForm, superClass);

  function ShippingAddressForm() {
    return ShippingAddressForm.__super__.constructor.apply(this, arguments);
  }

  ShippingAddressForm.prototype.tag = 'shippingaddress';

  ShippingAddressForm.prototype.html = html$5;

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
var html$11 = "\n<yield>\n  <div class=\"cart-count\">({ countItems() })</div>\n  <div class=\"cart-price\">({ renderCurrency(data.get('order.currency'), totalPrice()) })</div>\n</yield>";

// src/widgets/cart-counter.coffee
var CartCounter;
var extend$46 = function(child, parent) { for (var key in parent) { if (hasProp$45.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$45 = {}.hasOwnProperty;

CartCounter = (function(superClass) {
  extend$46(CartCounter, superClass);

  function CartCounter() {
    return CartCounter.__super__.constructor.apply(this, arguments);
  }

  CartCounter.prototype.tag = 'cart-counter';

  CartCounter.prototype.html = html$11;

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

// src/widgets/checkout-modal.coffee
var CheckoutModal;
var extend$47 = function(child, parent) { for (var key in parent) { if (hasProp$46.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$46 = {}.hasOwnProperty;

CheckoutModal = (function(superClass) {
  extend$47(CheckoutModal, superClass);

  function CheckoutModal() {
    return CheckoutModal.__super__.constructor.apply(this, arguments);
  }

  return CheckoutModal;

})(El.View);

var CheckoutModal$1 = CheckoutModal;

// src/widgets/checkout-page.coffee
var CheckoutPage;
var extend$48 = function(child, parent) { for (var key in parent) { if (hasProp$47.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$47 = {}.hasOwnProperty;

CheckoutPage = (function(superClass) {
  extend$48(CheckoutPage, superClass);

  function CheckoutPage() {
    return CheckoutPage.__super__.constructor.apply(this, arguments);
  }

  return CheckoutPage;

})(El.View);

var CheckoutPage$1 = CheckoutPage;

// src/widgets/modal.coffee
var Modal;
var extend$49 = function(child, parent) { for (var key in parent) { if (hasProp$48.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$48 = {}.hasOwnProperty;

Modal = (function(superClass) {
  extend$49(Modal, superClass);

  function Modal() {
    return Modal.__super__.constructor.apply(this, arguments);
  }

  return Modal;

})(El.View);

var Modal$1 = Modal;

// templates/widgets/nested-form.pug
var html$12 = "";

// src/widgets/nested-form.coffee
var NestedForm;
var extend$50 = function(child, parent) { for (var key in parent) { if (hasProp$49.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$49 = {}.hasOwnProperty;

NestedForm = (function(superClass) {
  extend$50(NestedForm, superClass);

  function NestedForm() {
    return NestedForm.__super__.constructor.apply(this, arguments);
  }

  NestedForm.prototype.tag = 'nested-form';

  NestedForm.prototype.html = html$12;

  return NestedForm;

})(El.Views.View);

var NestedForm$1 = NestedForm;

// src/widgets/side-cart.coffee
var SideCart;
var extend$51 = function(child, parent) { for (var key in parent) { if (hasProp$50.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$50 = {}.hasOwnProperty;

SideCart = (function(superClass) {
  extend$51(SideCart, superClass);

  function SideCart() {
    return SideCart.__super__.constructor.apply(this, arguments);
  }

  return SideCart;

})(El.View);

var SideCart$1 = SideCart;

// src/widgets/index.coffee
var Widgets;

var Widgets$1 = Widgets = {
  CartCounter: CartCounter$1,
  CheckoutModal: CheckoutModal$1,
  CheckoutPage: CheckoutPage$1,
  Modal: Modal$1,
  NestedForm: NestedForm$1,
  SideCart: SideCart$1,
  register: function() {
    CartCounter$1.register();
    CheckoutModal$1.register();
    CheckoutPage$1.register();
    Modal$1.register();
    NestedForm$1.register();
    return SideCart$1.register();
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
var children;
var elementsToMount;
var getMCIds;
var getQueries;
var getReferrer;
var k;
var ref;
var ref1;
var ref2;
var root;
var searchQueue;
var tagNames;
var v;
var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
  if ((root.tagName != null) && (ref1 = root.tagName, indexOf.call(tagNames, ref1) >= 0)) {
    elementsToMount.push(root);
  } else if (((ref2 = root.children) != null ? ref2.length : void 0) > 0) {
    children = Array.prototype.slice.call(root.children);
    children.unshift(0);
    children.unshift(searchQueue.length);
    searchQueue.splice.apply(searchQueue, children);
  }
}

Shop.start = function(opts) {
  var cartId, checkoutPayment, checkoutShippingAddress, checkoutUser, data, i, item, items, j, k2, len, len1, meta, p, promo, ps, queries, r, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref3, ref4, ref5, ref6, ref7, ref8, ref9, referrer, settings, tag, tags, v2;
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
  if ((ref3 = opts.config) != null ? ref3.hashReferrer : void 0) {
    r = window.location.hash.replace('#', '');
    if (r !== '') {
      referrer = r;
    } else {
      referrer = (ref4 = getReferrer(queries)) != null ? ref4 : (ref5 = opts.order) != null ? ref5.referrer : void 0;
    }
  } else {
    referrer = (ref6 = getReferrer(queries)) != null ? ref6 : (ref7 = opts.order) != null ? ref7.referrer : void 0;
  }
  store.set('referrer', referrer);
  promo = (ref8 = queries.promo) != null ? ref8 : '';
  items = store.get('items');
  cartId = store.get('cartId');
  meta = store.get('order.metadata');
  this.data = refer({
    taxRates: opts.taxRates || [],
    shippingRates: opts.shippingRates || [],
    tokenId: queries.tokenid,
    terms: (ref9 = opts.terms) != null ? ref9 : false,
    order: {
      giftType: 'physical',
      type: 'stripe',
      shippingRate: ((ref10 = opts.config) != null ? ref10.shippingRate : void 0) || ((ref11 = opts.order) != null ? ref11.shippingRate : void 0) || 0,
      taxRate: ((ref12 = opts.config) != null ? ref12.taxRate : void 0) || ((ref13 = opts.order) != null ? ref13.taxRate : void 0) || 0,
      currency: ((ref14 = opts.config) != null ? ref14.currency : void 0) || ((ref15 = opts.order) != null ? ref15.currency : void 0) || 'usd',
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
      checkoutUrl: (ref16 = (ref17 = opts.config) != null ? ref17.checkoutUrl : void 0) != null ? ref16 : null,
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
        ref18 = data[k];
        for (k2 in ref18) {
          v2 = ref18[k2];
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
  this.client = new Api(settings);
  this.cart = new Cart(this.client, this.data, opts.cartOptions);
  this.cart.onCart = (function(_this) {
    return function() {
      var _, cart, mcCId, ref19;
      store.set('cartId', _this.data.get('order.cartId'));
      ref19 = getMCIds(queries), _ = ref19[0], mcCId = ref19[1];
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
      return m.trigger(Events.Ready);
    });
    return El.scheduleUpdate();
  })["catch"](function(err) {
    var ref19;
    return typeof window !== "undefined" && window !== null ? (ref19 = window.Raven) != null ? ref19.captureException(err) : void 0 : void 0;
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
    var ref19;
    console.log(err);
    return typeof window !== "undefined" && window !== null ? (ref19 = window.Raven) != null ? ref19.captureException(err) : void 0 : void 0;
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
      var ref3;
      return typeof window !== "undefined" && window !== null ? (ref3 = window.Raven) != null ? ref3.captureException(err) : void 0 : void 0;
    });
  }
};

Shop.getItem = function(id) {
  return this.cart.get(id);
};

export default Shop;
//# sourceMappingURL=lib.mjs.map
