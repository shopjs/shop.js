var Shop = (function () {
'use strict';

// node_modules/broken/lib/broken.mjs
// src/promise-inspection.coffee
var PromiseInspection;

var PromiseInspection$1 = PromiseInspection = (function() {
  function PromiseInspection(arg) {
    this.state = arg.state, this.value = arg.value, this.reason = arg.reason;
  }

  PromiseInspection.prototype.isFulfilled = function() {
    return this.state === 'fulfilled';
  };

  PromiseInspection.prototype.isRejected = function() {
    return this.state === 'rejected';
  };

  return PromiseInspection;

})();

// src/utils.coffee
var _undefined$1 = void 0;

var _undefinedString$1 = 'undefined';

// src/soon.coffee
var soon;

soon = (function() {
  var bufferSize, callQueue, cqYield, fq, fqStart;
  fq = [];
  fqStart = 0;
  bufferSize = 1024;
  callQueue = function() {
    var err;
    while (fq.length - fqStart) {
      try {
        fq[fqStart]();
      } catch (error) {
        err = error;
        if (typeof console !== 'undefined') {
          console.error(err);
        }
      }
      fq[fqStart++] = _undefined$1;
      if (fqStart === bufferSize) {
        fq.splice(0, bufferSize);
        fqStart = 0;
      }
    }
  };
  cqYield = (function() {
    var dd, mo;
    if (typeof MutationObserver !== _undefinedString$1) {
      dd = document.createElement('div');
      mo = new MutationObserver(callQueue);
      mo.observe(dd, {
        attributes: true
      });
      return function() {
        dd.setAttribute('a', 0);
      };
    }
    if (typeof setImmediate !== _undefinedString$1) {
      return function() {
        setImmediate(callQueue);
      };
    }
    return function() {
      setTimeout(callQueue, 0);
    };
  })();
  return function(fn) {
    fq.push(fn);
    if (fq.length - fqStart === 1) {
      cqYield();
    }
  };
})();

var soon$1 = soon;

// src/promise.coffee
var Promise$1;
var STATE_FULFILLED;
var STATE_PENDING;
var STATE_REJECTED;
var _undefined;
var rejectClient;
var resolveClient;

_undefined = void 0;

STATE_PENDING = _undefined;

STATE_FULFILLED = 'fulfilled';

STATE_REJECTED = 'rejected';

resolveClient = function(c, arg) {
  var err, yret;
  if (typeof c.y === 'function') {
    try {
      yret = c.y.call(_undefined, arg);
      c.p.resolve(yret);
    } catch (error) {
      err = error;
      c.p.reject(err);
    }
  } else {
    c.p.resolve(arg);
  }
};

rejectClient = function(c, reason) {
  var err, yret;
  if (typeof c.n === 'function') {
    try {
      yret = c.n.call(_undefined, reason);
      c.p.resolve(yret);
    } catch (error) {
      err = error;
      c.p.reject(err);
    }
  } else {
    c.p.reject(reason);
  }
};

Promise$1 = (function() {
  function Promise(fn) {
    if (fn) {
      fn((function(_this) {
        return function(arg) {
          return _this.resolve(arg);
        };
      })(this), (function(_this) {
        return function(arg) {
          return _this.reject(arg);
        };
      })(this));
    }
  }

  Promise.prototype.resolve = function(value) {
    var clients, err, first, next;
    if (this.state !== STATE_PENDING) {
      return;
    }
    if (value === this) {
      return this.reject(new TypeError('Attempt to resolve promise with self'));
    }
    if (value && (typeof value === 'function' || typeof value === 'object')) {
      try {
        first = true;
        next = value.then;
        if (typeof next === 'function') {
          next.call(value, (function(_this) {
            return function(ra) {
              if (first) {
                if (first) {
                  first = false;
                }
                _this.resolve(ra);
              }
            };
          })(this), (function(_this) {
            return function(rr) {
              if (first) {
                first = false;
                _this.reject(rr);
              }
            };
          })(this));
          return;
        }
      } catch (error) {
        err = error;
        if (first) {
          this.reject(err);
        }
        return;
      }
    }
    this.state = STATE_FULFILLED;
    this.v = value;
    if (clients = this.c) {
      soon$1((function(_this) {
        return function() {
          var c, i, len;
          for (i = 0, len = clients.length; i < len; i++) {
            c = clients[i];
            resolveClient(c, value);
          }
        };
      })(this));
    }
  };

  Promise.prototype.reject = function(reason) {
    var clients;
    if (this.state !== STATE_PENDING) {
      return;
    }
    this.state = STATE_REJECTED;
    this.v = reason;
    if (clients = this.c) {
      soon$1(function() {
        var c, i, len;
        for (i = 0, len = clients.length; i < len; i++) {
          c = clients[i];
          rejectClient(c, reason);
        }
      });
    } else if (!Promise.suppressUncaughtRejectionError && typeof console !== 'undefined') {
      console.log('Broken Promise, please catch rejections: ', reason, reason ? reason.stack : null);
    }
  };

  Promise.prototype.then = function(onFulfilled, onRejected) {
    var a, client, p, s;
    p = new Promise;
    client = {
      y: onFulfilled,
      n: onRejected,
      p: p
    };
    if (this.state === STATE_PENDING) {
      if (this.c) {
        this.c.push(client);
      } else {
        this.c = [client];
      }
    } else {
      s = this.state;
      a = this.v;
      soon$1(function() {
        if (s === STATE_FULFILLED) {
          resolveClient(client, a);
        } else {
          rejectClient(client, a);
        }
      });
    }
    return p;
  };

  Promise.prototype["catch"] = function(cfn) {
    return this.then(null, cfn);
  };

  Promise.prototype["finally"] = function(cfn) {
    return this.then(cfn, cfn);
  };

  Promise.prototype.timeout = function(ms, msg) {
    msg = msg || 'timeout';
    return new Promise((function(_this) {
      return function(resolve, reject) {
        setTimeout(function() {
          return reject(Error(msg));
        }, ms);
        _this.then(function(val) {
          resolve(val);
        }, function(err) {
          reject(err);
        });
      };
    })(this));
  };

  Promise.prototype.callback = function(cb) {
    if (typeof cb === 'function') {
      this.then(function(val) {
        return cb(null, val);
      });
      this["catch"](function(err) {
        return cb(err, null);
      });
    }
    return this;
  };

  return Promise;

})();

var Promise$2 = Promise$1;

// src/helpers.coffee
var resolve = function(val) {
  var z;
  z = new Promise$2;
  z.resolve(val);
  return z;
};

var reject = function(err) {
  var z;
  z = new Promise$2;
  z.reject(err);
  return z;
};

var all = function(ps) {
  var i, j, len, p, rc, resolvePromise, results, retP;
  results = [];
  rc = 0;
  retP = new Promise$2();
  resolvePromise = function(p, i) {
    if (!p || typeof p.then !== 'function') {
      p = resolve(p);
    }
    p.then(function(yv) {
      results[i] = yv;
      rc++;
      if (rc === ps.length) {
        retP.resolve(results);
      }
    }, function(nv) {
      retP.reject(nv);
    });
  };
  for (i = j = 0, len = ps.length; j < len; i = ++j) {
    p = ps[i];
    resolvePromise(p, i);
  }
  if (!ps.length) {
    retP.resolve(results);
  }
  return retP;
};

var reflect = function(promise) {
  return new Promise$2(function(resolve, reject) {
    return promise.then(function(value) {
      return resolve(new PromiseInspection$1({
        state: 'fulfilled',
        value: value
      }));
    })["catch"](function(err) {
      return resolve(new PromiseInspection$1({
        state: 'rejected',
        reason: err
      }));
    });
  });
};

var settle = function(promises) {
  return all(promises.map(reflect));
};

// src/index.coffee
Promise$2.all = all;

Promise$2.reflect = reflect;

Promise$2.reject = reject;

Promise$2.resolve = resolve;

Promise$2.settle = settle;

Promise$2.soon = soon$1;

// node_modules/es-raf/dist/es-raf.mjs
var browser = (function() {
  var loadTime, now;
  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    now = function() {
      return performance.now();
    };
  } else {
    now = function() {
      return Date.now() - loadTime;
    };
    loadTime = new Date().getTime();
  }
  return now;
})();

var cancelAnimationFrame;
var frameDuration;
var id;
var last;
var queue;
var requestAnimationFrame$1;

frameDuration = 1000 / 60;

id = 0;

last = 0;

queue = [];

var raf$1 = requestAnimationFrame$1 = function(callback) {
  var next, now_;
  if (queue.length === 0) {
    now_ = browser();
    next = Math.max(0, frameDuration - (now_ - last));
    last = next + now_;
    setTimeout(function() {
      var cp, err, i, len, x;
      cp = queue.slice(0);
      queue.length = 0;
      for (i = 0, len = cp.length; i < len; i++) {
        x = cp[i];
        if (!x.cancelled) {
          try {
            x.callback(last);
          } catch (error) {
            err = error;
            setTimeout(function() {
              throw err;
            }, 0);
          }
        }
      }
    }, Math.round(next));
  }
  queue.push({
    handle: ++id,
    callback: callback,
    cancelled: false
  });
  return id;
};

var caf = cancelAnimationFrame = function(handle) {
  var i, len, x;
  for (i = 0, len = queue.length; i < len; i++) {
    x = queue[i];
    if (x.handle === handle) {
      x.cancelled = true;
    }
  }
};

// src/utils/patches.coffee
var agent;
var ieMajor;
var ieMinor;
var matches;
var reg;

if (window.Promise == null) {
  window.Promise = Promise$2;
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

// node_modules/es-is/dist/index.mjs
// src/index.coffee
var isActualNaN;
var isArgs;
var isFn;
var objProto;
var owns;
var symbolValueOf;
var toStr;

objProto = Object.prototype;

owns = objProto.hasOwnProperty;

toStr = objProto.toString;

symbolValueOf = void 0;

if (typeof Symbol === 'function') {
  symbolValueOf = Symbol.prototype.valueOf;
}

isActualNaN = function(value) {
  return value !== value;
};

var isEqual = function(value, other) {
  var key, type;
  if (value === other) {
    return true;
  }
  type = toStr.call(value);
  if (type !== toStr.call(other)) {
    return false;
  }
  if (type === '[object Object]') {
    for (key in value) {
      if (!isEqual(value[key], other[key]) || !(key in other)) {
        return false;
      }
    }
    for (key in other) {
      if (!isEqual(value[key], other[key]) || !(key in value)) {
        return false;
      }
    }
    return true;
  }
  if (type === '[object Array]') {
    key = value.length;
    if (key !== other.length) {
      return false;
    }
    while (key--) {
      if (!isEqual(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }
  if (type === '[object Function]') {
    return value.prototype === other.prototype;
  }
  if (type === '[object Date]') {
    return value.getTime() === other.getTime();
  }
  return false;
};

var isArrayLike = function(value) {
  return !!value && !isBool(value) && owns.call(value, 'length') && isFinite(value.length) && isNumber(value.length) && value.length >= 0;
};

var isArguments = isArgs = function(value) {
  var isOldArguments, isStandardArguments;
  isStandardArguments = toStr.call(value) === '[object Arguments]';
  isOldArguments = !isArray$1(value) && isArrayLike(value) && isObject$1(value) && isFn(value.callee);
  return isStandardArguments || isOldArguments;
};

var isArray$1 = Array.isArray || function(value) {
  return toStr.call(value) === '[object Array]';
};

var isBool = function(value) {
  return toStr.call(value) === '[object Boolean]';
};

var isFunction = isFn = function(value) {
  var isAlert, str;
  isAlert = typeof window !== 'undefined' && value === window.alert;
  if (isAlert) {
    return true;
  }
  str = toStr.call(value);
  return str === '[object Function]' || str === '[object GeneratorFunction]' || str === '[object AsyncFunction]';
};

var isNumber = function(value) {
  return toStr.call(value) === '[object Number]';
};

var isObject$1 = function(value) {
  return toStr.call(value) === '[object Object]';
};

// node_modules/el.js/node_modules/broken/dist/broken.mjs
// src/promise-inspection.coffee
var PromiseInspection$1$1;

var PromiseInspection$1$2 = PromiseInspection$1$1 = class PromiseInspection {
  constructor(arg) {
    var reason, state, value;
    state = arg.state, value = arg.value, reason = arg.reason;
    this.state = state;
    this.value = value;
    this.reason = reason;
  }

  isFulfilled() {
    return this.state === 'fulfilled';
  }

  isRejected() {
    return this.state === 'rejected';
  }

};

// src/utils.coffee
var _undefined$1$1 = void 0;

var _undefinedString$1$1 = 'undefined';

// src/soon.coffee
var soon$1$1;

soon$1$1 = (function() {
  var bufferSize, callQueue, cqYield, fq, fqStart;
  fq = [];
  fqStart = 0;
  bufferSize = 1024;
  callQueue = function() {
    var err;
    while (fq.length - fqStart) {
      try {
        fq[fqStart]();
      } catch (error) {
        err = error;
        if (typeof console !== 'undefined') {
          console.error(err);
        }
      }
      fq[fqStart++] = _undefined$1$1;
      if (fqStart === bufferSize) {
        fq.splice(0, bufferSize);
        fqStart = 0;
      }
    }
  };
  cqYield = (function() {
    var dd, mo;
    if (typeof MutationObserver !== _undefinedString$1$1) {
      dd = document.createElement('div');
      mo = new MutationObserver(callQueue);
      mo.observe(dd, {
        attributes: true
      });
      return function() {
        dd.setAttribute('a', 0);
      };
    }
    if (typeof setImmediate !== _undefinedString$1$1) {
      return function() {
        setImmediate(callQueue);
      };
    }
    return function() {
      setTimeout(callQueue, 0);
    };
  })();
  return function(fn) {
    fq.push(fn);
    if (fq.length - fqStart === 1) {
      cqYield();
    }
  };
})();

var soon$1$2 = soon$1$1;

// src/promise.coffee
var Promise$1$2;
var STATE_FULFILLED$1;
var STATE_PENDING$1;
var STATE_REJECTED$1;
var _undefined$1$2;
var rejectClient$1;
var resolveClient$1;

_undefined$1$2 = void 0;

STATE_PENDING$1 = _undefined$1$2;

STATE_FULFILLED$1 = 'fulfilled';

STATE_REJECTED$1 = 'rejected';

resolveClient$1 = function(c, arg) {
  var err, yret;
  if (typeof c.y === 'function') {
    try {
      yret = c.y.call(_undefined$1$2, arg);
      c.p.resolve(yret);
    } catch (error) {
      err = error;
      c.p.reject(err);
    }
  } else {
    c.p.resolve(arg);
  }
};

rejectClient$1 = function(c, reason) {
  var err, yret;
  if (typeof c.n === 'function') {
    try {
      yret = c.n.call(_undefined$1$2, reason);
      c.p.resolve(yret);
    } catch (error) {
      err = error;
      c.p.reject(err);
    }
  } else {
    c.p.reject(reason);
  }
};

Promise$1$2 = class Promise {
  constructor(fn) {
    if (fn) {
      fn((arg) => {
        return this.resolve(arg);
      }, (arg) => {
        return this.reject(arg);
      });
    }
  }

  resolve(value) {
    var clients, err, first, next;
    if (this.state !== STATE_PENDING$1) {
      return;
    }
    if (value === this) {
      return this.reject(new TypeError('Attempt to resolve promise with self'));
    }
    if (value && (typeof value === 'function' || typeof value === 'object')) {
      try {
        first = true;
        next = value.then;
        if (typeof next === 'function') {
          next.call(value, (ra) => {
            if (first) {
              if (first) {
                first = false;
              }
              this.resolve(ra);
            }
          }, (rr) => {
            if (first) {
              first = false;
              this.reject(rr);
            }
          });
          return;
        }
      } catch (error) {
        err = error;
        if (first) {
          this.reject(err);
        }
        return;
      }
    }
    this.state = STATE_FULFILLED$1;
    this.v = value;
    if (clients = this.c) {
      soon$1$2(() => {
        var c, i, len;
        for (i = 0, len = clients.length; i < len; i++) {
          c = clients[i];
          resolveClient$1(c, value);
        }
      });
    }
  }

  reject(reason) {
    var clients;
    if (this.state !== STATE_PENDING$1) {
      return;
    }
    this.state = STATE_REJECTED$1;
    this.v = reason;
    if (clients = this.c) {
      soon$1$2(function() {
        var c, i, len;
        for (i = 0, len = clients.length; i < len; i++) {
          c = clients[i];
          rejectClient$1(c, reason);
        }
      });
    } else if (!Promise.suppressUncaughtRejectionError && typeof console !== 'undefined') {
      console.log('Broken Promise, please catch rejections: ', reason, reason ? reason.stack : null);
    }
  }

  then(onFulfilled, onRejected) {
    var a, client, p, s;
    p = new Promise;
    client = {
      y: onFulfilled,
      n: onRejected,
      p: p
    };
    if (this.state === STATE_PENDING$1) {
      if (this.c) {
        this.c.push(client);
      } else {
        this.c = [client];
      }
    } else {
      s = this.state;
      a = this.v;
      soon$1$2(function() {
        if (s === STATE_FULFILLED$1) {
          resolveClient$1(client, a);
        } else {
          rejectClient$1(client, a);
        }
      });
    }
    return p;
  }

  ["catch"](cfn) {
    return this.then(null, cfn);
  }

  ["finally"](cfn) {
    return this.then(cfn, cfn);
  }

  timeout(ms, msg) {
    msg = msg || 'timeout';
    return new Promise((resolve, reject) => {
      setTimeout(function() {
        return reject(Error(msg));
      }, ms);
      this.then(function(val) {
        resolve(val);
      }, function(err) {
        reject(err);
      });
    });
  }

  callback(cb) {
    if (typeof cb === 'function') {
      this.then(function(val) {
        return cb(null, val);
      });
      this["catch"](function(err) {
        return cb(err, null);
      });
    }
    return this;
  }

};

var Promise$2$1 = Promise$1$2;

// src/helpers.coffee
var resolve$1 = function(val) {
  var z;
  z = new Promise$2$1;
  z.resolve(val);
  return z;
};

var reject$1 = function(err) {
  var z;
  z = new Promise$2$1;
  z.reject(err);
  return z;
};

var all$1 = function(ps) {
  var i, j, len, p, rc, resolvePromise, results, retP;
  results = [];
  rc = 0;
  retP = new Promise$2$1();
  resolvePromise = function(p, i) {
    if (!p || typeof p.then !== 'function') {
      p = resolve$1(p);
    }
    p.then(function(yv) {
      results[i] = yv;
      rc++;
      if (rc === ps.length) {
        retP.resolve(results);
      }
    }, function(nv) {
      retP.reject(nv);
    });
  };
  for (i = j = 0, len = ps.length; j < len; i = ++j) {
    p = ps[i];
    resolvePromise(p, i);
  }
  if (!ps.length) {
    retP.resolve(results);
  }
  return retP;
};

var reflect$1 = function(promise) {
  return new Promise$2$1(function(resolve, reject) {
    return promise.then(function(value) {
      return resolve(new PromiseInspection$1$2({
        state: 'fulfilled',
        value: value
      }));
    })["catch"](function(err) {
      return resolve(new PromiseInspection$1$2({
        state: 'rejected',
        reason: err
      }));
    });
  });
};

var settle$1 = function(promises) {
  return all$1(promises.map(reflect$1));
};

// src/index.coffee
Promise$2$1.all = all$1;

Promise$2$1.reflect = reflect$1;

Promise$2$1.reject = reject$1;

Promise$2$1.resolve = resolve$1;

Promise$2$1.settle = settle$1;

Promise$2$1.soon = soon$1$2;

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
    if (isObject$1(key)) {
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
      if (isObject$1(value)) {
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
    if (isNumber(key)) {
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

// node_modules/el.js/dist/el.mjs
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
function isFunction$1(value) {
  return typeof value === T_FUNCTION
}

/**
 * Check if passed argument is an object, exclude null
 * NOTE: use isObject(x) && !isArray(x) to excludes arrays.
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isObject$$1(value) {
  return value && typeof value === T_OBJECT // typeof null is 'object'
}

/**
 * Check if passed argument is undefined
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isUndefined$$1(value) {
  return typeof value === T_UNDEF
}

/**
 * Check if passed argument is a string
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isString$$1(value) {
  return typeof value === T_STRING
}

/**
 * Check if passed argument is empty. Different from falsy, because we dont consider 0 or false to be blank
 * @param { * } value -
 * @returns { Boolean } -
 */
function isBlank(value) {
  return isUndefined$$1(value) || value === null || value === ''
}

/**
 * Check if passed argument is a kind of array
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isArray$$1(value) {
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
  return isUndefined$$1(obj[key]) || descriptor && descriptor.writable
}

/**
 * Check if passed argument is a reserved name
 * @param   { String } value -
 * @returns { Boolean } -
 */
function isReservedName(value) {
  return RE_RESERVED_NAMES.test(value)
}

var check = {
	isBoolAttr: isBoolAttr,
	isFunction: isFunction$1,
	isObject: isObject$$1,
	isUndefined: isUndefined$$1,
	isString: isString$$1,
	isBlank: isBlank,
	isArray: isArray$$1,
	isWritable: isWritable,
	isReservedName: isReservedName
};

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
  if (!isUndefined$$1(container.innerHTML))
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

var dom = {
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
};

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

  function _setSettings (o$$1) {
    var b;

    o$$1 = o$$1 || {};
    b = o$$1.brackets;
    Object.defineProperty(o$$1, 'brackets', {
      set: _reset,
      get: function () { return cachedBrackets },
      enumerable: true
    });
    _settings = o$$1;
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
  Object.defineProperty(el, key, extend({
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
function extend(src) {
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

var misc = {
	each: each,
	contains: contains,
	toCamel: toCamel,
	startsWith: startsWith,
	defineProperty: defineProperty,
	extend: extend
};

// node_modules/riot/lib/settings.js
var settings$1 = extend(Object.create(brackets.settings), {
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
  else if (isUndefined$$1(value) || value === null)
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
  if (isFunction$1(value)) {
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
      isObject$$1 = !isArray$$1(items) && !isString$$1(items),
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

        return !!tmpl(ifExpr, extend(Object.create(parent), item))
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
  if (isFunction$1(attrs)) {
    fn = attrs;

    if (/^[\w\-]+\s?=/.test(css)) {
      attrs = css;
      css = '';
    } else
      attrs = '';
  }

  if (css) {
    if (isFunction$1(css))
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

  if (isObject$$1(tagName)) {
    opts = tagName;
    tagName = 0;
  }

  var elem;
  var allTags;

  // crawl the DOM to find the tag
  if (isString$$1(selector)) {
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
  if (isObject$$1(name)) {
    mixin$1(`__unnamed_${mixins_id++}`, name, true);
    return
  }

  const store = g ? globals : mixins;

  // Getter
  if (!mix) {
    if (isUndefined$$1(store[name]))
      throw new Error('Unregistered mixin: ' + name)

    return store[name]
  }

  // Setter
  store[name] = isFunction$1(mix) ?
    extend(mix.prototype, store[name] || {}) && mix :
    extend(store[name] || {}, mix);
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


var core = {
	Tag: Tag$2,
	tag: tag$1,
	tag2: tag2$1,
	mount: mount$1,
	mixin: mixin$1,
	update: update$1,
	unregister: unregister$1,
	version: version
};

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

  var opts = extend({}, conf.opts),
    parent = conf.parent,
    isLoop = conf.isLoop,
    isAnonymous = !!conf.isAnonymous,
    skipAnonymous = settings$1.skipAnonymousTags && isAnonymous,
    item = cleanUpData(conf.item),
    index$$1 = conf.index, // available only for the looped nodes
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
    index: index$$1,
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
  extend(this, { opts }, item);
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
    extend(this, data);
    updateOpts.apply(this, [isLoop, parent, isAnonymous, nextOpts, instAttrs]);
    if (this.isMounted && isFunction$1(this.shouldUpdate) && !this.shouldUpdate(data, nextOpts)) return this

    // inherit properties from the parent, but only for isAnonymous tags
    if (isLoop && isAnonymous) inheritFrom.apply(this, [this.parent, propsInSyncWithParent]);
    extend(opts, nextOpts);
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

      mix = isString$$1(mix) ? mixin$1(mix) : mix;

      // check if the mixin is a function
      if (isFunction$1(mix)) {
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
            this[key] = isFunction$1(instance[key]) ?
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

    if (isUndefined$$1(this[k]) || mustSync) {
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

  if (isArray$$1(tags))
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
  if (!(data instanceof Tag$1) && !(data && isFunction$1(data.trigger)))
    return data

  var o$$1 = {};
  for (var key in data) {
    if (!RE_RESERVED_NAMES.test(key)) o$$1[key] = data[key];
  }
  return o$$1
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
function arrayishAdd(obj, key, value, ensureArray, index$$1) {
  const dest = obj[key];
  const isArr = isArray$$1(dest);
  const hasIndex = !isUndefined$$1(index$$1);

  if (dest && dest === value) return

  // if the key was never set, set it once
  if (!dest && ensureArray) obj[key] = [value];
  else if (!dest) obj[key] = value;
  // if it was an array and not yet set
  else {
    if (isArr) {
      const oldIndex = dest.indexOf(value);
      // this item never changed its position
      if (oldIndex === index$$1) return
      // remove the item from its old position
      if (oldIndex !== -1) dest.splice(oldIndex, 1);
      // move or add the item
      if (hasIndex) {
        dest.splice(index$$1, 0, value);
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
  if (isArray$$1(obj[key])) {
    let index$$1 = obj[key].indexOf(value);
    if (index$$1 !== -1) obj[key].splice(index$$1, 1);
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

  var conf = extend({ root: root, opts: opts }, { parent: opts ? opts.parent : null });

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


var tags = {
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
};

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









var riot$1 = extend({}, core, {
  observable: observable,
  settings,
  util,
});

// src/schedule.coffee
var id$1;
var p;
var rafId;
var scheduleUpdate;
var todos;

todos = {};

rafId = -1;

p = null;

id$1 = 0;

scheduleUpdate = function(tag$$1) {
  var currentTag, parentTag;
  if (!p) {
    p = new Promise$2$1;
    p.then(function() {
      var _, todo;
      for (_ in todos) {
        todo = todos[_];
        todo.update();
      }
      p = null;
      todos = {};
      return rafId = -1;
    });
  }
  if (todos['*']) {
    return p;
  }
  if (!tag$$1) {
    todos = {
      '*': riot$1
    };
  } else if (tag$$1.update == null) {
    throw new Error('tag has no update routine');
  } else {
    currentTag = tag$$1;
    while (currentTag != null) {
      parentTag = currentTag.parent;
      if (!currentTag._schedulingId) {
        currentTag._schedulingId = id$1++;
      } else if (todos[currentTag.schedulingId] != null) {
        return p;
      }
      currentTag = parentTag;
    }
    todos[tag$$1._schedulingId] = tag$$1;
  }
  if (rafId === -1) {
    rafId = raf$1(function() {
      return p.resolve();
    });
  }
  return p;
};

// src/views/view.coffee
var View;
var collapsePrototype;
var setPrototypeOf;

setPrototypeOf = (function() {
  var mixinProperties, setProtoOf;
  setProtoOf = function(obj, proto) {
    return obj.__proto__ = proto;
  };
  mixinProperties = function(obj, proto) {
    var prop, results;
    results = [];
    for (prop in proto) {
      if (obj[prop] == null) {
        results.push(obj[prop] = proto[prop]);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };
  if (Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array) {
    return setProtoOf;
  } else {
    return mixinProperties;
  }
})();

collapsePrototype = function(collapse, proto) {
  var parentProto;
  if (proto === View.prototype) {
    return;
  }
  parentProto = Object.getPrototypeOf(proto);
  collapsePrototype(collapse, parentProto);
  return index(collapse, parentProto);
};

View = (function() {
  View.register = function() {
    return new this;
  };

  View.prototype.tag = '';

  View.prototype.html = '';

  View.prototype.css = '';

  View.prototype.attrs = '';

  View.prototype.events = null;

  function View() {
    var newProto;
    newProto = collapsePrototype({}, this);
    this.beforeInit();
    riot$1.tag(this.tag, this.html, this.css, this.attrs, function(opts) {
      var fn, handler, k, name, parent, proto, ref, ref1, self, v;
      if (newProto != null) {
        for (k in newProto) {
          v = newProto[k];
          if (isFunction(v)) {
            (function(_this) {
              return (function(v) {
                var oldFn;
                if (_this[k] != null) {
                  oldFn = _this[k];
                  return _this[k] = function() {
                    oldFn.apply(_this, arguments);
                    return v.apply(_this, arguments);
                  };
                } else {
                  return _this[k] = function() {
                    return v.apply(_this, arguments);
                  };
                }
              });
            })(this)(v);
          } else {
            this[k] = v;
          }
        }
      }
      self = this;
      parent = (ref = self.parent) != null ? ref : opts.parent;
      proto = Object.getPrototypeOf(self);
      while (parent && parent !== proto) {
        setPrototypeOf(self, parent);
        self = parent;
        parent = self.parent;
        proto = Object.getPrototypeOf(self);
      }
      if (opts != null) {
        for (k in opts) {
          v = opts[k];
          this[k] = v;
        }
      }
      if (this.events != null) {
        ref1 = this.events;
        fn = (function(_this) {
          return function(name, handler) {
            if (typeof handler === 'string') {
              return _this.on(name, function() {
                return _this[handler].apply(_this, arguments);
              });
            } else {
              return _this.on(name, function() {
                return handler.apply(_this, arguments);
              });
            }
          };
        })(this);
        for (name in ref1) {
          handler = ref1[name];
          fn(name, handler);
        }
      }
      return this.init(opts);
    });
  }

  View.prototype.beforeInit = function() {};

  View.prototype.init = function() {};

  View.prototype.scheduleUpdate = function() {
    return scheduleUpdate(this);
  };

  return View;

})();

var View$1 = View;

// src/views/inputify.coffee
var inputify;
var isRef;

isRef = function(o$$1) {
  return (o$$1 != null) && isFunction(o$$1.ref);
};

inputify = function(data, configs) {
  var config, fn, inputs, name, ref;
  ref = data;
  if (!isRef(ref)) {
    ref = refer$1(data);
  }
  inputs = {};
  fn = function(name, config) {
    var fn1, i, input, len, middleware, middlewareFn, validate;
    middleware = [];
    if (config && config.length > 0) {
      fn1 = function(name, middlewareFn) {
        return middleware.push(function(pair) {
          ref = pair[0], name = pair[1];
          return Promise$2$1.resolve(pair).then(function(pair) {
            return middlewareFn.call(pair[0], pair[0].get(pair[1]), pair[1], pair[0]);
          }).then(function(v) {
            ref.set(name, v);
            return pair;
          });
        });
      };
      for (i = 0, len = config.length; i < len; i++) {
        middlewareFn = config[i];
        fn1(name, middlewareFn);
      }
    }
    middleware.push(function(pair) {
      ref = pair[0], name = pair[1];
      return Promise$2$1.resolve(ref.get(name));
    });
    validate = function(ref, name) {
      var j, len1, p;
      p = Promise$2$1.resolve([ref, name]);
      for (j = 0, len1 = middleware.length; j < len1; j++) {
        middlewareFn = middleware[j];
        p = p.then(middlewareFn);
      }
      return p;
    };
    input = {
      name: name,
      ref: ref,
      config: config,
      validate: validate
    };
    return inputs[name] = input;
  };
  for (name in configs) {
    config = configs[name];
    fn(name, config);
  }
  return inputs;
};

var inputify$1 = inputify;

// src/views/form.coffee
var Form;
var extend$1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp = {}.hasOwnProperty;

Form = (function(superClass) {
  extend$1(Form, superClass);

  function Form() {
    return Form.__super__.constructor.apply(this, arguments);
  }

  Form.prototype.initInputs = function() {
    var input, name, ref, results1;
    this.inputs = {};
    if (this.configs != null) {
      this.inputs = inputify$1(this.data, this.configs);
      ref = this.inputs;
      results1 = [];
      for (name in ref) {
        input = ref[name];
        results1.push(observable(input));
      }
      return results1;
    }
  };

  Form.prototype.init = function() {
    return this.initInputs();
  };

  Form.prototype.submit = function(e) {
    var input, name, pRef, ps, ref;
    ps = [];
    ref = this.inputs;
    for (name in ref) {
      input = ref[name];
      pRef = {};
      input.trigger('validate', pRef);
      if (pRef.p != null) {
        ps.push(pRef.p);
      }
    }
    Promise$2$1.settle(ps).then((function(_this) {
      return function(results) {
        var i, len, result;
        for (i = 0, len = results.length; i < len; i++) {
          result = results[i];
          if (!result.isFulfilled()) {
            return;
          }
        }
        return _this._submit.apply(_this, arguments);
      };
    })(this));
    if (e != null) {
      e.preventDefault();
      e.stopPropagation();
    }
    return false;
  };

  Form.prototype._submit = function() {};

  return Form;

})(View$1);

var Form$1 = Form;

// src/views/input.coffee
var Input;
var extend$2 = function(child, parent) { for (var key in parent) { if (hasProp$1.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$1 = {}.hasOwnProperty;

Input = (function(superClass) {
  extend$2(Input, superClass);

  function Input() {
    return Input.__super__.constructor.apply(this, arguments);
  }

  Input.prototype.input = null;

  Input.prototype.valid = false;

  Input.prototype.errorMessage = '';

  Input.prototype.errorHtml = '<div class="error-container" if="{ errorMessage }">\n  <div class="error-message">{ errorMessage }</div>\n</div>';

  Input.prototype.beforeInit = function() {
    return this.html += this.errorHtml;
  };

  Input.prototype.init = function() {
    this.input.on('validate', (function(_this) {
      return function(pRef) {
        return _this.validate(pRef);
      };
    })(this));
    return this.input.ref.on('set', (function(_this) {
      return function(n, v1, v2) {
        if (n === _this.input.name && v1 !== v2) {
          return _this.scheduleUpdate();
        }
      };
    })(this));
  };

  Input.prototype.getValue = function(event) {
    return event.target.value;
  };

  Input.prototype.change = function(event) {
    var name, ref, ref1, value;
    ref1 = this.input, ref = ref1.ref, name = ref1.name;
    value = this.getValue(event);
    if (value === ref.get(name)) {
      return;
    }
    this.input.ref.set(name, value);
    this.clearError();
    return this.validate();
  };

  Input.prototype.error = function(err) {
    var ref1;
    return this.errorMessage = (ref1 = err != null ? err.message : void 0) != null ? ref1 : err;
  };

  Input.prototype.changed = function() {};

  Input.prototype.clearError = function() {
    return this.errorMessage = '';
  };

  Input.prototype.validate = function(pRef) {
    var p;
    p = this.input.validate(this.input.ref, this.input.name).then((function(_this) {
      return function(value) {
        _this.changed(value);
        _this.valid = true;
        return _this.scheduleUpdate();
      };
    })(this))["catch"]((function(_this) {
      return function(err) {
        _this.error(err);
        _this.valid = false;
        _this.scheduleUpdate();
        throw err;
      };
    })(this));
    if (pRef != null) {
      pRef.p = p;
    }
    return p;
  };

  return Input;

})(View$1);

var Input$1 = Input;

// src/views/index.coffee
var Views;

var Views$1 = Views = {
  Form: Form$1,
  Input: Input$1,
  View: View$1,
  inputify: inputify$1
};

// src/index.coffee
var El;
var fn;
var k$1;
var v$1;

El = {
  Views: Views$1,
  View: Views$1.View,
  Form: Views$1.Form,
  Input: Views$1.Input,
  riot: riot$1,
  scheduleUpdate: function() {
    return scheduleUpdate();
  }
};

fn = function(k, v) {
  if (isFunction(v)) {
    return El[k] = function() {
      return v.apply(riot$1, arguments);
    };
  }
};
for (k$1 in riot$1) {
  v$1 = riot$1[k$1];
  fn(k$1, v$1);
}

var El$1 = El;

// node_modules/es-cookies/lib/cookies.mjs
// src/cookies.coffee
var Cookies;

Cookies = (function() {
  function Cookies(defaults) {
    this.defaults = defaults != null ? defaults : {};
    this.get = (function(_this) {
      return function(key) {
        return _this.api(key);
      };
    })(this);
    this.remove = (function(_this) {
      return function(key, attrs) {
        return _this.api(key, '', index({
          expires: -1
        }, attrs));
      };
    })(this);
    this.set = (function(_this) {
      return function(key, value, attrs) {
        return _this.api(key, value, attrs);
      };
    })(this);
    this.getJSON = (function(_this) {
      return function(key) {
        var err, val;
        val = _this.api(key);
        if (val == null) {
          return {};
        }
        try {
          return JSON.parse(val);
        } catch (error) {
          err = error;
          return val;
        }
      };
    })(this);
  }

  Cookies.prototype.api = function(key, value, attrs) {
    var attr, cookie, cookies, err, expires, i, kv, len, name, parts, rdecode, result, strAttrs;
    if (typeof document === 'undefined') {
      return;
    }
    if (arguments.length > 1) {
      attrs = index({
        path: '/'
      }, this.defaults, attrs);
      if (isNumber(attrs.expires)) {
        expires = new Date;
        expires.setMilliseconds(expires.getMilliseconds() + attrs.expires * 864e+5);
        attrs.expires = expires;
      }
      attrs.expires = attrs.expires ? attrs.expires.toUTCString() : '';
      try {
        result = JSON.stringify(value);
        if (/^[\{\[]/.test(result)) {
          value = result;
        }
      } catch (error) {
        err = error;
      }
      value = encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
      key = encodeURIComponent(String(key));
      key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
      key = key.replace(/[\(\)]/g, escape);
      strAttrs = '';
      for (name in attrs) {
        attr = attrs[name];
        if (!attr) {
          continue;
        }
        strAttrs += '; ' + name;
        if (attr === true) {
          continue;
        }
        strAttrs += '=' + attr;
      }
      return document.cookie = key + '=' + value + strAttrs;
    }
    if (!key) {
      result = {};
    }
    cookies = document.cookie ? document.cookie.split('; ') : [];
    rdecode = /(%[0-9A-Z]{2})+/g;
    for (i = 0, len = cookies.length; i < len; i++) {
      kv = cookies[i];
      parts = kv.split('=');
      cookie = parts.slice(1).join('=');
      if (cookie.charAt(0) === '"') {
        cookie = cookie.slice(1, -1);
      }
      try {
        name = parts[0].replace(rdecode, decodeURIComponent);
        cookie = cookie.replace(rdecode, decodeURIComponent);
        if (key === name) {
          return cookie;
        }
        if (!key) {
          result[name] = cookie;
        }
      } catch (error) {
        err = error;
      }
    }
    return result;
  };

  return Cookies;

})();

var Cookies$1 = Cookies;

// src/index.coffee
var index$2 = new Cookies$1();

// node_modules/es-md5/dist/md5.mjs
var binl2rstr;
var binlMD5;
var bitRotateLeft;
var hexHMACMD5;
var hexMD5;
var md5;
var md5cmn;
var md5ff;
var md5gg;
var md5hh;
var md5ii;
var rawHMACMD5;
var rawMD5;
var rstr2binl;
var rstr2hex;
var rstrHMACMD5;
var rstrMD5;
var safeAdd;
var str2rstrUTF8;

safeAdd = function(x, y) {
  var lsw, msw;
  lsw = (x & 0xFFFF) + (y & 0xFFFF);
  msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 0xFFFF;
};

bitRotateLeft = function(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
};

md5cmn = function(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
};

md5ff = function(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
};

md5gg = function(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
};

md5hh = function(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
};

md5ii = function(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
};

binlMD5 = function(x, len) {

  /* append padding */
  var a, b, c, d, i, olda, oldb, oldc, oldd;
  x[len >> 5] |= 0x80 << len % 32;
  x[(len + 64 >>> 9 << 4) + 14] = len;
  i = void 0;
  olda = void 0;
  oldb = void 0;
  oldc = void 0;
  oldd = void 0;
  a = 1732584193;
  b = -271733879;
  c = -1732584194;
  d = 271733878;
  i = 0;
  while (i < x.length) {
    olda = a;
    oldb = b;
    oldc = c;
    oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
    i += 16;
  }
  return [a, b, c, d];
};

binl2rstr = function(input) {
  var i, length32, output;
  i = void 0;
  output = '';
  length32 = input.length * 32;
  i = 0;
  while (i < length32) {
    output += String.fromCharCode(input[i >> 5] >>> i % 32 & 0xFF);
    i += 8;
  }
  return output;
};

rstr2binl = function(input) {
  var i, length8, output;
  i = void 0;
  output = [];
  output[(input.length >> 2) - 1] = void 0;
  i = 0;
  while (i < output.length) {
    output[i] = 0;
    i += 1;
  }
  length8 = input.length * 8;
  i = 0;
  while (i < length8) {
    output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << i % 32;
    i += 8;
  }
  return output;
};

rstrMD5 = function(s) {
  return binl2rstr(binlMD5(rstr2binl(s), s.length * 8));
};

rstrHMACMD5 = function(key, data) {
  var bkey, hash, i, ipad, opad;
  i = void 0;
  bkey = rstr2binl(key);
  ipad = [];
  opad = [];
  hash = void 0;
  ipad[15] = opad[15] = void 0;
  if (bkey.length > 16) {
    bkey = binlMD5(bkey, key.length * 8);
  }
  i = 0;
  while (i < 16) {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
    i += 1;
  }
  hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
  return binl2rstr(binlMD5(opad.concat(hash), 512 + 128));
};

rstr2hex = function(input) {
  var hexTab, i, output, x;
  hexTab = '0123456789abcdef';
  output = '';
  x = void 0;
  i = void 0;
  i = 0;
  while (i < input.length) {
    x = input.charCodeAt(i);
    output += hexTab.charAt(x >>> 4 & 0x0F) + hexTab.charAt(x & 0x0F);
    i += 1;
  }
  return output;
};

str2rstrUTF8 = function(input) {
  return unescape(encodeURIComponent(input));
};

rawMD5 = function(s) {
  return rstrMD5(str2rstrUTF8(s));
};

hexMD5 = function(s) {
  return rstr2hex(rawMD5(s));
};

rawHMACMD5 = function(k, d) {
  return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d));
};

hexHMACMD5 = function(k, d) {
  return rstr2hex(rawHMACMD5(k, d));
};

var index$3 = md5 = function(string, key, raw) {
  if (!key) {
    if (!raw) {
      return hexMD5(string);
    }
    return rawMD5(string);
  }
  if (!raw) {
    return hexHMACMD5(key, string);
  }
  return rawHMACMD5(key, string);
};

// node_modules/akasha/lib/akasha.mjs
// src/cookie-storage.coffee
var cookieStorage = (function() {
  var key, postFix;
  postFix = index$3(window.location.host);
  key = function(k) {
    return k + "_" + postFix;
  };
  return {
    get: function(k) {
      return index$2.getJSON(key(k));
    },
    set: function(k, v) {
      var ks, ref;
      ks = (ref = index$2.getJSON(key('_keys'))) != null ? ref : [];
      ks.push(k);
      index$2.set(key('_keys'), ks);
      return index$2.set(key(k), v);
    },
    remove: function(k) {
      return index$2.remove(key(k));
    },
    clear: function() {
      var i, k, ks, len, ref;
      ks = (ref = index$2.getJSON(key('_keys'))) != null ? ref : [];
      for (i = 0, len = ks.length; i < len; i++) {
        k = ks[i];
        index$2.remove(k);
      }
      return index$2.remove(key('_keys'));
    }
  };
})();

// src/storage.coffee
var storage = function(backend) {
  var root, store;
  root = typeof window === 'undefined' ? global : window;
  store = root[backend + 'Storage'];
  return {
    get: function(k) {
      var err;
      try {
        return JSON.parse(store.getItem(k));
      } catch (error) {
        err = error;
        console.error('Unable to parse', k);
        return void 0;
      }
    },
    set: function(k, v) {
      return store.setItem(k, JSON.stringify(v));
    },
    remove: function(k) {
      return store.removeItem(k);
    },
    clear: function() {
      return store.clear();
    }
  };
};

// src/local-storage.coffee
var localStorage = storage('local');

// src/index.coffee
var supported;

supported = function(storage) {
  var err, ok, testStr;
  try {
    testStr = '__akasha__test__';
    storage.set(testStr, testStr);
    ok = (storage.get(testStr)) === testStr;
    storage.remove(testStr);
    return ok;
  } catch (error) {
    err = error;
    return false;
  }
};

var index$1 = (function() {
  if (supported(localStorage)) {
    return localStorage;
  } else {
    return cookieStorage;
  }
})();

// node_modules/es-xhr-promise/node_modules/broken/dist/broken.mjs
// src/promise-inspection.coffee
var PromiseInspection$2;

var PromiseInspection$1$3 = PromiseInspection$2 = (function() {
  function PromiseInspection(arg) {
    this.state = arg.state, this.value = arg.value, this.reason = arg.reason;
  }

  PromiseInspection.prototype.isFulfilled = function() {
    return this.state === 'fulfilled';
  };

  PromiseInspection.prototype.isRejected = function() {
    return this.state === 'rejected';
  };

  return PromiseInspection;

})();

// src/utils.coffee
var _undefined$1$3 = void 0;

var _undefinedString$1$2 = 'undefined';

// src/soon.coffee
var soon$2;

soon$2 = (function() {
  var bufferSize, callQueue, cqYield, fq, fqStart;
  fq = [];
  fqStart = 0;
  bufferSize = 1024;
  callQueue = function() {
    var err;
    while (fq.length - fqStart) {
      try {
        fq[fqStart]();
      } catch (error) {
        err = error;
        if (typeof console !== 'undefined') {
          console.error(err);
        }
      }
      fq[fqStart++] = _undefined$1$3;
      if (fqStart === bufferSize) {
        fq.splice(0, bufferSize);
        fqStart = 0;
      }
    }
  };
  cqYield = (function() {
    var dd, mo;
    if (typeof MutationObserver !== _undefinedString$1$2) {
      dd = document.createElement('div');
      mo = new MutationObserver(callQueue);
      mo.observe(dd, {
        attributes: true
      });
      return function() {
        dd.setAttribute('a', 0);
      };
    }
    if (typeof setImmediate !== _undefinedString$1$2) {
      return function() {
        setImmediate(callQueue);
      };
    }
    return function() {
      setTimeout(callQueue, 0);
    };
  })();
  return function(fn) {
    fq.push(fn);
    if (fq.length - fqStart === 1) {
      cqYield();
    }
  };
})();

var soon$1$3 = soon$2;

// src/promise.coffee
var Promise$1$3;
var STATE_FULFILLED$2;
var STATE_PENDING$2;
var STATE_REJECTED$2;
var _undefined$2;
var rejectClient$2;
var resolveClient$2;

_undefined$2 = void 0;

STATE_PENDING$2 = _undefined$2;

STATE_FULFILLED$2 = 'fulfilled';

STATE_REJECTED$2 = 'rejected';

resolveClient$2 = function(c, arg) {
  var err, yret;
  if (typeof c.y === 'function') {
    try {
      yret = c.y.call(_undefined$2, arg);
      c.p.resolve(yret);
    } catch (error) {
      err = error;
      c.p.reject(err);
    }
  } else {
    c.p.resolve(arg);
  }
};

rejectClient$2 = function(c, reason) {
  var err, yret;
  if (typeof c.n === 'function') {
    try {
      yret = c.n.call(_undefined$2, reason);
      c.p.resolve(yret);
    } catch (error) {
      err = error;
      c.p.reject(err);
    }
  } else {
    c.p.reject(reason);
  }
};

Promise$1$3 = (function() {
  function Promise(fn) {
    if (fn) {
      fn((function(_this) {
        return function(arg) {
          return _this.resolve(arg);
        };
      })(this), (function(_this) {
        return function(arg) {
          return _this.reject(arg);
        };
      })(this));
    }
  }

  Promise.prototype.resolve = function(value) {
    var clients, err, first, next;
    if (this.state !== STATE_PENDING$2) {
      return;
    }
    if (value === this) {
      return this.reject(new TypeError('Attempt to resolve promise with self'));
    }
    if (value && (typeof value === 'function' || typeof value === 'object')) {
      try {
        first = true;
        next = value.then;
        if (typeof next === 'function') {
          next.call(value, (function(_this) {
            return function(ra) {
              if (first) {
                if (first) {
                  first = false;
                }
                _this.resolve(ra);
              }
            };
          })(this), (function(_this) {
            return function(rr) {
              if (first) {
                first = false;
                _this.reject(rr);
              }
            };
          })(this));
          return;
        }
      } catch (error) {
        err = error;
        if (first) {
          this.reject(err);
        }
        return;
      }
    }
    this.state = STATE_FULFILLED$2;
    this.v = value;
    if (clients = this.c) {
      soon$1$3((function(_this) {
        return function() {
          var c, i, len;
          for (i = 0, len = clients.length; i < len; i++) {
            c = clients[i];
            resolveClient$2(c, value);
          }
        };
      })(this));
    }
  };

  Promise.prototype.reject = function(reason) {
    var clients;
    if (this.state !== STATE_PENDING$2) {
      return;
    }
    this.state = STATE_REJECTED$2;
    this.v = reason;
    if (clients = this.c) {
      soon$1$3(function() {
        var c, i, len;
        for (i = 0, len = clients.length; i < len; i++) {
          c = clients[i];
          rejectClient$2(c, reason);
        }
      });
    } else if (!Promise.suppressUncaughtRejectionError && typeof console !== 'undefined') {
      console.log('Broken Promise, please catch rejections: ', reason, reason ? reason.stack : null);
    }
  };

  Promise.prototype.then = function(onFulfilled, onRejected) {
    var a, client, p, s;
    p = new Promise;
    client = {
      y: onFulfilled,
      n: onRejected,
      p: p
    };
    if (this.state === STATE_PENDING$2) {
      if (this.c) {
        this.c.push(client);
      } else {
        this.c = [client];
      }
    } else {
      s = this.state;
      a = this.v;
      soon$1$3(function() {
        if (s === STATE_FULFILLED$2) {
          resolveClient$2(client, a);
        } else {
          rejectClient$2(client, a);
        }
      });
    }
    return p;
  };

  Promise.prototype["catch"] = function(cfn) {
    return this.then(null, cfn);
  };

  Promise.prototype["finally"] = function(cfn) {
    return this.then(cfn, cfn);
  };

  Promise.prototype.timeout = function(ms, msg) {
    msg = msg || 'timeout';
    return new Promise((function(_this) {
      return function(resolve, reject) {
        setTimeout(function() {
          return reject(Error(msg));
        }, ms);
        _this.then(function(val) {
          resolve(val);
        }, function(err) {
          reject(err);
        });
      };
    })(this));
  };

  Promise.prototype.callback = function(cb) {
    if (typeof cb === 'function') {
      this.then(function(val) {
        return cb(null, val);
      });
      this["catch"](function(err) {
        return cb(err, null);
      });
    }
    return this;
  };

  return Promise;

})();

var Promise$2$3 = Promise$1$3;

// src/helpers.coffee
var resolve$2 = function(val) {
  var z;
  z = new Promise$2$3;
  z.resolve(val);
  return z;
};

var reject$2 = function(err) {
  var z;
  z = new Promise$2$3;
  z.reject(err);
  return z;
};

var all$2 = function(ps) {
  var i, j, len, p, rc, resolvePromise, results, retP;
  results = [];
  rc = 0;
  retP = new Promise$2$3();
  resolvePromise = function(p, i) {
    if (!p || typeof p.then !== 'function') {
      p = resolve$2(p);
    }
    p.then(function(yv) {
      results[i] = yv;
      rc++;
      if (rc === ps.length) {
        retP.resolve(results);
      }
    }, function(nv) {
      retP.reject(nv);
    });
  };
  for (i = j = 0, len = ps.length; j < len; i = ++j) {
    p = ps[i];
    resolvePromise(p, i);
  }
  if (!ps.length) {
    retP.resolve(results);
  }
  return retP;
};

var reflect$2 = function(promise) {
  return new Promise$2$3(function(resolve, reject) {
    return promise.then(function(value) {
      return resolve(new PromiseInspection$1$3({
        state: 'fulfilled',
        value: value
      }));
    })["catch"](function(err) {
      return resolve(new PromiseInspection$1$3({
        state: 'rejected',
        reason: err
      }));
    });
  });
};

var settle$2 = function(promises) {
  return all$2(promises.map(reflect$2));
};

// src/index.coffee
Promise$2$3.all = all$2;

Promise$2$3.reflect = reflect$2;

Promise$2$3.reject = reject$2;

Promise$2$3.resolve = resolve$2;

Promise$2$3.settle = settle$2;

Promise$2$3.soon = soon$1$3;

// node_modules/es-xhr-promise/dist/lib.mjs
// src/parse-headers.coffee
var isArray$2;
var parseHeaders;
var trim;

trim = function(s) {
  return s.replace(/^\s*|\s*$/g, '');
};

isArray$2 = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

var parseHeaders$1 = parseHeaders = function(headers) {
  var i, index$$1, key, len, ref, result, row, value;
  if (!headers) {
    return {};
  }
  result = {};
  ref = trim(headers).split('\n');
  for (i = 0, len = ref.length; i < len; i++) {
    row = ref[i];
    index$$1 = row.indexOf(':');
    key = trim(row.slice(0, index$$1)).toLowerCase();
    value = trim(row.slice(index$$1 + 1));
    if (typeof result[key] === 'undefined') {
      result[key] = value;
    } else if (isArray$2(result[key])) {
      result[key].push(value);
    } else {
      result[key] = [result[key], value];
    }
    return;
  }
  return result;
};

// src/index.coffee

/*
 * Copyright 2015 Scott Brady
 * MIT License
 * https://github.com/scottbrady/xhr-promise/blob/master/LICENSE
 */
var XhrPromise;
var defaults;

defaults = {
  method: 'GET',
  headers: {},
  data: null,
  username: null,
  password: null,
  async: true
};


/*
 * Module to wrap an XhrPromise in a promise.
 */

XhrPromise = (function() {
  function XhrPromise() {}

  XhrPromise.DEFAULT_CONTENT_TYPE = 'application/x-www-form-urlencoded; charset=UTF-8';

  XhrPromise.Promise = Promise$2$3;


  /*
   * XhrPromise.send(options) -> Promise
   * - options (Object): URL, method, data, etc.
   *
   * Create the XHR object and wire up event handlers to use a promise.
   */

  XhrPromise.prototype.send = function(options) {
    if (options == null) {
      options = {};
    }
    options = index({}, defaults, options);
    return new Promise$2$3((function(_this) {
      return function(resolve, reject) {
        var e, header, ref, value, xhr;
        if (!XMLHttpRequest) {
          _this._handleError('browser', reject, null, "browser doesn't support XMLHttpRequest");
          return;
        }
        if (typeof options.url !== 'string' || options.url.length === 0) {
          _this._handleError('url', reject, null, 'URL is a required parameter');
          return;
        }
        _this._xhr = xhr = new XMLHttpRequest();
        xhr.onload = function() {
          var responseText;
          _this._detachWindowUnload();
          try {
            responseText = _this._getResponseText();
          } catch (error) {
            _this._handleError('parse', reject, null, 'invalid JSON response');
            return;
          }
          return resolve({
            url: _this._getResponseUrl(),
            headers: _this._getHeaders(),
            responseText: responseText,
            status: xhr.status,
            statusText: xhr.statusText,
            xhr: xhr
          });
        };
        xhr.onerror = function() {
          return _this._handleError('error', reject);
        };
        xhr.ontimeout = function() {
          return _this._handleError('timeout', reject);
        };
        xhr.onabort = function() {
          return _this._handleError('abort', reject);
        };
        _this._attachWindowUnload();
        xhr.open(options.method, options.url, options.async, options.username, options.password);
        if ((options.data != null) && !options.headers['Content-Type']) {
          options.headers['Content-Type'] = _this.constructor.DEFAULT_CONTENT_TYPE;
        }
        ref = options.headers;
        for (header in ref) {
          value = ref[header];
          xhr.setRequestHeader(header, value);
        }
        try {
          return xhr.send(options.data);
        } catch (error) {
          e = error;
          return _this._handleError('send', reject, null, e.toString());
        }
      };
    })(this));
  };


  /*
   * XhrPromise.getXHR() -> XhrPromise
   */

  XhrPromise.prototype.getXHR = function() {
    return this._xhr;
  };


  /*
   * XhrPromise._attachWindowUnload()
   *
   * Fix for IE 9 and IE 10
   * Internet Explorer freezes when you close a webpage during an XHR request
   * https://support.microsoft.com/kb/2856746
   *
   */

  XhrPromise.prototype._attachWindowUnload = function() {
    this._unloadHandler = this._handleWindowUnload.bind(this);
    if (window.attachEvent) {
      return window.attachEvent('onunload', this._unloadHandler);
    }
  };


  /*
   * XhrPromise._detachWindowUnload()
   */

  XhrPromise.prototype._detachWindowUnload = function() {
    if (window.detachEvent) {
      return window.detachEvent('onunload', this._unloadHandler);
    }
  };


  /*
   * XhrPromise._getHeaders() -> Object
   */

  XhrPromise.prototype._getHeaders = function() {
    return parseHeaders$1(this._xhr.getAllResponseHeaders());
  };


  /*
   * XhrPromise._getResponseText() -> Mixed
   *
   * Parses response text JSON if present.
   */

  XhrPromise.prototype._getResponseText = function() {
    var responseText;
    responseText = typeof this._xhr.responseText === 'string' ? this._xhr.responseText : '';
    switch (this._xhr.getResponseHeader('Content-Type')) {
      case 'application/json':
      case 'text/javascript':
        responseText = JSON.parse(responseText + '');
    }
    return responseText;
  };


  /*
   * XhrPromise._getResponseUrl() -> String
   *
   * Actual response URL after following redirects.
   */

  XhrPromise.prototype._getResponseUrl = function() {
    if (this._xhr.responseURL != null) {
      return this._xhr.responseURL;
    }
    if (/^X-Request-URL:/m.test(this._xhr.getAllResponseHeaders())) {
      return this._xhr.getResponseHeader('X-Request-URL');
    }
    return '';
  };


  /*
   * XhrPromise._handleError(reason, reject, status, statusText)
   * - reason (String)
   * - reject (Function)
   * - status (String)
   * - statusText (String)
   */

  XhrPromise.prototype._handleError = function(reason, reject, status, statusText) {
    this._detachWindowUnload();
    return reject({
      reason: reason,
      status: status || this._xhr.status,
      statusText: statusText || this._xhr.statusText,
      xhr: this._xhr
    });
  };


  /*
   * XhrPromise._handleWindowUnload()
   */

  XhrPromise.prototype._handleWindowUnload = function() {
    return this._xhr.abort();
  };

  return XhrPromise;

})();

var XhrPromise$1 = XhrPromise;

// node_modules/hanzo.js/lib/hanzo.mjs
// src/utils.coffee
var updateParam;

var isFunction$1$1 = function(fn) {
  return typeof fn === 'function';
};



var statusOk = function(res) {
  return res.status === 200;
};

var statusCreated = function(res) {
  return res.status === 201;
};



var GET = 'GET';

var POST = 'POST';

var PATCH = 'PATCH';

var newError = function(data, res, err) {
  var message, ref, ref1, ref2, ref3, ref4;
  if (res == null) {
    res = {};
  }
  message = (ref = (ref1 = res.data) != null ? (ref2 = ref1.error) != null ? ref2.message : void 0 : void 0) != null ? ref : 'Request failed';
  if (err == null) {
    err = new Error(message);
  }
  err.data = res.data;
  err.msg = message;
  err.req = data;
  err.responseText = res.data;
  err.status = res.status;
  err.type = (ref3 = res.data) != null ? (ref4 = ref3.error) != null ? ref4.type : void 0 : void 0;
  return err;
};

updateParam = function(url, key, value) {
  var hash, re, separator;
  re = new RegExp('([?&])' + key + '=.*?(&|#|$)(.*)', 'gi');
  if (re.test(url)) {
    if (value != null) {
      return url.replace(re, '$1' + key + '=' + value + '$2$3');
    } else {
      hash = url.split('#');
      url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
      if (hash[1] != null) {
        url += '#' + hash[1];
      }
      return url;
    }
  } else {
    if (value != null) {
      separator = url.indexOf('?') !== -1 ? '&' : '?';
      hash = url.split('#');
      url = hash[0] + separator + key + '=' + value;
      if (hash[1] != null) {
        url += '#' + hash[1];
      }
      return url;
    } else {
      return url;
    }
  }
};

var updateQuery = function(url, data) {
  var k, v;
  if (typeof data !== 'object') {
    return url;
  }
  for (k in data) {
    v = data[k];
    url = updateParam(url, k, v);
  }
  return url;
};

// src/api.coffee
var Api;

Api = (function() {
  Api.BLUEPRINTS = {};

  Api.CLIENT = null;

  function Api(opts) {
    var blueprints, client, k, v;
    if (opts == null) {
      opts = {};
    }
    if (!(this instanceof Api)) {
      return new Api(opts);
    }
    blueprints = opts.blueprints, client = opts.client;
    this.client = client || new this.constructor.CLIENT(opts);
    if (blueprints == null) {
      blueprints = this.constructor.BLUEPRINTS;
    }
    for (k in blueprints) {
      v = blueprints[k];
      this.addBlueprints(k, v);
    }
  }

  Api.prototype.addBlueprints = function(api, blueprints) {
    var bp, name;
    if (this[api] == null) {
      this[api] = {};
    }
    for (name in blueprints) {
      bp = blueprints[name];
      this.addBlueprint(api, name, bp);
    }
  };

  Api.prototype.addBlueprint = function(api, name, bp) {
    var method;
    if (isFunction$1$1(bp)) {
      return this[api][name] = (function(_this) {
        return function() {
          return bp.apply(_this, arguments);
        };
      })(this);
    }
    if (bp.expects == null) {
      bp.expects = statusOk;
    }
    if (bp.method == null) {
      bp.method = GET;
    }
    method = (function(_this) {
      return function(data, cb) {
        var key;
        key = void 0;
        if (bp.useCustomerToken) {
          key = _this.client.getCustomerToken();
        }
        return _this.client.request(bp, data, key).then(function(res) {
          var ref, ref1;
          if (((ref = res.data) != null ? ref.error : void 0) != null) {
            throw newError(data, res);
          }
          if (!bp.expects(res)) {
            throw newError(data, res);
          }
          if (bp.process != null) {
            bp.process.call(_this, res);
          }
          return (ref1 = res.data) != null ? ref1 : res.body;
        }).callback(cb);
      };
    })(this);
    return this[api][name] = method;
  };

  Api.prototype.setKey = function(key) {
    return this.client.setKey(key);
  };

  Api.prototype.setCustomerToken = function(key) {
    return this.client.setCustomerToken(key);
  };

  Api.prototype.deleteCustomerToken = function() {
    return this.client.deleteCustomerToken();
  };

  Api.prototype.setStore = function(id) {
    this.storeId = id;
    return this.client.setStore(id);
  };

  return Api;

})();

var Api$1 = Api;

// src/client/client.coffee
var Client$1;
var slice$1 = [].slice;

Client$1 = (function() {
  function Client(opts) {
    var k, v;
    if (opts == null) {
      opts = {};
    }
    this.opts = {
      debug: false,
      endpoint: 'https://api.hanzo.io',
      session: {
        name: 'hzo',
        expires: 7 * 24 * 3600 * 1000
      }
    };
    for (k in opts) {
      v = opts[k];
      this.opts[k] = v;
    }
  }

  Client.prototype.getKey = function() {
    return this.opts.key;
  };

  Client.prototype.setKey = function(key) {
    return this.opts.key = key;
  };

  Client.prototype.getCustomerToken = function() {
    var session;
    if ((session = index$2.getJSON(this.opts.session.name)) != null) {
      if (session.customerToken != null) {
        this.customerToken = session.customerToken;
      }
    }
    return this.customerToken;
  };

  Client.prototype.setCustomerToken = function(key) {
    index$2.set(this.opts.session.name, {
      customerToken: key
    }, {
      expires: this.opts.session.expires
    });
    return this.customerToken = key;
  };

  Client.prototype.deleteCustomerToken = function() {
    index$2.set(this.opts.session.name, {
      customerToken: null
    }, {
      expires: this.opts.session.expires
    });
    return this.customerToken = null;
  };

  Client.prototype.url = function(url, data, key) {
    if (isFunction$1$1(url)) {
      url = url.call(this, data);
    }
    return updateQuery(this.opts.endpoint + url, {
      token: key
    });
  };

  Client.prototype.log = function() {
    var args;
    args = 1 <= arguments.length ? slice$1.call(arguments, 0) : [];
    args.unshift('hanzo.js>');
    if (this.opts.debug && (typeof console !== "undefined" && console !== null)) {
      return console.log.apply(console, args);
    }
  };

  return Client;

})();

var Client$2 = Client$1;

// src/client/browser.coffee
var BrowserClient;
var extend$1$1 = function(child, parent) { for (var key in parent) { if (hasProp$1$1.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$1$1 = {}.hasOwnProperty;

BrowserClient = (function(superClass) {
  extend$1$1(BrowserClient, superClass);

  function BrowserClient(opts) {
    if (!(this instanceof BrowserClient)) {
      return new BrowserClient(opts);
    }
    BrowserClient.__super__.constructor.call(this, opts);
    this.getCustomerToken();
  }

  BrowserClient.prototype.request = function(blueprint, data, key) {
    var opts;
    if (data == null) {
      data = {};
    }
    if (key == null) {
      key = this.getKey();
    }
    opts = {
      url: this.url(blueprint.url, data, key),
      method: blueprint.method
    };
    if (blueprint.method !== 'GET') {
      opts.headers = {
        'Content-Type': 'application/json'
      };
    }
    if (blueprint.method === 'GET') {
      opts.url = updateQuery(opts.url, data);
    } else {
      opts.data = JSON.stringify(data);
    }
    this.log('request', {
      key: key,
      opts: opts
    });
    return (new XhrPromise$1).send(opts).then((function(_this) {
      return function(res) {
        _this.log('response', res);
        res.data = res.responseText;
        return res;
      };
    })(this))["catch"]((function(_this) {
      return function(res) {
        var err, ref;
        try {
          res.data = (ref = res.responseText) != null ? ref : JSON.parse(res.xhr.responseText);
        } catch (error) {
          err = error;
        }
        err = newError(data, res, err);
        _this.log('response', res);
        _this.log('error', err);
        throw err;
      };
    })(this));
  };

  return BrowserClient;

})(Client$2);

var Client = BrowserClient;

// src/blueprints/url.coffee
var sp;

var storePrefixed = sp = function(u) {
  return function(x) {
    var url;
    if (isFunction$1$1(u)) {
      url = u(x);
    } else {
      url = u;
    }
    if (this.storeId != null) {
      return ("/store/" + this.storeId) + url;
    } else {
      return url;
    }
  };
};

var byId = function(name) {
  switch (name) {
    case 'coupon':
      return sp(function(x) {
        var ref;
        return "/coupon/" + ((ref = x.code) != null ? ref : x);
      });
    case 'collection':
      return sp(function(x) {
        var ref;
        return "/collection/" + ((ref = x.slug) != null ? ref : x);
      });
    case 'product':
      return sp(function(x) {
        var ref, ref1;
        return "/product/" + ((ref = (ref1 = x.id) != null ? ref1 : x.slug) != null ? ref : x);
      });
    case 'variant':
      return sp(function(x) {
        var ref, ref1;
        return "/variant/" + ((ref = (ref1 = x.id) != null ? ref1 : x.sku) != null ? ref : x);
      });
    case 'site':
      return function(x) {
        var ref, ref1;
        return "/site/" + ((ref = (ref1 = x.id) != null ? ref1 : x.name) != null ? ref : x);
      };
    default:
      return function(x) {
        var ref;
        return "/" + name + "/" + ((ref = x.id) != null ? ref : x);
      };
  }
};

// src/blueprints/browser.coffee
var blueprints;
var createBlueprint;
var fn$1;
var i;
var len;
var model;
var models;

createBlueprint = function(name) {
  var endpoint;
  endpoint = "/" + name;
  return {
    list: {
      url: endpoint,
      method: GET,
      expects: statusOk
    },
    get: {
      url: byId(name),
      method: GET,
      expects: statusOk
    }
  };
};

blueprints = {
  account: {
    get: {
      url: '/account',
      method: GET,
      expects: statusOk,
      useCustomerToken: true
    },
    update: {
      url: '/account',
      method: PATCH,
      expects: statusOk,
      useCustomerToken: true
    },
    exists: {
      url: function(x) {
        var ref, ref1, ref2;
        return "/account/exists/" + ((ref = (ref1 = (ref2 = x.email) != null ? ref2 : x.username) != null ? ref1 : x.id) != null ? ref : x);
      },
      method: GET,
      expects: statusOk,
      process: function(res) {
        return res.data.exists;
      }
    },
    create: {
      url: '/account/create',
      method: POST,
      expects: statusCreated
    },
    enable: {
      url: function(x) {
        var ref;
        return "/account/enable/" + ((ref = x.tokenId) != null ? ref : x);
      },
      method: POST,
      expects: statusOk
    },
    login: {
      url: '/account/login',
      method: POST,
      expects: statusOk,
      process: function(res) {
        this.setCustomerToken(res.data.token);
        return res;
      }
    },
    logout: function() {
      return this.deleteCustomerToken();
    },
    reset: {
      url: '/account/reset',
      method: POST,
      expects: statusOk,
      useCustomerToken: true
    },
    updateOrder: {
      url: function(x) {
        var ref, ref1;
        return "/account/order/" + ((ref = (ref1 = x.orderId) != null ? ref1 : x.id) != null ? ref : x);
      },
      method: PATCH,
      expects: statusOk,
      useCustomerToken: true
    },
    confirm: {
      url: function(x) {
        var ref;
        return "/account/confirm/" + ((ref = x.tokenId) != null ? ref : x);
      },
      method: POST,
      expects: statusOk,
      useCustomerToken: true
    }
  },
  cart: {
    create: {
      url: '/cart',
      method: POST,
      expects: statusCreated
    },
    update: {
      url: function(x) {
        var ref;
        return "/cart/" + ((ref = x.id) != null ? ref : x);
      },
      method: PATCH,
      expects: statusOk
    },
    discard: {
      url: function(x) {
        var ref;
        return "/cart/" + ((ref = x.id) != null ? ref : x) + "/discard";
      },
      method: POST,
      expects: statusOk
    },
    set: {
      url: function(x) {
        var ref;
        return "/cart/" + ((ref = x.id) != null ? ref : x) + "/set";
      },
      method: POST,
      expects: statusOk
    }
  },
  review: {
    create: {
      url: '/review',
      method: POST,
      expects: statusCreated
    },
    get: {
      url: function(x) {
        var ref;
        return "/review/" + ((ref = x.id) != null ? ref : x);
      },
      method: GET,
      expects: statusOk
    }
  },
  checkout: {
    authorize: {
      url: storePrefixed('/checkout/authorize'),
      method: POST,
      expects: statusOk
    },
    capture: {
      url: storePrefixed(function(x) {
        var ref;
        return "/checkout/capture/" + ((ref = x.orderId) != null ? ref : x);
      }),
      method: POST,
      expects: statusOk
    },
    charge: {
      url: storePrefixed('/checkout/charge'),
      method: POST,
      expects: statusOk
    },
    paypal: {
      url: storePrefixed('/checkout/paypal'),
      method: POST,
      expects: statusOk
    }
  },
  referrer: {
    create: {
      url: '/referrer',
      method: POST,
      expects: statusCreated
    },
    get: {
      url: function(x) {
        var ref;
        return "/referrer/" + ((ref = x.id) != null ? ref : x);
      },
      method: GET,
      expects: statusOk
    }
  }
};

models = ['collection', 'coupon', 'product', 'variant'];

fn$1 = function(model) {
  return blueprints[model] = createBlueprint(model);
};
for (i = 0, len = models.length; i < len; i++) {
  model = models[i];
  fn$1(model);
}

var blueprints$1 = blueprints;

// src/browser.coffee
var Hanzo;

Api$1.BLUEPRINTS = blueprints$1;

Api$1.CLIENT = Client;

Hanzo = function(opts) {
  if (opts == null) {
    opts = {};
  }
  if (opts.client == null) {
    opts.client = new Client(opts);
  }
  if (opts.blueprints == null) {
    opts.blueprints = blueprints$1;
  }
  return new Api$1(opts);
};

Hanzo.Api = Api$1;

Hanzo.Client = Client;

// node_modules/commerce.js/lib/commerce.mjs
// src/analytics.coffee
var analytics;

var analytics$1 = analytics = {
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

// src/cart.coffee
var Cart;

Cart = (function() {
  Cart.prototype.waits = 0;

  Cart.prototype.queue = null;

  Cart.prototype.data = null;

  Cart.prototype.client = null;

  Cart.prototype.cartPromise = null;

  Cart.prototype.promise = null;

  Cart.prototype.reject = null;

  Cart.prototype.resolve = null;

  Cart.prototype.opts = {};

  function Cart(client, data1, opts) {
    this.client = client;
    this.data = data1;
    this.opts = opts != null ? opts : {};
    this.queue = [];
    this.invoice();
  }

  Cart.prototype.initCart = function() {
    var cartId, i, item, items, j, len;
    cartId = this.data.get('order.cartId');
    if (!cartId && (this.client.cart != null)) {
      return this.client.cart.create().then((function(_this) {
        return function(cart) {
          var i, item, items, j, len;
          _this.data.set('order.cartId', cart.id);
          items = _this.data.get('order.items');
          for (i = j = 0, len = items.length; j < len; i = ++j) {
            item = items[i];
            _this._cartSet(item.productId, item.quantity);
          }
          return _this.onCart(cart.id);
        };
      })(this));
    } else {
      this.onCart(cartId);
      items = this.data.get('order.items');
      for (i = j = 0, len = items.length; j < len; i = ++j) {
        item = items[i];
        this._cartSet(item.productId, item.quantity);
      }
      return this.onCart(cartId);
    }
  };

  Cart.prototype.onCart = function(cartId) {};

  Cart.prototype._cartSet = function(id, quantity) {
    var cartId;
    cartId = this.data.get('order.cartId');
    if (cartId && (this.client.cart != null)) {
      return this.client.cart.set({
        id: cartId,
        productId: id,
        quantity: quantity
      });
    }
  };

  Cart.prototype._cartUpdate = function(cart) {
    var cartId;
    cartId = this.data.get('order.cartId');
    if (cartId && (this.client.cart != null)) {
      cart.id = cartId;
      return this.client.cart.update(cart);
    }
  };

  Cart.prototype.set = function(id, quantity, locked) {
    if (locked == null) {
      locked = false;
    }
    this.queue.push([id, quantity, locked]);
    if (this.queue.length === 1) {
      this.promise = new Promise$2((function(_this) {
        return function(resolve, reject) {
          _this.resolve = resolve;
          return _this.reject = reject;
        };
      })(this));
      this._set();
    }
    return this.promise;
  };

  Cart.prototype.get = function(id) {
    var i, item, items, j, k, len, len1, ref;
    items = this.data.get('order.items');
    for (i = j = 0, len = items.length; j < len; i = ++j) {
      item = items[i];
      if (item.id !== id && item.productId !== id && item.productSlug !== id) {
        continue;
      }
      return item;
    }
    ref = this.queue;
    for (i = k = 0, len1 = ref.length; k < len1; i = ++k) {
      item = ref[i];
      if (item[0] !== id) {
        continue;
      }
      return {
        id: item[0],
        quantity: item[2],
        locked: item[3]
      };
    }
  };

  Cart.prototype._set = function() {
    var a, deltaQuantity, i, id, item, items, j, k, len, len1, locked, newValue, oldValue, quantity, ref;
    items = this.data.get('order.items');
    if (this.queue.length === 0) {
      this.invoice();
      if (this.resolve != null) {
        this.resolve(items);
      }
      return;
    }
    ref = this.queue[0], id = ref[0], quantity = ref[1], locked = ref[2];
    if (quantity === 0) {
      for (i = j = 0, len = items.length; j < len; i = ++j) {
        item = items[i];
        if (item.productId === id || item.productSlug === id || item.id === id) {
          break;
        }
      }
      if (i < items.length) {
        this.data.set('order.items', []);
        items.splice(i, 1);
        this.onUpdate();
        a = {
          id: item.productId,
          sku: item.productSlug,
          name: item.productName,
          quantity: item.quantity,
          price: parseFloat(item.price / 100)
        };
        if (this.opts.analyticsProductTransform != null) {
          a = this.opts.analyticsProductTransform(a);
        }
        analytics$1.track('Removed Product', a);
        this.data.set('order.items', items);
        this._cartSet(item.productId, 0);
        this.onUpdate(item);
      }
      this.queue.shift();
      this._set();
      return;
    }
    for (i = k = 0, len1 = items.length; k < len1; i = ++k) {
      item = items[i];
      if (item.id !== id && item.productId !== id && item.productSlug !== id) {
        continue;
      }
      oldValue = item.quantity;
      item.quantity = quantity;
      item.locked = locked;
      newValue = quantity;
      deltaQuantity = newValue - oldValue;
      if (deltaQuantity > 0) {
        a = {
          id: item.productId,
          sku: item.productSlug,
          name: item.productName,
          quantity: deltaQuantity,
          price: parseFloat(item.price / 100)
        };
        if (this.opts.analyticsProductTransform != null) {
          a = this.opts.analyticsProductTransform(a);
        }
        analytics$1.track('Added Product', a);
      } else if (deltaQuantity < 0) {
        a = {
          id: item.productId,
          sku: item.productSlug,
          name: item.productName,
          quantity: deltaQuantity,
          price: parseFloat(item.price / 100)
        };
        if (this.opts.analyticsProductTransform != null) {
          a = this.opts.analyticsProductTransform(a);
        }
        analytics$1.track('Removed Product', a);
      }
      this.data.set('order.items.' + i + '.quantity', quantity);
      this.data.set('order.items.' + i + '.locked', locked);
      this._cartSet(item.productId, quantity);
      this.onUpdate(item);
      this.queue.shift();
      this._set();
      return;
    }
    items.push({
      id: id,
      quantity: quantity,
      locked: locked
    });
    this.waits++;
    return this.load(id);
  };

  Cart.prototype.load = function(id) {
    return this.client.product.get(id).then((function(_this) {
      return function(product) {
        var a, i, item, items, j, len;
        _this.waits--;
        items = _this.data.get('order.items');
        for (i = j = 0, len = items.length; j < len; i = ++j) {
          item = items[i];
          if (product.id === item.id || product.slug === item.id) {
            a = {
              id: product.id,
              sku: product.slug,
              name: product.name,
              quantity: item.quantity,
              price: parseFloat(product.price / 100)
            };
            if (_this.opts.analyticsProductTransform != null) {
              a = _this.opts.analyticsProductTransform(a);
            }
            analytics$1.track('Added Product', a);
            _this.update(product, item);
            _this.data.set('order.items.' + i, item);
            _this._cartSet(product.id, item.quantity);
            break;
          }
        }
        _this.queue.shift();
        return _this._set();
      };
    })(this))["catch"]((function(_this) {
      return function(err) {
        var i, item, items, j, len;
        _this.waits--;
        console.log("setItem Error: " + err.stack);
        items = _this.data.get('order.items');
        for (i = j = 0, len = items.length; j < len; i = ++j) {
          item = items[i];
          if (item.id === id) {
            items.splice(i, 1);
            _this.data.set('order.items', items);
            break;
          }
        }
        _this.queue.shift();
        return _this._set();
      };
    })(this));
  };

  Cart.prototype.refresh = function(id) {
    var items;
    items = this.data.get('order.items');
    return this.client.product.get(id).then((function(_this) {
      return function(product) {
        var i, item, j, len;
        _this.waits--;
        for (i = j = 0, len = items.length; j < len; i = ++j) {
          item = items[i];
          if (product.id === item.productId || product.slug === item.productSlug) {
            _this.update(product, item);
            break;
          }
        }
        return items;
      };
    })(this))["catch"](function(err) {
      return console.log("setItem Error: " + err);
    });
  };

  Cart.prototype.update = function(product, item) {
    delete item.id;
    item.productId = product.id;
    item.productSlug = product.slug;
    item.productName = product.name;
    item.price = product.price;
    item.listPrice = product.listPrice;
    item.description = product.description;
    return this.onUpdate(item);
  };

  Cart.prototype.onUpdate = function(item) {};

  Cart.prototype.promoCode = function(promoCode) {
    if (promoCode != null) {
      this.invoice();
      return this.client.coupon.get(promoCode).then((function(_this) {
        return function(coupon) {
          if (coupon.enabled) {
            _this.data.set('order.coupon', coupon);
            _this.data.set('order.couponCodes', [promoCode]);
            _this._cartUpdate({
              coupon: coupon,
              couponCodes: [promoCode]
            });
            if (coupon.freeProductId !== "" && coupon.freeQuantity > 0) {
              return _this.client.product.get(coupon.freeProductId).then(function(freeProduct) {
                return _this.invoice();
              })["catch"](function(err) {
                throw new Error('This coupon is invalid.');
              });
            } else {
              _this.invoice();
            }
          } else {
            throw new Error('This code is expired.');
          }
        };
      })(this));
    }
    return this.data.get('order.promoCode');
  };

  Cart.prototype.taxRates = function(taxRates) {
    if (taxRates != null) {
      this.data.set('taxRates', taxRates);
      this.invoice();
    }
    return this.data.get('taxRates');
  };

  Cart.prototype.shippingRates = function(shippingRates) {
    if (shippingRates != null) {
      this.data.set('shippingRates', shippingRates);
      this.invoice();
    }
    return this.data.get('shippingRates');
  };

  Cart.prototype.invoice = function() {
    var city, country, coupon, discount, item, items, j, k, l, len, len1, len2, len3, len4, len5, m, n, o, quantity, ref, ref1, ref2, ref3, ref4, shipping, shippingRate, shippingRateFilter, shippingRates, state, subtotal, tax, taxRate, taxRateFilter, taxRates;
    items = this.data.get('order.items');
    discount = 0;
    coupon = this.data.get('order.coupon');
    if (coupon != null) {
      switch (coupon.type) {
        case 'flat':
          if ((coupon.productId == null) || coupon.productId === '') {
            discount = coupon.amount || 0;
          } else {
            ref = this.data.get('order.items');
            for (j = 0, len = ref.length; j < len; j++) {
              item = ref[j];
              if (item.productId === coupon.productId) {
                quantity = item.quantity;
                if (coupon.once) {
                  quantity = 1;
                }
                discount += (coupon.amount || 0) * quantity;
              }
            }
          }
          break;
        case 'percent':
          if ((coupon.productId == null) || coupon.productId === '') {
            ref1 = this.data.get('order.items');
            for (k = 0, len1 = ref1.length; k < len1; k++) {
              item = ref1[k];
              quantity = item.quantity;
              if (coupon.once) {
                quantity = 1;
              }
              discount += (coupon.amount || 0) * item.price * quantity * 0.01;
            }
          } else {
            ref2 = this.data.get('order.items');
            for (l = 0, len2 = ref2.length; l < len2; l++) {
              item = ref2[l];
              if (item.productId === coupon.productId) {
                quantity = item.quantity;
                if (coupon.once) {
                  quantity = 1;
                }
                discount += (coupon.amount || 0) * item.price * quantity * 0.01;
              }
            }
          }
          discount = Math.floor(discount);
      }
    }
    this.data.set('order.discount', discount);
    items = this.data.get('order.items');
    subtotal = -discount;
    for (m = 0, len3 = items.length; m < len3; m++) {
      item = items[m];
      subtotal += item.price * item.quantity;
    }
    this.data.set('order.subtotal', subtotal);
    taxRates = this.data.get('taxRates');
    if (taxRates != null) {
      for (n = 0, len4 = taxRates.length; n < len4; n++) {
        taxRateFilter = taxRates[n];
        city = this.data.get('order.shippingAddress.city');
        if (!city || ((taxRateFilter.city != null) && taxRateFilter.city.toLowerCase() !== city.toLowerCase())) {
          continue;
        }
        state = this.data.get('order.shippingAddress.state');
        if (!state || ((taxRateFilter.state != null) && taxRateFilter.state.toLowerCase() !== state.toLowerCase())) {
          continue;
        }
        country = this.data.get('order.shippingAddress.country');
        if (!country || ((taxRateFilter.country != null) && taxRateFilter.country.toLowerCase() !== country.toLowerCase())) {
          continue;
        }
        this.data.set('order.taxRate', taxRateFilter.taxRate);
        break;
      }
    }
    shippingRates = this.data.get('shippingRates');
    if (shippingRates != null) {
      for (o = 0, len5 = shippingRates.length; o < len5; o++) {
        shippingRateFilter = shippingRates[o];
        city = this.data.get('order.shippingAddress.city');
        if (!city || ((shippingRateFilter.city != null) && shippingRateFilter.city.toLowerCase() !== city.toLowerCase())) {
          continue;
        }
        state = this.data.get('order.shippingAddress.state');
        if (!state || ((shippingRateFilter.state != null) && shippingRateFilter.state.toLowerCase() !== state.toLowerCase())) {
          continue;
        }
        country = this.data.get('order.shippingAddress.country');
        if (!country || ((shippingRateFilter.country != null) && shippingRateFilter.country.toLowerCase() !== country.toLowerCase())) {
          continue;
        }
        this.data.set('order.shippingRate', shippingRateFilter.shippingRate);
        break;
      }
    }
    taxRate = (ref3 = this.data.get('order.taxRate')) != null ? ref3 : 0;
    tax = Math.ceil((taxRate != null ? taxRate : 0) * subtotal);
    shippingRate = (ref4 = this.data.get('order.shippingRate')) != null ? ref4 : 0;
    shipping = shippingRate;
    this.data.set('order.shipping', shipping);
    this.data.set('order.tax', tax);
    return this.data.set('order.total', subtotal + shipping + tax);
  };

  Cart.prototype.checkout = function() {
    var data;
    this.invoice();
    data = {
      user: this.data.get('user'),
      order: this.data.get('order'),
      payment: this.data.get('payment')
    };
    return this.client.checkout.authorize(data).then((function(_this) {
      return function(order) {
        var a, i, item, j, len, options, p, p2, ref, referralProgram;
        _this.data.set('coupon', _this.data.get('order.coupon') || {});
        _this.data.set('order', order);
        p = _this.client.checkout.capture(order.id).then(function(order) {
          _this.data.set('order', order);
          return order;
        })["catch"](function(err) {
          var ref;
          if (typeof window !== "undefined" && window !== null) {
            if ((ref = window.Raven) != null) {
              ref.captureException(err);
            }
          }
          return console.log("capture Error: " + err);
        });
        referralProgram = _this.data.get('referralProgram');
        if (referralProgram != null) {
          p2 = _this.client.referrer.create({
            userId: data.order.userId,
            orderId: data.order.orderId,
            program: referralProgram,
            programId: _this.data.get('referralProgram.id')
          })["catch"](function(err) {
            var ref;
            if (typeof window !== "undefined" && window !== null) {
              if ((ref = window.Raven) != null) {
                ref.captureException(err);
              }
            }
            return console.log("new referralProgram Error: " + err);
          });
          p = Promise$2.settle([p, p2]).then(function(pis) {
            var referrer;
            order = pis[0].value;
            referrer = pis[1].value;
            _this.data.set('referrerId', referrer.id);
            return order;
          })["catch"](function(err) {
            var ref;
            if (typeof window !== "undefined" && window !== null) {
              if ((ref = window.Raven) != null) {
                ref.captureException(err);
              }
            }
            return console.log("order/referralProgram Error: " + err);
          });
        }
        options = {
          orderId: _this.data.get('order.id'),
          total: parseFloat(_this.data.get('order.total') / 100),
          shipping: parseFloat(_this.data.get('order.shipping') / 100),
          tax: parseFloat(_this.data.get('order.tax') / 100),
          discount: parseFloat(_this.data.get('order.discount') / 100),
          coupon: _this.data.get('order.couponCodes.0') || '',
          currency: _this.data.get('order.currency'),
          products: []
        };
        ref = _this.data.get('order.items');
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          item = ref[i];
          a = {
            id: item.productId,
            sku: item.productSlug,
            name: item.productName,
            quantity: item.quantity,
            price: parseFloat(item.price / 100)
          };
          if (_this.opts.analyticsProductTransform != null) {
            a = _this.opts.analyticsProductTransform(a);
          }
          options.products[i] = a;
        }
        analytics$1.track('Completed Order', options);
        return {
          p: p
        };
      };
    })(this));
  };

  return Cart;

})();

var Cart$1 = Cart;

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
var extend$2$1 = function(child, parent) { for (var key in parent) { if (hasProp$2.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$2 = {}.hasOwnProperty;

scrolling = false;

var Control$1 = Control = (function(superClass) {
  extend$2$1(Control, superClass);

  function Control() {
    return Control.__super__.constructor.apply(this, arguments);
  }

  Control.prototype.errorHtml = '<div class="error" if="{ errorMessage }">{ errorMessage }</div>';

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
    return El$1.scheduleUpdate();
  };

  Control.prototype.value = function() {
    return this.input.ref(this.input.name);
  };

  return Control;

})(El$1.Input);

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
var extend$3 = function(child, parent) { for (var key in parent) { if (hasProp$3.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$3 = {}.hasOwnProperty;

var Text$1 = Text = (function(superClass) {
  extend$3(Text, superClass);

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
var extend$4 = function(child, parent) { for (var key in parent) { if (hasProp$4.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$4 = {}.hasOwnProperty;

TextArea = (function(superClass) {
  extend$4(TextArea, superClass);

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
var extend$5 = function(child, parent) { for (var key in parent) { if (hasProp$5.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$5 = {}.hasOwnProperty;

var Checkbox$1 = Checkbox = (function(superClass) {
  extend$5(Checkbox, superClass);

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

// node_modules/es-selectize/dist/js/selectize.mjs
var DIACRITICS = {
    'a': '[aḀḁĂăÂâǍǎȺⱥȦȧẠạÄäÀàÁáĀāÃãÅåąĄÃąĄ]',
    'b': '[b␢βΒB฿𐌁ᛒ]',
    'c': '[cĆćĈĉČčĊċC̄c̄ÇçḈḉȻȼƇƈɕᴄＣｃ]',
    'd': '[dĎďḊḋḐḑḌḍḒḓḎḏĐđD̦d̦ƉɖƊɗƋƌᵭᶁᶑȡᴅＤｄð]',
    'e': '[eÉéÈèÊêḘḙĚěĔĕẼẽḚḛẺẻĖėËëĒēȨȩĘęᶒɆɇȄȅẾếỀềỄễỂểḜḝḖḗḔḕȆȇẸẹỆệⱸᴇＥｅɘǝƏƐε]',
    'f': '[fƑƒḞḟ]',
    'g': '[gɢ₲ǤǥĜĝĞğĢģƓɠĠġ]',
    'h': '[hĤĥĦħḨḩẖẖḤḥḢḣɦʰǶƕ]',
    'i': '[iÍíÌìĬĭÎîǏǐÏïḮḯĨĩĮįĪīỈỉȈȉȊȋỊịḬḭƗɨɨ̆ᵻᶖİiIıɪＩｉ]',
    'j': '[jȷĴĵɈɉʝɟʲ]',
    'k': '[kƘƙꝀꝁḰḱǨǩḲḳḴḵκϰ₭]',
    'l': '[lŁłĽľĻļĹĺḶḷḸḹḼḽḺḻĿŀȽƚⱠⱡⱢɫɬᶅɭȴʟＬｌ]',
    'n': '[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲȠƞᵰᶇɳȵɴＮｎŊŋ]',
    'o': '[oØøÖöÓóÒòÔôǑǒŐőŎŏȮȯỌọƟɵƠơỎỏŌōÕõǪǫȌȍՕօ]',
    'p': '[pṔṕṖṗⱣᵽƤƥᵱ]',
    'q': '[qꝖꝗʠɊɋꝘꝙq̃]',
    'r': '[rŔŕɌɍŘřŖŗṘṙȐȑȒȓṚṛⱤɽ]',
    's': '[sŚśṠṡṢṣꞨꞩŜŝŠšŞşȘșS̈s̈]',
    't': '[tŤťṪṫŢţṬṭƮʈȚțṰṱṮṯƬƭ]',
    'u': '[uŬŭɄʉỤụÜüÚúÙùÛûǓǔŰűŬŭƯưỦủŪūŨũŲųȔȕ∪]',
    'v': '[vṼṽṾṿƲʋꝞꝟⱱʋ]',
    'w': '[wẂẃẀẁŴŵẄẅẆẇẈẉ]',
    'x': '[xẌẍẊẋχ]',
    'y': '[yÝýỲỳŶŷŸÿỸỹẎẏỴỵɎɏƳƴ]',
    'z': '[zŹźẐẑŽžŻżẒẓẔẕƵƶ]'
};

var asciifold = (function() {
    var i, n, k, chunk;
    var foreignletters = '';
    var lookup = {};
    for (k in DIACRITICS) {
        if (DIACRITICS.hasOwnProperty(k)) {
            chunk = DIACRITICS[k].substring(2, DIACRITICS[k].length - 1);
            foreignletters += chunk;
            for (i = 0, n = chunk.length; i < n; i++) {
                lookup[chunk.charAt(i)] = k;
            }
        }
    }
    var regexp = new RegExp('[' +  foreignletters + ']', 'g');
    return function(str) {
        return str.replace(regexp, function(foreignletter) {
            return lookup[foreignletter];
        }).toLowerCase();
    };
})();

function cmp(a, b) {
    if (typeof a === 'number' && typeof b === 'number') {
        return a > b ? 1 : (a < b ? -1 : 0);
    }
    a = asciifold(String(a || ''));
    b = asciifold(String(b || ''));
    if (a > b) return 1;
    if (b > a) return -1;
    return 0;
}

function extend$7(a, b) {
    var i, n, k, object;
    for (i = 1, n = arguments.length; i < n; i++) {
        object = arguments[i];
        if (!object) continue;
        for (k in object) {
            if (object.hasOwnProperty(k)) {
                a[k] = object[k];
            }
        }
    }
    return a;
}

/**
 * A property getter resolving dot-notation
 * @param  {Object}  obj     The root object to fetch property on
 * @param  {String}  name    The optionally dotted property name to fetch
 * @param  {Boolean} nesting Handle nesting or not
 * @return {Object}          The resolved property value
 */
function getattr(obj, name, nesting) {
    if (!obj || !name) return;
    if (!nesting) return obj[name];
    var names = name.split('.');
    while(names.length && (obj = obj[names.shift()]));
    return obj;
}

function trim$1(str) {
    return (str + '').replace(/^\s+|\s+$|/g, '');
}

function escapeRegex(str) {
    return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
}

const isArray$3 = Array.isArray || (typeof $ !== 'undefined' && $.isArray) || function(object) {
    return Object.prototype.toString.call(object) === '[object Array]';
};

/**
 * sifter.js
 * Copyright (c) 2013 Brian Reavis & contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * @author Brian Reavis <brian@thirdroute.com>
 */

/**
 * Textually searches arrays and hashes of objects
 * by property (or multiple properties). Designed
 * specifically for autocomplete.
 *
 * @constructor
 * @param {array|object} items
 * @param {object} items
 */
function Sifter(items, settings) {
    this.items = items;
    this.settings = settings || {diacritics: true};
}

/**
 * Splits a search string into an array of individual
 * regexps to be used to match results.
 *
 * @param {string} query
 * @returns {array}
 */
Sifter.prototype.tokenize = function(query) {
    query = trim$1(String(query || '').toLowerCase());
    if (!query || !query.length) return [];

    var i, n, regex, letter;
    var tokens = [];
    var words = query.split(/ +/);

    for (i = 0, n = words.length; i < n; i++) {
        regex = escapeRegex(words[i]);
        if (this.settings.diacritics) {
            for (letter in DIACRITICS) {
                if (DIACRITICS.hasOwnProperty(letter)) {
                    regex = regex.replace(new RegExp(letter, 'g'), DIACRITICS[letter]);
                }
            }
        }
        tokens.push({
            string : words[i],
            regex  : new RegExp(regex, 'i')
        });
    }

    return tokens;
};

/**
 * Iterates over arrays and hashes.
 *
 * ```
 * this.iterator(this.items, function(item, id) {
 *    // invoked for each item
 * });
 * ```
 *
 * @param {array|object} object
 */
Sifter.prototype.iterator = function(object, callback) {
    var iterator;
    if (isArray$3(object)) {
        iterator = Array.prototype.forEach || function(callback) {
            for (var i = 0, n = this.length; i < n; i++) {
                callback(this[i], i, this);
            }
        };
    } else {
        iterator = function(callback) {
            for (var key in this) {
                if (this.hasOwnProperty(key)) {
                    callback(this[key], key, this);
                }
            }
        };
    }

    iterator.apply(object, [callback]);
};

/**
 * Returns a function to be used to score individual results.
 *
 * Good matches will have a higher score than poor matches.
 * If an item is not a match, 0 will be returned by the function.
 *
 * @param {object|string} search
 * @param {object} options (optional)
 * @returns {function}
 */
Sifter.prototype.getScoreFunction = function(search, options) {
    var self, fields, tokens, tokenCount, nesting;

    self       = this;
    search     = self.prepareSearch(search, options);
    tokens     = search.tokens;
    fields     = search.options.fields;
    tokenCount = tokens.length;
    nesting    = search.options.nesting;

    /**
     * Calculates how close of a match the
     * given value is against a search token.
     *
     * @param {mixed} value
     * @param {object} token
     * @return {number}
     */
     function scoreValue(value, token) {
        var score, pos;

        if (!value) return 0;
        value = String(value || '');
        pos = value.search(token.regex);
        if (pos === -1) return 0;
        score = token.string.length / value.length;
        if (pos === 0) score += 0.5;
        return score;
    }

    /**
     * Calculates the score of an object
     * against the search query.
     *
     * @param {object} token
     * @param {object} data
     * @return {number}
     */
    var scoreObject = (function() {
        var fieldCount = fields.length;
        if (!fieldCount) {
            return function() { return 0; };
        }
        if (fieldCount === 1) {
            return function(token, data) {
                return scoreValue(getattr(data, fields[0], nesting), token);
            };
        }
        return function(token, data) {
            for (var i = 0, sum = 0; i < fieldCount; i++) {
                sum += scoreValue(getattr(data, fields[i], nesting), token);
            }
            return sum / fieldCount;
        };
    })();

    if (!tokenCount) {
        return function() { return 0; };
    }
    if (tokenCount === 1) {
        return function(data) {
            return scoreObject(tokens[0], data);
        };
    }

    if (search.options.conjunction === 'and') {
        return function(data) {
            var score;
            for (var i = 0, sum = 0; i < tokenCount; i++) {
                score = scoreObject(tokens[i], data);
                if (score <= 0) return 0;
                sum += score;
            }
            return sum / tokenCount;
        };
    } else {
        return function(data) {
            for (var i = 0, sum = 0; i < tokenCount; i++) {
                sum += scoreObject(tokens[i], data);
            }
            return sum / tokenCount;
        };
    }
};

/**
 * Returns a function that can be used to compare two
 * results, for sorting purposes. If no sorting should
 * be performed, `null` will be returned.
 *
 * @param {string|object} search
 * @param {object} options
 * @return function(a,b)
 */
Sifter.prototype.getSortFunction = function(search, options) {
    var i, n, self, field, fields, fieldsCount, multiplier, multipliers, sort, implicitScore;

    self   = this;
    search = self.prepareSearch(search, options);
    sort   = (!search.query && options.sortEmpty) || options.sort;

    /**
     * Fetches the specified sort field value
     * from a search result item.
     *
     * @param  {string} name
     * @param  {object} result
     * @return {mixed}
     */
    function getField(name, result) {
        if (name === '$score') return result.score;
        return getattr(self.items[result.id], name, options.nesting);
    }

    // parse options
    fields = [];
    if (sort) {
        for (i = 0, n = sort.length; i < n; i++) {
            if (search.query || sort[i].field !== '$score') {
                fields.push(sort[i]);
            }
        }
    }

    // the "$score" field is implied to be the primary
    // sort field, unless it's manually specified
    if (search.query) {
        implicitScore = true;
        for (i = 0, n = fields.length; i < n; i++) {
            if (fields[i].field === '$score') {
                implicitScore = false;
                break;
            }
        }
        if (implicitScore) {
            fields.unshift({field: '$score', direction: 'desc'});
        }
    } else {
        for (i = 0, n = fields.length; i < n; i++) {
            if (fields[i].field === '$score') {
                fields.splice(i, 1);
                break;
            }
        }
    }

    multipliers = [];
    for (i = 0, n = fields.length; i < n; i++) {
        multipliers.push(fields[i].direction === 'desc' ? -1 : 1);
    }

    // build function
    fieldsCount = fields.length;
    if (!fieldsCount) {
        return null;
    } else if (fieldsCount === 1) {
        field = fields[0].field;
        multiplier = multipliers[0];
        return function(a, b) {
            return multiplier * cmp(
                getField(field, a),
                getField(field, b)
            );
        };
    } else {
        return function(a, b) {
            var i, result, field;
            for (i = 0; i < fieldsCount; i++) {
                field = fields[i].field;
                result = multipliers[i] * cmp(
                    getField(field, a),
                    getField(field, b)
                );
                if (result) return result;
            }
            return 0;
        };
    }
};

/**
 * Parses a search query and returns an object
 * with tokens and fields ready to be populated
 * with results.
 *
 * @param {string} query
 * @param {object} options
 * @returns {object}
 */
Sifter.prototype.prepareSearch = function(query, options) {
    if (typeof query === 'object') return query;

    options = extend$7({}, options);

    var optionFields     = options.fields;
    var optionSort       = options.sort;
    var optionSortEmpty = options.sortEmpty;

    if (optionFields && !isArray$3(optionFields)) options.fields = [optionFields];
    if (optionSort && !isArray$3(optionSort)) options.sort = [optionSort];
    if (optionSortEmpty && !isArray$3(optionSortEmpty)) options.sortEmpty = [optionSortEmpty];

    return {
        options : options,
        query   : String(query || '').toLowerCase(),
        tokens  : this.tokenize(query),
        total   : 0,
        items   : []
    };
};

/**
 * Searches through all items and returns a sorted array of matches.
 *
 * The `options` parameter can contain:
 *
 *   - fields {string|array}
 *   - sort {array}
 *   - score {function}
 *   - filter {bool}
 *   - limit {integer}
 *
 * Returns an object containing:
 *
 *   - options {object}
 *   - query {string}
 *   - tokens {array}
 *   - total {int}
 *   - items {array}
 *
 * @param {string} query
 * @param {object} options
 * @returns {object}
 */
Sifter.prototype.search = function(query, options) {
    var self = this, score, search;
    var fnSort;
    var fnScore;

    search  = this.prepareSearch(query, options);
    options = search.options;
    query   = search.query;

    // generate result scoring function
    fnScore = options.score || self.getScoreFunction(search);

    // perform search and sort
    if (query.length) {
        self.iterator(self.items, function(item, id) {
            score = fnScore(item);
            if (options.filter === false || score > 0) {
                search.items.push({'score': score, 'id': id});
            }
        });
    } else {
        self.iterator(self.items, function(item, id) {
            search.items.push({'score': 1, 'id': id});
        });
    }

    fnSort = self.getSortFunction(search, options);
    if (fnSort) search.items.sort(fnSort);

    // apply limits
    search.total = search.items.length;
    if (typeof options.limit === 'number') {
        search.items = search.items.slice(0, options.limit);
    }

    return search;
};

var isActualNaN$1;
var isArgs$1;
var isFn$1;
var objProto$1;
var owns$1;
var symbolValueOf$1;
var toStr$1;

objProto$1 = Object.prototype;

owns$1 = objProto$1.hasOwnProperty;

toStr$1 = objProto$1.toString;

symbolValueOf$1 = void 0;

if (typeof Symbol === 'function') {
  symbolValueOf$1 = Symbol.prototype.valueOf;
}

isActualNaN$1 = function(value) {
  return value !== value;
};

var isEqual$1 = function(value, other) {
  var key, type;
  if (value === other) {
    return true;
  }
  type = toStr$1.call(value);
  if (type !== toStr$1.call(other)) {
    return false;
  }
  if (type === '[object Object]') {
    for (key in value) {
      if (!isEqual$1(value[key], other[key]) || !(key in other)) {
        return false;
      }
    }
    for (key in other) {
      if (!isEqual$1(value[key], other[key]) || !(key in value)) {
        return false;
      }
    }
    return true;
  }
  if (type === '[object Array]') {
    key = value.length;
    if (key !== other.length) {
      return false;
    }
    while (key--) {
      if (!isEqual$1(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }
  if (type === '[object Function]') {
    return value.prototype === other.prototype;
  }
  if (type === '[object Date]') {
    return value.getTime() === other.getTime();
  }
  return false;
};

var isArrayLike$1 = function(value) {
  return !!value && !isBool$1(value) && owns$1.call(value, 'length') && isFinite(value.length) && isNumber$1(value.length) && value.length >= 0;
};

var isArguments$1 = isArgs$1 = function(value) {
  var isOldArguments, isStandardArguments;
  isStandardArguments = toStr$1.call(value) === '[object Arguments]';
  isOldArguments = !isArray$1$1(value) && isArrayLike$1(value) && isObject$2(value) && isFn$1(value.callee);
  return isStandardArguments || isOldArguments;
};

var isArray$1$1 = Array.isArray || function(value) {
  return toStr$1.call(value) === '[object Array]';
};

var isBool$1 = function(value) {
  return toStr$1.call(value) === '[object Boolean]';
};

var isFunction$2 = isFn$1 = function(value) {
  var isAlert, str;
  isAlert = typeof window !== 'undefined' && value === window.alert;
  if (isAlert) {
    return true;
  }
  str = toStr$1.call(value);
  return str === '[object Function]' || str === '[object GeneratorFunction]' || str === '[object AsyncFunction]';
};

var isNumber$1 = function(value) {
  return toStr$1.call(value) === '[object Number]';
};

var isObject$2 = function(value) {
  return toStr$1.call(value) === '[object Object]';
};

/**
 * microplugin.js
 * Copyright (c) 2013 Brian Reavis & contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * @author Brian Reavis <brian@thirdroute.com>
 */

const MicroPlugin = {};

MicroPlugin.mixin = function(Interface) {
    Interface.plugins = {};

    /**
     * Initializes the listed plugins (with options).
     * Acceptable formats:
     *
     * List (without options):
     *   ['a', 'b', 'c']
     *
     * List (with options):
     *   [{'name': 'a', options: {}}, {'name': 'b', options: {}}]
     *
     * Hash (with options):
     *   {'a': { ... }, 'b': { ... }, 'c': { ... }}
     *
     * @param {mixed} plugins
     */
    Interface.prototype.initializePlugins = function(plugins) {
        var i, n, key;
        var self  = this;
        var queue = [];

        self.plugins = {
            names     : [],
            settings  : {},
            requested : {},
            loaded    : {}
        };

        if (isArray$1$1(plugins)) {
            for (i = 0, n = plugins.length; i < n; i++) {
                if (typeof plugins[i] === 'string') {
                    queue.push(plugins[i]);
                } else {
                    self.plugins.settings[plugins[i].name] = plugins[i].options;
                    queue.push(plugins[i].name);
                }
            }
        } else if (plugins) {
            for (key in plugins) {
                if (plugins.hasOwnProperty(key)) {
                    self.plugins.settings[key] = plugins[key];
                    queue.push(key);
                }
            }
        }

        while (queue.length) {
            self.require(queue.shift());
        }
    };

    Interface.prototype.loadPlugin = function(name) {
        var self    = this;
        var plugins = self.plugins;
        var plugin  = Interface.plugins[name];

        if (!Interface.plugins.hasOwnProperty(name)) {
            throw new Error('Unable to find "' +  name + '" plugin');
        }

        plugins.requested[name] = true;
        plugins.loaded[name] = plugin.fn.apply(self, [self.plugins.settings[name] || {}]);
        plugins.names.push(name);
    };

    /**
     * Initializes a plugin.
     *
     * @param {string} name
     */
    Interface.prototype.require = function(name) {
        var self = this;
        var plugins = self.plugins;

        if (!self.plugins.loaded.hasOwnProperty(name)) {
            if (plugins.requested[name]) {
                throw new Error('Plugin has circular dependency ("' + name + '")');
            }
            self.loadPlugin(name);
        }

        return plugins.loaded[name];
    };

    /**
     * Registers a plugin.
     *
     * @param {string} name
     * @param {function} fn
     */
    Interface.define = function(name, fn) {
        Interface.plugins[name] = {
            'name' : name,
            'fn'   : fn
        };
    };
};

/**
 * MicroEvent - to make any js object an event emitter
 *
 * - pure javascript - server compatible, browser compatible
 * - dont rely on the browser doms
 * - super simple - you get it immediatly, no mistery, no magic involved
 *
 * @author Jerome Etienne (https://github.com/jeromeetienne)
 */

function MicroEvent() {}

MicroEvent.prototype = {
	on: function(event, fct){
		this._events = this._events || {};
		this._events[event] = this._events[event] || [];
		this._events[event].push(fct);
	},
	off: function(event, fct){
		var n = arguments.length;
		if (n === 0) return delete this._events;
		if (n === 1) return delete this._events[event];

		this._events = this._events || {};
		if (event in this._events === false) return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	},
	trigger: function(event /* , args... */){
		this._events = this._events || {};
		if (event in this._events === false) return;
		for (var i = 0; i < this._events[event].length; i++){
			this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
		}
	}
};

/**
 * Mixin will delegate all MicroEvent.js function in the destination object.
 *
 * - MicroEvent.mixin(Foobar) will make Foobar able to use MicroEvent
 *
 * @param {object} the object which will support MicroEvent
 */
MicroEvent.mixin = function(destObject){
	var props = ['on', 'off', 'trigger'];
	for (var i = 0; i < props.length; i++){
		destObject.prototype[props[i]] = MicroEvent.prototype[props[i]];
	}
};

/**
 * highlight v3 | MIT license | Johann Burkard <jb@eaio.com>
 * Highlights arbitrary terms in a node.
 *
 * - Modified by Marshal <beatgates@gmail.com> 2011-6-24 (added regex)
 * - Modified by Brian Reavis <brian@thirdroute.com> 2012-8-27 (cleanup)
 */

function highlight($element, pattern) {
	if (typeof pattern === 'string' && !pattern.length) return;
	var regex = (typeof pattern === 'string') ? new RegExp(pattern, 'i') : pattern;

	var highlight = function(node) {
		var skip = 0;
		if (node.nodeType === 3) {
			var pos = node.data.search(regex);
			if (pos >= 0 && node.data.length > 0) {
				// var match = node.data.match(regex);
				var spannode = document.createElement('span');
				spannode.className = 'highlight';
				var middlebit = node.splitText(pos);
				// var endbit = middlebit.splitText(match[0].length);
				var middleclone = middlebit.cloneNode(true);
				spannode.appendChild(middleclone);
				middlebit.parentNode.replaceChild(spannode, middlebit);
				skip = 1;
			}
		} else if (node.nodeType === 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
			for (var i = 0; i < node.childNodes.length; ++i) {
				i += highlight(node.childNodes[i]);
			}
		}
		return skip;
	};

	return $element.each(function() {
		highlight(this);
	});
}

/**
 * removeHighlight fn copied from highlight v5 and
 * edited to remove with() and pass js strict mode
 */
$.fn.removeHighlight = function() {
	return this.find('span.highlight').each(function() {
		// this.parentNode.firstChild.nodeName;
		var parent = this.parentNode;
		parent.replaceChild(this.firstChild, this);
		parent.normalize();
	}).end();
};

var defaults$1 = {
	options: [],
	optgroups: [],

	plugins: [],
	delimiter: ',',
	splitOn: null, // regexp or string for splitting up values from a paste command
	persist: true,
	diacritics: true,
	create: false,
	createOnBlur: false,
	createFilter: null,
	highlight: true,
	openOnFocus: true,
	maxOptions: 1000,
	maxItems: null,
	hideSelected: null,
	addPrecedence: false,
	selectOnTab: false,
	preload: false,
	allowEmptyOption: false,
	closeAfterSelect: false,

	scrollDuration: 60,
	loadThrottle: 300,
	loadingClass: 'loading',

	dataAttr: 'data-data',
	optgroupField: 'optgroup',
	valueField: 'value',
	labelField: 'text',
	optgroupLabelField: 'label',
	optgroupValueField: 'value',
	lockOptgroupOrder: false,

	sortField: '$order',
	searchField: ['text'],
	searchConjunction: 'and',

	mode: null,
	wrapperClass: 'selectize-control',
	inputClass: 'selectize-input',
	dropdownClass: 'selectize-dropdown',
	dropdownContentClass: 'selectize-dropdown-content',

	dropdownParent: null,

	copyClassesToDropdown: true,

	/*
	load                 : null, // function(query, callback) { ... }
	score                : null, // function(search) { ... }
	onInitialize         : null, // function() { ... }
	onChange             : null, // function(value) { ... }
	onItemAdd            : null, // function(value, $item) { ... }
	onItemRemove         : null, // function(value) { ... }
	onClear              : null, // function() { ... }
	onOptionAdd          : null, // function(value, data) { ... }
	onOptionRemove       : null, // function(value) { ... }
	onOptionClear        : null, // function() { ... }
	onOptionGroupAdd     : null, // function(id, data) { ... }
	onOptionGroupRemove  : null, // function(id) { ... }
	onOptionGroupClear   : null, // function() { ... }
	onDropdownOpen       : null, // function($dropdown) { ... }
	onDropdownClose      : null, // function($dropdown) { ... }
	onType               : null, // function(str) { ... }
	onDelete             : null, // function(values) { ... }
	*/

	render: {
		/*
		item: null,
		optgroup: null,
		optgroup_header: null,
		option: null,
		option_create: null
		*/
	}
};

var IS_MAC        = /Mac/.test(navigator.userAgent);

var KEY_A         = 65;

var KEY_RETURN    = 13;
var KEY_ESC       = 27;
var KEY_LEFT      = 37;
var KEY_UP        = 38;
var KEY_P         = 80;
var KEY_RIGHT     = 39;
var KEY_DOWN      = 40;
var KEY_N         = 78;
var KEY_BACKSPACE = 8;
var KEY_DELETE    = 46;
var KEY_SHIFT     = 16;
var KEY_CMD       = IS_MAC ? 91 : 17;
var KEY_CTRL      = IS_MAC ? 18 : 17;
var KEY_TAB       = 9;

var TAG_SELECT    = 1;
var TAG_INPUT     = 2;

// for now, android support in general is too spotty to support validity
var SUPPORTS_VALIDITY_API = !/android/i.test(window.navigator.userAgent) && !!document.createElement('input').validity;

/**
 * Determines if the provided value has been defined.
 *
 * @param {mixed} object
 * @returns {boolean}
 */
function isSet(object) {
	return typeof object !== 'undefined';
}

/**
 * Converts a scalar to its best string representation
 * for hash keys and HTML attribute values.
 *
 * Transformations:
 *   'str'     -> 'str'
 *   null      -> ''
 *   undefined -> ''
 *   true      -> '1'
 *   false     -> '0'
 *   0         -> '0'
 *   1         -> '1'
 *
 * @param {string} value
 * @returns {string|null}
 */
function hashKey(value) {
	if (typeof value === 'undefined' || value === null) return null;
	if (typeof value === 'boolean') return value ? '1' : '0';
	return value + '';
}

/**
 * Escapes a string for use within HTML.
 *
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
	return (str + '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/**
 * Escapes "$" characters in replacement strings.
 *
 * @param {string} str
 * @returns {string}
 */




/**
 * Wraps `fn` so that it can only be invoked once.
 *
 * @param {function} fn
 * @returns {function}
 */
function once(fn) {
	var called = false;
	return function() {
		if (called) return;
		called = true;
		fn.apply(this, arguments);
	};
}

/**
 * Wraps `fn` so that it can only be called once
 * every `delay` milliseconds (invoked on the falling edge).
 *
 * @param {function} fn
 * @param {int} delay
 * @returns {function}
 */
function debounce(fn, delay) {
	var timeout;
	return function() {
		var self = this;
		var args = arguments;
		window.clearTimeout(timeout);
		timeout = window.setTimeout(function() {
			fn.apply(self, args);
		}, delay);
	};
}

/**
 * Debounce all fired events types listed in `types`
 * while executing the provided `fn`.
 *
 * @param {object} self
 * @param {array} types
 * @param {function} fn
 */
function debounceEvents(self, types, fn) {
	var type;
	var trigger = self.trigger;
	var eventArgs = {};

	// override trigger method
	self.trigger = function() {
		var type = arguments[0];
		if (types.indexOf(type) !== -1) {
			eventArgs[type] = arguments;
		} else {
			return trigger.apply(self, arguments);
		}
	};

	// invoke provided function
	fn.apply(self, []);
	self.trigger = trigger;

	// trigger queued events
	for (type in eventArgs) {
		if (eventArgs.hasOwnProperty(type)) {
			trigger.apply(self, eventArgs[type]);
		}
	}
}

/**
 * A workaround for http://bugs.jquery.com/ticket/6696
 *
 * @param {object} $parent - Parent element to listen on.
 * @param {string} event - Event name.
 * @param {string} selector - Descendant selector to filter by.
 * @param {function} fn - Event handler.
 */
function watchChildEvent($parent, event, selector, fn) {
	$parent.on(event, selector, function(e) {
		var child = e.target;
		while (child && child.parentNode !== $parent[0]) {
			child = child.parentNode;
		}
		e.currentTarget = child;
		return fn.apply(this, [e]);
	});
}

/**
 * Determines the current selection within a text input control.
 * Returns an object containing:
 *   - start
 *   - length
 *
 * @param {object} input
 * @returns {object}
 */
function getSelection(input) {
	var result = {};
	if ('selectionStart' in input) {
		result.start = input.selectionStart;
		result.length = input.selectionEnd - result.start;
	} else if (document.selection) {
		input.focus();
		var sel = document.selection.createRange();
		var selLen = document.selection.createRange().text.length;
		sel.moveStart('character', -input.value.length);
		result.start = sel.text.length - selLen;
		result.length = selLen;
	}
	return result;
}

/**
 * Copies CSS properties from one element to another.
 *
 * @param {object} $from
 * @param {object} $to
 * @param {array} properties
 */
function transferStyles($from, $to, properties) {
	var i, n, styles = {};
	if (properties) {
		for (i = 0, n = properties.length; i < n; i++) {
			styles[properties[i]] = $from.css(properties[i]);
		}
	} else {
		styles = $from.css();
	}
	$to.css(styles);
}

/**
 * Measures the width of a string within a
 * parent element (in pixels).
 *
 * @param {string} str
 * @param {object} $parent
 * @returns {int}
 */
function measureString(str, $parent) {
	if (!str) {
		return 0;
	}

	var $test = $('<test>').css({
		position: 'absolute',
		top: -99999,
		left: -99999,
		width: 'auto',
		padding: 0,
		whiteSpace: 'pre'
	}).text(str).appendTo('body');

	transferStyles($parent, $test, [
		'letterSpacing',
		'fontSize',
		'fontFamily',
		'fontWeight',
		'textTransform'
	]);

	var width = $test.width();
	$test.remove();

	return width;
}

/**
 * Sets up an input to grow horizontally as the user
 * types. If the value is changed manually, you can
 * trigger the "update" handler to resize:
 *
 * $input.trigger('update');
 *
 * @param {object} $input
 */
function autoGrow($input) {
	var currentWidth = null;

	var update = function(e, options) {
		var value, keyCode, printable, placeholder, width;
		var shift, character, selection;
		e = e || window.event || {};
		options = options || {};

		if (e.metaKey || e.altKey) return;
		if (!options.force && $input.data('grow') === false) return;

		value = $input.val();
		if (e.type && e.type.toLowerCase() === 'keydown') {
			keyCode = e.keyCode;
			printable = (
				(keyCode >= 97 && keyCode <= 122) || // a-z
				(keyCode >= 65 && keyCode <= 90)  || // A-Z
				(keyCode >= 48 && keyCode <= 57)  || // 0-9
				keyCode === 32 // space
			);

			if (keyCode === KEY_DELETE || keyCode === KEY_BACKSPACE) {
				selection = getSelection($input[0]);
				if (selection.length) {
					value = value.substring(0, selection.start) + value.substring(selection.start + selection.length);
				} else if (keyCode === KEY_BACKSPACE && selection.start) {
					value = value.substring(0, selection.start - 1) + value.substring(selection.start + 1);
				} else if (keyCode === KEY_DELETE && typeof selection.start !== 'undefined') {
					value = value.substring(0, selection.start) + value.substring(selection.start + 1);
				}
			} else if (printable) {
				shift = e.shiftKey;
				character = String.fromCharCode(e.keyCode);
				if (shift) character = character.toUpperCase();
				else character = character.toLowerCase();
				value += character;
			}
		}

		placeholder = $input.attr('placeholder');
		if (!value && placeholder) {
			value = placeholder;
		}

		width = measureString(value, $input) + 4;
		if (width !== currentWidth) {
			currentWidth = width;
			$input.width(width);
			$input.triggerHandler('resize');
		}
	};

	$input.on('keydown keyup update blur', update);
	update();
}

function domToString(d) {
	var tmp = document.createElement('div');

	tmp.appendChild(d.cloneNode(true));

	return tmp.innerHTML;
}

function Selectize($input, settings) {
	var i, n, dir, input, self = this;
	input = $input[0];
	input.selectize = self;

	// detect rtl environment
	var computedStyle = window.getComputedStyle && window.getComputedStyle(input, null);
	dir = computedStyle ? computedStyle.getPropertyValue('direction') : input.currentStyle && input.currentStyle.direction;
	dir = dir || $input.parents('[dir]:first').attr('dir') || '';

	// setup default state
	$.extend(self, {
		order            : 0,
		settings         : settings,
		$input           : $input,
		tabIndex         : $input.attr('tabindex') || '',
		tagType          : input.tagName.toLowerCase() === 'select' ? TAG_SELECT : TAG_INPUT,
		rtl              : /rtl/i.test(dir),

		eventNS          : '.selectize' + (++Selectize.count),
		highlightedValue : null,
		isOpen           : false,
		isDisabled       : false,
		isRequired       : $input.is('[required]'),
		isInvalid        : false,
		isLocked         : false,
		isFocused        : false,
		isInputHidden    : false,
		isSetup          : false,
		isShiftDown      : false,
		isCmdDown        : false,
		isCtrlDown       : false,
		ignoreFocus      : false,
		ignoreBlur       : false,
		ignoreHover      : false,
		hasOptions       : false,
		currentResults   : null,
		lastValue        : '',
		caretPos         : 0,
		loading          : 0,
		loadedSearches   : {},

		$activeOption    : null,
		$activeItems     : [],

		optgroups        : {},
		options          : {},
		userOptions      : {},
		items            : [],
		renderCache      : {},
		onSearchChange   : settings.loadThrottle === null ? self.onSearchChange : debounce(self.onSearchChange, settings.loadThrottle)
	});

	// search system
	self.sifter = new Sifter(this.options, {diacritics: settings.diacritics});

	// build options table
	if (self.settings.options) {
		for (i = 0, n = self.settings.options.length; i < n; i++) {
			self.registerOption(self.settings.options[i]);
		}
		delete self.settings.options;
	}

	// build optgroup table
	if (self.settings.optgroups) {
		for (i = 0, n = self.settings.optgroups.length; i < n; i++) {
			self.registerOptionGroup(self.settings.optgroups[i]);
		}
		delete self.settings.optgroups;
	}

	// option-dependent defaults
	self.settings.mode = self.settings.mode || (self.settings.maxItems === 1 ? 'single' : 'multi');
	if (typeof self.settings.hideSelected !== 'boolean') {
		self.settings.hideSelected = self.settings.mode === 'multi';
	}

	self.initializePlugins(self.settings.plugins);
	self.setupCallbacks();
	self.setupTemplates();
	self.setup();
}


// defaults
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Selectize.defaults = defaults$1;
Selectize.count    = 0;

// mixins
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

MicroEvent.mixin(Selectize);
MicroPlugin.mixin(Selectize);

// methods
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

$.extend(Selectize.prototype, {

	/**
	 * Creates all elements and sets up event bindings.
	 */
	setup: function() {
		var self      = this;
		var settings  = self.settings;
		var eventNS   = self.eventNS;
		var $window   = $(window);
		var $document = $(document);
		var $input    = self.$input;

		var $wrapper;
		var $control;
		var $controlInput;
		var $dropdown;
		var $dropdownContent;
		var $dropdownParent;
		var inputMode;
		var classes;
		var classesPlugins;
		var inputId;

		inputMode         = self.settings.mode;
		classes           = $input.attr('class') || '';

		$wrapper          = $('<div>').addClass(settings.wrapperClass).addClass(classes).addClass(inputMode);
		$control          = $('<div>').addClass(settings.inputClass).addClass('items').appendTo($wrapper);
		$controlInput    = $('<input type="text" autocomplete="off" />').appendTo($control).attr('tabindex', $input.is(':disabled') ? '-1' : self.tabIndex);
		$dropdownParent  = $(settings.dropdownParent || $wrapper);
		$dropdown         = $('<div>').addClass(settings.dropdownClass).addClass(inputMode).hide().appendTo($dropdownParent);
		$dropdownContent = $('<div>').addClass(settings.dropdownContentClass).appendTo($dropdown);

		if(inputId = $input.attr('id')) {
			$controlInput.attr('id', inputId + '-selectized');
			$('label[for="'+inputId+'"]').attr('for', inputId + '-selectized');
		}

		if(self.settings.copyClassesToDropdown) {
			$dropdown.addClass(classes);
		}

		$wrapper.css({
			width: $input[0].style.width
		});

		if (self.plugins.names.length) {
			classesPlugins = 'plugin-' + self.plugins.names.join(' plugin-');
			$wrapper.addClass(classesPlugins);
			$dropdown.addClass(classesPlugins);
		}

		if ((settings.maxItems === null || settings.maxItems > 1) && self.tagType === TAG_SELECT) {
			$input.attr('multiple', 'multiple');
		}

		if (self.settings.placeholder) {
			$controlInput.attr('placeholder', settings.placeholder);
		}

		// if splitOn was not passed in, construct it from the delimiter to allow pasting universally
		if (!self.settings.splitOn && self.settings.delimiter) {
			var delimiterEscaped = self.settings.delimiter.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
			self.settings.splitOn = new RegExp('\\s*' + delimiterEscaped + '+\\s*');
		}

		if ($input.attr('autocorrect')) {
			$controlInput.attr('autocorrect', $input.attr('autocorrect'));
		}

		if ($input.attr('autocapitalize')) {
			$controlInput.attr('autocapitalize', $input.attr('autocapitalize'));
		}

		self.$wrapper          = $wrapper;
		self.$control          = $control;
		self.$controlInput    = $controlInput;
		self.$dropdown         = $dropdown;
		self.$dropdownContent = $dropdownContent;

		$dropdown.on('mouseenter', '[data-selectable]', function() { return self.onOptionHover.apply(self, arguments); });
		$dropdown.on('mousedown click', '[data-selectable]', function() { return self.onOptionSelect.apply(self, arguments); });
		watchChildEvent($control, 'mousedown', '*:not(input)', function() { return self.onItemSelect.apply(self, arguments); });
		autoGrow($controlInput);

		$control.on({
			mousedown : function() { return self.onMouseDown.apply(self, arguments); },
			click     : function() { return self.onClick.apply(self, arguments); }
		});

		$controlInput.on({
			mousedown : function(e) { e.stopPropagation(); },
			keydown   : function() { return self.onKeyDown.apply(self, arguments); },
			keyup     : function() { return self.onKeyUp.apply(self, arguments); },
			keypress  : function() { return self.onKeyPress.apply(self, arguments); },
			resize    : function() { self.positionDropdown.apply(self, []); },
			blur      : function() { return self.onBlur.apply(self, arguments); },
			focus     : function() { self.ignoreBlur = false; return self.onFocus.apply(self, arguments); },
			paste     : function() { return self.onPaste.apply(self, arguments); }
		});

		$document.on('keydown' + eventNS, function(e) {
			self.isCmdDown = e[IS_MAC ? 'metaKey' : 'ctrlKey'];
			self.isCtrlDown = e[IS_MAC ? 'altKey' : 'ctrlKey'];
			self.isShiftDown = e.shiftKey;
		});

		$document.on('keyup' + eventNS, function(e) {
			if (e.keyCode === KEY_CTRL) self.isCtrlDown = false;
			if (e.keyCode === KEY_SHIFT) self.isShiftDown = false;
			if (e.keyCode === KEY_CMD) self.isCmdDown = false;
		});

		$document.on('mousedown' + eventNS, function(e) {
			if (self.isFocused) {
				// prevent events on the dropdown scrollbar from causing the control to blur
				if (e.target === self.$dropdown[0] || e.target.parentNode === self.$dropdown[0]) {
					return false;
				}
				// blur on click outside
				if (!self.$control.has(e.target).length && e.target !== self.$control[0]) {
					self.blur(e.target);
				}
			}
		});

		$window.on(['scroll' + eventNS, 'resize' + eventNS].join(' '), function() {
			if (self.isOpen) {
				self.positionDropdown.apply(self, arguments);
			}
		});
		$window.on('mousemove' + eventNS, function() {
			self.ignoreHover = false;
		});

		// store original children and tab index so that they can be
		// restored when the destroy() method is called.
		this.revertSettings = {
			$children : $input.children().detach(),
			tabindex  : $input.attr('tabindex')
		};

		$input.attr('tabindex', -1).hide().after(self.$wrapper);

		if ($.isArray(settings.items)) {
			self.setValue(settings.items);
			delete settings.items;
		}

		// feature detect for the validation API
		if (SUPPORTS_VALIDITY_API) {
			$input.on('invalid' + eventNS, function(e) {
				e.preventDefault();
				self.isInvalid = true;
				self.refreshState();
			});
		}

		self.updateOriginalInput();
		self.refreshItems();
		self.refreshState();
		self.updatePlaceholder();
		self.isSetup = true;

		if ($input.is(':disabled')) {
			self.disable();
		}

		self.on('change', this.onChange);

		$input.data('selectize', self);
		$input.addClass('selectized');
		self.trigger('initialize');

		// preload options
		if (settings.preload === true) {
			self.onSearchChange('');
		}

	},

	/**
	 * Sets up default rendering functions.
	 */
	setupTemplates: function() {
		var self = this;
		var fieldLabel = self.settings.labelField;
		var fieldOptgroup = self.settings.optgroupLabelField;

		var templates = {
			'optgroup': function(data) {
				return '<div class="optgroup">' + data.html + '</div>';
			},
			'optgroupHeader': function(data, escape) {
				return '<div class="optgroup-header">' + escape(data[fieldOptgroup]) + '</div>';
			},
			'option': function(data, escape) {
				return '<div class="option">' + escape(data[fieldLabel]) + '</div>';
			},
			'item': function(data, escape) {
				return '<div class="item">' + escape(data[fieldLabel]) + '</div>';
			},
			'optionCreate': function(data, escape) {
				return '<div class="create">Add <strong>' + escape(data.input) + '</strong>&hellip;</div>';
			}
		};

		self.settings.render = $.extend({}, templates, self.settings.render);
	},

	/**
	 * Maps fired events to callbacks provided
	 * in the settings used when creating the control.
	 */
	setupCallbacks: function() {
		var key, fn, callbacks = {
			'initialize'      : 'onInitialize',
			'change'          : 'onChange',
			'itemAdd'        : 'onItemAdd',
			'itemRemove'     : 'onItemRemove',
			'clear'           : 'onClear',
			'optionAdd'      : 'onOptionAdd',
			'optionRemove'   : 'onOptionRemove',
			'optionClear'    : 'onOptionClear',
			'optgroupAdd'    : 'onOptionGroupAdd',
			'optgroupRemove' : 'onOptionGroupRemove',
			'optgroupClear'  : 'onOptionGroupClear',
			'dropdownOpen'   : 'onDropdownOpen',
			'dropdownClose'  : 'onDropdownClose',
			'type'            : 'onType',
			'load'            : 'onLoad',
			'focus'           : 'onFocus',
			'blur'            : 'onBlur'
		};

		for (key in callbacks) {
			if (callbacks.hasOwnProperty(key)) {
				fn = this.settings[callbacks[key]];
				if (fn) this.on(key, fn);
			}
		}
	},

	/**
	 * Triggered when the main control element
	 * has a click event.
	 *
	 * @param {object} e
	 * @return {boolean}
	 */
	onClick: function(e) {
		var self = this;

		// necessary for mobile webkit devices (manual focus triggering
		// is ignored unless invoked within a click event)
		if (!self.isFocused) {
			self.focus();
			e.preventDefault();
		}
	},

	/**
	 * Triggered when the main control element
	 * has a mouse down event.
	 *
	 * @param {object} e
	 * @return {boolean}
	 */
	onMouseDown: function(e) {
		var self = this;
		var defaultPrevented = e.isDefaultPrevented();

		if (self.isFocused) {
			// retain focus by preventing native handling. if the
			// event target is the input it should not be modified.
			// otherwise, text selection within the input won't work.
			if (e.target !== self.$controlInput[0]) {
				if (self.settings.mode === 'single') {
					// toggle dropdown
					if (self.isOpen)
					  self.close();
					else
					  self.open();
				} else if (!defaultPrevented) {
					self.setActiveItem(null);
				}
				return false
			}
		} else {
			// give control focus
			if (!defaultPrevented) {
				window.setTimeout(function() {
					self.focus();
				}, 0);
			}
		}
	},

	/**
	 * Triggered when the value of the control has been changed.
	 * This should propagate the event to the original DOM
	 * input / select element.
	 */
	onChange: function() {
		this.$input.trigger('change');
	},

	/**
	 * Triggered on <input> paste.
	 *
	 * @param {object} e
	 * @returns {boolean}
	 */
	onPaste: function(e) {
		var self = this;

		if (self.isFull() || self.isInputHidden || self.isLocked) {
			e.preventDefault();
			return;
		}

		// If a regex or string is included, this will split the pasted
		// input and create Items for each separate value
		if (self.settings.splitOn) {

			// Wait for pasted text to be recognized in value
			setTimeout(function() {
				var pastedText = self.$controlInput.val();
				if(!pastedText.match(self.settings.splitOn)){ return }

				var splitInput = $.trim(pastedText).split(self.settings.splitOn);
				for (var i = 0, n = splitInput.length; i < n; i++) {
					self.createItem(splitInput[i]);
				}
			}, 0);
		}
	},

	/**
	 * Triggered on <input> keypress.
	 *
	 * @param {object} e
	 * @returns {boolean}
	 */
	onKeyPress: function(e) {
		if (this.isLocked) return e && e.preventDefault();
		var character = String.fromCharCode(e.keyCode || e.which);
		if (this.settings.create && this.settings.mode === 'multi' && character === this.settings.delimiter) {
			this.createItem();
			e.preventDefault();
			return false;
		}
	},

	/**
	 * Triggered on <input> keydown.
	 *
	 * @param {object} e
	 * @returns {boolean}
	 */
	onKeyDown: function(e) {
		var self = this;

		if (self.isLocked) {
			if (e.keyCode !== KEY_TAB) {
				e.preventDefault();
			}
			return;
		}

		switch (e.keyCode) {
			case KEY_A:
				if (self.isCmdDown) {
					self.selectAll();
					return;
				}
				break;
			case KEY_ESC:
				if (self.isOpen) {
					e.preventDefault();
					e.stopPropagation();
					self.close();
				}
				return;
			case KEY_N:
				if (!e.ctrlKey || e.altKey) break;
			case KEY_DOWN:
				if (!self.isOpen && self.hasOptions) {
					self.open();
				} else if (self.$activeOption) {
					self.ignoreHover = true;
					var $next = self.getAdjacentOption(self.$activeOption, 1);
					if ($next.length) self.setActiveOption($next, true, true);
				}
				e.preventDefault();
				return;
			case KEY_P:
				if (!e.ctrlKey || e.altKey) break;
			case KEY_UP:
				if (self.$activeOption) {
					self.ignoreHover = true;
					var $prev = self.getAdjacentOption(self.$activeOption, -1);
					if ($prev.length) self.setActiveOption($prev, true, true);
				}
				e.preventDefault();
				return;
			case KEY_RETURN:
				if (self.isOpen && self.$activeOption) {
					self.onOptionSelect({currentTarget: self.$activeOption});
					e.preventDefault();
				}
				return;
			case KEY_LEFT:
				self.advanceSelection(-1, e);
				return;
			case KEY_RIGHT:
				self.advanceSelection(1, e);
				return;
			case KEY_TAB:
				if (self.settings.selectOnTab && self.isOpen && self.$activeOption) {
					self.onOptionSelect({currentTarget: self.$activeOption});

					// Default behaviour is to jump to the next field, we only want this
					// if the current field doesn't accept any more entries
					if (!self.isFull()) {
						e.preventDefault();
					}
				}
				if (self.settings.create && self.createItem()) {
					e.preventDefault();
				}
				return;
			case KEY_BACKSPACE:
			case KEY_DELETE:
				self.deleteSelection(e);
				return;
		}

		if ((self.isFull() || self.isInputHidden) && !(IS_MAC ? e.metaKey : e.ctrlKey)) {
			e.preventDefault();
			return;
		}
	},

	/**
	 * Triggered on <input> keyup.
	 *
	 * @param {object} e
	 * @returns {boolean}
	 */
	onKeyUp: function(e) {
		var self = this;

		if (self.isLocked) return e && e.preventDefault();
		var value = self.$controlInput.val() || '';
		if (self.lastValue !== value) {
			self.lastValue = value;
			self.onSearchChange(value);
			self.refreshOptions();
			self.trigger('type', value);
		}
	},

	/**
	 * Invokes the user-provide option provider / loader.
	 *
	 * Note: this function is debounced in the Selectize
	 * constructor (by `settings.loadThrottle` milliseconds)
	 *
	 * @param {string} value
	 */
	onSearchChange: function(value) {
		var self = this;
		var fn = self.settings.load;
		if (!fn) return;
		if (self.loadedSearches.hasOwnProperty(value)) return;
		self.loadedSearches[value] = true;
		self.load(function(callback) {
			fn.apply(self, [value, callback]);
		});
	},

	/**
	 * Triggered on <input> focus.
	 *
	 * @param {object} e (optional)
	 * @returns {boolean}
	 */
	onFocus: function(e) {
		var self = this;
		var wasFocused = self.isFocused;

		if (self.isDisabled) {
			self.blur();
			if (e) e.preventDefault();
			return false;
		}

		if (self.ignoreFocus) return;
		self.isFocused = true;
		if (self.settings.preload === 'focus') self.onSearchChange('');

		if (!wasFocused) self.trigger('focus');

		if (!self.$activeItems.length) {
			self.showInput();
			self.setActiveItem(null);
			self.refreshOptions(!!self.settings.openOnFocus);
		}

		self.refreshState();
	},

	/**
	 * Triggered on <input> blur.
	 *
	 * @param {object} e
	 * @param {Element} dest
	 */
	onBlur: function(e, dest) {
		var self = this;
		if (!self.isFocused) return;
		self.isFocused = false;

		if (self.ignoreFocus) {
			return;
		} else if (!self.ignoreBlur && document.activeElement === self.$dropdownContent[0]) {
			// necessary to prevent IE closing the dropdown when the scrollbar is clicked
			self.ignoreBlur = true;
			self.onFocus(e);
			return;
		}

		var deactivate = function() {
			self.close();
			self.setTextboxValue('');
			self.setActiveItem(null);
			self.setActiveOption(null);
			self.setCaret(self.items.length);
			self.refreshState();

			// IE11 bug: element still marked as active
			if (dest && dest.focus) dest.focus();

			self.ignoreFocus = false;
			self.trigger('blur');
		};

		self.ignoreFocus = true;
		if (self.settings.create && self.settings.createOnBlur) {
			self.createItem(null, false, deactivate);
		} else {
			deactivate();
		}
	},

	/**
	 * Triggered when the user rolls over
	 * an option in the autocomplete dropdown menu.
	 *
	 * @param {object} e
	 * @returns {boolean}
	 */
	onOptionHover: function(e) {
		if (this.ignoreHover) return;
		this.setActiveOption(e.currentTarget, false);
	},

	/**
	 * Triggered when the user clicks on an option
	 * in the autocomplete dropdown menu.
	 *
	 * @param {object} e
	 * @returns {boolean}
	 */
	onOptionSelect: function(e) {
		var value, $target, self = this;

		if (e.preventDefault) {
			e.preventDefault();
			e.stopPropagation();
		}

		$target = $(e.currentTarget);
		if ($target.hasClass('create')) {
			self.createItem(null, function() {
				if (self.settings.closeAfterSelect) {
					self.close();
				}
			});
		} else {
			value = $target.attr('data-value');
			if (typeof value !== 'undefined') {
				self.lastQuery = null;
				self.setTextboxValue('');
				self.addItem(value);
				if (self.settings.closeAfterSelect) {
					self.close();
				} else if (!self.settings.hideSelected && e.type && /mouse/.test(e.type)) {
					self.setActiveOption(self.getOption(value));
				}
			}
		}
	},

	/**
	 * Triggered when the user clicks on an item
	 * that has been selected.
	 *
	 * @param {object} e
	 * @returns {boolean}
	 */
	onItemSelect: function(e) {
		var self = this;

		if (self.isLocked) return;
		if (self.settings.mode === 'multi') {
			e.preventDefault();
			self.setActiveItem(e.currentTarget, e);
		}
	},

	/**
	 * Invokes the provided method that provides
	 * results to a callback---which are then added
	 * as options to the control.
	 *
	 * @param {function} fn
	 */
	load: function(fn) {
		var self = this;
		var $wrapper = self.$wrapper.addClass(self.settings.loadingClass);

		self.loading++;
		fn.apply(self, [function(results) {
			self.loading = Math.max(self.loading - 1, 0);
			if (results && results.length) {
				self.addOption(results);
				self.refreshOptions(self.isFocused && !self.isInputHidden);
			}
			if (!self.loading) {
				$wrapper.removeClass(self.settings.loadingClass);
			}
			self.trigger('load', results);
		}]);
	},

	/**
	 * Sets the input field of the control to the specified value.
	 *
	 * @param {string} value
	 */
	setTextboxValue: function(value) {
		var $input = this.$controlInput;
		var changed = $input.val() !== value;
		if (changed) {
			$input.val(value).triggerHandler('update');
			this.lastValue = value;
		}
	},

	/**
	 * Returns the value of the control. If multiple items
	 * can be selected (e.g. <select multiple>), this returns
	 * an array. If only one item can be selected, this
	 * returns a string.
	 *
	 * @returns {mixed}
	 */
	getValue: function() {
		if (this.tagType === TAG_SELECT && this.$input.attr('multiple')) {
			return this.items;
		} else {
			return this.items.join(this.settings.delimiter);
		}
	},

	/**
	 * Resets the selected items to the given value.
	 *
	 * @param {mixed} value
	 */
	setValue: function(value, silent) {
		var events = silent ? [] : ['change'];

		debounceEvents(this, events, function() {
			this.clear(silent);
			this.addItems(value, silent);
		});
	},

	/**
	 * Sets the selected item.
	 *
	 * @param {object} $item
	 * @param {object} e (optional)
	 */
	setActiveItem: function($item, e) {
		var self = this;
		var eventName;
		var i, idx, begin, end, item, swap;
		var $last;

		if (self.settings.mode === 'single') return;
		$item = $($item);

		// clear the active selection
		if (!$item.length) {
			$(self.$activeItems).removeClass('active');
			self.$activeItems = [];
			if (self.isFocused) {
				self.showInput();
			}
			return;
		}

		// modify selection
		eventName = e && e.type.toLowerCase();

		if (eventName === 'mousedown' && self.isShiftDown && self.$activeItems.length) {
			$last = self.$control.children('.active:last');
			begin = Array.prototype.indexOf.apply(self.$control[0].childNodes, [$last[0]]);
			end   = Array.prototype.indexOf.apply(self.$control[0].childNodes, [$item[0]]);
			if (begin > end) {
				swap  = begin;
				begin = end;
				end   = swap;
			}
			for (i = begin; i <= end; i++) {
				item = self.$control[0].childNodes[i];
				if (self.$activeItems.indexOf(item) === -1) {
					$(item).addClass('active');
					self.$activeItems.push(item);
				}
			}
			e.preventDefault();
		} else if ((eventName === 'mousedown' && self.isCtrlDown) || (eventName === 'keydown' && this.isShiftDown)) {
			if ($item.hasClass('active')) {
				idx = self.$activeItems.indexOf($item[0]);
				self.$activeItems.splice(idx, 1);
				$item.removeClass('active');
			} else {
				self.$activeItems.push($item.addClass('active')[0]);
			}
		} else {
			$(self.$activeItems).removeClass('active');
			self.$activeItems = [$item.addClass('active')[0]];
		}

		// ensure control has focus
		self.hideInput();
		if (!this.isFocused) {
			self.focus();
		}
	},

	/**
	 * Sets the selected item in the dropdown menu
	 * of available options.
	 *
	 * @param {object} $object
	 * @param {boolean} scroll
	 * @param {boolean} animate
	 */
	setActiveOption: function($option, scroll, animate) {
		var heightMenu, heightItem, y;
		var scrollTop, scrollBottom;
		var self = this;

		if (self.$activeOption) self.$activeOption.removeClass('active');
		self.$activeOption = null;

		$option = $($option);
		if (!$option.length) return;

		self.$activeOption = $option.addClass('active');

		if (scroll || !isSet(scroll)) {

			heightMenu   = self.$dropdownContent.height();
			heightItem   = self.$activeOption.outerHeight(true);
			scroll        = self.$dropdownContent.scrollTop() || 0;
			y             = self.$activeOption.offset().top - self.$dropdownContent.offset().top + scroll;
			scrollTop    = y;
			scrollBottom = y - heightMenu + heightItem;

			if (y + heightItem > heightMenu + scroll) {
				self.$dropdownContent.stop().animate({scrollTop: scrollBottom}, animate ? self.settings.scrollDuration : 0);
			} else if (y < scroll) {
				self.$dropdownContent.stop().animate({scrollTop: scrollTop}, animate ? self.settings.scrollDuration : 0);
			}

		}
	},

	/**
	 * Selects all items (CTRL + A).
	 */
	selectAll: function() {
		var self = this;
		if (self.settings.mode === 'single') return;

		self.$activeItems = Array.prototype.slice.apply(self.$control.children(':not(input)').addClass('active'));
		if (self.$activeItems.length) {
			self.hideInput();
			self.close();
		}
		self.focus();
	},

	/**
	 * Hides the input element out of view, while
	 * retaining its focus.
	 */
	hideInput: function() {
		var self = this;

		self.setTextboxValue('');
		self.$controlInput.css({opacity: 0, position: 'absolute', left: self.rtl ? 10000 : -10000});
		self.isInputHidden = true;
	},

	/**
	 * Restores input visibility.
	 */
	showInput: function() {
		this.$controlInput.css({opacity: 1, position: 'relative', left: 0});
		this.isInputHidden = false;
	},

	/**
	 * Gives the control focus.
	 */
	focus: function() {
		var self = this;
		if (self.isDisabled) return;

		self.ignoreFocus = true;
		self.$controlInput[0].focus();
		window.setTimeout(function() {
			self.ignoreFocus = false;
			self.onFocus();
		}, 0);
	},

	/**
	 * Forces the control out of focus.
	 *
	 * @param {Element} dest
	 */
	blur: function(dest) {
		this.$controlInput[0].blur();
		this.onBlur(null, dest);
	},

	/**
	 * Returns a function that scores an object
	 * to show how good of a match it is to the
	 * provided query.
	 *
	 * @param {string} query
	 * @param {object} options
	 * @return {function}
	 */
	getScoreFunction: function(query) {
		return this.sifter.getScoreFunction(query, this.getSearchOptions());
	},

	/**
	 * Returns search options for sifter (the system
	 * for scoring and sorting results).
	 *
	 * @see https://github.com/brianreavis/sifter.js
	 * @return {object}
	 */
	getSearchOptions: function() {
		var settings = this.settings;
		var sort = settings.sortField;
		if (typeof sort === 'string') {
			sort = [{field: sort}];
		}

		return {
			fields      : settings.searchField,
			conjunction : settings.searchConjunction,
			sort        : sort
		};
	},

	/**
	 * Searches through available options and returns
	 * a sorted array of matches.
	 *
	 * Returns an object containing:
	 *
	 *   - query {string}
	 *   - tokens {array}
	 *   - total {int}
	 *   - items {array}
	 *
	 * @param {string} query
	 * @returns {object}
	 */
	search: function(query) {
		var i, result, calculateScore;
		var self     = this;
		var settings = self.settings;
		var options  = this.getSearchOptions();

		// validate user-provided result scoring function
		if (settings.score) {
			calculateScore = self.settings.score.apply(this, [query]);
			if (typeof calculateScore !== 'function') {
				throw new Error('Selectize "score" setting must be a function that returns a function');
			}
		}

		// perform search
		if (query !== self.lastQuery) {
			self.lastQuery = query;
			result = self.sifter.search(query, $.extend(options, {score: calculateScore}));
			self.currentResults = result;
		} else {
			result = $.extend(true, {}, self.currentResults);
		}

		// filter out selected items
		if (settings.hideSelected) {
			for (i = result.items.length - 1; i >= 0; i--) {
				if (self.items.indexOf(hashKey(result.items[i].id)) !== -1) {
					result.items.splice(i, 1);
				}
			}
		}

		return result;
	},

	/**
	 * Refreshes the list of available options shown
	 * in the autocomplete dropdown menu.
	 *
	 * @param {boolean} triggerDropdown
	 */
	refreshOptions: function(triggerDropdown) {
		var i, j, k, n, groups, groupsOrder, option, optionHtml, optgroup, optgroups, html, htmlChildren, hasCreateOption;
		var $active, $activeBefore, $create;

		if (typeof triggerDropdown === 'undefined') {
			triggerDropdown = true;
		}

		var self              = this;
		var query             = $.trim(self.$controlInput.val());
		var results           = self.search(query);
		var $dropdownContent = self.$dropdownContent;
		var activeBefore     = self.$activeOption && hashKey(self.$activeOption.attr('data-value'));

		// build markup
		n = results.items.length;
		if (typeof self.settings.maxOptions === 'number') {
			n = Math.min(n, self.settings.maxOptions);
		}

		// render and group available options individually
		groups = {};
		groupsOrder = [];

		for (i = 0; i < n; i++) {
			option      = self.options[results.items[i].id];
			optionHtml = self.render('option', option);
			optgroup    = option[self.settings.optgroupField] || '';
			optgroups   = $.isArray(optgroup) ? optgroup : [optgroup];

			for (j = 0, k = optgroups && optgroups.length; j < k; j++) {
				optgroup = optgroups[j];
				if (!self.optgroups.hasOwnProperty(optgroup)) {
					optgroup = '';
				}
				if (!groups.hasOwnProperty(optgroup)) {
					groups[optgroup] = document.createDocumentFragment();
					groupsOrder.push(optgroup);
				}
				groups[optgroup].appendChild(optionHtml);
			}
		}

		// sort optgroups
		if (this.settings.lockOptgroupOrder) {
			groupsOrder.sort(function(a, b) {
				var aOrder = self.optgroups[a].$order || 0;
				var bOrder = self.optgroups[b].$order || 0;
				return aOrder - bOrder;
			});
		}

		// render optgroup headers & join groups
		html = document.createDocumentFragment();
		for (i = 0, n = groupsOrder.length; i < n; i++) {
			optgroup = groupsOrder[i];
			if (self.optgroups.hasOwnProperty(optgroup) && groups[optgroup].childNodes.length) {
				// render the optgroup header and options within it,
				// then pass it to the wrapper template
				htmlChildren = document.createDocumentFragment();
				htmlChildren.appendChild(self.render('optgroupHeader', self.optgroups[optgroup]));
				htmlChildren.appendChild(groups[optgroup]);

				html.appendChild(self.render('optgroup', $.extend({}, self.optgroups[optgroup], {
					html: domToString(htmlChildren),
					dom:  htmlChildren
				})));
			} else {
				html.appendChild(groups[optgroup]);
			}
		}

		$dropdownContent.html(html);

		// highlight matching terms inline
		if (self.settings.highlight && results.query.length && results.tokens.length) {
			$dropdownContent.removeHighlight();
			for (i = 0, n = results.tokens.length; i < n; i++) {
				highlight($dropdownContent, results.tokens[i].regex);
			}
		}

		// add "selected" class to selected options
		if (!self.settings.hideSelected) {
			for (i = 0, n = self.items.length; i < n; i++) {
				self.getOption(self.items[i]).addClass('selected');
			}
		}

		// add create option
		hasCreateOption = self.canCreate(query);
		if (hasCreateOption) {
			$dropdownContent.prepend(self.render('optionCreate', {input: query}));
			$create = $($dropdownContent[0].childNodes[0]);
		}

		// activate
		self.hasOptions = results.items.length > 0 || hasCreateOption;
		if (self.hasOptions) {
			if (results.items.length > 0) {
				$activeBefore = activeBefore && self.getOption(activeBefore);
				if ($activeBefore && $activeBefore.length) {
					$active = $activeBefore;
				} else if (self.settings.mode === 'single' && self.items.length) {
					$active = self.getOption(self.items[0]);
				}
				if (!$active || !$active.length) {
					if ($create && !self.settings.addPrecedence) {
						$active = self.getAdjacentOption($create, 1);
					} else {
						$active = $dropdownContent.find('[data-selectable]:first');
					}
				}
			} else {
				$active = $create;
			}
			self.setActiveOption($active);
			if (triggerDropdown && !self.isOpen) { self.open(); }
		} else {
			self.setActiveOption(null);
			if (triggerDropdown && self.isOpen) { self.close(); }
		}
	},

	/**
	 * Adds an available option. If it already exists,
	 * nothing will happen. Note: this does not refresh
	 * the options list dropdown (use `refreshOptions`
	 * for that).
	 *
	 * Usage:
	 *
	 *   this.addOption(data)
	 *
	 * @param {object|array} data
	 */
	addOption: function(data) {
		var i, n, value, self = this;

		if ($.isArray(data)) {
			for (i = 0, n = data.length; i < n; i++) {
				self.addOption(data[i]);
			}
			return;
		}

		if (value = self.registerOption(data)) {
			self.userOptions[value] = true;
			self.lastQuery = null;
			self.trigger('optionAdd', value, data);
		}
	},

	/**
	 * Registers an option to the pool of options.
	 *
	 * @param {object} data
	 * @return {boolean|string}
	 */
	registerOption: function(data) {
		var key = hashKey(data[this.settings.valueField]);
		if (typeof key === 'undefined' || key === null || this.options.hasOwnProperty(key)) return false;
		data.$order = data.$order || ++this.order;
		this.options[key] = data;
		return key;
	},

	/**
	 * Registers an option group to the pool of option groups.
	 *
	 * @param {object} data
	 * @return {boolean|string}
	 */
	registerOptionGroup: function(data) {
		var key = hashKey(data[this.settings.optgroupValueField]);
		if (!key) return false;

		data.$order = data.$order || ++this.order;
		this.optgroups[key] = data;
		return key;
	},

	/**
	 * Registers a new optgroup for options
	 * to be bucketed into.
	 *
	 * @param {string} id
	 * @param {object} data
	 */
	addOptionGroup: function(id, data) {
		data[this.settings.optgroupValueField] = id;
		if (id = this.registerOptionGroup(data)) {
			this.trigger('optgroupAdd', id, data);
		}
	},

	/**
	 * Removes an existing option group.
	 *
	 * @param {string} id
	 */
	removeOptionGroup: function(id) {
		if (this.optgroups.hasOwnProperty(id)) {
			delete this.optgroups[id];
			this.renderCache = {};
			this.trigger('optgroupRemove', id);
		}
	},

	/**
	 * Clears all existing option groups.
	 */
	clearOptionGroups: function() {
		this.optgroups = {};
		this.renderCache = {};
		this.trigger('optgroupClear');
	},

	/**
	 * Updates an option available for selection. If
	 * it is visible in the selected items or options
	 * dropdown, it will be re-rendered automatically.
	 *
	 * @param {string} value
	 * @param {object} data
	 */
	updateOption: function(value, data) {
		var self = this;
		var $item, $itemNew;
		var valueNew, indexItem, cacheItems, cacheOptions, orderOld;

		value     = hashKey(value);
		valueNew = hashKey(data[self.settings.valueField]);

		// sanity checks
		if (value === null) return;
		if (!self.options.hasOwnProperty(value)) return;
		if (typeof valueNew !== 'string') throw new Error('Value must be set in option data');

		orderOld = self.options[value].$order;

		// update references
		if (valueNew !== value) {
			delete self.options[value];
			indexItem = self.items.indexOf(value);
			if (indexItem !== -1) {
				self.items.splice(indexItem, 1, valueNew);
			}
		}
		data.$order = data.$order || orderOld;
		self.options[valueNew] = data;

		// invalidate render cache
		cacheItems = self.renderCache.item;
		cacheOptions = self.renderCache.option;

		if (cacheItems) {
			delete cacheItems[value];
			delete cacheItems[valueNew];
		}
		if (cacheOptions) {
			delete cacheOptions[value];
			delete cacheOptions[valueNew];
		}

		// update the item if it's selected
		if (self.items.indexOf(valueNew) !== -1) {
			$item = self.getItem(value);
			$itemNew = $(self.render('item', data));
			if ($item.hasClass('active')) $itemNew.addClass('active');
			$item.replaceWith($itemNew);
		}

		// invalidate last query because we might have updated the sortField
		self.lastQuery = null;

		// update dropdown contents
		if (self.isOpen) {
			self.refreshOptions(false);
		}
	},

	/**
	 * Removes a single option.
	 *
	 * @param {string} value
	 * @param {boolean} silent
	 */
	removeOption: function(value, silent) {
		var self = this;
		value = hashKey(value);

		var cacheItems = self.renderCache.item;
		var cacheOptions = self.renderCache.option;
		if (cacheItems) delete cacheItems[value];
		if (cacheOptions) delete cacheOptions[value];

		delete self.userOptions[value];
		delete self.options[value];
		self.lastQuery = null;
		self.trigger('optionRemove', value);
		self.removeItem(value, silent);
	},

	/**
	 * Clears all options.
	 */
	clearOptions: function() {
		var self = this;

		self.loadedSearches = {};
		self.userOptions = {};
		self.renderCache = {};
		self.options = self.sifter.items = {};
		self.lastQuery = null;
		self.trigger('optionClear');
		self.clear();
	},

	/**
	 * Returns the jQuery element of the option
	 * matching the given value.
	 *
	 * @param {string} value
	 * @returns {object}
	 */
	getOption: function(value) {
		return this.getElementWithValue(value, this.$dropdownContent.find('[data-selectable]'));
	},

	/**
	 * Returns the jQuery element of the next or
	 * previous selectable option.
	 *
	 * @param {object} $option
	 * @param {int} direction  can be 1 for next or -1 for previous
	 * @return {object}
	 */
	getAdjacentOption: function($option, direction) {
		var $options = this.$dropdown.find('[data-selectable]');
		var index    = $options.index($option) + direction;

		return index >= 0 && index < $options.length ? $options.eq(index) : $();
	},

	/**
	 * Finds the first element with a "data-value" attribute
	 * that matches the given value.
	 *
	 * @param {mixed} value
	 * @param {object} $els
	 * @return {object}
	 */
	getElementWithValue: function(value, $els) {
		value = hashKey(value);

		if (typeof value !== 'undefined' && value !== null) {
			for (var i = 0, n = $els.length; i < n; i++) {
				if ($els[i].getAttribute('data-value') === value) {
					return $($els[i]);
				}
			}
		}

		return $();
	},

	/**
	 * Returns the jQuery element of the item
	 * matching the given value.
	 *
	 * @param {string} value
	 * @returns {object}
	 */
	getItem: function(value) {
		return this.getElementWithValue(value, this.$control.children());
	},

	/**
	 * "Selects" multiple items at once. Adds them to the list
	 * at the current caret position.
	 *
	 * @param {string} value
	 * @param {boolean} silent
	 */
	addItems: function(values, silent) {
		var items = $.isArray(values) ? values : [values];
		for (var i = 0, n = items.length; i < n; i++) {
			this.isPending = (i < n - 1);
			this.addItem(items[i], silent);
		}
	},

	/**
	 * "Selects" an item. Adds it to the list
	 * at the current caret position.
	 *
	 * @param {string} value
	 * @param {boolean} silent
	 */
	addItem: function(value, silent) {
		var events = silent ? [] : ['change'];

		debounceEvents(this, events, function() {
			var $item, $option, $options;
			var self = this;
			var inputMode = self.settings.mode;
			var valueNext, wasFull;
			value = hashKey(value);

			if (self.items.indexOf(value) !== -1) {
				if (inputMode === 'single') self.close();
				return;
			}

			if (!self.options.hasOwnProperty(value)) return;
			if (inputMode === 'single') self.clear(silent);
			if (inputMode === 'multi' && self.isFull()) return;

			$item = $(self.render('item', self.options[value]));
			wasFull = self.isFull();
			self.items.splice(self.caretPos, 0, value);
			self.insertAtCaret($item);
			if (!self.isPending || (!wasFull && self.isFull())) {
				self.refreshState();
			}

			if (self.isSetup) {
				$options = self.$dropdownContent.find('[data-selectable]');

				// update menu / remove the option (if this is not one item being added as part of series)
				if (!self.isPending) {
					$option = self.getOption(value);
					valueNext = self.getAdjacentOption($option, 1).attr('data-value');
					self.refreshOptions(self.isFocused && inputMode !== 'single');
					if (valueNext) {
						self.setActiveOption(self.getOption(valueNext));
					}
				}

				// hide the menu if the maximum number of items have been selected or no options are left
				if (!$options.length || self.isFull()) {
					self.close();
				} else {
					self.positionDropdown();
				}

				self.updatePlaceholder();
				self.trigger('itemAdd', value, $item);
				self.updateOriginalInput({silent: silent});
			}
		});
	},

	/**
	 * Removes the selected item matching
	 * the provided value.
	 *
	 * @param {string} value
	 */
	removeItem: function(value, silent) {
		var self = this;
		var $item, i, idx;

		$item = (value instanceof $) ? value : self.getItem(value);
		value = hashKey($item.attr('data-value'));
		i = self.items.indexOf(value);

		if (i !== -1) {
			$item.remove();
			if ($item.hasClass('active')) {
				idx = self.$activeItems.indexOf($item[0]);
				self.$activeItems.splice(idx, 1);
			}

			self.items.splice(i, 1);
			self.lastQuery = null;
			if (!self.settings.persist && self.userOptions.hasOwnProperty(value)) {
				self.removeOption(value, silent);
			}

			if (i < self.caretPos) {
				self.setCaret(self.caretPos - 1);
			}

			self.refreshState();
			self.updatePlaceholder();
			self.updateOriginalInput({silent: silent});
			self.positionDropdown();
			self.trigger('itemRemove', value, $item);
		}
	},

	/**
	 * Invokes the `create` method provided in the
	 * selectize options that should provide the data
	 * for the new item, given the user input.
	 *
	 * Once this completes, it will be added
	 * to the item list.
	 *
	 * @param {string} value
	 * @param {boolean} [triggerDropdown]
	 * @param {function} [callback]
	 * @return {boolean}
	 */
	createItem: function(input, triggerDropdown) {
		var self  = this;
		var caret = self.caretPos;
		input = input || $.trim(self.$controlInput.val() || '');

		var callback = arguments[arguments.length - 1];
		if (typeof callback !== 'function') callback = function() {};

		if (typeof triggerDropdown !== 'boolean') {
			triggerDropdown = true;
		}

		if (!self.canCreate(input)) {
			callback();
			return false;
		}

		self.lock();

		var setup = (typeof self.settings.create === 'function') ? this.settings.create : function(input) {
			var data = {};
			data[self.settings.labelField] = input;
			data[self.settings.valueField] = input;
			return data;
		};

		var create = once(function(data) {
			self.unlock();

			if (!data || typeof data !== 'object') return callback();
			var value = hashKey(data[self.settings.valueField]);
			if (typeof value !== 'string') return callback();

			self.setTextboxValue('');
			self.addOption(data);
			self.setCaret(caret);
			self.addItem(value);
			self.refreshOptions(triggerDropdown && self.settings.mode !== 'single');
			callback(data);
		});

		var output = setup.apply(this, [input, create]);
		if (typeof output !== 'undefined') {
			create(output);
		}

		return true;
	},

	/**
	 * Re-renders the selected item lists.
	 */
	refreshItems: function() {
		this.lastQuery = null;

		if (this.isSetup) {
			this.addItem(this.items);
		}

		this.refreshState();
		this.updateOriginalInput();
	},

	/**
	 * Updates all state-dependent attributes
	 * and CSS classes.
	 */
	refreshState: function() {
		this.refreshValidityState();
		this.refreshClasses();
	},

	/**
	 * Update the `required` attribute of both input and control input.
	 *
	 * The `required` property needs to be activated on the control input
	 * for the error to be displayed at the right place. `required` also
	 * needs to be temporarily deactivated on the input since the input is
	 * hidden and can't show errors.
	 */
	refreshValidityState: function() {
		if (!this.isRequired) return false;

		var invalid = !this.items.length;

		this.isInvalid = invalid;
		this.$controlInput.prop('required', invalid);
		this.$input.prop('required', !invalid);
	},

	/**
	 * Updates all state-dependent CSS classes.
	 */
	refreshClasses: function() {
		var self     = this;
		var isFull   = self.isFull();
		var isLocked = self.isLocked;

		self.$wrapper
			.toggleClass('rtl', self.rtl);

		self.$control
			.toggleClass('focus', self.isFocused)
			.toggleClass('disabled', self.isDisabled)
			.toggleClass('required', self.isRequired)
			.toggleClass('invalid', self.isInvalid)
			.toggleClass('locked', isLocked)
			.toggleClass('full', isFull).toggleClass('not-full', !isFull)
			.toggleClass('input-active', self.isFocused && !self.isInputHidden)
			.toggleClass('dropdown-active', self.isOpen)
			.toggleClass('has-options', !$.isEmptyObject(self.options))
			.toggleClass('has-items', self.items.length > 0);

		self.$controlInput.data('grow', !isFull && !isLocked);
	},

	/**
	 * Determines whether or not more items can be added
	 * to the control without exceeding the user-defined maximum.
	 *
	 * @returns {boolean}
	 */
	isFull: function() {
		return this.settings.maxItems !== null && this.items.length >= this.settings.maxItems;
	},

	/**
	 * Refreshes the original <select> or <input>
	 * element to reflect the current state.
	 */
	updateOriginalInput: function(opts) {
		var i, n, options, label, self = this;
		opts = opts || {};

		if (self.tagType === TAG_SELECT) {
			options = [];
			for (i = 0, n = self.items.length; i < n; i++) {
				label = self.options[self.items[i]][self.settings.labelField] || '';
				options.push('<option value="' + escapeHtml(self.items[i]) + '" selected="selected">' + escapeHtml(label) + '</option>');
			}
			if (!options.length && !this.$input.attr('multiple')) {
				options.push('<option value="" selected="selected"></option>');
			}
			self.$input.html(options.join(''));
		} else {
			self.$input.val(self.getValue());
			self.$input.attr('value',self.$input.val());
		}

		if (self.isSetup) {
			if (!opts.silent) {
				self.trigger('change', self.$input.val());
			}
		}
	},

	/**
	 * Shows/hide the input placeholder depending
	 * on if there items in the list already.
	 */
	updatePlaceholder: function() {
		if (!this.settings.placeholder) return;
		var $input = this.$controlInput;

		if (this.items.length) {
			$input.removeAttr('placeholder');
		} else {
			$input.attr('placeholder', this.settings.placeholder);
		}
		$input.triggerHandler('update', {force: true});
	},

	/**
	 * Shows the autocomplete dropdown containing
	 * the available options.
	 */
	open: function() {
		var self = this;

		if (self.isLocked || self.isOpen || (self.settings.mode === 'multi' && self.isFull())) return;
		self.focus();
		self.isOpen = true;
		self.refreshState();
		self.$dropdown.css({visibility: 'hidden', display: 'block'});
		self.positionDropdown();
		self.$dropdown.css({visibility: 'visible'});
		self.trigger('dropdownOpen', self.$dropdown);
	},

	/**
	 * Closes the autocomplete dropdown menu.
	 */
	close: function() {
		var self = this;
		var trigger = self.isOpen;

		if (self.settings.mode === 'single' && self.items.length) {
			self.hideInput();
			self.$controlInput.blur(); // close keyboard on iOS
		}

		self.isOpen = false;
		self.$dropdown.hide();
		self.setActiveOption(null);
		self.refreshState();

		if (trigger) self.trigger('dropdownClose', self.$dropdown);
	},

	/**
	 * Calculates and applies the appropriate
	 * position of the dropdown.
	 */
	positionDropdown: function() {
		var $control = this.$control;
		var offset = this.settings.dropdownParent === 'body' ? $control.offset() : $control.position();
		offset.top += $control.outerHeight(true);

		this.$dropdown.css({
			width : $control.outerWidth(),
			top   : offset.top,
			left  : offset.left
		});
	},

	/**
	 * Resets / clears all selected items
	 * from the control.
	 *
	 * @param {boolean} silent
	 */
	clear: function(silent) {
		var self = this;

		if (!self.items.length) return;
		self.$control.children(':not(input)').remove();
		self.items = [];
		self.lastQuery = null;
		self.setCaret(0);
		self.setActiveItem(null);
		self.updatePlaceholder();
		self.updateOriginalInput({silent: silent});
		self.refreshState();
		self.showInput();
		self.trigger('clear');
	},

	/**
	 * A helper method for inserting an element
	 * at the current caret position.
	 *
	 * @param {object} $el
	 */
	insertAtCaret: function($el) {
		var caret = Math.min(this.caretPos, this.items.length);
		if (caret === 0) {
			this.$control.prepend($el);
		} else {
			$(this.$control[0].childNodes[caret]).before($el);
		}
		this.setCaret(caret + 1);
	},

	/**
	 * Removes the current selected item(s).
	 *
	 * @param {object} e (optional)
	 * @returns {boolean}
	 */
	deleteSelection: function(e) {
		var i, n, direction, selection, values, caret, optionSelect, $optionSelect, $tail;
		var self = this;

		direction = (e && e.keyCode === KEY_BACKSPACE) ? -1 : 1;
		selection = getSelection(self.$controlInput[0]);

		if (self.$activeOption && !self.settings.hideSelected) {
			optionSelect = self.getAdjacentOption(self.$activeOption, -1).attr('data-value');
		}

		// determine items that will be removed
		values = [];

		if (self.$activeItems.length) {
			$tail = self.$control.children('.active:' + (direction > 0 ? 'last' : 'first'));
			caret = self.$control.children(':not(input)').index($tail);
			if (direction > 0) { caret++; }

			for (i = 0, n = self.$activeItems.length; i < n; i++) {
				values.push($(self.$activeItems[i]).attr('data-value'));
			}
			if (e) {
				e.preventDefault();
				e.stopPropagation();
			}
		} else if ((self.isFocused || self.settings.mode === 'single') && self.items.length) {
			if (direction < 0 && selection.start === 0 && selection.length === 0) {
				values.push(self.items[self.caretPos - 1]);
			} else if (direction > 0 && selection.start === self.$controlInput.val().length) {
				values.push(self.items[self.caretPos]);
			}
		}

		// allow the callback to abort
		if (!values.length || (typeof self.settings.onDelete === 'function' && self.settings.onDelete.apply(self, [values]) === false)) {
			return false;
		}

		// perform removal
		if (typeof caret !== 'undefined') {
			self.setCaret(caret);
		}
		while (values.length) {
			self.removeItem(values.pop());
		}

		self.showInput();
		self.positionDropdown();
		self.refreshOptions(true);

		// select previous option
		if (optionSelect) {
			$optionSelect = self.getOption(optionSelect);
			if ($optionSelect.length) {
				self.setActiveOption($optionSelect);
			}
		}

		return true;
	},

	/**
	 * Selects the previous / next item (depending
	 * on the `direction` argument).
	 *
	 * > 0 - right
	 * < 0 - left
	 *
	 * @param {int} direction
	 * @param {object} e (optional)
	 */
	advanceSelection: function(direction, e) {
		var tail, selection, idx, valueLength, cursorAtEdge, $tail;
		var self = this;

		if (direction === 0) return;
		if (self.rtl) direction *= -1;

		tail = direction > 0 ? 'last' : 'first';
		selection = getSelection(self.$controlInput[0]);

		if (self.isFocused && !self.isInputHidden) {
			valueLength = self.$controlInput.val().length;
            cursorAtEdge = direction < 0 ? selection.start === 0 &&
              selection.length === 0 : selection.start === valueLength;

			if (cursorAtEdge && !valueLength) {
				self.advanceCaret(direction, e);
			}
		} else {
			$tail = self.$control.children('.active:' + tail);
			if ($tail.length) {
				idx = self.$control.children(':not(input)').index($tail);
				self.setActiveItem(null);
				self.setCaret(direction > 0 ? idx + 1 : idx);
			}
		}
	},

	/**
	 * Moves the caret left / right.
	 *
	 * @param {int} direction
	 * @param {object} e (optional)
	 */
	advanceCaret: function(direction, e) {
		var self = this, fn, $adj;

		if (direction === 0) return;

		fn = direction > 0 ? 'next' : 'prev';
		if (self.isShiftDown) {
			$adj = self.$controlInput[fn]();
			if ($adj.length) {
				self.hideInput();
				self.setActiveItem($adj);
				if(e) e.preventDefault();
			}
		} else {
			self.setCaret(self.caretPos + direction);
		}
	},

	/**
	 * Moves the caret to the specified index.
	 *
	 * @param {int} i
	 */
	setCaret: function(i) {
		var self = this;

		if (self.settings.mode === 'single') {
			i = self.items.length;
		} else {
			i = Math.max(0, Math.min(self.items.length, i));
		}

		if(!self.isPending) {
			// the input must be moved by leaving it in place and moving the
			// siblings, due to the fact that focus cannot be restored once lost
			// on mobile webkit devices
			var j, n, $children, $child;
			$children = self.$control.children(':not(input)');
			for (j = 0, n = $children.length; j < n; j++) {
				$child = $($children[j]).detach();
				if (j <  i) {
					self.$controlInput.before($child);
				} else {
					self.$control.append($child);
				}
			}
		}

		self.caretPos = i;
	},

	/**
	 * Disables user input on the control. Used while
	 * items are being asynchronously created.
	 */
	lock: function() {
		this.close();
		this.isLocked = true;
		this.refreshState();
	},

	/**
	 * Re-enables user input on the control.
	 */
	unlock: function() {
		this.isLocked = false;
		this.refreshState();
	},

	/**
	 * Disables user input on the control completely.
	 * While disabled, it cannot receive focus.
	 */
	disable: function() {
		var self = this;
		self.$input.prop('disabled', true);
		self.$controlInput.prop('disabled', true).prop('tabindex', -1);
		self.isDisabled = true;
		self.lock();
	},

	/**
	 * Enables the control so that it can respond
	 * to focus and user input.
	 */
	enable: function() {
		var self = this;
		self.$input.prop('disabled', false);
		self.$controlInput.prop('disabled', false).prop('tabindex', self.tabIndex);
		self.isDisabled = false;
		self.unlock();
	},

	/**
	 * Completely destroys the control and
	 * unbinds all event listeners so that it can
	 * be garbage collected.
	 */
	destroy: function() {
		var self = this;
		var eventNS = self.eventNS;
		var revertSettings = self.revertSettings;

		self.trigger('destroy');
		self.off();
		self.$wrapper.remove();
		self.$dropdown.remove();

		self.$input
			.html('')
			.append(revertSettings.$children)
			.removeAttr('tabindex')
			.removeClass('selectized')
			.attr({tabindex: revertSettings.tabindex})
			.show();

		self.$controlInput.removeData('grow');
		self.$input.removeData('selectize');

		$(window).off(eventNS);
		$(document).off(eventNS);
		$(document.body).off(eventNS);

		delete self.$input[0].selectize;
	},

	/**
	 * A helper method for rendering "item" and
	 * "option" templates, given the data.
	 *
	 * @param {string} templateName
	 * @param {object} data
	 * @returns {string}
	 */
	render: function(templateName, data) {
		var value, id;
		var html = '';
		var cache = false;
		var self = this;
		// var regexTag = /^[\t \r\n]*<([a-z][a-z0-9\-]*(?:\:[a-z][a-z0-9\-]*)?)/i;

		if (templateName === 'option' || templateName === 'item') {
			value = hashKey(data[self.settings.valueField]);
			cache = !!value;
		}

		// pull markup from cache if it exists
		if (cache) {
			if (!isSet(self.renderCache[templateName])) {
				self.renderCache[templateName] = {};
			}
			if (self.renderCache[templateName].hasOwnProperty(value)) {
				return self.renderCache[templateName][value];
			}
		}

		// render markup
		html = $(self.settings.render[templateName].apply(this, [data, escapeHtml]));

		// add mandatory attributes
		if (templateName === 'option' || templateName === 'optionCreate') {
			html.attr('data-selectable', '');
		}
		else if (templateName === 'optgroup') {
			id = data[self.settings.optgroupValueField] || '';
			html.attr('data-group', id);
		}
		if (templateName === 'option' || templateName === 'item') {
			html.attr('data-value', value || '');
		}

		// update cache
		if (cache) {
			self.renderCache[templateName][value] = html[0];
		}

		return html[0];
	},

	/**
	 * Clears the render cache for a template. If
	 * no template is given, clears all render
	 * caches.
	 *
	 * @param {string} templateName
	 */
	clearCache: function(templateName) {
		var self = this;
		if (typeof templateName === 'undefined') {
			self.renderCache = {};
		} else {
			delete self.renderCache[templateName];
		}
	},

	/**
	 * Determines whether or not to display the
	 * create item prompt, given a user input.
	 *
	 * @param {string} input
	 * @return {boolean}
	 */
	canCreate: function(input) {
		var self = this;
		if (!self.settings.create) return false;
		var filter = self.settings.createFilter;
		return input.length
            && (typeof filter !== 'function' || filter.apply(self, [input]))
			&& (typeof filter !== 'string' || new RegExp(filter).test(input))
			&& (!(filter instanceof RegExp) || filter.test(input));
	}

});

function selectize($select, optsUser) {
    var opts               = $.extend({}, defaults$1, optsUser);
    var attrData           = opts.dataAttr;
    var fieldLabel         = opts.labelField;
    var fieldValue         = opts.valueField;
    var fieldOptgroup      = opts.optgroupField;
    var fieldOptgroupLabel = opts.optgroupLabelField;
    var fieldOptgroupValue = opts.optgroupValueField;

    /**
     * Initializes selectize from a <input type="text"> element.
     *
     * @param {object} $input
     * @param {object} optsElement
     */
    var initTextbox = function($input, optsElement) {
        var i, n, values, option;

        var dataRaw = $input.attr(attrData);

        if (!dataRaw) {
            var value = $.trim($input.val() || '');
            if (!opts.allowEmptyOption && !value.length) return;
            values = value.split(opts.delimiter);
            for (i = 0, n = values.length; i < n; i++) {
                option = {};
                option[fieldLabel] = values[i];
                option[fieldValue] = values[i];
                optsElement.options.push(option);
            }
            optsElement.items = values;
        } else {
            optsElement.options = JSON.parse(dataRaw);
            for (i = 0, n = optsElement.options.length; i < n; i++) {
                optsElement.items.push(optsElement.options[i][fieldValue]);
            }
        }
    };

    /**
     * Initializes selectize from a <select> element.
     *
     * @param {object} $input
     * @param {object} optsElement
     */
    var initSelect = function($input, optsElement) {
        var i, n, tagName, $children;
        var options = optsElement.options;
        var optionsMap = {};

        var readData = function($el) {
            var data = attrData && $el.attr(attrData);
            if (typeof data === 'string' && data.length) {
                return JSON.parse(data);
            }
            return null;
        };

        var addOption = function($option, group) {
            $option = $($option);

            var value = hashKey($option.val());
            if (!value && !opts.allowEmptyOption) return;

            // if the option already exists, it's probably been
            // duplicated in another optgroup. in this case, push
            // the current group to the "optgroup" property on the
            // existing option so that it's rendered in both places.
            if (optionsMap.hasOwnProperty(value)) {
                if (group) {
                    var arr = optionsMap[value][fieldOptgroup];
                    if (!arr) {
                        optionsMap[value][fieldOptgroup] = group;
                    } else if (!$.isArray(arr)) {
                        optionsMap[value][fieldOptgroup] = [arr, group];
                    } else {
                        arr.push(group);
                    }
                }
                return;
            }

            var option            = readData($option) || {};
            option[fieldLabel]    = option[fieldLabel] || $option.text();
            option[fieldValue]    = option[fieldValue] || value;
            option[fieldOptgroup] = option[fieldOptgroup] || group;

            optionsMap[value] = option;
            options.push(option);

            if ($option.is(':selected')) {
                optsElement.items.push(value);
            }
        };

        var addGroup = function($optgroup) {
            var i, n, id, optgroup, $options;

            $optgroup = $($optgroup);
            id = $optgroup.attr('label');

            if (id) {
                optgroup = readData($optgroup) || {};
                optgroup[fieldOptgroupLabel] = id;
                optgroup[fieldOptgroupValue] = id;
                optsElement.optgroups.push(optgroup);
            }

            $options = $('option', $optgroup);
            for (i = 0, n = $options.length; i < n; i++) {
                addOption($options[i], id);
            }
        };

        optsElement.maxItems = $input.attr('multiple') ? null : 1;

        $children = $input.children();
        for (i = 0, n = $children.length; i < n; i++) {
            tagName = $children[i].tagName.toLowerCase();
            if (tagName === 'optgroup') {
                addGroup($children[i]);
            } else if (tagName === 'option') {
                addOption($children[i]);
            }
        }
    };

    return $select.each(function() {
        if (this.selectize) return;

        var instance;
        var $input = $(this);
        var tagName = this.tagName.toLowerCase();
        var placeholder = $input.attr('placeholder') || $input.attr('data-placeholder');
        if (!placeholder && !opts.allowEmptyOption) {
            placeholder = $input.children('option[value=""]').text();
        }

        var optsElement = {
            'placeholder' : placeholder,
            'options'     : [],
            'optgroups'   : [],
            'items'       : []
        };

        if (tagName === 'select') {
            initSelect($input, optsElement);
        } else {
            initTextbox($input, optsElement);
        }

        instance = new Selectize($input, $.extend(true, {}, defaults$1, optsElement, optsUser));
    });
}

// templates/controls/select.pug
var html$3 = "\n<select class=\"{invalid: errorMessage, valid: valid}\" id=\"{ input.name }\" style=\"display: none;\" name=\"{ name || input.name }\" onchange=\"{ change }\" onblur=\"{ change }\" placeholder=\"{ placeholder }\"></select>\n<yield></yield>";

// src/controls/select.coffee
var Select;
var coolDown;
var isABrokenBrowser;
var extend$6 = function(child, parent) { for (var key in parent) { if (hasProp$6.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$6 = {}.hasOwnProperty;

isABrokenBrowser = window.navigator.userAgent.indexOf('MSIE') > 0 || window.navigator.userAgent.indexOf('Trident') > 0;

coolDown = -1;

var Select$1 = Select = (function(superClass) {
  extend$6(Select, superClass);

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
var i$1;
var j;
var opts;
var extend$8 = function(child, parent) { for (var key in parent) { if (hasProp$7.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$7 = {}.hasOwnProperty;

opts = {};

for (i$1 = j = 1; j < 100; i$1 = ++j) {
  opts[i$1] = i$1;
}

var QuantitySelect$1 = QuantitySelect = (function(superClass) {
  extend$8(QuantitySelect, superClass);

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
var extend$9 = function(child, parent) { for (var key in parent) { if (hasProp$8.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$8 = {}.hasOwnProperty;

var CountrySelect$1 = CountrySelect = (function(superClass) {
  extend$9(CountrySelect, superClass);

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
var extend$10 = function(child, parent) { for (var key in parent) { if (hasProp$9.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$9 = {}.hasOwnProperty;

var Select$2 = StateSelect = (function(superClass) {
  extend$10(StateSelect, superClass);

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
var extend$11 = function(child, parent) { for (var key in parent) { if (hasProp$10.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$10 = {}.hasOwnProperty;

var UserEmail = UserName = (function(superClass) {
  extend$11(UserName, superClass);

  function UserName() {
    return UserName.__super__.constructor.apply(this, arguments);
  }

  UserName.prototype.tag = 'user-name';

  UserName.prototype.lookup = 'user.name';

  return UserName;

})(Text$1);

// src/controls/user-name.coffee
var UserEmail$1;
var extend$12 = function(child, parent) { for (var key in parent) { if (hasProp$11.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$11 = {}.hasOwnProperty;

var UserName$1 = UserEmail$1 = (function(superClass) {
  extend$12(UserEmail, superClass);

  function UserEmail() {
    return UserEmail.__super__.constructor.apply(this, arguments);
  }

  UserEmail.prototype.tag = 'user-email';

  UserEmail.prototype.lookup = 'user.email';

  return UserEmail;

})(Text$1);

// src/controls/user-current-password.coffee
var UserCurrentPassword;
var extend$13 = function(child, parent) { for (var key in parent) { if (hasProp$12.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$12 = {}.hasOwnProperty;

var UserCurrentPassword$1 = UserCurrentPassword = (function(superClass) {
  extend$13(UserCurrentPassword, superClass);

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
var extend$14 = function(child, parent) { for (var key in parent) { if (hasProp$13.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$13 = {}.hasOwnProperty;

var UserPassword$1 = UserPassword = (function(superClass) {
  extend$14(UserPassword, superClass);

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
var extend$15 = function(child, parent) { for (var key in parent) { if (hasProp$14.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$14 = {}.hasOwnProperty;

var UserPasswordConfirm$1 = UserPasswordConfirm = (function(superClass) {
  extend$15(UserPasswordConfirm, superClass);

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
var extend$16 = function(child, parent) { for (var key in parent) { if (hasProp$15.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$15 = {}.hasOwnProperty;

var ShippingAddressName$1 = ShippingAddressName = (function(superClass) {
  extend$16(ShippingAddressName, superClass);

  function ShippingAddressName() {
    return ShippingAddressName.__super__.constructor.apply(this, arguments);
  }

  ShippingAddressName.prototype.tag = 'shippingaddress-name';

  ShippingAddressName.prototype.lookup = 'order.shippingAddress.name';

  return ShippingAddressName;

})(Text$1);

// src/controls/shippingaddress-line1.coffee
var ShippingAddressLine1;
var extend$17 = function(child, parent) { for (var key in parent) { if (hasProp$16.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$16 = {}.hasOwnProperty;

var ShippingAddressLine1$1 = ShippingAddressLine1 = (function(superClass) {
  extend$17(ShippingAddressLine1, superClass);

  function ShippingAddressLine1() {
    return ShippingAddressLine1.__super__.constructor.apply(this, arguments);
  }

  ShippingAddressLine1.prototype.tag = 'shippingaddress-line1';

  ShippingAddressLine1.prototype.lookup = 'order.shippingAddress.line1';

  return ShippingAddressLine1;

})(Text$1);

// src/controls/shippingaddress-line2.coffee
var ShippingAddressLine2;
var extend$18 = function(child, parent) { for (var key in parent) { if (hasProp$17.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$17 = {}.hasOwnProperty;

var ShippingAddressLine2$1 = ShippingAddressLine2 = (function(superClass) {
  extend$18(ShippingAddressLine2, superClass);

  function ShippingAddressLine2() {
    return ShippingAddressLine2.__super__.constructor.apply(this, arguments);
  }

  ShippingAddressLine2.prototype.tag = 'shippingaddress-line2';

  ShippingAddressLine2.prototype.lookup = 'order.shippingAddress.line2';

  return ShippingAddressLine2;

})(Text$1);

// src/controls/shippingaddress-city.coffee
var ShippingAddressCity;
var extend$19 = function(child, parent) { for (var key in parent) { if (hasProp$18.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$18 = {}.hasOwnProperty;

var ShippingAddressCity$1 = ShippingAddressCity = (function(superClass) {
  extend$19(ShippingAddressCity, superClass);

  function ShippingAddressCity() {
    return ShippingAddressCity.__super__.constructor.apply(this, arguments);
  }

  ShippingAddressCity.prototype.tag = 'shippingaddress-city';

  ShippingAddressCity.prototype.lookup = 'order.shippingAddress.city';

  return ShippingAddressCity;

})(Text$1);

// src/controls/shippingaddress-postalcode.coffee
var ShippingAddressPostalCode;
var extend$20 = function(child, parent) { for (var key in parent) { if (hasProp$19.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$19 = {}.hasOwnProperty;

var ShippingAddressPostalCode$1 = ShippingAddressPostalCode = (function(superClass) {
  extend$20(ShippingAddressPostalCode, superClass);

  function ShippingAddressPostalCode() {
    return ShippingAddressPostalCode.__super__.constructor.apply(this, arguments);
  }

  ShippingAddressPostalCode.prototype.tag = 'shippingaddress-postalcode';

  ShippingAddressPostalCode.prototype.lookup = 'order.shippingAddress.postalCode';

  return ShippingAddressPostalCode;

})(Text$1);

// src/controls/shippingaddress-state.coffee
var ShippingAddressState;
var extend$21 = function(child, parent) { for (var key in parent) { if (hasProp$20.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$20 = {}.hasOwnProperty;

var ShippingAddressState$1 = ShippingAddressState = (function(superClass) {
  extend$21(ShippingAddressState, superClass);

  function ShippingAddressState() {
    return ShippingAddressState.__super__.constructor.apply(this, arguments);
  }

  ShippingAddressState.prototype.tag = 'shippingaddress-state';

  ShippingAddressState.prototype.lookup = 'order.shippingAddress.state';

  return ShippingAddressState;

})(Select$2);

// src/controls/shippingaddress-country.coffee
var ShippingAddressCountry;
var extend$22 = function(child, parent) { for (var key in parent) { if (hasProp$21.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$21 = {}.hasOwnProperty;

var ShippingAddressCountry$1 = ShippingAddressCountry = (function(superClass) {
  extend$22(ShippingAddressCountry, superClass);

  function ShippingAddressCountry() {
    return ShippingAddressCountry.__super__.constructor.apply(this, arguments);
  }

  ShippingAddressCountry.prototype.tag = 'shippingaddress-country';

  ShippingAddressCountry.prototype.lookup = 'order.shippingAddress.country';

  return ShippingAddressCountry;

})(CountrySelect$1);

// src/controls/card-name.coffee
var CardName;
var extend$23 = function(child, parent) { for (var key in parent) { if (hasProp$22.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$22 = {}.hasOwnProperty;

CardName = (function(superClass) {
  extend$23(CardName, superClass);

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
var extend$24 = function(child, parent) { for (var key in parent) { if (hasProp$23.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$23 = {}.hasOwnProperty;
var indexOf$2 = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

CardNumber = (function(superClass) {
  extend$24(CardNumber, superClass);

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
var extend$25 = function(child, parent) { for (var key in parent) { if (hasProp$24.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$24 = {}.hasOwnProperty;
var indexOf$3 = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

CardExpiry = (function(superClass) {
  extend$25(CardExpiry, superClass);

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
var extend$26 = function(child, parent) { for (var key in parent) { if (hasProp$25.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$25 = {}.hasOwnProperty;
var indexOf$4 = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

CardCVC = (function(superClass) {
  extend$26(CardCVC, superClass);

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
var extend$27 = function(child, parent) { for (var key in parent) { if (hasProp$26.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$26 = {}.hasOwnProperty;

var Terms$1 = Terms = (function(superClass) {
  extend$27(Terms, superClass);

  function Terms() {
    return Terms.__super__.constructor.apply(this, arguments);
  }

  Terms.prototype.tag = 'terms';

  Terms.prototype.lookup = 'terms';

  return Terms;

})(Checkbox$1);

// src/controls/gift-toggle.coffee
var GiftToggle;
var extend$28 = function(child, parent) { for (var key in parent) { if (hasProp$27.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$27 = {}.hasOwnProperty;

var GiftToggle$1 = GiftToggle = (function(superClass) {
  extend$28(GiftToggle, superClass);

  function GiftToggle() {
    return GiftToggle.__super__.constructor.apply(this, arguments);
  }

  GiftToggle.prototype.tag = 'gift-toggle';

  GiftToggle.prototype.lookup = 'order.gift';

  return GiftToggle;

})(Checkbox$1);

// src/controls/gift-type.coffee
var GiftType;
var extend$29 = function(child, parent) { for (var key in parent) { if (hasProp$28.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$28 = {}.hasOwnProperty;

GiftType = (function(superClass) {
  extend$29(GiftType, superClass);

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
var extend$30 = function(child, parent) { for (var key in parent) { if (hasProp$29.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$29 = {}.hasOwnProperty;

GiftEmail = (function(superClass) {
  extend$30(GiftEmail, superClass);

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
var extend$31 = function(child, parent) { for (var key in parent) { if (hasProp$30.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$30 = {}.hasOwnProperty;

var GiftMessage$1 = GiftMessage = (function(superClass) {
  extend$31(GiftMessage, superClass);

  function GiftMessage() {
    return GiftMessage.__super__.constructor.apply(this, arguments);
  }

  GiftMessage.prototype.tag = 'gift-message';

  GiftMessage.prototype.lookup = 'order.giftMessage';

  return GiftMessage;

})(TextArea$1);

// src/controls/promocode.coffee
var PromoCode;
var extend$32 = function(child, parent) { for (var key in parent) { if (hasProp$31.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$31 = {}.hasOwnProperty;

var PromoCode$1 = PromoCode = (function(superClass) {
  extend$32(PromoCode, superClass);

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
var html$5 = "\n<form onsubmit=\"{ submit }\">\n  <yield>\n    <div if=\"{ !isEmpty() }\">\n      <div class=\"contact checkout-section\">\n        <h2>Contact</h2>\n        <div class=\"fields\">\n          <user-name class=\"input\" placeholder=\"Name\"></user-name>\n          <user-email class=\"input\" placeholder=\"Email\"></user-email>\n        </div>\n      </div>\n      <div class=\"payment checkout-section\">\n        <h2>Payment</h2><span class=\"secured-text\">SSL Secure<span>Checkout</span><img class=\"lock-icon\" src=\"/img/lock-icon.svg\"></span>\n        <div class=\"fields\">\n          <card-name class=\"input\" placeholder=\"Name on Card\"></card-name>\n          <card-number class=\"input\" name=\"number\" placeholder=\"Card Number\">\n            <div class=\"cards-accepted\"><img class=\"card-logo amex-logo\" src=\"/img/card-logos/amex.svg\"><img class=\"card-logo visa-logo\" src=\"/img/card-logos/visa.svg\"><img class=\"card-logo discover-logo\" src=\"/img/card-logos/discover.svg\"><img class=\"card-logo jcb-logo\" src=\"/img/card-logos/jcb.svg\"><img class=\"card-logo mastercard-logo\" src=\"img/card-logos/mastercard.svg\"><a class=\"stripe-link\" href=\"//www.stripe.com\" target=\"_blank\"><img class=\"stripe-logo\" src=\"/img/stripelogo.png\"></a></div>\n          </card-number>\n          <card-expiry class=\"input\" name=\"expiry\" placeholder=\"MM / YY\"></card-expiry>\n          <card-cvc class=\"input\" name=\"cvc\" placeholder=\"CVC\"></card-cvc>\n        </div>\n      </div>\n      <div class=\"shipping checkout-section\">\n        <h2>Shipping</h2>\n        <div class=\"fields\">\n          <shippingaddress-name class=\"input\" placeholder=\"Recipient\"></shippingaddress-name>\n          <shippingaddress-line1 class=\"input\" placeholder=\"Address\"></shippingaddress-line1>\n          <shippingaddress-line2 class=\"input\" placeholder=\"Suite\"></shippingaddress-line2>\n        </div>\n        <div class=\"fields\">\n          <shippingaddress-city class=\"input\" placeholder=\"City\"></shippingaddress-city>\n          <shippingaddress-postalcode class=\"input\" placeholder=\"Postal Code\"></shippingaddress-postalcode>\n        </div>\n        <div class=\"fields\">\n          <shippingaddress-state class=\"input\" placeholder=\"State\"></shippingaddress-state>\n          <shippingaddress-country class=\"input\" placeholder=\"Country\"></shippingaddress-country>\n        </div>\n      </div>\n      <div class=\"complete checkout-section\">\n        <h2>Complete Checkout</h2>\n        <terms>\n          <label for=\"terms\">I have read and accept the&nbsp;<a href=\"{ termsUrl }\" target=\"_blank\">terms and conditions</a></label>\n        </terms>\n        <button class=\"{ loading: loading || checkedOut }\" disabled=\"{ loading || checkedOut }\" type=\"submit\"><span>Checkout</span></button>\n        <div class=\"error\" if=\"{ errorMessage }\">{ errorMessage }</div>\n      </div>\n    </div>\n  </yield>\n</form>";

// src/forms/checkout.coffee
var CheckoutForm;
var extend$33 = function(child, parent) { for (var key in parent) { if (hasProp$32.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$32 = {}.hasOwnProperty;

CheckoutForm = (function(superClass) {
  extend$33(CheckoutForm, superClass);

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
        return El$1.scheduleUpdate();
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
    El$1.scheduleUpdate();
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
        El$1.scheduleUpdate();
        return _this.cart.checkout().then(function(pRef) {
          return pRef.p.then(function() {
            var hasErrored;
            hasErrored = false;
            setTimeout(function() {
              if (!hasErrored) {
                _this.loading = false;
                index$1.clear();
                _this.checkedOut = true;
                return El$1.scheduleUpdate();
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
            return El$1.scheduleUpdate();
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
          return El$1.scheduleUpdate();
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
        return El$1.scheduleUpdate();
      };
    })(this));
  };

  return CheckoutForm;

})(El$1.Form);

var Checkout = CheckoutForm;

// templates/forms/checkout-card.pug
var html$6 = "\n<form onsubmit=\"{ submit }\">\n  <yield></yield>\n</form>";

// src/forms/checkout-card.coffee
var CheckoutCardForm;
var extend$34 = function(child, parent) { for (var key in parent) { if (hasProp$33.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$33 = {}.hasOwnProperty;

CheckoutCardForm = (function(superClass) {
  extend$34(CheckoutCardForm, superClass);

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
      index$1.set('checkout-user', this.data.get('user'));
      index$1.set('checkout-payment', this.data.get('order.payment'));
    }
    return this.scheduleUpdate();
  };

  return CheckoutCardForm;

})(El$1.Form);

var CheckoutCard = CheckoutCardForm;

// node_modules/riot/lib/browser/common/global-variables.js
const __TAGS_CACHE$1 = [];
const __TAG_IMPL$1 = {};
const GLOBAL_MIXIN$1 = '__global_mixin';
const ATTRS_PREFIX$1 = 'riot-';
const REF_DIRECTIVES$1 = ['ref', 'data-ref'];
const IS_DIRECTIVE$1 = 'data-is';
const CONDITIONAL_DIRECTIVE$1 = 'if';
const LOOP_DIRECTIVE$1 = 'each';
const LOOP_NO_REORDER_DIRECTIVE$1 = 'no-reorder';
const SHOW_DIRECTIVE$1 = 'show';
const HIDE_DIRECTIVE$1 = 'hide';
const T_STRING$1 = 'string';
const T_OBJECT$1 = 'object';
const T_UNDEF$1  = 'undefined';
const T_FUNCTION$1 = 'function';
const XLINK_NS$1 = 'http://www.w3.org/1999/xlink';
const XLINK_REGEX$1 = /^xlink:(\w+)/;
const WIN$1 = typeof window === T_UNDEF$1 ? undefined : window;
const RE_SPECIAL_TAGS$1 = /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?|opt(?:ion|group))$/;
const RE_SPECIAL_TAGS_NO_OPTION$1 = /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?)$/;
const RE_RESERVED_NAMES$1 = /^(?:_(?:item|id|parent)|update|root|(?:un)?mount|mixin|is(?:Mounted|Loop)|tags|refs|parent|opts|trigger|o(?:n|ff|ne))$/;
const RE_HTML_ATTRS$1 = /([-\w]+) ?= ?(?:"([^"]*)|'([^']*)|({[^}]*}))/g;
const CASE_SENSITIVE_ATTRIBUTES$1 = { 'viewbox': 'viewBox' };
const RE_BOOL_ATTRS$1 = /^(?:disabled|checked|readonly|required|allowfullscreen|auto(?:focus|play)|compact|controls|default|formnovalidate|hidden|ismap|itemscope|loop|multiple|muted|no(?:resize|shade|validate|wrap)?|open|reversed|seamless|selected|sortable|truespeed|typemustmatch)$/;
const IE_VERSION$1 = (WIN$1 && WIN$1.document || {}).documentMode | 0;

// node_modules/riot/lib/browser/common/util/check.js
/**
 * Check Check if the passed argument is undefined
 * @param   { String } value -
 * @returns { Boolean } -
 */
function isBoolAttr$1(value) {
  return RE_BOOL_ATTRS$1.test(value)
}

/**
 * Check if passed argument is a function
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isFunction$3(value) {
  return typeof value === T_FUNCTION$1
}

/**
 * Check if passed argument is an object, exclude null
 * NOTE: use isObject(x) && !isArray(x) to excludes arrays.
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isObject$3(value) {
  return value && typeof value === T_OBJECT$1 // typeof null is 'object'
}

/**
 * Check if passed argument is undefined
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isUndefined$2(value) {
  return typeof value === T_UNDEF$1
}

/**
 * Check if passed argument is a string
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isString$2(value) {
  return typeof value === T_STRING$1
}

/**
 * Check if passed argument is empty. Different from falsy, because we dont consider 0 or false to be blank
 * @param { * } value -
 * @returns { Boolean } -
 */
function isBlank$1(value) {
  return isUndefined$2(value) || value === null || value === ''
}

/**
 * Check if passed argument is a kind of array
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isArray$4(value) {
  return Array.isArray(value) || value instanceof Array
}

/**
 * Check whether object's property could be overridden
 * @param   { Object }  obj - source object
 * @param   { String }  key - object property
 * @returns { Boolean } -
 */
function isWritable$1(obj, key) {
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  return isUndefined$2(obj[key]) || descriptor && descriptor.writable
}

/**
 * Check if passed argument is a reserved name
 * @param   { String } value -
 * @returns { Boolean } -
 */
function isReservedName$1(value) {
  return RE_RESERVED_NAMES$1.test(value)
}

var check$1 = {
	isBoolAttr: isBoolAttr$1,
	isFunction: isFunction$3,
	isObject: isObject$3,
	isUndefined: isUndefined$2,
	isString: isString$2,
	isBlank: isBlank$1,
	isArray: isArray$4,
	isWritable: isWritable$1,
	isReservedName: isReservedName$1
};

// node_modules/riot/lib/browser/common/util/dom.js
/**
 * Shorter and fast way to select multiple nodes in the DOM
 * @param   { String } selector - DOM selector
 * @param   { Object } ctx - DOM node where the targets of our search will is located
 * @returns { Object } dom nodes found
 */
function $$$1(selector, ctx) {
  return (ctx || document).querySelectorAll(selector)
}

/**
 * Shorter and fast way to select a single node in the DOM
 * @param   { String } selector - unique dom selector
 * @param   { Object } ctx - DOM node where the target of our search will is located
 * @returns { Object } dom node found
 */
function $$2(selector, ctx) {
  return (ctx || document).querySelector(selector)
}

/**
 * Create a document fragment
 * @returns { Object } document fragment
 */
function createFrag$1() {
  return document.createDocumentFragment()
}

/**
 * Create a document text node
 * @returns { Object } create a text node to use as placeholder
 */
function createDOMPlaceholder$1() {
  return document.createTextNode('')
}

/**
 * Create a generic DOM node
 * @param   { String } name - name of the DOM node we want to create
 * @returns { Object } DOM node just created
 */
function mkEl$1(name) {
  return document.createElement(name)
}

/**
 * Set the inner html of any DOM node SVGs included
 * @param { Object } container - DOM node where we'll inject new html
 * @param { String } html - html to inject
 */
/* istanbul ignore next */
function setInnerHTML$1(container, html) {
  if (!isUndefined$2(container.innerHTML))
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
function remAttr$1(dom, name) {
  dom.removeAttribute(name);
}

/**
 * Get the value of any DOM attribute on a node
 * @param   { Object } dom - DOM node we want to parse
 * @param   { String } name - name of the attribute we want to get
 * @returns { String | undefined } name of the node attribute whether it exists
 */
function getAttr$1(dom, name) {
  return dom.getAttribute(name)
}

/**
 * Set any DOM attribute
 * @param { Object } dom - DOM node we want to update
 * @param { String } name - name of the property we want to set
 * @param { String } val - value of the property we want to set
 */
function setAttr$1(dom, name, val) {
  var xlink = XLINK_REGEX$1.exec(name);
  if (xlink && xlink[1])
    dom.setAttributeNS(XLINK_NS$1, xlink[1], val);
  else
    dom.setAttribute(name, val);
}

/**
 * Insert safely a tag to fix #1962 #1649
 * @param   { HTMLElement } root - children container
 * @param   { HTMLElement } curr - node to insert
 * @param   { HTMLElement } next - node that should preceed the current node inserted
 */
function safeInsert$1(root, curr, next) {
  root.insertBefore(curr, next.parentNode && next);
}

/**
 * Minimize risk: only zero or one _space_ between attr & value
 * @param   { String }   html - html string we want to parse
 * @param   { Function } fn - callback function to apply on any attribute found
 */
function walkAttrs$1(html, fn) {
  if (!html)
    return
  var m;
  while (m = RE_HTML_ATTRS$1.exec(html))
    fn(m[1].toLowerCase(), m[2] || m[3] || m[4]);
}

/**
 * Walk down recursively all the children tags starting dom node
 * @param   { Object }   dom - starting node where we will start the recursion
 * @param   { Function } fn - callback to transform the child node just found
 * @param   { Object }   context - fn can optionally return an object, which is passed to children
 */
function walkNodes$1(dom, fn, context) {
  if (dom) {
    const res = fn(dom, context);
    var next;
    // stop the recursion
    if (res === false) return

    dom = dom.firstChild;

    while (dom) {
      next = dom.nextSibling;
      walkNodes$1(dom, fn, res);
      dom = next;
    }
  }
}

var dom$1 = {
	$$: $$$1,
	$: $$2,
	createFrag: createFrag$1,
	createDOMPlaceholder: createDOMPlaceholder$1,
	mkEl: mkEl$1,
	setInnerHTML: setInnerHTML$1,
	remAttr: remAttr$1,
	getAttr: getAttr$1,
	setAttr: setAttr$1,
	safeInsert: safeInsert$1,
	walkAttrs: walkAttrs$1,
	walkNodes: walkNodes$1
};

// node_modules/riot/lib/browser/tag/styleManager.js
var styleNode$1;
var cssTextProp$1;
var byName$1 = {};
var remainder$1 = [];
var needsInject$1 = false;

// skip the following code on the server
if (WIN$1) {
  styleNode$1 = (function () {
    // create a new style element with the correct type
    var newNode = mkEl$1('style');
    setAttr$1(newNode, 'type', 'text/css');

    // replace any user node or insert the new one into the head
    var userNode = $$2('style[type=riot]');
    /* istanbul ignore next */
    if (userNode) {
      if (userNode.id) newNode.id = userNode.id;
      userNode.parentNode.replaceChild(newNode, userNode);
    }
    else document.getElementsByTagName('head')[0].appendChild(newNode);

    return newNode
  })();
  cssTextProp$1 = styleNode$1.styleSheet;
}

/**
 * Object that will be used to inject and manage the css of every tag instance
 */
var styleManager$1 = {
  styleNode: styleNode$1,
  /**
   * Save a tag style to be later injected into DOM
   * @param { String } css - css string
   * @param { String } name - if it's passed we will map the css to a tagname
   */
  add(css, name) {
    if (name) byName$1[name] = css;
    else remainder$1.push(css);
    needsInject$1 = true;
  },
  /**
   * Inject all previously saved tag styles into DOM
   * innerHTML seems slow: http://jsperf.com/riot-insert-style
   */
  inject() {
    if (!WIN$1 || !needsInject$1) return
    needsInject$1 = false;
    var style = Object.keys(byName$1)
      .map(function(k) { return byName$1[k] })
      .concat(remainder$1).join('\n');
    /* istanbul ignore next */
    if (cssTextProp$1) cssTextProp$1.cssText = style;
    else styleNode$1.innerHTML = style;
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

var brackets$1 = (function (UNDEF) {

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

var tmpl$1 = (function () {

  var _cache = {};

  function _tmpl (str, data) {
    if (!str) return str

    return (_cache[str] || (_cache[str] = _create(str))).call(data, _logErr)
  }

  _tmpl.hasExpr = brackets$1.hasExpr;

  _tmpl.loopKeys = brackets$1.loopKeys;

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
    RE_QBLOCK = RegExp(brackets$1.S_QBLOCKS, 'g'),
    RE_DQUOTE = /\u2057/g,
    RE_QBMARK = /\u2057(\d+)~/g;

  function _getTmpl (str) {
    var
      qstr = [],
      expr,
      parts = brackets$1.split(str.replace(RE_DQUOTE, '"'), 1);

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

  _tmpl.version = brackets$1.version = 'v3.0.3';

  return _tmpl

})();

// node_modules/riot/lib/browser/common/util/misc.js
/**
 * Specialized function for looping an array-like collection with `each={}`
 * @param   { Array } list - collection of items
 * @param   {Function} fn - callback function
 * @returns { Array } the array looped
 */
function each$1(list, fn) {
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
function contains$1(array, item) {
  return array.indexOf(item) !== -1
}

/**
 * Convert a string containing dashes to camel case
 * @param   { String } str - input string
 * @returns { String } my-string -> myString
 */
function toCamel$1(str) {
  return str.replace(/-(\w)/g, (_, c) => c.toUpperCase())
}

/**
 * Faster String startsWith alternative
 * @param   { String } str - source string
 * @param   { String } value - test string
 * @returns { Boolean } -
 */
function startsWith$1(str, value) {
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
function defineProperty$1(el, key, value, options) {
  Object.defineProperty(el, key, extend$36({
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
function extend$36(src) {
  var obj, args = arguments;
  for (var i = 1; i < args.length; ++i) {
    if (obj = args[i]) {
      for (var key in obj) {
        // check if this property of the source object could be overridden
        if (isWritable$1(src, key))
          src[key] = obj[key];
      }
    }
  }
  return src
}

var misc$1 = {
	each: each$1,
	contains: contains$1,
	toCamel: toCamel$1,
	startsWith: startsWith$1,
	defineProperty: defineProperty$1,
	extend: extend$36
};

// node_modules/riot/lib/settings.js
var settings$2 = extend$36(Object.create(brackets$1.settings), {
  skipAnonymousTags: true
});

// node_modules/riot/lib/browser/tag/setEventHandler.js
const EVENTS_PREFIX_REGEX$1 = /^on/;

/**
 * Trigger DOM events
 * @param   { HTMLElement } dom - dom element target of the event
 * @param   { Function } handler - user function
 * @param   { Object } e - event object
 */
function handleEvent$1(dom, handler, e) {
  var ptag = this.__.parent,
    item = this.__.item;

  if (!item)
    while (ptag && !item) {
      item = ptag.__.item;
      ptag = ptag.__.parent;
    }

  // override the event properties
  /* istanbul ignore next */
  if (isWritable$1(e, 'currentTarget')) e.currentTarget = dom;
  /* istanbul ignore next */
  if (isWritable$1(e, 'target')) e.target = e.srcElement;
  /* istanbul ignore next */
  if (isWritable$1(e, 'which')) e.which = e.charCode || e.keyCode;

  e.item = item;

  handler.call(this, e);

  if (!e.preventUpdate) {
    var p = getImmediateCustomParentTag$1(this);
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
function setEventHandler$1(name, handler, dom, tag) {
  var eventName,
    cb = handleEvent$1.bind(tag, dom, handler);

  // avoid to bind twice the same event
  dom[name] = null;

  // normalize event name
  eventName = name.replace(EVENTS_PREFIX_REGEX$1, '');

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
function updateDataIs$1(expr, parent) {
  var tagName = tmpl$1(expr.value, parent),
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
      ref = createDOMPlaceholder$1();
      head.parentNode.insertBefore(ref, head);
    }

    expr.tag.unmount(true);
  }

  expr.impl = __TAG_IMPL$1[tagName];
  conf = {root: expr.dom, parent: parent, hasImpl: true, tagName: tagName};
  expr.tag = initChildTag$1(expr.impl, conf, expr.dom.innerHTML, parent);
  each$1(expr.attrs, a => setAttr$1(expr.tag.root, a.name, a.value));
  expr.tagName = tagName;
  expr.tag.mount();
  if (isVirtual)
    makeReplaceVirtual$1(expr.tag, ref || expr.tag.root); // root exist first time, after use placeholder

  // parent is the placeholder tag, not the dynamic tag so clean up
  parent.__.onUnmount = function() {
    var delName = expr.tag.opts.dataIs,
      tags = expr.tag.parent.tags,
      _tags = expr.tag.__.parent.tags;
    arrayishRemove$1(tags, delName, expr.tag);
    arrayishRemove$1(_tags, delName, expr.tag);
    expr.tag.unmount();
  };
}

/**
 * Update on single tag expression
 * @this Tag
 * @param { Object } expr - expression logic
 * @returns { undefined }
 */
function updateExpression$1(expr) {
  if (this.root && getAttr$1(this.root,'virtualized')) return

  var dom = expr.dom,
    attrName = expr.attr,
    isToggle = contains$1([SHOW_DIRECTIVE$1, HIDE_DIRECTIVE$1], attrName),
    value = tmpl$1(expr.expr, this),
    isValueAttr = attrName === 'riot-value',
    isVirtual = expr.root && expr.root.tagName === 'VIRTUAL',
    parent = dom && (expr.parent || dom.parentNode),
    old;

  if (expr.bool)
    value = value ? attrName : false;
  else if (isUndefined$2(value) || value === null)
    value = '';

  if (expr._riot_id) { // if it's a tag
    if (expr.isMounted) {
      expr.update();

    // if it hasn't been mounted yet, do that now.
    } else {
      expr.mount();

      if (isVirtual)
        makeReplaceVirtual$1(expr, expr.root);

    }
    return
  }

  old = expr.value;
  expr.value = value;

  if (expr.update) {
    expr.update();
    return
  }

  if (expr.isRtag && value) return updateDataIs$1(expr, this)
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
        if (!IE_VERSION$1) dom.nodeValue = value;  // #1625 IE throws here, nodeValue
      }                                         // will be available on 'updated'
      else dom.nodeValue = value;
    }
    return
  }

  // remove original attribute
  if (!expr.isAttrRemoved || !value) {
    remAttr$1(dom, attrName);
    expr.isAttrRemoved = true;
  }

  // event handler
  if (isFunction$3(value)) {
    setEventHandler$1(attrName, value, dom, this);
  // show / hide
  } else if (isToggle) {
    if (attrName === HIDE_DIRECTIVE$1) value = !value;
    dom.style.display = value ? '' : 'none';
  // field value
  } else if (isValueAttr) {
    dom.value = value;
  // <img src="{ expr }">
  } else if (startsWith$1(attrName, ATTRS_PREFIX$1) && attrName !== IS_DIRECTIVE$1) {
    attrName = attrName.slice(ATTRS_PREFIX$1.length);
    if (CASE_SENSITIVE_ATTRIBUTES$1[attrName])
      attrName = CASE_SENSITIVE_ATTRIBUTES$1[attrName];
    if (value != null)
      setAttr$1(dom, attrName, value);
  } else {
    if (expr.bool) {
      dom[attrName] = value;
      if (!value) return
    }

    if (value === 0 || value && typeof value !== T_OBJECT$1) {
      setAttr$1(dom, attrName, value);
    }
  }
}

/**
 * Update all the expressions in a Tag instance
 * @this Tag
 * @param { Array } expressions - expression that must be re evaluated
 */
function updateAllExpressions$1(expressions) {
  each$1(expressions, updateExpression$1.bind(this));
}

// node_modules/riot/lib/browser/tag/if.js
var IfExpr$1 = {
  init(dom, tag, expr) {
    remAttr$1(dom, CONDITIONAL_DIRECTIVE$1);
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
    var newValue = tmpl$1(this.expr, this.tag);

    if (newValue && !this.current) { // insert
      this.current = this.pristine.cloneNode(true);
      this.stub.parentNode.insertBefore(this.current, this.stub);

      this.expressions = [];
      parseExpressions$1.apply(this.tag, [this.current, this.expressions, true]);
    } else if (!newValue && this.current) { // remove
      unmountAll$1(this.expressions);
      if (this.current._tag) {
        this.current._tag.unmount();
      } else if (this.current.parentNode)
        this.current.parentNode.removeChild(this.current);
      this.current = null;
      this.expressions = [];
    }

    if (newValue) updateAllExpressions$1.call(this.tag, this.expressions);
  },
  unmount() {
    unmountAll$1(this.expressions || []);
    delete this.pristine;
    delete this.parentNode;
    delete this.stub;
  }
};

// node_modules/riot/lib/browser/tag/ref.js
var RefExpr$1 = {
  init(dom, parent, attrName, attrValue) {
    this.dom = dom;
    this.attr = attrName;
    this.rawValue = attrValue;
    this.parent = parent;
    this.hasExp = tmpl$1.hasExpr(attrValue);
    this.firstRun = true;

    return this
  },
  update() {
    var value = this.rawValue;
    if (this.hasExp)
      value = tmpl$1(this.rawValue, this.parent);

    // if nothing changed, we're done
    if (!this.firstRun && value === this.value) return

    var customParent = this.parent && getImmediateCustomParentTag$1(this.parent);

    // if the referenced element is a custom tag, then we set the tag itself, rather than DOM
    var tagOrDom = this.tag || this.dom;

    // the name changed, so we need to remove it from the old key (if present)
    if (!isBlank$1(this.value) && customParent)
      arrayishRemove$1(customParent.refs, this.value, tagOrDom);

    if (isBlank$1(value)) {
      // if the value is blank, we remove it
      remAttr$1(this.dom, this.attr);
    } else {
      // add it to the refs of parent tag (this behavior was changed >=3.0)
      if (customParent) arrayishAdd$1(
        customParent.refs,
        value,
        tagOrDom,
        // use an array if it's a looped node and the ref is not an expression
        null,
        this.parent.__.index
      );
      // set the actual DOM attr
      setAttr$1(this.dom, this.attr, value);
    }

    this.value = value;
    this.firstRun = false;
  },
  unmount() {
    var tagOrDom = this.tag || this.dom;
    var customParent = this.parent && getImmediateCustomParentTag$1(this.parent);
    if (!isBlank$1(this.value) && customParent)
      arrayishRemove$1(customParent.refs, this.value, tagOrDom);
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
function mkitem$1(expr, key, val, base) {
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
function unmountRedundant$1(items, tags) {
  var i = tags.length,
    j = items.length;

  while (i > j) {
    i--;
    remove$1.apply(tags[i], [tags, i]);
  }
}


/**
 * Remove a child tag
 * @this Tag
 * @param   { Array } tags - tags collection
 * @param   { Number } i - index of the tag to remove
 */
function remove$1(tags, i) {
  tags.splice(i, 1);
  this.unmount();
  arrayishRemove$1(this.parent, this, this.__.tagName, true);
}

/**
 * Move the nested custom tags in non custom loop tags
 * @this Tag
 * @param   { Number } i - current position of the loop tag
 */
function moveNestedTags$1(i) {
  each$1(Object.keys(this.tags), (tagName) => {
    moveChildTag$1.apply(this.tags[tagName], [tagName, i]);
  });
}

/**
 * Move a child tag
 * @this Tag
 * @param   { HTMLElement } root - dom node containing all the loop children
 * @param   { Tag } nextTag - instance of the next tag preceding the one we want to move
 * @param   { Boolean } isVirtual - is it a virtual tag?
 */
function move$1(root, nextTag, isVirtual) {
  if (isVirtual)
    moveVirtual$1.apply(this, [root, nextTag]);
  else
    safeInsert$1(root, this.root, nextTag.root);
}

/**
 * Insert and mount a child tag
 * @this Tag
 * @param   { HTMLElement } root - dom node containing all the loop children
 * @param   { Tag } nextTag - instance of the next tag preceding the one we want to insert
 * @param   { Boolean } isVirtual - is it a virtual tag?
 */
function insert$1(root, nextTag, isVirtual) {
  if (isVirtual)
    makeVirtual$1.apply(this, [root, nextTag]);
  else
    safeInsert$1(root, this.root, nextTag.root);
}

/**
 * Append a new tag into the DOM
 * @this Tag
 * @param   { HTMLElement } root - dom node containing all the loop children
 * @param   { Boolean } isVirtual - is it a virtual tag?
 */
function append$1(root, isVirtual) {
  if (isVirtual)
    makeVirtual$1.call(this, root);
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
function _each$1(dom, parent, expr) {

  // remove the each property from the original tag
  remAttr$1(dom, LOOP_DIRECTIVE$1);

  var mustReorder = typeof getAttr$1(dom, LOOP_NO_REORDER_DIRECTIVE$1) !== T_STRING$1 || remAttr$1(dom, LOOP_NO_REORDER_DIRECTIVE$1),
    tagName = getTagName$1(dom),
    impl = __TAG_IMPL$1[tagName],
    parentNode = dom.parentNode,
    placeholder = createDOMPlaceholder$1(),
    child = getTag$1(dom),
    ifExpr = getAttr$1(dom, CONDITIONAL_DIRECTIVE$1),
    tags = [],
    oldItems = [],
    hasKeys,
    isLoop = true,
    isAnonymous = !__TAG_IMPL$1[tagName],
    isVirtual = dom.tagName === 'VIRTUAL';

  // parse the each expression
  expr = tmpl$1.loopKeys(expr);
  expr.isLoop = true;

  if (ifExpr) remAttr$1(dom, CONDITIONAL_DIRECTIVE$1);

  // insert a marked where the loop tags will be injected
  parentNode.insertBefore(placeholder, dom);
  parentNode.removeChild(dom);

  expr.update = function updateEach() {
    // get the new items collection
    var items = tmpl$1(expr.val, parent),
      frag = createFrag$1(),
      isObject$$1 = !isArray$4(items) && !isString$2(items),
      root = placeholder.parentNode;

    // object loop. any changes cause full redraw
    if (isObject$$1) {
      hasKeys = items || false;
      items = hasKeys ?
        Object.keys(items).map(function (key) {
          return mkitem$1(expr, items[key], key)
        }) : [];
    } else {
      hasKeys = false;
    }

    if (ifExpr) {
      items = items.filter(function(item, i) {
        if (expr.key && !isObject$$1)
          return !!tmpl$1(ifExpr, mkitem$1(expr, item, i, parent))

        return !!tmpl$1(ifExpr, extend$36(Object.create(parent), item))
      });
    }

    // loop all the new items
    each$1(items, function(item, i) {
      // reorder only if the items are objects
      var
        doReorder = mustReorder && typeof item === T_OBJECT$1 && !hasKeys,
        oldPos = oldItems.indexOf(item),
        isNew = oldPos === -1,
        pos = !isNew && doReorder ? oldPos : i,
        // does a tag exist in this position?
        tag = tags[pos],
        mustAppend = i >= oldItems.length,
        mustCreate =  doReorder && isNew || !doReorder && !tag;

      item = !hasKeys && expr.key ? mkitem$1(expr, item, i) : item;

      // new tag
      if (mustCreate) {
        tag = new Tag$1$1(impl, {
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
          append$1.apply(tag, [frag || root, isVirtual]);
        else
          insert$1.apply(tag, [root, tags[i], isVirtual]);

        if (!mustAppend) oldItems.splice(i, 0, item);
        tags.splice(i, 0, tag);
        if (child) arrayishAdd$1(parent.tags, tagName, tag, true);
      } else if (pos !== i && doReorder) {
        // move
        if (contains$1(items, oldItems[pos])) {
          move$1.apply(tag, [root, tags[i], isVirtual]);
          // move the old tag instance
          tags.splice(i, 0, tags.splice(pos, 1)[0]);
          // move the old item
          oldItems.splice(i, 0, oldItems.splice(pos, 1)[0]);
        }

        // update the position attribute if it exists
        if (expr.pos) tag[expr.pos] = i;

        // if the loop tags are not custom
        // we need to move all their custom tags into the right position
        if (!child && tag.tags) moveNestedTags$1.call(tag, i);
      }

      // cache the original item to use it in the events bound to this node
      // and its children
      tag.__.item = item;
      tag.__.index = i;
      tag.__.parent = parent;

      if (!mustCreate) tag.update(item);
    });

    // remove the redundant tags
    unmountRedundant$1(items, tags);

    // clone the items array
    oldItems = items.slice();

    root.insertBefore(frag, placeholder);
  };

  expr.unmount = function() {
    each$1(tags, function(t) { t.unmount(); });
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
function parseExpressions$1(root, expressions, mustIncludeRoot) {
  var tree = {parent: {children: expressions}};

  walkNodes$1(root, (dom, ctx) => {
    let type = dom.nodeType, parent = ctx.parent, attr, expr, tagImpl;
    if (!mustIncludeRoot && dom === root) return {parent: parent}

    // text node
    if (type === 3 && dom.parentNode.tagName !== 'STYLE' && tmpl$1.hasExpr(dom.nodeValue))
      parent.children.push({dom: dom, expr: dom.nodeValue});

    if (type !== 1) return ctx // not an element

    var isVirtual = dom.tagName === 'VIRTUAL';

    // loop. each does it's own thing (for now)
    if (attr = getAttr$1(dom, LOOP_DIRECTIVE$1)) {
      if(isVirtual) setAttr$1(dom, 'loopVirtual', true); // ignore here, handled in _each
      parent.children.push(_each$1(dom, this, attr));
      return false
    }

    // if-attrs become the new parent. Any following expressions (either on the current
    // element, or below it) become children of this expression.
    if (attr = getAttr$1(dom, CONDITIONAL_DIRECTIVE$1)) {
      parent.children.push(Object.create(IfExpr$1).init(dom, this, attr));
      return false
    }

    if (expr = getAttr$1(dom, IS_DIRECTIVE$1)) {
      if (tmpl$1.hasExpr(expr)) {
        parent.children.push({isRtag: true, expr: expr, dom: dom, attrs: [].slice.call(dom.attributes)});
        return false
      }
    }

    // if this is a tag, stop traversing here.
    // we ignore the root, since parseExpressions is called while we're mounting that root
    tagImpl = getTag$1(dom);
    if(isVirtual) {
      if(getAttr$1(dom, 'virtualized')) {dom.parentElement.removeChild(dom); } // tag created, remove from dom
      if(!tagImpl && !getAttr$1(dom, 'virtualized') && !getAttr$1(dom, 'loopVirtual'))  // ok to create virtual tag
        tagImpl = { tmpl: dom.outerHTML };
    }

    if (tagImpl && (dom !== root || mustIncludeRoot)) {
      if(isVirtual && !getAttr$1(dom, IS_DIRECTIVE$1)) { // handled in update
        // can not remove attribute like directives
        // so flag for removal after creation to prevent maximum stack error
        setAttr$1(dom, 'virtualized', true);

        var tag = new Tag$1$1({ tmpl: dom.outerHTML },
          {root: dom, parent: this},
          dom.innerHTML);
        parent.children.push(tag); // no return, anonymous tag, keep parsing
      } else {
        var conf = {root: dom, parent: this, hasImpl: true};
        parent.children.push(initChildTag$1(tagImpl, conf, dom.innerHTML, this));
        return false
      }
    }

    // attribute expressions
    parseAttributes$1.apply(this, [dom, dom.attributes, function(attr, expr) {
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
function parseAttributes$1(dom, attrs, fn) {
  each$1(attrs, (attr) => {
    var name = attr.name, bool = isBoolAttr$1(name), expr;

    if (contains$1(REF_DIRECTIVES$1, name)) {
      expr =  Object.create(RefExpr$1).init(dom, this, name, attr.value);
    } else if (tmpl$1.hasExpr(attr.value)) {
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

const reHasYield$1  = /<yield\b/i;
const reYieldAll$1  = /<yield\s*(?:\/>|>([\S\s]*?)<\/yield\s*>|>)/ig;
const reYieldSrc$1  = /<yield\s+to=['"]([^'">]*)['"]\s*>([\S\s]*?)<\/yield\s*>/ig;
const reYieldDest$1 = /<yield\s+from=['"]?([-\w]+)['"]?\s*(?:\/>|>([\S\s]*?)<\/yield\s*>)/ig;
const rootEls$1 = { tr: 'tbody', th: 'tr', td: 'tr', col: 'colgroup' };
const tblTags$1 = IE_VERSION$1 && IE_VERSION$1 < 10 ? RE_SPECIAL_TAGS$1 : RE_SPECIAL_TAGS_NO_OPTION$1;
const GENERIC$1 = 'div';


/*
  Creates the root element for table or select child elements:
  tr/th/td/thead/tfoot/tbody/caption/col/colgroup/option/optgroup
*/
function specialTags$1(el, tmpl, tagName) {

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
    var tname = rootEls$1[tagName];
    if (tname && parent.childElementCount === 1) parent = $$2(tname, parent);
  }
  return parent
}

/*
  Replace the yield tag from any tag template with the innerHTML of the
  original tag in the page
*/
function replaceYield$1(tmpl, html) {
  // do nothing if no yield
  if (!reHasYield$1.test(tmpl)) return tmpl

  // be careful with #1343 - string on the source having `$1`
  var src = {};

  html = html && html.replace(reYieldSrc$1, function (_, ref, text) {
    src[ref] = src[ref] || text;   // preserve first definition
    return ''
  }).trim();

  return tmpl
    .replace(reYieldDest$1, function (_, ref, def) {  // yield with from - to attrs
      return src[ref] || def || ''
    })
    .replace(reYieldAll$1, function (_, def) {        // yield without any "from"
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
function mkdom$1(tmpl, html) {
  var match   = tmpl && tmpl.match(/^\s*<([-\w]+)/),
    tagName = match && match[1].toLowerCase(),
    el = mkEl$1(GENERIC$1);

  // replace all the yield tags with the tag inner html
  tmpl = replaceYield$1(tmpl, html);

  /* istanbul ignore next */
  if (tblTags$1.test(tagName))
    el = specialTags$1(el, tmpl, tagName);
  else
    setInnerHTML$1(el, tmpl);

  return el
}

// node_modules/riot/lib/browser/tag/core.js
/**
 * Another way to create a riot tag a bit more es6 friendly
 * @param { HTMLElement } el - tag DOM selector or DOM node/s
 * @param { Object } opts - tag logic
 * @returns { Tag } new riot tag instance
 */
function Tag$2$1(el, opts) {
  // get the tag properties from the class constructor
  var {name, tmpl, css, attrs, onCreate} = this;
  // register a new tag and cache the class prototype
  if (!__TAG_IMPL$1[name]) {
    tag$1$1(name, tmpl, css, attrs, onCreate);
    // cache the class constructor
    __TAG_IMPL$1[name].class = this.constructor;
  }

  // mount the tag using the class instance
  mountTo$1(el, name, opts, this);
  // inject the component css
  if (css) styleManager$1.inject();

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
function tag$1$1(name, tmpl, css, attrs, fn) {
  if (isFunction$3(attrs)) {
    fn = attrs;

    if (/^[\w\-]+\s?=/.test(css)) {
      attrs = css;
      css = '';
    } else
      attrs = '';
  }

  if (css) {
    if (isFunction$3(css))
      fn = css;
    else
      styleManager$1.add(css);
  }

  name = name.toLowerCase();
  __TAG_IMPL$1[name] = { name, tmpl, attrs, fn };

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
function tag2$1$1(name, tmpl, css, attrs, fn) {
  if (css) styleManager$1.add(css, name);

  __TAG_IMPL$1[name] = { name, tmpl, attrs, fn };

  return name
}

/**
 * Mount a tag using a specific tag implementation
 * @param   { * } selector - tag DOM selector or DOM node/s
 * @param   { String } tagName - tag implementation name
 * @param   { Object } opts - tag logic
 * @returns { Array } new tags instances
 */
function mount$1$1(selector, tagName, opts) {
  var tags = [];

  function pushTagsTo(root) {
    if (root.tagName) {
      var riotTag = getAttr$1(root, IS_DIRECTIVE$1);

      // have tagName? force riot-tag to be the same
      if (tagName && riotTag !== tagName) {
        riotTag = tagName;
        setAttr$1(root, IS_DIRECTIVE$1, tagName);
      }

      var tag = mountTo$1(root, riotTag || root.tagName.toLowerCase(), opts);

      if (tag)
        tags.push(tag);
    } else if (root.length)
      each$1(root, pushTagsTo); // assume nodeList
  }

  // inject styles into DOM
  styleManager$1.inject();

  if (isObject$3(tagName)) {
    opts = tagName;
    tagName = 0;
  }

  var elem;
  var allTags;

  // crawl the DOM to find the tag
  if (isString$2(selector)) {
    selector = selector === '*' ?
      // select all registered tags
      // & tags found with the riot-tag attribute set
      allTags = selectTags$1() :
      // or just the ones named like the selector
      selector + selectTags$1(selector.split(/, */));

    // make sure to pass always a selector
    // to the querySelectorAll function
    elem = selector ? $$$1(selector) : [];
  }
  else
    // probably you have passed already a tag or a NodeList
    elem = selector;

  // select all the registered and mount them inside their root elements
  if (tagName === '*') {
    // get all custom tags
    tagName = allTags || selectTags$1();
    // if the root els it's just a single tag
    if (elem.tagName)
      elem = $$$1(tagName, elem);
    else {
      // select all the children for all the different root elements
      var nodeList = [];

      each$1(elem, _el => nodeList.push($$$1(tagName, _el)));

      elem = nodeList;
    }
    // get rid of the tagName
    tagName = 0;
  }

  pushTagsTo(elem);

  return tags
}

// Create a mixin that could be globally shared across all the tags
const mixins$1 = {};
const globals$1 = mixins$1[GLOBAL_MIXIN$1] = {};
let mixins_id$1 = 0;

/**
 * Create/Return a mixin by its name
 * @param   { String }  name - mixin name (global mixin if object)
 * @param   { Object }  mix - mixin logic
 * @param   { Boolean } g - is global?
 * @returns { Object }  the mixin logic
 */
function mixin$1$1(name, mix, g) {
  // Unnamed global
  if (isObject$3(name)) {
    mixin$1$1(`__unnamed_${mixins_id$1++}`, name, true);
    return
  }

  const store = g ? globals$1 : mixins$1;

  // Getter
  if (!mix) {
    if (isUndefined$2(store[name]))
      throw new Error('Unregistered mixin: ' + name)

    return store[name]
  }

  // Setter
  store[name] = isFunction$3(mix) ?
    extend$36(mix.prototype, store[name] || {}) && mix :
    extend$36(store[name] || {}, mix);
}

/**
 * Update all the tags instances created
 * @returns { Array } all the tags instances
 */
function update$1$1() {
  return each$1(__TAGS_CACHE$1, tag => tag.update())
}

function unregister$1$1(name) {
  delete __TAG_IMPL$1[name];
}

const version$1 = 'WIP';


var core$1 = {
	Tag: Tag$2$1,
	tag: tag$1$1,
	tag2: tag2$1$1,
	mount: mount$1$1,
	mixin: mixin$1$1,
	update: update$1$1,
	unregister: unregister$1$1,
	version: version$1
};

// node_modules/riot/lib/browser/tag/tag.js
// counter to give a unique id to all the Tag instances
var __uid$1 = 0;

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
function updateOpts$1(isLoop, parent, isAnonymous, opts, instAttrs) {
  // isAnonymous `each` tags treat `dom` and `root` differently. In this case
  // (and only this case) we don't need to do updateOpts, because the regular parse
  // will update those attrs. Plus, isAnonymous tags don't need opts anyway
  if (isLoop && isAnonymous) return

  var ctx = !isAnonymous && isLoop ? this : parent || this;
  each$1(instAttrs, (attr) => {
    if (attr.expr) updateAllExpressions$1.call(ctx, [attr.expr]);
    opts[toCamel$1(attr.name)] = attr.expr ? attr.expr.value : attr.value;
  });
}


/**
 * Tag class
 * @constructor
 * @param { Object } impl - it contains the tag template, and logic
 * @param { Object } conf - tag options
 * @param { String } innerHTML - html that eventually we need to inject in the tag
 */
function Tag$1$1(impl = {}, conf = {}, innerHTML) {

  var opts = extend$36({}, conf.opts),
    parent = conf.parent,
    isLoop = conf.isLoop,
    isAnonymous = !!conf.isAnonymous,
    skipAnonymous = settings$2.skipAnonymousTags && isAnonymous,
    item = cleanUpData$1(conf.item),
    index = conf.index, // available only for the looped nodes
    instAttrs = [], // All attributes on the Tag when it's first parsed
    implAttrs = [], // expressions on this type of Tag
    expressions = [],
    root = conf.root,
    tagName = conf.tagName || getTagName$1(root),
    isVirtual = tagName === 'virtual',
    propsInSyncWithParent = [],
    dom;

  // make this tag observable
  if (!skipAnonymous) observable(this);
  // only call unmount if we have a valid __TAG_IMPL (has name property)
  if (impl.name && root._tag) root._tag.unmount(true);

  // not yet mounted
  this.isMounted = false;

  defineProperty$1(this, '__', {
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
  defineProperty$1(this, '_riot_id', ++__uid$1); // base 1 allows test !t._riot_id
  defineProperty$1(this, 'root', root);
  extend$36(this, { opts }, item);
  // protect the "tags" and "refs" property from being overridden
  defineProperty$1(this, 'parent', parent || null);
  defineProperty$1(this, 'tags', {});
  defineProperty$1(this, 'refs', {});

  dom = isLoop && isAnonymous ? root : mkdom$1(impl.tmpl, innerHTML, isLoop);

  /**
   * Update the tag expressions and options
   * @param   { * }  data - data we want to use to extend the tag properties
   * @returns { Tag } the current tag instance
   */
  defineProperty$1(this, 'update', function tagUpdate(data) {
    const nextOpts = {},
      canTrigger = this.isMounted && !skipAnonymous;

    // make sure the data passed will not override
    // the component core methods
    data = cleanUpData$1(data);
    extend$36(this, data);
    updateOpts$1.apply(this, [isLoop, parent, isAnonymous, nextOpts, instAttrs]);
    if (this.isMounted && isFunction$3(this.shouldUpdate) && !this.shouldUpdate(data, nextOpts)) return this

    // inherit properties from the parent, but only for isAnonymous tags
    if (isLoop && isAnonymous) inheritFrom$1.apply(this, [this.parent, propsInSyncWithParent]);
    extend$36(opts, nextOpts);
    if (canTrigger) this.trigger('update', data);
    updateAllExpressions$1.call(this, expressions);
    if (canTrigger) this.trigger('updated');

    return this

  }.bind(this));

  /**
   * Add a mixin to this tag
   * @returns { Tag } the current tag instance
   */
  defineProperty$1(this, 'mixin', function tagMixin() {
    each$1(arguments, (mix) => {
      let instance, obj;
      let props = [];

      // properties blacklisted and will not be bound to the tag instance
      const propsBlacklist = ['init', '__proto__'];

      mix = isString$2(mix) ? mixin$1$1(mix) : mix;

      // check if the mixin is a function
      if (isFunction$3(mix)) {
        // create the new mixin instance
        instance = new mix();
      } else instance = mix;

      var proto = Object.getPrototypeOf(instance);

      // build multilevel prototype inheritance chain property list
      do props = props.concat(Object.getOwnPropertyNames(obj || instance));
      while (obj = Object.getPrototypeOf(obj || instance))

      // loop the keys in the function prototype or the all object keys
      each$1(props, (key) => {
        // bind methods to this
        // allow mixins to override other properties/parent mixins
        if (!contains$1(propsBlacklist, key)) {
          // check for getters/setters
          var descriptor = Object.getOwnPropertyDescriptor(instance, key) || Object.getOwnPropertyDescriptor(proto, key);
          var hasGetterSetter = descriptor && (descriptor.get || descriptor.set);

          // apply method only if it does not already exist on the instance
          if (!this.hasOwnProperty(key) && hasGetterSetter) {
            Object.defineProperty(this, key, descriptor);
          } else {
            this[key] = isFunction$3(instance[key]) ?
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
  defineProperty$1(this, 'mount', function tagMount() {
    root._tag = this; // keep a reference to the tag just created

    // Read all the attrs on this instance. This give us the info we need for updateOpts
    parseAttributes$1.apply(parent, [root, root.attributes, (attr, expr) => {
      if (!isAnonymous && RefExpr$1.isPrototypeOf(expr)) expr.tag = this;
      attr.expr = expr;
      instAttrs.push(attr);
    }]);

    // update the root adding custom attributes coming from the compiler
    implAttrs = [];
    walkAttrs$1(impl.attrs, (k, v) => { implAttrs.push({name: k, value: v}); });
    parseAttributes$1.apply(this, [root, implAttrs, (attr, expr) => {
      if (expr) expressions.push(expr);
      else setAttr$1(root, attr.name, attr.value);
    }]);

    // initialiation
    updateOpts$1.apply(this, [isLoop, parent, isAnonymous, opts, instAttrs]);

    // add global mixins
    var globalMixin = mixin$1$1(GLOBAL_MIXIN$1);

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
    parseExpressions$1.apply(this, [dom, expressions, isAnonymous]);

    this.update(item);

    if (!isAnonymous) {
      while (dom.firstChild) root.appendChild(dom.firstChild);
    }

    defineProperty$1(this, 'root', root);
    defineProperty$1(this, 'isMounted', true);

    if (skipAnonymous) return

    // if it's not a child tag we can trigger its mount event
    if (!this.parent) {
      this.trigger('mount');
    }
    // otherwise we need to wait that the parent "mount" or "updated" event gets triggered
    else {
      const p = getImmediateCustomParentTag$1(this.parent);
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
  defineProperty$1(this, 'unmount', function tagUnmount(mustKeepRoot) {
    var el = this.root,
      p = el.parentNode,
      ptag,
      tagIndex = __TAGS_CACHE$1.indexOf(this);

    if (!skipAnonymous) this.trigger('before-unmount');

    // clear all attributes coming from the mounted tag
    walkAttrs$1(impl.attrs, (name) => {
      if (startsWith$1(name, ATTRS_PREFIX$1))
        name = name.slice(ATTRS_PREFIX$1.length);
      remAttr$1(root, name);
    });

    // remove this tag instance from the global virtualDom variable
    if (tagIndex !== -1)
      __TAGS_CACHE$1.splice(tagIndex, 1);

    if (p || isVirtual) {
      if (parent) {
        ptag = getImmediateCustomParentTag$1(parent);

        if (isVirtual) {
          Object.keys(this.tags).forEach(tagName => {
            arrayishRemove$1(ptag.tags, tagName, this.tags[tagName]);
          });
        } else {
          arrayishRemove$1(ptag.tags, tagName, this);
          if(parent !== ptag) // remove from _parent too
            arrayishRemove$1(parent.tags, tagName, this);
        }
      } else {
        while (el.firstChild) el.removeChild(el.firstChild);
      }

      if (p)
        if (!mustKeepRoot) {
          p.removeChild(el);
        } else {
          // the riot-tag and the data-is attributes aren't needed anymore, remove them
          remAttr$1(p, IS_DIRECTIVE$1);
        }
    }

    if (this.__.virts) {
      each$1(this.__.virts, (v) => {
        if (v.parentNode) v.parentNode.removeChild(v);
      });
    }

    // allow expressions to unmount themselves
    unmountAll$1(expressions);
    each$1(instAttrs, a => a.expr && a.expr.unmount && a.expr.unmount());

    // custom internal unmount function to avoid relying on the observable
    if (this.__.onUnmount) this.__.onUnmount();

    if (!skipAnonymous) {
      this.trigger('unmount');
      this.off('*');
    }

    defineProperty$1(this, 'isMounted', false);

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
function getTag$1(dom) {
  return dom.tagName && __TAG_IMPL$1[getAttr$1(dom, IS_DIRECTIVE$1) ||
    getAttr$1(dom, IS_DIRECTIVE$1) || dom.tagName.toLowerCase()]
}

/**
 * Inherit properties from a target tag instance
 * @this Tag
 * @param   { Tag } target - tag where we will inherit properties
 * @param   { Array } propsInSyncWithParent - array of properties to sync with the target
 */
function inheritFrom$1(target, propsInSyncWithParent) {
  each$1(Object.keys(target), (k) => {
    // some properties must be always in sync with the parent tag
    var mustSync = !isReservedName$1(k) && contains$1(propsInSyncWithParent, k);

    if (isUndefined$2(this[k]) || mustSync) {
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
function moveChildTag$1(tagName, newPos) {
  var parent = this.parent,
    tags;
  // no parent no move
  if (!parent) return

  tags = parent.tags[tagName];

  if (isArray$4(tags))
    tags.splice(newPos, 0, tags.splice(tags.indexOf(this), 1)[0]);
  else arrayishAdd$1(parent.tags, tagName, this);
}

/**
 * Create a new child tag including it correctly into its parent
 * @param   { Object } child - child tag implementation
 * @param   { Object } opts - tag options containing the DOM node where the tag will be mounted
 * @param   { String } innerHTML - inner html of the child node
 * @param   { Object } parent - instance of the parent tag including the child custom tag
 * @returns { Object } instance of the new child tag just created
 */
function initChildTag$1(child, opts, innerHTML, parent) {
  var tag = new Tag$1$1(child, opts, innerHTML),
    tagName = opts.tagName || getTagName$1(opts.root, true),
    ptag = getImmediateCustomParentTag$1(parent);
  // fix for the parent attribute in the looped elements
  defineProperty$1(tag, 'parent', ptag);
  // store the real parent tag
  // in some cases this could be different from the custom parent tag
  // for example in nested loops
  tag.__.parent = parent;

  // add this tag to the custom parent tag
  arrayishAdd$1(ptag.tags, tagName, tag);

  // and also to the real parent tag
  if (ptag !== parent)
    arrayishAdd$1(parent.tags, tagName, tag);

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
function getImmediateCustomParentTag$1(tag) {
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
function unmountAll$1(expressions) {
  each$1(expressions, function(expr) {
    if (expr instanceof Tag$1$1) expr.unmount(true);
    else if (expr.unmount) expr.unmount();
  });
}

/**
 * Get the tag name of any DOM node
 * @param   { Object } dom - DOM node we want to parse
 * @param   { Boolean } skipDataIs - hack to ignore the data-is attribute when attaching to parent
 * @returns { String } name to identify this dom node in riot
 */
function getTagName$1(dom, skipDataIs) {
  var child = getTag$1(dom),
    namedTag = !skipDataIs && getAttr$1(dom, IS_DIRECTIVE$1);
  return namedTag && !tmpl$1.hasExpr(namedTag) ?
                namedTag :
              child ? child.name : dom.tagName.toLowerCase()
}

/**
 * With this function we avoid that the internal Tag methods get overridden
 * @param   { Object } data - options we want to use to extend the tag instance
 * @returns { Object } clean object without containing the riot internal reserved words
 */
function cleanUpData$1(data) {
  if (!(data instanceof Tag$1$1) && !(data && isFunction$3(data.trigger)))
    return data

  var o = {};
  for (var key in data) {
    if (!RE_RESERVED_NAMES$1.test(key)) o[key] = data[key];
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
function arrayishAdd$1(obj, key, value, ensureArray, index) {
  const dest = obj[key];
  const isArr = isArray$4(dest);
  const hasIndex = !isUndefined$2(index);

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
function arrayishRemove$1(obj, key, value, ensureArray) {
  if (isArray$4(obj[key])) {
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
function mountTo$1(root, tagName, opts, ctx) {
  var impl = __TAG_IMPL$1[tagName],
    implClass = __TAG_IMPL$1[tagName].class,
    tag = ctx || (implClass ? Object.create(implClass.prototype) : {}),
    // cache the inner HTML to fix #855
    innerHTML = root._innerHTML = root._innerHTML || root.innerHTML;

  // clear the inner html
  root.innerHTML = '';

  var conf = extend$36({ root: root, opts: opts }, { parent: opts ? opts.parent : null });

  if (impl && root) Tag$1$1.apply(tag, [impl, conf, innerHTML]);

  if (tag && tag.mount) {
    tag.mount(true);
    // add this tag to the virtualDom variable
    if (!contains$1(__TAGS_CACHE$1, tag)) __TAGS_CACHE$1.push(tag);
  }

  return tag
}

/**
 * makes a tag virtual and replaces a reference in the dom
 * @this Tag
 * @param { tag } the tag to make virtual
 * @param { ref } the dom reference location
 */
function makeReplaceVirtual$1(tag, ref) {
  var frag = createFrag$1();
  makeVirtual$1.call(tag, frag);
  ref.parentNode.replaceChild(frag, ref);
}

/**
 * Adds the elements for a virtual tag
 * @this Tag
 * @param { Node } src - the node that will do the inserting or appending
 * @param { Tag } target - only if inserting, insert before this tag's first child
 */
function makeVirtual$1(src, target) {
  var head = createDOMPlaceholder$1(),
    tail = createDOMPlaceholder$1(),
    frag = createFrag$1(),
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
function moveVirtual$1(src, target) {
  var el = this.__.head,
    frag = createFrag$1(),
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
function selectTags$1(tags) {
  // select all tags
  if (!tags) {
    var keys = Object.keys(__TAG_IMPL$1);
    return keys + selectTags$1(keys)
  }

  return tags
    .filter(t => !/[^-\w]/.test(t))
    .reduce((list, t) => {
      var name = t.trim().toLowerCase();
      return list + `,[${IS_DIRECTIVE$1}="${name}"]`
    }, '')
}


var tags$1 = {
	getTag: getTag$1,
	inheritFrom: inheritFrom$1,
	moveChildTag: moveChildTag$1,
	initChildTag: initChildTag$1,
	getImmediateCustomParentTag: getImmediateCustomParentTag$1,
	unmountAll: unmountAll$1,
	getTagName: getTagName$1,
	cleanUpData: cleanUpData$1,
	arrayishAdd: arrayishAdd$1,
	arrayishRemove: arrayishRemove$1,
	mountTo: mountTo$1,
	makeReplaceVirtual: makeReplaceVirtual$1,
	makeVirtual: makeVirtual$1,
	moveVirtual: moveVirtual$1,
	selectTags: selectTags$1
};

// node_modules/riot/lib/riot.js
/**
 * Riot public api
 */
const settings$1$1 = settings$2;
const util$1 = {
  tmpl: tmpl$1,
  brackets: brackets$1,
  styleManager: styleManager$1,
  vdom: __TAGS_CACHE$1,
  styleNode: styleManager$1.styleNode,
  // export the riot internal utils as well
  dom: dom$1,
  check: check$1,
  misc: misc$1,
  tags: tags$1
};

// export the core props/methods









extend$36({}, core$1, {
  observable: observable,
  settings: settings$1$1,
  util: util$1,
})

// templates/forms/checkout-shippingaddress.pug
var html$7 = "\n<form onsubmit=\"{ submit }\">\n  <yield></yield>\n</form>";

// src/forms/checkout-shippingaddress.coffee
var CheckoutShippingAddressForm;
var extend$35 = function(child, parent) { for (var key in parent) { if (hasProp$34.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$34 = {}.hasOwnProperty;

CheckoutShippingAddressForm = (function(superClass) {
  extend$35(CheckoutShippingAddressForm, superClass);

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
    return CheckoutShippingAddressForm.__super__.init.call(this);
  };

  CheckoutShippingAddressForm.prototype._submit = function() {
    m.trigger(Events.SubmitShippingAddress);
    if (this.paged) {
      index$1.set('checkout-user', this.data.get('user'));
      index$1.set('checkout-shippingAddress', this.data.get('order.shippingAddress'));
    }
    return this.scheduleUpdate();
  };

  return CheckoutShippingAddressForm;

})(El$1.Form);

var CheckoutShippingAddress = CheckoutShippingAddressForm;

// templates/forms/cart.pug
var html$8 = "\n<yield>\n  <h2 if=\"{ !isEmpty() }\">Your Cart</h2>\n  <h2 if=\"{ isEmpty() }\">Your Cart Is Empty</h2>\n  <lineitems if=\"{ !isEmpty() }\"></lineitems>\n  <div if=\"{ !isEmpty() }\">\n    <div class=\"promo\">\n      <div class=\"promo-label\">Coupon</div>\n      <div class=\"promo-row { applied: applied, applying: applying, failed: failed }\">\n        <promocode class=\"input\" placeholder=\"Coupon\"></promocode>\n        <button disabled=\"{ applying }\" onclick=\"{ applyPromoCode }\"><span if=\"{ !applied &amp;&amp; !applying &amp;&amp; !failed }\">+</span><span if=\"{ applied }\">&#10003;</span><span if=\"{ failed }\">&#10005;</span><span if=\"{ applying }\">...</span></button>\n      </div>\n    </div>\n    <div class=\"invoice-discount invoice-line animated fadeIn\" if=\"{ data.get('order.discount') &gt; 0 }\">\n      <div class=\"invoice-label\">Discount</div>\n      <div class=\"invoice-amount\">{ renderCurrency(data.get('order.currency'), data.get('order.discount'))} { data.get('order.currency').toUpperCase() }</div>\n    </div>\n    <div class=\"invoice-line\">\n      <div class=\"invoice-label\">Subtotal</div>\n      <div class=\"invoice-amount\">{ renderCurrency(data.get('order.currency'), data.get('order.subtotal'))} { data.get('order.currency').toUpperCase() }</div>\n    </div>\n    <div class=\"invoice-line\">\n      <div class=\"invoice-label\">Shipping</div>\n      <div class=\"invoice-amount not-bold\">{ data.get('order.shipping') == 0 ? 'FREE' : renderCurrency(data.get('order.currency'), data.get('order.shipping'))}&nbsp;{ data.get('order.shipping') == 0 ? '' : data.get('order.currency').toUpperCase() }</div>\n    </div>\n    <div class=\"invoice-line\">\n      <div class=\"invoice-label\">Tax ({ data.get('order.taxRate') * 100 }%)</div>\n      <div class=\"invoice-amount\">{ renderCurrency(data.get('order.currency'), data.get('order.tax'))} { data.get('order.currency').toUpperCase() }</div>\n    </div>\n    <div class=\"invoice-line invoice-total\">\n      <div class=\"invoice-label\">Total</div>\n      <div class=\"invoice-amount\">{ renderCurrency(data.get('order.currency'), data.get('order.total'))} { data.get('order.currency').toUpperCase() }</div>\n    </div>\n    <button class=\"submit\" onclick=\"{ checkout }\" if=\"{ showButtons }\">Checkout</button>\n  </div>\n  <div if=\"{ isEmpty() }\">\n    <button class=\"submit\" onclick=\"{ submit }\" if=\"{ showButtons }\">Continue Shopping</button>\n  </div>\n</yield>";

// src/forms/cart.coffee
var CartForm;
var extend$37 = function(child, parent) { for (var key in parent) { if (hasProp$35.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$35 = {}.hasOwnProperty;

CartForm = (function(superClass) {
  extend$37(CartForm, superClass);

  function CartForm() {
    return CartForm.__super__.constructor.apply(this, arguments);
  }

  CartForm.prototype.tag = 'cart';

  CartForm.prototype.html = html$8;

  CartForm.prototype.init = function() {
    var promoCode;
    CartForm.__super__.init.apply(this, arguments);
    promoCode = index$1.get('promoCode');
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
    index$1.set('promoCode', promoCode);
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
        index$1.remove('promoCode');
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

})(El$1.Form);

var Cart$1$1 = CartForm;

// templates/forms/lineitem.pug
var html$9 = "\n<yield>\n  <div class=\"product-quantity-container\" if=\"{ !data.get('locked') }\">\n    <quantity-select-control></quantity-select-control>\n  </div>\n  <div class=\"product-quantity-container locked\" if=\"{ data.get('locked') }\">{ data.get('quantity') }</div>\n  <div class=\"product-text-container\">\n    <div class=\"product-name\">{ data.get('productName') }</div>\n    <div class=\"product-slug\">{ data.get('productSlug') }</div>\n    <div class=\"product-description\" if=\"{ data.get('description') }\">{ data.get('description') }</div>\n  </div>\n  <div class=\"product-delete\" onclick=\"{ delete }\"></div>\n  <div class=\"product-price-container\">\n    <div class=\"product-price\">{ renderCurrency(parentData.get('currency'), data.get().price * data.get().quantity) }\n      <div class=\"product-currency\">{ parentData.get('currency').toUpperCase() }</div>\n    </div>\n    <div class=\"product-list-price\" if=\"{ data.get().listPrice &gt; data.get().price }\">{ renderCurrency(parentData.get('currency'), data.get().listPrice * data.get().quantity) }\n      <div class=\"product-currency\">{ parentData.get('currency').toUpperCase() }</div>\n    </div>\n  </div>\n</yield>";

// src/forms/lineitem.coffee
var LineItemForm;
var extend$38 = function(child, parent) { for (var key in parent) { if (hasProp$36.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$36 = {}.hasOwnProperty;

LineItemForm = (function(superClass) {
  extend$38(LineItemForm, superClass);

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

})(El$1.Form);

var LineItem = LineItemForm;

// templates/forms/lineitems.pug
var html$10 = "\n<lineitem each=\"{ item, v in data('order.items') }\" parent-data=\"{ this.parent.data.ref('order') }\" data=\"{ this.parent.data.ref('order.items.' + v) }\" no-reorder>\n  <yield>\n    <div class=\"animated fadeIn\">\n      <div class=\"product-image-container\" if=\"{ images }\"><img src=\"{ images[data.get().productSlug] || images[data.get().productId] || images[data.get().productName] }\"></div>\n      <div class=\"product-text-container\"><span class=\"product-description\"><span class=\"product-name\">{ data.get('productName') }</span>\n          <p>{ data.get('description') }</p></span></div><span class=\"product-quantity-container locked\" if=\"{ data.get('locked') }\">{ data.get('quantity') }</span><span class=\"product-quantity-container\" if=\"{ !data.get('locked') }\">\n        <quantity-select-control></quantity-select-control></span>\n      <div class=\"product-delete\" onclick=\"{ delete }\">Remove</div>\n      <div class=\"product-price-container invoice-amount\">\n        <div class=\"product-price\">{ renderCurrency(parentData.get('currency'), data.get().price * data.get().quantity) } { parentData.get('currency').toUpperCase() }</div>\n        <div class=\"product-list-price invoice-amount\" if=\"{ data.get().listPrice &gt; data.get().price }\">{ renderCurrency(parentData.get('currency'), data.get().listPrice * data.get().quantity) } { parentData.get('currency').toUpperCase() }</div>\n      </div>\n    </div>\n  </yield>\n</lineitem>";

// src/forms/lineitems.coffee
var LineItems;
var extend$39 = function(child, parent) { for (var key in parent) { if (hasProp$37.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$37 = {}.hasOwnProperty;

LineItems = (function(superClass) {
  extend$39(LineItems, superClass);

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

})(El$1.View);

var LineItems$1 = LineItems;

// templates/forms/form.pug
var html$11 = "\n<form onsubmit=\"{ submit }\">\n  <yield></yield>\n</form>";

// src/forms/login.coffee
var LoginForm;
var extend$40 = function(child, parent) { for (var key in parent) { if (hasProp$38.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$38 = {}.hasOwnProperty;

LoginForm = (function(superClass) {
  extend$40(LoginForm, superClass);

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

})(El$1.Form);

var Login = LoginForm;

// templates/forms/order.pug
var html$12 = "\n<yield>\n  <div class=\"order-information\">\n    <div class=\"order-number-container\">\n      <div class=\"order-number-label\">Order Number:</div>\n      <div class=\"order-number\">{ data.get('number') }</div>\n    </div>\n    <div class=\"order-date-container\">\n      <div class=\"order-date-label\">Purchase Date:</div>\n      <div class=\"order-date\">{ renderDate(data.get('createdAt'), 'LL') }</div>\n    </div>\n    <lineitems if=\"{ !isEmpty() }\"></lineitems>\n    <div class=\"discount-container\">\n      <div class=\"discount-label\">Discount:</div>\n      <div class=\"discount\">{ renderCurrency(data.get('currency'), data.get('discount'))}</div>\n    </div>\n    <div class=\"subtotal-container\">\n      <div class=\"subtotal-label\">Subtotal:</div>\n      <div class=\"subtotal\">{ renderCurrency(data.get('currency'), data.get('subtotal'))}</div>\n    </div>\n    <div class=\"shipping-container\">\n      <div class=\"shipping-label\">Shipping:</div>\n      <div class=\"shipping\">{ renderCurrency(data.get('currency'), data.get('shipping'))}</div>\n    </div>\n    <div class=\"tax-container\">\n      <div class=\"tax-label\">Tax({ data.get('tax') / data.get('subtotal') * 100 }%):</div>\n      <div class=\"tax\">{ renderCurrency(data.get('currency'), data.get('tax'))}</div>\n    </div>\n    <div class=\"total-container\">\n      <div class=\"total-label\">Total:</div>\n      <div class=\"total\">{ renderCurrency(data.get('currency'), data.get('total'))}&nbsp;{ data.get('currency').toUpperCase() }</div>\n    </div>\n  </div>\n  <div class=\"address-information\">\n    <div class=\"street\">{ data.get('shippingAddress.line1') }</div>\n    <div class=\"apartment\" if=\"{ data.get('shippingAddress.line2') }\">{ data.get('shippingAddress.line2') }</div>\n    <div class=\"city\">{ data.get('shippingAddress.city') }</div>\n    <div class=\"state\" if=\"{ data.get('shippingAddress.state')}\">{ data.get('shippingAddress.state').toUpperCase() }</div>\n    <div class=\"state\" if=\"{ data.get('shippingAddress.postalCode')}\">{ data.get('shippingAddress.postalCode') }</div>\n    <div class=\"country\">{ data.get('shippingAddress.country').toUpperCase() }</div>\n  </div>\n</yield>";

// src/forms/order.coffee
var OrderForm;
var extend$41 = function(child, parent) { for (var key in parent) { if (hasProp$39.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$39 = {}.hasOwnProperty;

OrderForm = (function(superClass) {
  extend$41(OrderForm, superClass);

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

})(El$1.Form);

var Order = OrderForm;

// templates/forms/orders.pug
var html$13 = "\n<order each=\"{ order, v in data('user.orders') }\" parent-data=\"{ this.parent.data.get('user') }\" data=\"{ this.parent.data.ref('user.orders.' + v) }\" if=\"{ order.paymentStatus != 'unpaid' }\">\n  <yield></yield>\n</order>";

// src/forms/orders.coffee
var Orders;
var extend$42 = function(child, parent) { for (var key in parent) { if (hasProp$40.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$40 = {}.hasOwnProperty;

Orders = (function(superClass) {
  extend$42(Orders, superClass);

  function Orders() {
    return Orders.__super__.constructor.apply(this, arguments);
  }

  Orders.prototype.tag = 'orders';

  Orders.prototype.html = html$13;

  Orders.prototype.init = function() {
    return Orders.__super__.init.apply(this, arguments);
  };

  return Orders;

})(El$1.View);

var Orders$1 = Orders;

// src/forms/profile.coffee
var ProfileForm;
var extend$43 = function(child, parent) { for (var key in parent) { if (hasProp$41.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$41 = {}.hasOwnProperty;

ProfileForm = (function(superClass) {
  extend$43(ProfileForm, superClass);

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
              return El$1.scheduleUpdate();
            })["catch"](function(err) {
              _this.errorMessage = err.message;
              m.trigger(Events.CreateReferralProgramFailed, err);
              m.trigger(Events.ProfileLoadSuccess, res);
              return El$1.scheduleUpdate();
            });
          });
        } else {
          m.trigger(Events.ProfileLoadSuccess, res);
          return El$1.scheduleUpdate();
        }
      };
    })(this))["catch"]((function(_this) {
      return function(err) {
        _this.errorMessage = err.message;
        m.trigger(Events.ProfileLoadFailed, err);
        return El$1.scheduleUpdate();
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

})(El$1.Form);

var Profile = ProfileForm;

// src/forms/register.coffee
var RegisterForm;
var extend$44 = function(child, parent) { for (var key in parent) { if (hasProp$42.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$42 = {}.hasOwnProperty;

RegisterForm = (function(superClass) {
  extend$44(RegisterForm, superClass);

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

})(El$1.Form);

var Register = RegisterForm;

// src/forms/register-complete.coffee
var RegisterComplete;
var extend$45 = function(child, parent) { for (var key in parent) { if (hasProp$43.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$43 = {}.hasOwnProperty;

RegisterComplete = (function(superClass) {
  extend$45(RegisterComplete, superClass);

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

})(El$1.Form);

var RegisterComplete$1 = RegisterComplete;

// src/forms/reset-password.coffee
var ResetPasswordForm;
var extend$46 = function(child, parent) { for (var key in parent) { if (hasProp$44.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$44 = {}.hasOwnProperty;

ResetPasswordForm = (function(superClass) {
  extend$46(ResetPasswordForm, superClass);

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

})(El$1.Form);

var ResetPassword = ResetPasswordForm;

// src/forms/reset-password-complete.coffee
var ResetPasswordCompleteForm;
var extend$47 = function(child, parent) { for (var key in parent) { if (hasProp$45.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$45 = {}.hasOwnProperty;

ResetPasswordCompleteForm = (function(superClass) {
  extend$47(ResetPasswordCompleteForm, superClass);

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

})(El$1.Form);

var ResetPasswordComplete = ResetPasswordCompleteForm;

// src/forms/shippingaddress.coffee
var ShippingAddressForm;
var extend$48 = function(child, parent) { for (var key in parent) { if (hasProp$46.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$46 = {}.hasOwnProperty;

ShippingAddressForm = (function(superClass) {
  extend$48(ShippingAddressForm, superClass);

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

})(El$1.Form);

var ShippingAddress = ShippingAddressForm;

// src/forms/index.coffee
var Forms;

var Forms$1 = Forms = {
  Checkout: Checkout,
  CheckoutCard: CheckoutCard,
  CheckoutShippingAddress: CheckoutShippingAddress,
  Cart: Cart$1$1,
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
    Cart$1$1.register();
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
var extend$49 = function(child, parent) { for (var key in parent) { if (hasProp$47.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$47 = {}.hasOwnProperty;

CartCounter = (function(superClass) {
  extend$49(CartCounter, superClass);

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

})(El$1.View);

var CartCounter$1 = CartCounter;

// templates/widgets/checkout-modal.pug
var html$15 = "\n<!-- Checkout Modal-->\n<div class=\"checkout-modal { opened: opened, closed: !opened }\">\n  <div class=\"checkout-modal-close\" onclick=\"{ close }\">&#10005;</div>\n</div>\n<!-- Checkout widget-->\n<div class=\"checkout-container\">\n  <div class=\"checkout-header\">\n    <ul class=\"checkout-steps\">\n      <li class=\"checkout-step { active: parent.step == i }\" each=\"{ name, i in names }\">\n        <div class=\"checkout-step-number\">{ i + 1 }</div>\n        <div class=\"checkout-step-description\">{ name }</div>\n      </li>\n    </ul>\n    <div class=\"checkout-back\" if=\"{ step == 0 || step == 2}\" onclick=\"{ close }\">&#10005;</div>\n    <div class=\"checkout-back\" if=\"{ step == 1 }\" onclick=\"{ back }\">&#10140;</div>\n  </div>\n  <div class=\"checkout-content\">\n    <cart>\n      <h2>You Items</h2>\n      <lineitems if=\"{ !isEmpty() }\"></lineitems>\n      <div class=\"promo\">\n        <div class=\"promo-label\">Coupon</div>\n        <div class=\"promo-row { applied: applied, applying: applying, failed: failed }\">\n          <promocode class=\"input\" placeholder=\"Coupon\"></promocode>\n          <button disabled=\"{ applying }\" onclick=\"{ applyPromoCode }\"><span if=\"{ !applied &amp;&amp; !applying &amp;&amp; !failed }\">+</span><span if=\"{ applied }\">&#10003;</span><span if=\"{ failed }\">&#10005;</span><span if=\"{ applying }\">...</span></button>\n        </div>\n      </div>\n      <div class=\"invoice-discount invoice-line animated fadeIn\" if=\"{ data.get('order.discount') &gt; 0 }\">\n        <div class=\"invoice-label\">Discount</div>\n        <div class=\"invoice-amount\">{ renderCurrency(data.get('order.currency'), data.get('order.discount'))} { data.get('order.currency').toUpperCase() }</div>\n      </div>\n      <div class=\"invoice-line\">\n        <div class=\"invoice-label\">Subtotal</div>\n        <div class=\"invoice-amount\">{ renderCurrency(data.get('order.currency'), data.get('order.subtotal'))} { data.get('order.currency').toUpperCase() }</div>\n      </div>\n      <div class=\"invoice-line\">\n        <div class=\"invoice-label\">Shipping</div>\n        <div class=\"invoice-amount not-bold\">{ data.get('order.shipping') == 0 ? 'FREE' : renderCurrency(data.get('order.currency'), data.get('order.shipping'))}&nbsp;{ data.get('order.shipping') == 0 ? '' : data.get('order.currency').toUpperCase() }</div>\n      </div>\n      <div class=\"invoice-line\">\n        <div class=\"invoice-label\">Tax ({ data.get('order.taxRate') * 100 }%)</div>\n        <div class=\"invoice-amount\">{ renderCurrency(data.get('order.currency'), data.get('order.tax'))} { data.get('order.currency').toUpperCase() }</div>\n      </div>\n      <div class=\"invoice-line invoice-total\">\n        <div class=\"invoice-label\">Total</div>\n        <div class=\"invoice-amount\">{ renderCurrency(data.get('order.currency'), data.get('order.total'))} { data.get('order.currency').toUpperCase() }</div>\n      </div>\n    </cart>\n    <div class=\"checkout-form { step-1: step == 0, step-2: step == 1, step-3: step == 2 }\">\n      <div class=\"checkout-form-parts\">\n        <checkout-card class=\"checkout-form-part\">\n          <div class=\"contact checkout-section\">\n            <h2>Contact</h2>\n            <div class=\"fields\">\n              <user-name class=\"input\" placeholder=\"Name\"></user-name>\n              <user-email class=\"input\" placeholder=\"Email\"></user-email>\n            </div>\n          </div>\n          <div class=\"payment checkout-section\">\n            <h2>Payment</h2><span class=\"secured-text\">SSL Secure<span>Checkout</span><img class=\"lock-icon\" src=\"/img/lock-icon.svg\"></span>\n            <div class=\"fields\">\n              <card-name class=\"input\" placeholder=\"Name on Card\"></card-name>\n              <card-number class=\"input\" name=\"number\" placeholder=\"Card Number\">\n                <div class=\"cards-accepted\"><img class=\"card-logo amex-logo\" src=\"/img/card-logos/amex.svg\"><img class=\"card-logo visa-logo\" src=\"/img/card-logos/visa.svg\"><img class=\"card-logo discover-logo\" src=\"/img/card-logos/discover.svg\"><img class=\"card-logo jcb-logo\" src=\"/img/card-logos/jcb.svg\"><img class=\"card-logo mastercard-logo\" src=\"img/card-logos/mastercard.svg\"><a class=\"stripe-link\" href=\"//www.stripe.com\" target=\"_blank\"><img class=\"stripe-logo\" src=\"/img/stripelogo.png\"></a></div>\n              </card-number>\n              <card-expiry class=\"input\" name=\"expiry\" placeholder=\"MM / YY\"></card-expiry>\n              <card-cvc class=\"input\" name=\"cvc\" placeholder=\"CVC\"></card-cvc>\n            </div>\n          </div>\n          <button class=\"checkout-next\" type=\"submit\">Continue &#10140;</button>\n          <div class=\"error\" if=\"{ errorMessage }\">{ errorMessage }</div>\n        </checkout-card>\n        <checkout class=\"checkout-form-part\">\n          <div class=\"shipping checkout-section\">\n            <h2>Shipping</h2>\n            <div class=\"fields\">\n              <shippingaddress-name class=\"input\" placeholder=\"Recipient\"></shippingaddress-name>\n              <shippingaddress-line1 class=\"input\" placeholder=\"Address\"></shippingaddress-line1>\n              <shippingaddress-line2 class=\"input\" placeholder=\"Suite\"></shippingaddress-line2>\n            </div>\n            <div class=\"fields\">\n              <shippingaddress-city class=\"input\" placeholder=\"City\"></shippingaddress-city>\n              <shippingaddress-postalcode class=\"input\" placeholder=\"Postal Code\"></shippingaddress-postalcode>\n            </div>\n            <div class=\"fields\">\n              <shippingaddress-state class=\"input\" placeholder=\"State\"></shippingaddress-state>\n              <shippingaddress-country class=\"input\" placeholder=\"Country\"></shippingaddress-country>\n            </div>\n          </div>\n          <terms>\n            <label for=\"terms\">I have read and accept the&nbsp;<a href=\"terms\" target=\"_blank\">terms and conditions</a></label>\n          </terms>\n          <button class=\"checkout-next { loading: loading || checkedOut }\" disabled=\"{ loading || checkedOut }\" type=\"submit\">Checkout</button>\n          <div class=\"error\" if=\"{ errorMessage }\">{ errorMessage }</div>\n        </checkout>\n        <div class=\"completed checkout-form-part\">\n          <yield ></yield >\n        </div>\n      </div>\n    </div>\n  </div>\n</div>";

// src/widgets/checkout-modal.coffee
var CheckoutModal;
var extend$50 = function(child, parent) { for (var key in parent) { if (hasProp$48.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$48 = {}.hasOwnProperty;

CheckoutModal = (function(superClass) {
  extend$50(CheckoutModal, superClass);

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
        return El$1.scheduleUpdate();
      };
    })(this));
    return m.on(Events.SubmitSuccess, (function(_this) {
      return function(id) {
        _this.step = 2;
        return El$1.scheduleUpdate();
      };
    })(this));
  };

  CheckoutModal.prototype.open = function() {
    return this.toggle(true);
  };

  CheckoutModal.prototype.close = function() {
    this.toggle(false);
    if (this.step === 2) {
      window.location.reload();
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

})(El$1.View);

var CheckoutModal$1 = CheckoutModal;

// templates/widgets/nested-form.pug
var html$16 = "\n<form onsubmit=\"{ submit }\">\n  <yield></yield>\n</form>";

// src/widgets/nested-form.coffee
var NestedForm;
var extend$51 = function(child, parent) { for (var key in parent) { if (hasProp$49.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$49 = {}.hasOwnProperty;

NestedForm = (function(superClass) {
  extend$51(NestedForm, superClass);

  function NestedForm() {
    return NestedForm.__super__.constructor.apply(this, arguments);
  }

  NestedForm.prototype.tag = 'nested-form';

  NestedForm.prototype.html = html$16;

  return NestedForm;

})(El$1.View);

var NestedForm$1 = NestedForm;

// templates/widgets/side-pane.pug
var html$17 = "\n<div class=\"side-pane { opened: opened, closed: !opened }\">\n  <div class=\"side-pane-close\" onclick=\"{ close }\">&#10140;</div>\n  <div class=\"side-pane-content\">\n    <yield></yield>\n  </div>\n</div>";

// src/widgets/side-pane.coffee
var SidePane;
var extend$52 = function(child, parent) { for (var key in parent) { if (hasProp$50.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$50 = {}.hasOwnProperty;

SidePane = (function(superClass) {
  extend$52(SidePane, superClass);

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

})(El$1.View);

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
var analytics$1$1 = {
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

// node_modules/moment/src/lib/utils/hooks.js
var hookCallback;

function hooks () {
    return hookCallback.apply(null, arguments);
}

// This is done to register the method called with moment()
// without creating circular dependencies.
function setHookCallback (callback) {
    hookCallback = callback;
}

// node_modules/moment/src/lib/utils/is-array.js
function isArray$5(input) {
    return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
}

// node_modules/moment/src/lib/utils/is-object.js
function isObject$4(input) {
    // IE8 will treat undefined and null as object if it wasn't for
    // input != null
    return input != null && Object.prototype.toString.call(input) === '[object Object]';
}

// node_modules/moment/src/lib/utils/is-object-empty.js
function isObjectEmpty(obj) {
    var k;
    for (k in obj) {
        // even if its not own property I'd still call it non-empty
        return false;
    }
    return true;
}

// node_modules/moment/src/lib/utils/is-undefined.js
function isUndefined$3(input) {
    return input === void 0;
}

// node_modules/moment/src/lib/utils/is-number.js
function isNumber$2(input) {
    return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
}

// node_modules/moment/src/lib/utils/is-date.js
function isDate$1(input) {
    return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
}

// node_modules/moment/src/lib/utils/map.js
function map(arr, fn) {
    var res = [], i;
    for (i = 0; i < arr.length; ++i) {
        res.push(fn(arr[i], i));
    }
    return res;
}

// node_modules/moment/src/lib/utils/has-own-prop.js
function hasOwnProp(a, b) {
    return Object.prototype.hasOwnProperty.call(a, b);
}

// node_modules/moment/src/lib/utils/extend.js
function extend$53(a, b) {
    for (var i in b) {
        if (hasOwnProp(b, i)) {
            a[i] = b[i];
        }
    }

    if (hasOwnProp(b, 'toString')) {
        a.toString = b.toString;
    }

    if (hasOwnProp(b, 'valueOf')) {
        a.valueOf = b.valueOf;
    }

    return a;
}

// node_modules/moment/src/lib/create/utc.js
function createUTC (input, format, locale, strict) {
    return createLocalOrUTC(input, format, locale, strict, true).utc();
}

// node_modules/moment/src/lib/create/parsing-flags.js
function defaultParsingFlags() {
    // We need to deep clone this object.
    return {
        empty           : false,
        unusedTokens    : [],
        unusedInput     : [],
        overflow        : -2,
        charsLeftOver   : 0,
        nullInput       : false,
        invalidMonth    : null,
        invalidFormat   : false,
        userInvalidated : false,
        iso             : false,
        parsedDateParts : [],
        meridiem        : null,
        rfc2822         : false,
        weekdayMismatch : false
    };
}

function getParsingFlags(m) {
    if (m._pf == null) {
        m._pf = defaultParsingFlags();
    }
    return m._pf;
}

// node_modules/moment/src/lib/utils/some.js
var some;
if (Array.prototype.some) {
    some = Array.prototype.some;
} else {
    some = function (fun) {
        var t = Object(this);
        var len = t.length >>> 0;

        for (var i = 0; i < len; i++) {
            if (i in t && fun.call(this, t[i], i, t)) {
                return true;
            }
        }

        return false;
    };
}

// node_modules/moment/src/lib/create/valid.js
function isValid(m) {
    if (m._isValid == null) {
        var flags = getParsingFlags(m);
        var parsedParts = some.call(flags.parsedDateParts, function (i) {
            return i != null;
        });
        var isNowValid = !isNaN(m._d.getTime()) &&
            flags.overflow < 0 &&
            !flags.empty &&
            !flags.invalidMonth &&
            !flags.invalidWeekday &&
            !flags.nullInput &&
            !flags.invalidFormat &&
            !flags.userInvalidated &&
            (!flags.meridiem || (flags.meridiem && parsedParts));

        if (m._strict) {
            isNowValid = isNowValid &&
                flags.charsLeftOver === 0 &&
                flags.unusedTokens.length === 0 &&
                flags.bigHour === undefined;
        }

        if (Object.isFrozen == null || !Object.isFrozen(m)) {
            m._isValid = isNowValid;
        }
        else {
            return isNowValid;
        }
    }
    return m._isValid;
}

function createInvalid (flags) {
    var m = createUTC(NaN);
    if (flags != null) {
        extend$53(getParsingFlags(m), flags);
    }
    else {
        getParsingFlags(m).userInvalidated = true;
    }

    return m;
}

// node_modules/moment/src/lib/moment/constructor.js
// Plugins that add properties should also add the key here (null value),
// so we can properly clone ourselves.
var momentProperties = hooks.momentProperties = [];

function copyConfig(to, from) {
    var i, prop, val;

    if (!isUndefined$3(from._isAMomentObject)) {
        to._isAMomentObject = from._isAMomentObject;
    }
    if (!isUndefined$3(from._i)) {
        to._i = from._i;
    }
    if (!isUndefined$3(from._f)) {
        to._f = from._f;
    }
    if (!isUndefined$3(from._l)) {
        to._l = from._l;
    }
    if (!isUndefined$3(from._strict)) {
        to._strict = from._strict;
    }
    if (!isUndefined$3(from._tzm)) {
        to._tzm = from._tzm;
    }
    if (!isUndefined$3(from._isUTC)) {
        to._isUTC = from._isUTC;
    }
    if (!isUndefined$3(from._offset)) {
        to._offset = from._offset;
    }
    if (!isUndefined$3(from._pf)) {
        to._pf = getParsingFlags(from);
    }
    if (!isUndefined$3(from._locale)) {
        to._locale = from._locale;
    }

    if (momentProperties.length > 0) {
        for (i = 0; i < momentProperties.length; i++) {
            prop = momentProperties[i];
            val = from[prop];
            if (!isUndefined$3(val)) {
                to[prop] = val;
            }
        }
    }

    return to;
}

var updateInProgress = false;

// Moment prototype object
function Moment(config) {
    copyConfig(this, config);
    this._d = new Date(config._d != null ? config._d.getTime() : NaN);
    if (!this.isValid()) {
        this._d = new Date(NaN);
    }
    // Prevent infinite loop in case updateOffset creates new moment
    // objects.
    if (updateInProgress === false) {
        updateInProgress = true;
        hooks.updateOffset(this);
        updateInProgress = false;
    }
}

function isMoment (obj) {
    return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
}

// node_modules/moment/src/lib/utils/abs-floor.js
function absFloor (number) {
    if (number < 0) {
        // -0 -> 0
        return Math.ceil(number) || 0;
    } else {
        return Math.floor(number);
    }
}

// node_modules/moment/src/lib/utils/to-int.js
function toInt(argumentForCoercion) {
    var coercedNumber = +argumentForCoercion,
        value = 0;

    if (coercedNumber !== 0 && isFinite(coercedNumber)) {
        value = absFloor(coercedNumber);
    }

    return value;
}

// node_modules/moment/src/lib/utils/compare-arrays.js
// compare two arrays, return the number of differences
function compareArrays(array1, array2, dontConvert) {
    var len = Math.min(array1.length, array2.length),
        lengthDiff = Math.abs(array1.length - array2.length),
        diffs = 0,
        i;
    for (i = 0; i < len; i++) {
        if ((dontConvert && array1[i] !== array2[i]) ||
            (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
            diffs++;
        }
    }
    return diffs + lengthDiff;
}

// node_modules/moment/src/lib/utils/deprecate.js
function warn(msg) {
    if (hooks.suppressDeprecationWarnings === false &&
            (typeof console !==  'undefined') && console.warn) {
        console.warn('Deprecation warning: ' + msg);
    }
}

function deprecate(msg, fn) {
    var firstTime = true;

    return extend$53(function () {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(null, msg);
        }
        if (firstTime) {
            var args = [];
            var arg;
            for (var i = 0; i < arguments.length; i++) {
                arg = '';
                if (typeof arguments[i] === 'object') {
                    arg += '\n[' + i + '] ';
                    for (var key in arguments[0]) {
                        arg += key + ': ' + arguments[0][key] + ', ';
                    }
                    arg = arg.slice(0, -2); // Remove trailing comma and space
                } else {
                    arg = arguments[i];
                }
                args.push(arg);
            }
            warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
            firstTime = false;
        }
        return fn.apply(this, arguments);
    }, fn);
}

var deprecations = {};

function deprecateSimple(name, msg) {
    if (hooks.deprecationHandler != null) {
        hooks.deprecationHandler(name, msg);
    }
    if (!deprecations[name]) {
        warn(msg);
        deprecations[name] = true;
    }
}

hooks.suppressDeprecationWarnings = false;
hooks.deprecationHandler = null;

// node_modules/moment/src/lib/utils/is-function.js
function isFunction$4(input) {
    return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
}

// node_modules/moment/src/lib/locale/set.js
function set (config) {
    var prop, i;
    for (i in config) {
        prop = config[i];
        if (isFunction$4(prop)) {
            this[i] = prop;
        } else {
            this['_' + i] = prop;
        }
    }
    this._config = config;
    // Lenient ordinal parsing accepts just a number in addition to
    // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
    // TODO: Remove "ordinalParse" fallback in next major release.
    this._dayOfMonthOrdinalParseLenient = new RegExp(
        (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
            '|' + (/\d{1,2}/).source);
}

function mergeConfigs(parentConfig, childConfig) {
    var res = extend$53({}, parentConfig), prop;
    for (prop in childConfig) {
        if (hasOwnProp(childConfig, prop)) {
            if (isObject$4(parentConfig[prop]) && isObject$4(childConfig[prop])) {
                res[prop] = {};
                extend$53(res[prop], parentConfig[prop]);
                extend$53(res[prop], childConfig[prop]);
            } else if (childConfig[prop] != null) {
                res[prop] = childConfig[prop];
            } else {
                delete res[prop];
            }
        }
    }
    for (prop in parentConfig) {
        if (hasOwnProp(parentConfig, prop) &&
                !hasOwnProp(childConfig, prop) &&
                isObject$4(parentConfig[prop])) {
            // make sure changes to properties don't modify parent config
            res[prop] = extend$53({}, res[prop]);
        }
    }
    return res;
}

// node_modules/moment/src/lib/locale/constructor.js
function Locale(config) {
    if (config != null) {
        this.set(config);
    }
}

// node_modules/moment/src/lib/utils/keys.js
var keys$1;

if (Object.keys) {
    keys$1 = Object.keys;
} else {
    keys$1 = function (obj) {
        var i, res = [];
        for (i in obj) {
            if (hasOwnProp(obj, i)) {
                res.push(i);
            }
        }
        return res;
    };
}

// node_modules/moment/src/lib/locale/calendar.js
var defaultCalendar = {
    sameDay : '[Today at] LT',
    nextDay : '[Tomorrow at] LT',
    nextWeek : 'dddd [at] LT',
    lastDay : '[Yesterday at] LT',
    lastWeek : '[Last] dddd [at] LT',
    sameElse : 'L'
};

function calendar (key, mom, now) {
    var output = this._calendar[key] || this._calendar['sameElse'];
    return isFunction$4(output) ? output.call(mom, now) : output;
}

// node_modules/moment/src/lib/locale/formats.js
var defaultLongDateFormat = {
    LTS  : 'h:mm:ss A',
    LT   : 'h:mm A',
    L    : 'MM/DD/YYYY',
    LL   : 'MMMM D, YYYY',
    LLL  : 'MMMM D, YYYY h:mm A',
    LLLL : 'dddd, MMMM D, YYYY h:mm A'
};

function longDateFormat (key) {
    var format = this._longDateFormat[key],
        formatUpper = this._longDateFormat[key.toUpperCase()];

    if (format || !formatUpper) {
        return format;
    }

    this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
        return val.slice(1);
    });

    return this._longDateFormat[key];
}

// node_modules/moment/src/lib/locale/invalid.js
var defaultInvalidDate = 'Invalid date';

function invalidDate () {
    return this._invalidDate;
}

// node_modules/moment/src/lib/locale/ordinal.js
var defaultOrdinal = '%d';
var defaultDayOfMonthOrdinalParse = /\d{1,2}/;

function ordinal (number) {
    return this._ordinal.replace('%d', number);
}

// node_modules/moment/src/lib/locale/relative.js
var defaultRelativeTime = {
    future : 'in %s',
    past   : '%s ago',
    s  : 'a few seconds',
    ss : '%d seconds',
    m  : 'a minute',
    mm : '%d minutes',
    h  : 'an hour',
    hh : '%d hours',
    d  : 'a day',
    dd : '%d days',
    M  : 'a month',
    MM : '%d months',
    y  : 'a year',
    yy : '%d years'
};

function relativeTime (number, withoutSuffix, string, isFuture) {
    var output = this._relativeTime[string];
    return (isFunction$4(output)) ?
        output(number, withoutSuffix, string, isFuture) :
        output.replace(/%d/i, number);
}

function pastFuture (diff, output) {
    var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
    return isFunction$4(format) ? format(output) : format.replace(/%s/i, output);
}

// node_modules/moment/src/lib/units/aliases.js
var aliases = {};

function addUnitAlias (unit, shorthand) {
    var lowerCase = unit.toLowerCase();
    aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
}

function normalizeUnits(units) {
    return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
}

function normalizeObjectUnits(inputObject) {
    var normalizedInput = {},
        normalizedProp,
        prop;

    for (prop in inputObject) {
        if (hasOwnProp(inputObject, prop)) {
            normalizedProp = normalizeUnits(prop);
            if (normalizedProp) {
                normalizedInput[normalizedProp] = inputObject[prop];
            }
        }
    }

    return normalizedInput;
}

// node_modules/moment/src/lib/units/priorities.js
var priorities = {};

function addUnitPriority(unit, priority) {
    priorities[unit] = priority;
}

function getPrioritizedUnits(unitsObj) {
    var units = [];
    for (var u in unitsObj) {
        units.push({unit: u, priority: priorities[u]});
    }
    units.sort(function (a, b) {
        return a.priority - b.priority;
    });
    return units;
}

// node_modules/moment/src/lib/moment/get-set.js
function makeGetSet (unit, keepTime) {
    return function (value) {
        if (value != null) {
            set$1(this, unit, value);
            hooks.updateOffset(this, keepTime);
            return this;
        } else {
            return get(this, unit);
        }
    };
}

function get (mom, unit) {
    return mom.isValid() ?
        mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
}

function set$1 (mom, unit, value) {
    if (mom.isValid()) {
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
    }
}

// MOMENTS

function stringGet (units) {
    units = normalizeUnits(units);
    if (isFunction$4(this[units])) {
        return this[units]();
    }
    return this;
}


function stringSet (units, value) {
    if (typeof units === 'object') {
        units = normalizeObjectUnits(units);
        var prioritized = getPrioritizedUnits(units);
        for (var i = 0; i < prioritized.length; i++) {
            this[prioritized[i].unit](units[prioritized[i].unit]);
        }
    } else {
        units = normalizeUnits(units);
        if (isFunction$4(this[units])) {
            return this[units](value);
        }
    }
    return this;
}

// node_modules/moment/src/lib/utils/zero-fill.js
function zeroFill(number, targetLength, forceSign) {
    var absNumber = '' + Math.abs(number),
        zerosToFill = targetLength - absNumber.length,
        sign = number >= 0;
    return (sign ? (forceSign ? '+' : '') : '-') +
        Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
}

// node_modules/moment/src/lib/format/format.js
var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

var formatFunctions = {};

var formatTokenFunctions = {};

// token:    'M'
// padded:   ['MM', 2]
// ordinal:  'Mo'
// callback: function () { this.month() + 1 }
function addFormatToken (token, padded, ordinal, callback) {
    var func = callback;
    if (typeof callback === 'string') {
        func = function () {
            return this[callback]();
        };
    }
    if (token) {
        formatTokenFunctions[token] = func;
    }
    if (padded) {
        formatTokenFunctions[padded[0]] = function () {
            return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
        };
    }
    if (ordinal) {
        formatTokenFunctions[ordinal] = function () {
            return this.localeData().ordinal(func.apply(this, arguments), token);
        };
    }
}

function removeFormattingTokens(input) {
    if (input.match(/\[[\s\S]/)) {
        return input.replace(/^\[|\]$/g, '');
    }
    return input.replace(/\\/g, '');
}

function makeFormatFunction(format) {
    var array = format.match(formattingTokens), i, length;

    for (i = 0, length = array.length; i < length; i++) {
        if (formatTokenFunctions[array[i]]) {
            array[i] = formatTokenFunctions[array[i]];
        } else {
            array[i] = removeFormattingTokens(array[i]);
        }
    }

    return function (mom) {
        var output = '', i;
        for (i = 0; i < length; i++) {
            output += isFunction$4(array[i]) ? array[i].call(mom, format) : array[i];
        }
        return output;
    };
}

// format date using native date object
function formatMoment(m, format) {
    if (!m.isValid()) {
        return m.localeData().invalidDate();
    }

    format = expandFormat(format, m.localeData());
    formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

    return formatFunctions[format](m);
}

function expandFormat(format, locale) {
    var i = 5;

    function replaceLongDateFormatTokens(input) {
        return locale.longDateFormat(input) || input;
    }

    localFormattingTokens.lastIndex = 0;
    while (i >= 0 && localFormattingTokens.test(format)) {
        format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
        localFormattingTokens.lastIndex = 0;
        i -= 1;
    }

    return format;
}

// node_modules/moment/src/lib/parse/regex.js
var match1         = /\d/;            //       0 - 9
var match2         = /\d\d/;          //      00 - 99
var match3         = /\d{3}/;         //     000 - 999
var match4         = /\d{4}/;         //    0000 - 9999
var match6         = /[+-]?\d{6}/;    // -999999 - 999999
var match1to2      = /\d\d?/;         //       0 - 99
var match3to4      = /\d\d\d\d?/;     //     999 - 9999
var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
var match1to3      = /\d{1,3}/;       //       0 - 999
var match1to4      = /\d{1,4}/;       //       0 - 9999
var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

var matchUnsigned  = /\d+/;           //       0 - inf
var matchSigned    = /[+-]?\d+/;      //    -inf - inf

var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

// any word (or two) characters or numbers including two/three word month in arabic.
// includes scottish gaelic two word and hyphenated months
var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;


var regexes = {};

function addRegexToken (token, regex, strictRegex) {
    regexes[token] = isFunction$4(regex) ? regex : function (isStrict, localeData) {
        return (isStrict && strictRegex) ? strictRegex : regex;
    };
}

function getParseRegexForToken (token, config) {
    if (!hasOwnProp(regexes, token)) {
        return new RegExp(unescapeFormat(token));
    }

    return regexes[token](config._strict, config._locale);
}

// Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
function unescapeFormat(s) {
    return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
        return p1 || p2 || p3 || p4;
    }));
}

function regexEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// node_modules/moment/src/lib/parse/token.js
var tokens = {};

function addParseToken (token, callback) {
    var i, func = callback;
    if (typeof token === 'string') {
        token = [token];
    }
    if (isNumber$2(callback)) {
        func = function (input, array) {
            array[callback] = toInt(input);
        };
    }
    for (i = 0; i < token.length; i++) {
        tokens[token[i]] = func;
    }
}

function addWeekParseToken (token, callback) {
    addParseToken(token, function (input, array, config, token) {
        config._w = config._w || {};
        callback(input, config._w, config, token);
    });
}

function addTimeToArrayFromToken(token, input, config) {
    if (input != null && hasOwnProp(tokens, token)) {
        tokens[token](input, config._a, config, token);
    }
}

// node_modules/moment/src/lib/units/constants.js
var YEAR = 0;
var MONTH = 1;
var DATE = 2;
var HOUR = 3;
var MINUTE = 4;
var SECOND = 5;
var MILLISECOND = 6;
var WEEK = 7;
var WEEKDAY = 8;

// node_modules/moment/src/lib/utils/index-of.js
var indexOf$6;

if (Array.prototype.indexOf) {
    indexOf$6 = Array.prototype.indexOf;
} else {
    indexOf$6 = function (o) {
        // I know
        var i;
        for (i = 0; i < this.length; ++i) {
            if (this[i] === o) {
                return i;
            }
        }
        return -1;
    };
}

// node_modules/moment/src/lib/units/month.js
function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

// FORMATTING

addFormatToken('M', ['MM', 2], 'Mo', function () {
    return this.month() + 1;
});

addFormatToken('MMM', 0, 0, function (format) {
    return this.localeData().monthsShort(this, format);
});

addFormatToken('MMMM', 0, 0, function (format) {
    return this.localeData().months(this, format);
});

// ALIASES

addUnitAlias('month', 'M');

// PRIORITY

addUnitPriority('month', 8);

// PARSING

addRegexToken('M',    match1to2);
addRegexToken('MM',   match1to2, match2);
addRegexToken('MMM',  function (isStrict, locale) {
    return locale.monthsShortRegex(isStrict);
});
addRegexToken('MMMM', function (isStrict, locale) {
    return locale.monthsRegex(isStrict);
});

addParseToken(['M', 'MM'], function (input, array) {
    array[MONTH] = toInt(input) - 1;
});

addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
    var month = config._locale.monthsParse(input, token, config._strict);
    // if we didn't find a month name, mark the date as invalid.
    if (month != null) {
        array[MONTH] = month;
    } else {
        getParsingFlags(config).invalidMonth = input;
    }
});

// LOCALES

var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
function localeMonths (m, format) {
    if (!m) {
        return isArray$5(this._months) ? this._months :
            this._months['standalone'];
    }
    return isArray$5(this._months) ? this._months[m.month()] :
        this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
}

var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
function localeMonthsShort (m, format) {
    if (!m) {
        return isArray$5(this._monthsShort) ? this._monthsShort :
            this._monthsShort['standalone'];
    }
    return isArray$5(this._monthsShort) ? this._monthsShort[m.month()] :
        this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
}

function handleStrictParse(monthName, format, strict) {
    var i, ii, mom, llc = monthName.toLocaleLowerCase();
    if (!this._monthsParse) {
        // this is not used
        this._monthsParse = [];
        this._longMonthsParse = [];
        this._shortMonthsParse = [];
        for (i = 0; i < 12; ++i) {
            mom = createUTC([2000, i]);
            this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
            this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
        }
    }

    if (strict) {
        if (format === 'MMM') {
            ii = indexOf$6.call(this._shortMonthsParse, llc);
            return ii !== -1 ? ii : null;
        } else {
            ii = indexOf$6.call(this._longMonthsParse, llc);
            return ii !== -1 ? ii : null;
        }
    } else {
        if (format === 'MMM') {
            ii = indexOf$6.call(this._shortMonthsParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$6.call(this._longMonthsParse, llc);
            return ii !== -1 ? ii : null;
        } else {
            ii = indexOf$6.call(this._longMonthsParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$6.call(this._shortMonthsParse, llc);
            return ii !== -1 ? ii : null;
        }
    }
}

function localeMonthsParse (monthName, format, strict) {
    var i, mom, regex;

    if (this._monthsParseExact) {
        return handleStrictParse.call(this, monthName, format, strict);
    }

    if (!this._monthsParse) {
        this._monthsParse = [];
        this._longMonthsParse = [];
        this._shortMonthsParse = [];
    }

    // TODO: add sorting
    // Sorting makes sure if one month (or abbr) is a prefix of another
    // see sorting in computeMonthsParse
    for (i = 0; i < 12; i++) {
        // make the regex if we don't have it already
        mom = createUTC([2000, i]);
        if (strict && !this._longMonthsParse[i]) {
            this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
            this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
        }
        if (!strict && !this._monthsParse[i]) {
            regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
            this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        // test the regex
        if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
            return i;
        } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
            return i;
        } else if (!strict && this._monthsParse[i].test(monthName)) {
            return i;
        }
    }
}

// MOMENTS

function setMonth (mom, value) {
    var dayOfMonth;

    if (!mom.isValid()) {
        // No op
        return mom;
    }

    if (typeof value === 'string') {
        if (/^\d+$/.test(value)) {
            value = toInt(value);
        } else {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (!isNumber$2(value)) {
                return mom;
            }
        }
    }

    dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
    mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
    return mom;
}

function getSetMonth (value) {
    if (value != null) {
        setMonth(this, value);
        hooks.updateOffset(this, true);
        return this;
    } else {
        return get(this, 'Month');
    }
}

function getDaysInMonth () {
    return daysInMonth(this.year(), this.month());
}

var defaultMonthsShortRegex = matchWord;
function monthsShortRegex (isStrict) {
    if (this._monthsParseExact) {
        if (!hasOwnProp(this, '_monthsRegex')) {
            computeMonthsParse.call(this);
        }
        if (isStrict) {
            return this._monthsShortStrictRegex;
        } else {
            return this._monthsShortRegex;
        }
    } else {
        if (!hasOwnProp(this, '_monthsShortRegex')) {
            this._monthsShortRegex = defaultMonthsShortRegex;
        }
        return this._monthsShortStrictRegex && isStrict ?
            this._monthsShortStrictRegex : this._monthsShortRegex;
    }
}

var defaultMonthsRegex = matchWord;
function monthsRegex (isStrict) {
    if (this._monthsParseExact) {
        if (!hasOwnProp(this, '_monthsRegex')) {
            computeMonthsParse.call(this);
        }
        if (isStrict) {
            return this._monthsStrictRegex;
        } else {
            return this._monthsRegex;
        }
    } else {
        if (!hasOwnProp(this, '_monthsRegex')) {
            this._monthsRegex = defaultMonthsRegex;
        }
        return this._monthsStrictRegex && isStrict ?
            this._monthsStrictRegex : this._monthsRegex;
    }
}

function computeMonthsParse () {
    function cmpLenRev(a, b) {
        return b.length - a.length;
    }

    var shortPieces = [], longPieces = [], mixedPieces = [],
        i, mom;
    for (i = 0; i < 12; i++) {
        // make the regex if we don't have it already
        mom = createUTC([2000, i]);
        shortPieces.push(this.monthsShort(mom, ''));
        longPieces.push(this.months(mom, ''));
        mixedPieces.push(this.months(mom, ''));
        mixedPieces.push(this.monthsShort(mom, ''));
    }
    // Sorting makes sure if one month (or abbr) is a prefix of another it
    // will match the longer piece.
    shortPieces.sort(cmpLenRev);
    longPieces.sort(cmpLenRev);
    mixedPieces.sort(cmpLenRev);
    for (i = 0; i < 12; i++) {
        shortPieces[i] = regexEscape(shortPieces[i]);
        longPieces[i] = regexEscape(longPieces[i]);
    }
    for (i = 0; i < 24; i++) {
        mixedPieces[i] = regexEscape(mixedPieces[i]);
    }

    this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
    this._monthsShortRegex = this._monthsRegex;
    this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
    this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
}

// node_modules/moment/src/lib/units/year.js
// FORMATTING

addFormatToken('Y', 0, 0, function () {
    var y = this.year();
    return y <= 9999 ? '' + y : '+' + y;
});

addFormatToken(0, ['YY', 2], 0, function () {
    return this.year() % 100;
});

addFormatToken(0, ['YYYY',   4],       0, 'year');
addFormatToken(0, ['YYYYY',  5],       0, 'year');
addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

// ALIASES

addUnitAlias('year', 'y');

// PRIORITIES

addUnitPriority('year', 1);

// PARSING

addRegexToken('Y',      matchSigned);
addRegexToken('YY',     match1to2, match2);
addRegexToken('YYYY',   match1to4, match4);
addRegexToken('YYYYY',  match1to6, match6);
addRegexToken('YYYYYY', match1to6, match6);

addParseToken(['YYYYY', 'YYYYYY'], YEAR);
addParseToken('YYYY', function (input, array) {
    array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
});
addParseToken('YY', function (input, array) {
    array[YEAR] = hooks.parseTwoDigitYear(input);
});
addParseToken('Y', function (input, array) {
    array[YEAR] = parseInt(input, 10);
});

// HELPERS

function daysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
}

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// HOOKS

hooks.parseTwoDigitYear = function (input) {
    return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
};

// MOMENTS

var getSetYear = makeGetSet('FullYear', true);

function getIsLeapYear () {
    return isLeapYear(this.year());
}

// node_modules/moment/src/lib/create/date-from-array.js
function createDate (y, m, d, h, M, s, ms) {
    // can't just apply() to create a date:
    // https://stackoverflow.com/q/181348
    var date = new Date(y, m, d, h, M, s, ms);

    // the date constructor remaps years 0-99 to 1900-1999
    if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
        date.setFullYear(y);
    }
    return date;
}

function createUTCDate (y) {
    var date = new Date(Date.UTC.apply(null, arguments));

    // the Date.UTC function remaps years 0-99 to 1900-1999
    if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
        date.setUTCFullYear(y);
    }
    return date;
}

// node_modules/moment/src/lib/units/week-calendar-utils.js
// start-of-first-week - start-of-year
function firstWeekOffset(year, dow, doy) {
    var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
        fwd = 7 + dow - doy,
        // first-week day local weekday -- which local weekday is fwd
        fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

    return -fwdlw + fwd - 1;
}

// https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
    var localWeekday = (7 + weekday - dow) % 7,
        weekOffset = firstWeekOffset(year, dow, doy),
        dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
        resYear, resDayOfYear;

    if (dayOfYear <= 0) {
        resYear = year - 1;
        resDayOfYear = daysInYear(resYear) + dayOfYear;
    } else if (dayOfYear > daysInYear(year)) {
        resYear = year + 1;
        resDayOfYear = dayOfYear - daysInYear(year);
    } else {
        resYear = year;
        resDayOfYear = dayOfYear;
    }

    return {
        year: resYear,
        dayOfYear: resDayOfYear
    };
}

function weekOfYear(mom, dow, doy) {
    var weekOffset = firstWeekOffset(mom.year(), dow, doy),
        week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
        resWeek, resYear;

    if (week < 1) {
        resYear = mom.year() - 1;
        resWeek = week + weeksInYear(resYear, dow, doy);
    } else if (week > weeksInYear(mom.year(), dow, doy)) {
        resWeek = week - weeksInYear(mom.year(), dow, doy);
        resYear = mom.year() + 1;
    } else {
        resYear = mom.year();
        resWeek = week;
    }

    return {
        week: resWeek,
        year: resYear
    };
}

function weeksInYear(year, dow, doy) {
    var weekOffset = firstWeekOffset(year, dow, doy),
        weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
    return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
}

// node_modules/moment/src/lib/units/week.js
// FORMATTING

addFormatToken('w', ['ww', 2], 'wo', 'week');
addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

// ALIASES

addUnitAlias('week', 'w');
addUnitAlias('isoWeek', 'W');

// PRIORITIES

addUnitPriority('week', 5);
addUnitPriority('isoWeek', 5);

// PARSING

addRegexToken('w',  match1to2);
addRegexToken('ww', match1to2, match2);
addRegexToken('W',  match1to2);
addRegexToken('WW', match1to2, match2);

addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
    week[token.substr(0, 1)] = toInt(input);
});

// HELPERS

// LOCALES

function localeWeek (mom) {
    return weekOfYear(mom, this._week.dow, this._week.doy).week;
}

var defaultLocaleWeek = {
    dow : 0, // Sunday is the first day of the week.
    doy : 6  // The week that contains Jan 1st is the first week of the year.
};

function localeFirstDayOfWeek () {
    return this._week.dow;
}

function localeFirstDayOfYear () {
    return this._week.doy;
}

// MOMENTS

function getSetWeek (input) {
    var week = this.localeData().week(this);
    return input == null ? week : this.add((input - week) * 7, 'd');
}

function getSetISOWeek (input) {
    var week = weekOfYear(this, 1, 4).week;
    return input == null ? week : this.add((input - week) * 7, 'd');
}

// node_modules/moment/src/lib/units/day-of-week.js
// FORMATTING

addFormatToken('d', 0, 'do', 'day');

addFormatToken('dd', 0, 0, function (format) {
    return this.localeData().weekdaysMin(this, format);
});

addFormatToken('ddd', 0, 0, function (format) {
    return this.localeData().weekdaysShort(this, format);
});

addFormatToken('dddd', 0, 0, function (format) {
    return this.localeData().weekdays(this, format);
});

addFormatToken('e', 0, 0, 'weekday');
addFormatToken('E', 0, 0, 'isoWeekday');

// ALIASES

addUnitAlias('day', 'd');
addUnitAlias('weekday', 'e');
addUnitAlias('isoWeekday', 'E');

// PRIORITY
addUnitPriority('day', 11);
addUnitPriority('weekday', 11);
addUnitPriority('isoWeekday', 11);

// PARSING

addRegexToken('d',    match1to2);
addRegexToken('e',    match1to2);
addRegexToken('E',    match1to2);
addRegexToken('dd',   function (isStrict, locale) {
    return locale.weekdaysMinRegex(isStrict);
});
addRegexToken('ddd',   function (isStrict, locale) {
    return locale.weekdaysShortRegex(isStrict);
});
addRegexToken('dddd',   function (isStrict, locale) {
    return locale.weekdaysRegex(isStrict);
});

addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
    var weekday = config._locale.weekdaysParse(input, token, config._strict);
    // if we didn't get a weekday name, mark the date as invalid
    if (weekday != null) {
        week.d = weekday;
    } else {
        getParsingFlags(config).invalidWeekday = input;
    }
});

addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
    week[token] = toInt(input);
});

// HELPERS

function parseWeekday(input, locale) {
    if (typeof input !== 'string') {
        return input;
    }

    if (!isNaN(input)) {
        return parseInt(input, 10);
    }

    input = locale.weekdaysParse(input);
    if (typeof input === 'number') {
        return input;
    }

    return null;
}

function parseIsoWeekday(input, locale) {
    if (typeof input === 'string') {
        return locale.weekdaysParse(input) % 7 || 7;
    }
    return isNaN(input) ? null : input;
}

// LOCALES

var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
function localeWeekdays (m, format) {
    if (!m) {
        return isArray$5(this._weekdays) ? this._weekdays :
            this._weekdays['standalone'];
    }
    return isArray$5(this._weekdays) ? this._weekdays[m.day()] :
        this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
}

var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
function localeWeekdaysShort (m) {
    return (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
}

var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
function localeWeekdaysMin (m) {
    return (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
}

function handleStrictParse$1(weekdayName, format, strict) {
    var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
    if (!this._weekdaysParse) {
        this._weekdaysParse = [];
        this._shortWeekdaysParse = [];
        this._minWeekdaysParse = [];

        for (i = 0; i < 7; ++i) {
            mom = createUTC([2000, 1]).day(i);
            this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
            this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
            this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
        }
    }

    if (strict) {
        if (format === 'dddd') {
            ii = indexOf$6.call(this._weekdaysParse, llc);
            return ii !== -1 ? ii : null;
        } else if (format === 'ddd') {
            ii = indexOf$6.call(this._shortWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
        } else {
            ii = indexOf$6.call(this._minWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
        }
    } else {
        if (format === 'dddd') {
            ii = indexOf$6.call(this._weekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$6.call(this._shortWeekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$6.call(this._minWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
        } else if (format === 'ddd') {
            ii = indexOf$6.call(this._shortWeekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$6.call(this._weekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$6.call(this._minWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
        } else {
            ii = indexOf$6.call(this._minWeekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$6.call(this._weekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$6.call(this._shortWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
        }
    }
}

function localeWeekdaysParse (weekdayName, format, strict) {
    var i, mom, regex;

    if (this._weekdaysParseExact) {
        return handleStrictParse$1.call(this, weekdayName, format, strict);
    }

    if (!this._weekdaysParse) {
        this._weekdaysParse = [];
        this._minWeekdaysParse = [];
        this._shortWeekdaysParse = [];
        this._fullWeekdaysParse = [];
    }

    for (i = 0; i < 7; i++) {
        // make the regex if we don't have it already

        mom = createUTC([2000, 1]).day(i);
        if (strict && !this._fullWeekdaysParse[i]) {
            this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
            this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
            this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
        }
        if (!this._weekdaysParse[i]) {
            regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
            this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        // test the regex
        if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
            return i;
        } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
            return i;
        } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
            return i;
        } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
            return i;
        }
    }
}

// MOMENTS

function getSetDayOfWeek (input) {
    if (!this.isValid()) {
        return input != null ? this : NaN;
    }
    var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
    if (input != null) {
        input = parseWeekday(input, this.localeData());
        return this.add(input - day, 'd');
    } else {
        return day;
    }
}

function getSetLocaleDayOfWeek (input) {
    if (!this.isValid()) {
        return input != null ? this : NaN;
    }
    var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
    return input == null ? weekday : this.add(input - weekday, 'd');
}

function getSetISODayOfWeek (input) {
    if (!this.isValid()) {
        return input != null ? this : NaN;
    }

    // behaves the same as moment#day except
    // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
    // as a setter, sunday should belong to the previous week.

    if (input != null) {
        var weekday = parseIsoWeekday(input, this.localeData());
        return this.day(this.day() % 7 ? weekday : weekday - 7);
    } else {
        return this.day() || 7;
    }
}

var defaultWeekdaysRegex = matchWord;
function weekdaysRegex (isStrict) {
    if (this._weekdaysParseExact) {
        if (!hasOwnProp(this, '_weekdaysRegex')) {
            computeWeekdaysParse.call(this);
        }
        if (isStrict) {
            return this._weekdaysStrictRegex;
        } else {
            return this._weekdaysRegex;
        }
    } else {
        if (!hasOwnProp(this, '_weekdaysRegex')) {
            this._weekdaysRegex = defaultWeekdaysRegex;
        }
        return this._weekdaysStrictRegex && isStrict ?
            this._weekdaysStrictRegex : this._weekdaysRegex;
    }
}

var defaultWeekdaysShortRegex = matchWord;
function weekdaysShortRegex (isStrict) {
    if (this._weekdaysParseExact) {
        if (!hasOwnProp(this, '_weekdaysRegex')) {
            computeWeekdaysParse.call(this);
        }
        if (isStrict) {
            return this._weekdaysShortStrictRegex;
        } else {
            return this._weekdaysShortRegex;
        }
    } else {
        if (!hasOwnProp(this, '_weekdaysShortRegex')) {
            this._weekdaysShortRegex = defaultWeekdaysShortRegex;
        }
        return this._weekdaysShortStrictRegex && isStrict ?
            this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
    }
}

var defaultWeekdaysMinRegex = matchWord;
function weekdaysMinRegex (isStrict) {
    if (this._weekdaysParseExact) {
        if (!hasOwnProp(this, '_weekdaysRegex')) {
            computeWeekdaysParse.call(this);
        }
        if (isStrict) {
            return this._weekdaysMinStrictRegex;
        } else {
            return this._weekdaysMinRegex;
        }
    } else {
        if (!hasOwnProp(this, '_weekdaysMinRegex')) {
            this._weekdaysMinRegex = defaultWeekdaysMinRegex;
        }
        return this._weekdaysMinStrictRegex && isStrict ?
            this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
    }
}


function computeWeekdaysParse () {
    function cmpLenRev(a, b) {
        return b.length - a.length;
    }

    var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
        i, mom, minp, shortp, longp;
    for (i = 0; i < 7; i++) {
        // make the regex if we don't have it already
        mom = createUTC([2000, 1]).day(i);
        minp = this.weekdaysMin(mom, '');
        shortp = this.weekdaysShort(mom, '');
        longp = this.weekdays(mom, '');
        minPieces.push(minp);
        shortPieces.push(shortp);
        longPieces.push(longp);
        mixedPieces.push(minp);
        mixedPieces.push(shortp);
        mixedPieces.push(longp);
    }
    // Sorting makes sure if one weekday (or abbr) is a prefix of another it
    // will match the longer piece.
    minPieces.sort(cmpLenRev);
    shortPieces.sort(cmpLenRev);
    longPieces.sort(cmpLenRev);
    mixedPieces.sort(cmpLenRev);
    for (i = 0; i < 7; i++) {
        shortPieces[i] = regexEscape(shortPieces[i]);
        longPieces[i] = regexEscape(longPieces[i]);
        mixedPieces[i] = regexEscape(mixedPieces[i]);
    }

    this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
    this._weekdaysShortRegex = this._weekdaysRegex;
    this._weekdaysMinRegex = this._weekdaysRegex;

    this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
    this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
}

// node_modules/moment/src/lib/units/hour.js
// FORMATTING

function hFormat() {
    return this.hours() % 12 || 12;
}

function kFormat() {
    return this.hours() || 24;
}

addFormatToken('H', ['HH', 2], 0, 'hour');
addFormatToken('h', ['hh', 2], 0, hFormat);
addFormatToken('k', ['kk', 2], 0, kFormat);

addFormatToken('hmm', 0, 0, function () {
    return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
});

addFormatToken('hmmss', 0, 0, function () {
    return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
        zeroFill(this.seconds(), 2);
});

addFormatToken('Hmm', 0, 0, function () {
    return '' + this.hours() + zeroFill(this.minutes(), 2);
});

addFormatToken('Hmmss', 0, 0, function () {
    return '' + this.hours() + zeroFill(this.minutes(), 2) +
        zeroFill(this.seconds(), 2);
});

function meridiem (token, lowercase) {
    addFormatToken(token, 0, 0, function () {
        return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
    });
}

meridiem('a', true);
meridiem('A', false);

// ALIASES

addUnitAlias('hour', 'h');

// PRIORITY
addUnitPriority('hour', 13);

// PARSING

function matchMeridiem (isStrict, locale) {
    return locale._meridiemParse;
}

addRegexToken('a',  matchMeridiem);
addRegexToken('A',  matchMeridiem);
addRegexToken('H',  match1to2);
addRegexToken('h',  match1to2);
addRegexToken('k',  match1to2);
addRegexToken('HH', match1to2, match2);
addRegexToken('hh', match1to2, match2);
addRegexToken('kk', match1to2, match2);

addRegexToken('hmm', match3to4);
addRegexToken('hmmss', match5to6);
addRegexToken('Hmm', match3to4);
addRegexToken('Hmmss', match5to6);

addParseToken(['H', 'HH'], HOUR);
addParseToken(['k', 'kk'], function (input, array, config) {
    var kInput = toInt(input);
    array[HOUR] = kInput === 24 ? 0 : kInput;
});
addParseToken(['a', 'A'], function (input, array, config) {
    config._isPm = config._locale.isPM(input);
    config._meridiem = input;
});
addParseToken(['h', 'hh'], function (input, array, config) {
    array[HOUR] = toInt(input);
    getParsingFlags(config).bigHour = true;
});
addParseToken('hmm', function (input, array, config) {
    var pos = input.length - 2;
    array[HOUR] = toInt(input.substr(0, pos));
    array[MINUTE] = toInt(input.substr(pos));
    getParsingFlags(config).bigHour = true;
});
addParseToken('hmmss', function (input, array, config) {
    var pos1 = input.length - 4;
    var pos2 = input.length - 2;
    array[HOUR] = toInt(input.substr(0, pos1));
    array[MINUTE] = toInt(input.substr(pos1, 2));
    array[SECOND] = toInt(input.substr(pos2));
    getParsingFlags(config).bigHour = true;
});
addParseToken('Hmm', function (input, array, config) {
    var pos = input.length - 2;
    array[HOUR] = toInt(input.substr(0, pos));
    array[MINUTE] = toInt(input.substr(pos));
});
addParseToken('Hmmss', function (input, array, config) {
    var pos1 = input.length - 4;
    var pos2 = input.length - 2;
    array[HOUR] = toInt(input.substr(0, pos1));
    array[MINUTE] = toInt(input.substr(pos1, 2));
    array[SECOND] = toInt(input.substr(pos2));
});

// LOCALES

function localeIsPM (input) {
    // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
    // Using charAt should be more compatible.
    return ((input + '').toLowerCase().charAt(0) === 'p');
}

var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
function localeMeridiem (hours, minutes, isLower) {
    if (hours > 11) {
        return isLower ? 'pm' : 'PM';
    } else {
        return isLower ? 'am' : 'AM';
    }
}


// MOMENTS

// Setting the hour should keep the time, because the user explicitly
// specified which hour he wants. So trying to maintain the same hour (in
// a new timezone) makes sense. Adding/subtracting hours does not follow
// this rule.
var getSetHour = makeGetSet('Hours', true);

// node_modules/moment/src/lib/locale/base-config.js
// months
// week
// weekdays
// meridiem
var baseConfig = {
    calendar: defaultCalendar,
    longDateFormat: defaultLongDateFormat,
    invalidDate: defaultInvalidDate,
    ordinal: defaultOrdinal,
    dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
    relativeTime: defaultRelativeTime,

    months: defaultLocaleMonths,
    monthsShort: defaultLocaleMonthsShort,

    week: defaultLocaleWeek,

    weekdays: defaultLocaleWeekdays,
    weekdaysMin: defaultLocaleWeekdaysMin,
    weekdaysShort: defaultLocaleWeekdaysShort,

    meridiemParse: defaultLocaleMeridiemParse
};

// node_modules/moment/src/lib/locale/locales.js
// internal storage for locale config files
var locales = {};
var localeFamilies = {};
var globalLocale;

function normalizeLocale(key) {
    return key ? key.toLowerCase().replace('_', '-') : key;
}

// pick the locale from the array
// try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
// substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
function chooseLocale(names) {
    var i = 0, j, next, locale, split;

    while (i < names.length) {
        split = normalizeLocale(names[i]).split('-');
        j = split.length;
        next = normalizeLocale(names[i + 1]);
        next = next ? next.split('-') : null;
        while (j > 0) {
            locale = loadLocale(split.slice(0, j).join('-'));
            if (locale) {
                return locale;
            }
            if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                //the next array item is better than a shallower substring of this one
                break;
            }
            j--;
        }
        i++;
    }
    return null;
}

function loadLocale(name) {
    var oldLocale = null;
    // TODO: Find a better way to register and load all the locales in Node
    if (!locales[name] && (typeof module !== 'undefined') &&
            module && module.exports) {
        try {
            oldLocale = globalLocale._abbr;
            require('./locale/' + name);
            // because defineLocale currently also sets the global locale, we
            // want to undo that for lazy loaded locales
            getSetGlobalLocale(oldLocale);
        } catch (e) { }
    }
    return locales[name];
}

// This function will load locale and then set the global locale.  If
// no arguments are passed in, it will simply return the current global
// locale key.
function getSetGlobalLocale (key, values) {
    var data;
    if (key) {
        if (isUndefined$3(values)) {
            data = getLocale(key);
        }
        else {
            data = defineLocale(key, values);
        }

        if (data) {
            // moment.duration._locale = moment._locale = data;
            globalLocale = data;
        }
    }

    return globalLocale._abbr;
}

function defineLocale (name, config) {
    if (config !== null) {
        var parentConfig = baseConfig;
        config.abbr = name;
        if (locales[name] != null) {
            deprecateSimple('defineLocaleOverride',
                    'use moment.updateLocale(localeName, config) to change ' +
                    'an existing locale. moment.defineLocale(localeName, ' +
                    'config) should only be used for creating a new locale ' +
                    'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
            parentConfig = locales[name]._config;
        } else if (config.parentLocale != null) {
            if (locales[config.parentLocale] != null) {
                parentConfig = locales[config.parentLocale]._config;
            } else {
                if (!localeFamilies[config.parentLocale]) {
                    localeFamilies[config.parentLocale] = [];
                }
                localeFamilies[config.parentLocale].push({
                    name: name,
                    config: config
                });
                return null;
            }
        }
        locales[name] = new Locale(mergeConfigs(parentConfig, config));

        if (localeFamilies[name]) {
            localeFamilies[name].forEach(function (x) {
                defineLocale(x.name, x.config);
            });
        }

        // backwards compat for now: also set the locale
        // make sure we set the locale AFTER all child locales have been
        // created, so we won't end up with the child locale set.
        getSetGlobalLocale(name);


        return locales[name];
    } else {
        // useful for testing
        delete locales[name];
        return null;
    }
}

function updateLocale(name, config) {
    if (config != null) {
        var locale, parentConfig = baseConfig;
        // MERGE
        if (locales[name] != null) {
            parentConfig = locales[name]._config;
        }
        config = mergeConfigs(parentConfig, config);
        locale = new Locale(config);
        locale.parentLocale = locales[name];
        locales[name] = locale;

        // backwards compat for now: also set the locale
        getSetGlobalLocale(name);
    } else {
        // pass null for config to unupdate, useful for tests
        if (locales[name] != null) {
            if (locales[name].parentLocale != null) {
                locales[name] = locales[name].parentLocale;
            } else if (locales[name] != null) {
                delete locales[name];
            }
        }
    }
    return locales[name];
}

// returns locale data
function getLocale (key) {
    var locale;

    if (key && key._locale && key._locale._abbr) {
        key = key._locale._abbr;
    }

    if (!key) {
        return globalLocale;
    }

    if (!isArray$5(key)) {
        //short-circuit everything else
        locale = loadLocale(key);
        if (locale) {
            return locale;
        }
        key = [key];
    }

    return chooseLocale(key);
}

function listLocales() {
    return keys$1(locales);
}

// node_modules/moment/src/lib/create/check-overflow.js
function checkOverflow (m) {
    var overflow;
    var a = m._a;

    if (a && getParsingFlags(m).overflow === -2) {
        overflow =
            a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
            a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
            a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
            a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
            a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
            a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
            -1;

        if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
            overflow = DATE;
        }
        if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
            overflow = WEEK;
        }
        if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
            overflow = WEEKDAY;
        }

        getParsingFlags(m).overflow = overflow;
    }

    return m;
}

// node_modules/moment/src/lib/create/from-string.js
// iso 8601 regex
// 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

var isoDates = [
    ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
    ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
    ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
    ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
    ['YYYY-DDD', /\d{4}-\d{3}/],
    ['YYYY-MM', /\d{4}-\d\d/, false],
    ['YYYYYYMMDD', /[+-]\d{10}/],
    ['YYYYMMDD', /\d{8}/],
    // YYYYMM is NOT allowed by the standard
    ['GGGG[W]WWE', /\d{4}W\d{3}/],
    ['GGGG[W]WW', /\d{4}W\d{2}/, false],
    ['YYYYDDD', /\d{7}/]
];

// iso time formats and regexes
var isoTimes = [
    ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
    ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
    ['HH:mm:ss', /\d\d:\d\d:\d\d/],
    ['HH:mm', /\d\d:\d\d/],
    ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
    ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
    ['HHmmss', /\d\d\d\d\d\d/],
    ['HHmm', /\d\d\d\d/],
    ['HH', /\d\d/]
];

var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

// date from iso format
function configFromISO(config) {
    var i, l,
        string = config._i,
        match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
        allowTime, dateFormat, timeFormat, tzFormat;

    if (match) {
        getParsingFlags(config).iso = true;

        for (i = 0, l = isoDates.length; i < l; i++) {
            if (isoDates[i][1].exec(match[1])) {
                dateFormat = isoDates[i][0];
                allowTime = isoDates[i][2] !== false;
                break;
            }
        }
        if (dateFormat == null) {
            config._isValid = false;
            return;
        }
        if (match[3]) {
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(match[3])) {
                    // match[2] should be 'T' or space
                    timeFormat = (match[2] || ' ') + isoTimes[i][0];
                    break;
                }
            }
            if (timeFormat == null) {
                config._isValid = false;
                return;
            }
        }
        if (!allowTime && timeFormat != null) {
            config._isValid = false;
            return;
        }
        if (match[4]) {
            if (tzRegex.exec(match[4])) {
                tzFormat = 'Z';
            } else {
                config._isValid = false;
                return;
            }
        }
        config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
        configFromStringAndFormat(config);
    } else {
        config._isValid = false;
    }
}

// RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
var basicRfcRegex = /^((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d?\d\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(?:\d\d)?\d\d\s)(\d\d:\d\d)(\:\d\d)?(\s(?:UT|GMT|[ECMP][SD]T|[A-IK-Za-ik-z]|[+-]\d{4}))$/;

// date and time from ref 2822 format
function configFromRFC2822(config) {
    var string, match, dayFormat,
        dateFormat, timeFormat, tzFormat;
    var timezones = {
        ' GMT': ' +0000',
        ' EDT': ' -0400',
        ' EST': ' -0500',
        ' CDT': ' -0500',
        ' CST': ' -0600',
        ' MDT': ' -0600',
        ' MST': ' -0700',
        ' PDT': ' -0700',
        ' PST': ' -0800'
    };
    var military = 'YXWVUTSRQPONZABCDEFGHIKLM';
    var timezone, timezoneIndex;

    string = config._i
        .replace(/\([^\)]*\)|[\n\t]/g, ' ') // Remove comments and folding whitespace
        .replace(/(\s\s+)/g, ' ') // Replace multiple-spaces with a single space
        .replace(/^\s|\s$/g, ''); // Remove leading and trailing spaces
    match = basicRfcRegex.exec(string);

    if (match) {
        dayFormat = match[1] ? 'ddd' + ((match[1].length === 5) ? ', ' : ' ') : '';
        dateFormat = 'D MMM ' + ((match[2].length > 10) ? 'YYYY ' : 'YY ');
        timeFormat = 'HH:mm' + (match[4] ? ':ss' : '');

        // TODO: Replace the vanilla JS Date object with an indepentent day-of-week check.
        if (match[1]) { // day of week given
            var momentDate = new Date(match[2]);
            var momentDay = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][momentDate.getDay()];

            if (match[1].substr(0,3) !== momentDay) {
                getParsingFlags(config).weekdayMismatch = true;
                config._isValid = false;
                return;
            }
        }

        switch (match[5].length) {
            case 2: // military
                if (timezoneIndex === 0) {
                    timezone = ' +0000';
                } else {
                    timezoneIndex = military.indexOf(match[5][1].toUpperCase()) - 12;
                    timezone = ((timezoneIndex < 0) ? ' -' : ' +') +
                        (('' + timezoneIndex).replace(/^-?/, '0')).match(/..$/)[0] + '00';
                }
                break;
            case 4: // Zone
                timezone = timezones[match[5]];
                break;
            default: // UT or +/-9999
                timezone = timezones[' GMT'];
        }
        match[5] = timezone;
        config._i = match.splice(1).join('');
        tzFormat = ' ZZ';
        config._f = dayFormat + dateFormat + timeFormat + tzFormat;
        configFromStringAndFormat(config);
        getParsingFlags(config).rfc2822 = true;
    } else {
        config._isValid = false;
    }
}

// date from iso format or fallback
function configFromString(config) {
    var matched = aspNetJsonRegex.exec(config._i);

    if (matched !== null) {
        config._d = new Date(+matched[1]);
        return;
    }

    configFromISO(config);
    if (config._isValid === false) {
        delete config._isValid;
    } else {
        return;
    }

    configFromRFC2822(config);
    if (config._isValid === false) {
        delete config._isValid;
    } else {
        return;
    }

    // Final attempt, use Input Fallback
    hooks.createFromInputFallback(config);
}

hooks.createFromInputFallback = deprecate(
    'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
    'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
    'discouraged and will be removed in an upcoming major release. Please refer to ' +
    'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
    function (config) {
        config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
    }
);

// node_modules/moment/src/lib/utils/defaults.js
// Pick the first defined of two or three arguments.
function defaults$2(a, b, c) {
    if (a != null) {
        return a;
    }
    if (b != null) {
        return b;
    }
    return c;
}

// node_modules/moment/src/lib/create/from-array.js
function currentDateArray(config) {
    // hooks is actually the exported moment object
    var nowValue = new Date(hooks.now());
    if (config._useUTC) {
        return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
    }
    return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
}

// convert an array to a date.
// the array should mirror the parameters below
// note: all values past the year are optional and will default to the lowest possible value.
// [year, month, day , hour, minute, second, millisecond]
function configFromArray (config) {
    var i, date, input = [], currentDate, yearToUse;

    if (config._d) {
        return;
    }

    currentDate = currentDateArray(config);

    //compute day of the year from weeks and weekdays
    if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
        dayOfYearFromWeekInfo(config);
    }

    //if the day of the year is set, figure out what it is
    if (config._dayOfYear != null) {
        yearToUse = defaults$2(config._a[YEAR], currentDate[YEAR]);

        if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
            getParsingFlags(config)._overflowDayOfYear = true;
        }

        date = createUTCDate(yearToUse, 0, config._dayOfYear);
        config._a[MONTH] = date.getUTCMonth();
        config._a[DATE] = date.getUTCDate();
    }

    // Default to current date.
    // * if no year, month, day of month are given, default to today
    // * if day of month is given, default month and year
    // * if month is given, default only year
    // * if year is given, don't default anything
    for (i = 0; i < 3 && config._a[i] == null; ++i) {
        config._a[i] = input[i] = currentDate[i];
    }

    // Zero out whatever was not defaulted, including time
    for (; i < 7; i++) {
        config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
    }

    // Check for 24:00:00.000
    if (config._a[HOUR] === 24 &&
            config._a[MINUTE] === 0 &&
            config._a[SECOND] === 0 &&
            config._a[MILLISECOND] === 0) {
        config._nextDay = true;
        config._a[HOUR] = 0;
    }

    config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
    // Apply timezone offset from input. The actual utcOffset can be changed
    // with parseZone.
    if (config._tzm != null) {
        config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
    }

    if (config._nextDay) {
        config._a[HOUR] = 24;
    }
}

function dayOfYearFromWeekInfo(config) {
    var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

    w = config._w;
    if (w.GG != null || w.W != null || w.E != null) {
        dow = 1;
        doy = 4;

        // TODO: We need to take the current isoWeekYear, but that depends on
        // how we interpret now (local, utc, fixed offset). So create
        // a now version of current config (take local/utc/offset flags, and
        // create now).
        weekYear = defaults$2(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
        week = defaults$2(w.W, 1);
        weekday = defaults$2(w.E, 1);
        if (weekday < 1 || weekday > 7) {
            weekdayOverflow = true;
        }
    } else {
        dow = config._locale._week.dow;
        doy = config._locale._week.doy;

        var curWeek = weekOfYear(createLocal(), dow, doy);

        weekYear = defaults$2(w.gg, config._a[YEAR], curWeek.year);

        // Default to current week.
        week = defaults$2(w.w, curWeek.week);

        if (w.d != null) {
            // weekday -- low day numbers are considered next week
            weekday = w.d;
            if (weekday < 0 || weekday > 6) {
                weekdayOverflow = true;
            }
        } else if (w.e != null) {
            // local weekday -- counting starts from begining of week
            weekday = w.e + dow;
            if (w.e < 0 || w.e > 6) {
                weekdayOverflow = true;
            }
        } else {
            // default to begining of week
            weekday = dow;
        }
    }
    if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
        getParsingFlags(config)._overflowWeeks = true;
    } else if (weekdayOverflow != null) {
        getParsingFlags(config)._overflowWeekday = true;
    } else {
        temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }
}

// node_modules/moment/src/lib/create/from-string-and-format.js
// constant that refers to the ISO standard
hooks.ISO_8601 = function () {};

// constant that refers to the RFC 2822 form
hooks.RFC_2822 = function () {};

// date from string and format string
function configFromStringAndFormat(config) {
    // TODO: Move this to another part of the creation flow to prevent circular deps
    if (config._f === hooks.ISO_8601) {
        configFromISO(config);
        return;
    }
    if (config._f === hooks.RFC_2822) {
        configFromRFC2822(config);
        return;
    }
    config._a = [];
    getParsingFlags(config).empty = true;

    // This array is used to make a Date, either with `new Date` or `Date.UTC`
    var string = '' + config._i,
        i, parsedInput, tokens, token, skipped,
        stringLength = string.length,
        totalParsedInputLength = 0;

    tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

    for (i = 0; i < tokens.length; i++) {
        token = tokens[i];
        parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
        // console.log('token', token, 'parsedInput', parsedInput,
        //         'regex', getParseRegexForToken(token, config));
        if (parsedInput) {
            skipped = string.substr(0, string.indexOf(parsedInput));
            if (skipped.length > 0) {
                getParsingFlags(config).unusedInput.push(skipped);
            }
            string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
            totalParsedInputLength += parsedInput.length;
        }
        // don't parse if it's not a known token
        if (formatTokenFunctions[token]) {
            if (parsedInput) {
                getParsingFlags(config).empty = false;
            }
            else {
                getParsingFlags(config).unusedTokens.push(token);
            }
            addTimeToArrayFromToken(token, parsedInput, config);
        }
        else if (config._strict && !parsedInput) {
            getParsingFlags(config).unusedTokens.push(token);
        }
    }

    // add remaining unparsed input length to the string
    getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
    if (string.length > 0) {
        getParsingFlags(config).unusedInput.push(string);
    }

    // clear _12h flag if hour is <= 12
    if (config._a[HOUR] <= 12 &&
        getParsingFlags(config).bigHour === true &&
        config._a[HOUR] > 0) {
        getParsingFlags(config).bigHour = undefined;
    }

    getParsingFlags(config).parsedDateParts = config._a.slice(0);
    getParsingFlags(config).meridiem = config._meridiem;
    // handle meridiem
    config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

    configFromArray(config);
    checkOverflow(config);
}


function meridiemFixWrap (locale, hour, meridiem) {
    var isPm;

    if (meridiem == null) {
        // nothing to do
        return hour;
    }
    if (locale.meridiemHour != null) {
        return locale.meridiemHour(hour, meridiem);
    } else if (locale.isPM != null) {
        // Fallback
        isPm = locale.isPM(meridiem);
        if (isPm && hour < 12) {
            hour += 12;
        }
        if (!isPm && hour === 12) {
            hour = 0;
        }
        return hour;
    } else {
        // this is not supposed to happen
        return hour;
    }
}

// node_modules/moment/src/lib/create/from-string-and-array.js
// date from string and array of format strings
function configFromStringAndArray(config) {
    var tempConfig,
        bestMoment,

        scoreToBeat,
        i,
        currentScore;

    if (config._f.length === 0) {
        getParsingFlags(config).invalidFormat = true;
        config._d = new Date(NaN);
        return;
    }

    for (i = 0; i < config._f.length; i++) {
        currentScore = 0;
        tempConfig = copyConfig({}, config);
        if (config._useUTC != null) {
            tempConfig._useUTC = config._useUTC;
        }
        tempConfig._f = config._f[i];
        configFromStringAndFormat(tempConfig);

        if (!isValid(tempConfig)) {
            continue;
        }

        // if there is any input that was not parsed add a penalty for that format
        currentScore += getParsingFlags(tempConfig).charsLeftOver;

        //or tokens
        currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

        getParsingFlags(tempConfig).score = currentScore;

        if (scoreToBeat == null || currentScore < scoreToBeat) {
            scoreToBeat = currentScore;
            bestMoment = tempConfig;
        }
    }

    extend$53(config, bestMoment || tempConfig);
}

// node_modules/moment/src/lib/create/from-object.js
function configFromObject(config) {
    if (config._d) {
        return;
    }

    var i = normalizeObjectUnits(config._i);
    config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
        return obj && parseInt(obj, 10);
    });

    configFromArray(config);
}

// node_modules/moment/src/lib/create/from-anything.js
function createFromConfig (config) {
    var res = new Moment(checkOverflow(prepareConfig(config)));
    if (res._nextDay) {
        // Adding is smart enough around DST
        res.add(1, 'd');
        res._nextDay = undefined;
    }

    return res;
}

function prepareConfig (config) {
    var input = config._i,
        format = config._f;

    config._locale = config._locale || getLocale(config._l);

    if (input === null || (format === undefined && input === '')) {
        return createInvalid({nullInput: true});
    }

    if (typeof input === 'string') {
        config._i = input = config._locale.preparse(input);
    }

    if (isMoment(input)) {
        return new Moment(checkOverflow(input));
    } else if (isDate$1(input)) {
        config._d = input;
    } else if (isArray$5(format)) {
        configFromStringAndArray(config);
    } else if (format) {
        configFromStringAndFormat(config);
    }  else {
        configFromInput(config);
    }

    if (!isValid(config)) {
        config._d = null;
    }

    return config;
}

function configFromInput(config) {
    var input = config._i;
    if (isUndefined$3(input)) {
        config._d = new Date(hooks.now());
    } else if (isDate$1(input)) {
        config._d = new Date(input.valueOf());
    } else if (typeof input === 'string') {
        configFromString(config);
    } else if (isArray$5(input)) {
        config._a = map(input.slice(0), function (obj) {
            return parseInt(obj, 10);
        });
        configFromArray(config);
    } else if (isObject$4(input)) {
        configFromObject(config);
    } else if (isNumber$2(input)) {
        // from milliseconds
        config._d = new Date(input);
    } else {
        hooks.createFromInputFallback(config);
    }
}

function createLocalOrUTC (input, format, locale, strict, isUTC) {
    var c = {};

    if (locale === true || locale === false) {
        strict = locale;
        locale = undefined;
    }

    if ((isObject$4(input) && isObjectEmpty(input)) ||
            (isArray$5(input) && input.length === 0)) {
        input = undefined;
    }
    // object construction must be done this way.
    // https://github.com/moment/moment/issues/1423
    c._isAMomentObject = true;
    c._useUTC = c._isUTC = isUTC;
    c._l = locale;
    c._i = input;
    c._f = format;
    c._strict = strict;

    return createFromConfig(c);
}

// node_modules/moment/src/lib/create/local.js
function createLocal (input, format, locale, strict) {
    return createLocalOrUTC(input, format, locale, strict, false);
}

// node_modules/moment/src/lib/moment/min-max.js
var prototypeMin = deprecate(
    'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
    function () {
        var other = createLocal.apply(null, arguments);
        if (this.isValid() && other.isValid()) {
            return other < this ? this : other;
        } else {
            return createInvalid();
        }
    }
);

var prototypeMax = deprecate(
    'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
    function () {
        var other = createLocal.apply(null, arguments);
        if (this.isValid() && other.isValid()) {
            return other > this ? this : other;
        } else {
            return createInvalid();
        }
    }
);

// Pick a moment m from moments so that m[fn](other) is true for all
// other. This relies on the function fn to be transitive.
//
// moments should either be an array of moment objects or an array, whose
// first element is an array of moment objects.
function pickBy(fn, moments) {
    var res, i;
    if (moments.length === 1 && isArray$5(moments[0])) {
        moments = moments[0];
    }
    if (!moments.length) {
        return createLocal();
    }
    res = moments[0];
    for (i = 1; i < moments.length; ++i) {
        if (!moments[i].isValid() || moments[i][fn](res)) {
            res = moments[i];
        }
    }
    return res;
}

// TODO: Use [].sort instead?
function min () {
    var args = [].slice.call(arguments, 0);

    return pickBy('isBefore', args);
}

function max () {
    var args = [].slice.call(arguments, 0);

    return pickBy('isAfter', args);
}

// node_modules/moment/src/lib/moment/now.js
var now = function () {
    return Date.now ? Date.now() : +(new Date());
};

// node_modules/moment/src/lib/duration/valid.js
var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

function isDurationValid(m) {
    for (var key in m) {
        if (!(ordering.indexOf(key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
            return false;
        }
    }

    var unitHasDecimal = false;
    for (var i = 0; i < ordering.length; ++i) {
        if (m[ordering[i]]) {
            if (unitHasDecimal) {
                return false; // only allow non-integers for smallest unit
            }
            if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                unitHasDecimal = true;
            }
        }
    }

    return true;
}

function isValid$1() {
    return this._isValid;
}

function createInvalid$1() {
    return createDuration(NaN);
}

// node_modules/moment/src/lib/duration/constructor.js
function Duration (duration) {
    var normalizedInput = normalizeObjectUnits(duration),
        years = normalizedInput.year || 0,
        quarters = normalizedInput.quarter || 0,
        months = normalizedInput.month || 0,
        weeks = normalizedInput.week || 0,
        days = normalizedInput.day || 0,
        hours = normalizedInput.hour || 0,
        minutes = normalizedInput.minute || 0,
        seconds = normalizedInput.second || 0,
        milliseconds = normalizedInput.millisecond || 0;

    this._isValid = isDurationValid(normalizedInput);

    // representation for dateAddRemove
    this._milliseconds = +milliseconds +
        seconds * 1e3 + // 1000
        minutes * 6e4 + // 1000 * 60
        hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
    // Because of dateAddRemove treats 24 hours as different from a
    // day when working around DST, we need to store them separately
    this._days = +days +
        weeks * 7;
    // It is impossible translate months into days without knowing
    // which months you are are talking about, so we have to store
    // it separately.
    this._months = +months +
        quarters * 3 +
        years * 12;

    this._data = {};

    this._locale = getLocale();

    this._bubble();
}

function isDuration (obj) {
    return obj instanceof Duration;
}

// node_modules/moment/src/lib/utils/abs-round.js
function absRound (number) {
    if (number < 0) {
        return Math.round(-1 * number) * -1;
    } else {
        return Math.round(number);
    }
}

// node_modules/moment/src/lib/units/offset.js
// FORMATTING

function offset (token, separator) {
    addFormatToken(token, 0, 0, function () {
        var offset = this.utcOffset();
        var sign = '+';
        if (offset < 0) {
            offset = -offset;
            sign = '-';
        }
        return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
    });
}

offset('Z', ':');
offset('ZZ', '');

// PARSING

addRegexToken('Z',  matchShortOffset);
addRegexToken('ZZ', matchShortOffset);
addParseToken(['Z', 'ZZ'], function (input, array, config) {
    config._useUTC = true;
    config._tzm = offsetFromString(matchShortOffset, input);
});

// HELPERS

// timezone chunker
// '+10:00' > ['10',  '00']
// '-1530'  > ['-15', '30']
var chunkOffset = /([\+\-]|\d\d)/gi;

function offsetFromString(matcher, string) {
    var matches = (string || '').match(matcher);

    if (matches === null) {
        return null;
    }

    var chunk   = matches[matches.length - 1] || [];
    var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
    var minutes = +(parts[1] * 60) + toInt(parts[2]);

    return minutes === 0 ?
      0 :
      parts[0] === '+' ? minutes : -minutes;
}

// Return a moment from input, that is local/utc/zone equivalent to model.
function cloneWithOffset(input, model) {
    var res, diff;
    if (model._isUTC) {
        res = model.clone();
        diff = (isMoment(input) || isDate$1(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
        // Use low-level api, because this fn is low-level api.
        res._d.setTime(res._d.valueOf() + diff);
        hooks.updateOffset(res, false);
        return res;
    } else {
        return createLocal(input).local();
    }
}

function getDateOffset (m) {
    // On Firefox.24 Date#getTimezoneOffset returns a floating point.
    // https://github.com/moment/moment/pull/1871
    return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
}

// HOOKS

// This function will be called whenever a moment is mutated.
// It is intended to keep the offset in sync with the timezone.
hooks.updateOffset = function () {};

// MOMENTS

// keepLocalTime = true means only change the timezone, without
// affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
// 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
// +0200, so we adjust the time as needed, to be valid.
//
// Keeping the time actually adds/subtracts (one hour)
// from the actual represented time. That is why we call updateOffset
// a second time. In case it wants us to change the offset again
// _changeInProgress == true case, then we have to adjust, because
// there is no such time in the given timezone.
function getSetOffset (input, keepLocalTime, keepMinutes) {
    var offset = this._offset || 0,
        localAdjust;
    if (!this.isValid()) {
        return input != null ? this : NaN;
    }
    if (input != null) {
        if (typeof input === 'string') {
            input = offsetFromString(matchShortOffset, input);
            if (input === null) {
                return this;
            }
        } else if (Math.abs(input) < 16 && !keepMinutes) {
            input = input * 60;
        }
        if (!this._isUTC && keepLocalTime) {
            localAdjust = getDateOffset(this);
        }
        this._offset = input;
        this._isUTC = true;
        if (localAdjust != null) {
            this.add(localAdjust, 'm');
        }
        if (offset !== input) {
            if (!keepLocalTime || this._changeInProgress) {
                addSubtract(this, createDuration(input - offset, 'm'), 1, false);
            } else if (!this._changeInProgress) {
                this._changeInProgress = true;
                hooks.updateOffset(this, true);
                this._changeInProgress = null;
            }
        }
        return this;
    } else {
        return this._isUTC ? offset : getDateOffset(this);
    }
}

function getSetZone (input, keepLocalTime) {
    if (input != null) {
        if (typeof input !== 'string') {
            input = -input;
        }

        this.utcOffset(input, keepLocalTime);

        return this;
    } else {
        return -this.utcOffset();
    }
}

function setOffsetToUTC (keepLocalTime) {
    return this.utcOffset(0, keepLocalTime);
}

function setOffsetToLocal (keepLocalTime) {
    if (this._isUTC) {
        this.utcOffset(0, keepLocalTime);
        this._isUTC = false;

        if (keepLocalTime) {
            this.subtract(getDateOffset(this), 'm');
        }
    }
    return this;
}

function setOffsetToParsedOffset () {
    if (this._tzm != null) {
        this.utcOffset(this._tzm, false, true);
    } else if (typeof this._i === 'string') {
        var tZone = offsetFromString(matchOffset, this._i);
        if (tZone != null) {
            this.utcOffset(tZone);
        }
        else {
            this.utcOffset(0, true);
        }
    }
    return this;
}

function hasAlignedHourOffset (input) {
    if (!this.isValid()) {
        return false;
    }
    input = input ? createLocal(input).utcOffset() : 0;

    return (this.utcOffset() - input) % 60 === 0;
}

function isDaylightSavingTime () {
    return (
        this.utcOffset() > this.clone().month(0).utcOffset() ||
        this.utcOffset() > this.clone().month(5).utcOffset()
    );
}

function isDaylightSavingTimeShifted () {
    if (!isUndefined$3(this._isDSTShifted)) {
        return this._isDSTShifted;
    }

    var c = {};

    copyConfig(c, this);
    c = prepareConfig(c);

    if (c._a) {
        var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
        this._isDSTShifted = this.isValid() &&
            compareArrays(c._a, other.toArray()) > 0;
    } else {
        this._isDSTShifted = false;
    }

    return this._isDSTShifted;
}

function isLocal () {
    return this.isValid() ? !this._isUTC : false;
}

function isUtcOffset () {
    return this.isValid() ? this._isUTC : false;
}

function isUtc () {
    return this.isValid() ? this._isUTC && this._offset === 0 : false;
}

// node_modules/moment/src/lib/duration/create.js
// ASP.NET json date format regex
var aspNetRegex = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

// from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
// somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
// and further modified to allow for strings containing both week and day
var isoRegex = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;

function createDuration (input, key) {
    var duration = input,
        // matching against regexp is expensive, do it on demand
        match = null,
        sign,
        ret,
        diffRes;

    if (isDuration(input)) {
        duration = {
            ms : input._milliseconds,
            d  : input._days,
            M  : input._months
        };
    } else if (isNumber$2(input)) {
        duration = {};
        if (key) {
            duration[key] = input;
        } else {
            duration.milliseconds = input;
        }
    } else if (!!(match = aspNetRegex.exec(input))) {
        sign = (match[1] === '-') ? -1 : 1;
        duration = {
            y  : 0,
            d  : toInt(match[DATE])                         * sign,
            h  : toInt(match[HOUR])                         * sign,
            m  : toInt(match[MINUTE])                       * sign,
            s  : toInt(match[SECOND])                       * sign,
            ms : toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
        };
    } else if (!!(match = isoRegex.exec(input))) {
        sign = (match[1] === '-') ? -1 : 1;
        duration = {
            y : parseIso(match[2], sign),
            M : parseIso(match[3], sign),
            w : parseIso(match[4], sign),
            d : parseIso(match[5], sign),
            h : parseIso(match[6], sign),
            m : parseIso(match[7], sign),
            s : parseIso(match[8], sign)
        };
    } else if (duration == null) {// checks for null or undefined
        duration = {};
    } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
        diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));

        duration = {};
        duration.ms = diffRes.milliseconds;
        duration.M = diffRes.months;
    }

    ret = new Duration(duration);

    if (isDuration(input) && hasOwnProp(input, '_locale')) {
        ret._locale = input._locale;
    }

    return ret;
}

createDuration.fn = Duration.prototype;
createDuration.invalid = createInvalid$1;

function parseIso (inp, sign) {
    // We'd normally use ~~inp for this, but unfortunately it also
    // converts floats to ints.
    // inp may be undefined, so careful calling replace on it.
    var res = inp && parseFloat(inp.replace(',', '.'));
    // apply sign while we're at it
    return (isNaN(res) ? 0 : res) * sign;
}

function positiveMomentsDifference(base, other) {
    var res = {milliseconds: 0, months: 0};

    res.months = other.month() - base.month() +
        (other.year() - base.year()) * 12;
    if (base.clone().add(res.months, 'M').isAfter(other)) {
        --res.months;
    }

    res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

    return res;
}

function momentsDifference(base, other) {
    var res;
    if (!(base.isValid() && other.isValid())) {
        return {milliseconds: 0, months: 0};
    }

    other = cloneWithOffset(other, base);
    if (base.isBefore(other)) {
        res = positiveMomentsDifference(base, other);
    } else {
        res = positiveMomentsDifference(other, base);
        res.milliseconds = -res.milliseconds;
        res.months = -res.months;
    }

    return res;
}

// node_modules/moment/src/lib/moment/add-subtract.js
// TODO: remove 'name' arg after deprecation is removed
function createAdder(direction, name) {
    return function (val, period) {
        var dur, tmp;
        //invert the arguments, but complain about it
        if (period !== null && !isNaN(+period)) {
            deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
            'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
            tmp = val; val = period; period = tmp;
        }

        val = typeof val === 'string' ? +val : val;
        dur = createDuration(val, period);
        addSubtract(this, dur, direction);
        return this;
    };
}

function addSubtract (mom, duration, isAdding, updateOffset) {
    var milliseconds = duration._milliseconds,
        days = absRound(duration._days),
        months = absRound(duration._months);

    if (!mom.isValid()) {
        // No op
        return;
    }

    updateOffset = updateOffset == null ? true : updateOffset;

    if (milliseconds) {
        mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
    }
    if (days) {
        set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
    }
    if (months) {
        setMonth(mom, get(mom, 'Month') + months * isAdding);
    }
    if (updateOffset) {
        hooks.updateOffset(mom, days || months);
    }
}

var add      = createAdder(1, 'add');
var subtract = createAdder(-1, 'subtract');

// node_modules/moment/src/lib/moment/calendar.js
function getCalendarFormat(myMoment, now) {
    var diff = myMoment.diff(now, 'days', true);
    return diff < -6 ? 'sameElse' :
            diff < -1 ? 'lastWeek' :
            diff < 0 ? 'lastDay' :
            diff < 1 ? 'sameDay' :
            diff < 2 ? 'nextDay' :
            diff < 7 ? 'nextWeek' : 'sameElse';
}

function calendar$1 (time, formats) {
    // We want to compare the start of today, vs this.
    // Getting start-of-today depends on whether we're local/utc/offset or not.
    var now = time || createLocal(),
        sod = cloneWithOffset(now, this).startOf('day'),
        format = hooks.calendarFormat(this, sod) || 'sameElse';

    var output = formats && (isFunction$4(formats[format]) ? formats[format].call(this, now) : formats[format]);

    return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
}

// node_modules/moment/src/lib/moment/clone.js
function clone () {
    return new Moment(this);
}

// node_modules/moment/src/lib/moment/compare.js
function isAfter (input, units) {
    var localInput = isMoment(input) ? input : createLocal(input);
    if (!(this.isValid() && localInput.isValid())) {
        return false;
    }
    units = normalizeUnits(!isUndefined$3(units) ? units : 'millisecond');
    if (units === 'millisecond') {
        return this.valueOf() > localInput.valueOf();
    } else {
        return localInput.valueOf() < this.clone().startOf(units).valueOf();
    }
}

function isBefore (input, units) {
    var localInput = isMoment(input) ? input : createLocal(input);
    if (!(this.isValid() && localInput.isValid())) {
        return false;
    }
    units = normalizeUnits(!isUndefined$3(units) ? units : 'millisecond');
    if (units === 'millisecond') {
        return this.valueOf() < localInput.valueOf();
    } else {
        return this.clone().endOf(units).valueOf() < localInput.valueOf();
    }
}

function isBetween (from, to, units, inclusivity) {
    inclusivity = inclusivity || '()';
    return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) &&
        (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
}

function isSame (input, units) {
    var localInput = isMoment(input) ? input : createLocal(input),
        inputMs;
    if (!(this.isValid() && localInput.isValid())) {
        return false;
    }
    units = normalizeUnits(units || 'millisecond');
    if (units === 'millisecond') {
        return this.valueOf() === localInput.valueOf();
    } else {
        inputMs = localInput.valueOf();
        return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
    }
}

function isSameOrAfter (input, units) {
    return this.isSame(input, units) || this.isAfter(input,units);
}

function isSameOrBefore (input, units) {
    return this.isSame(input, units) || this.isBefore(input,units);
}

// node_modules/moment/src/lib/moment/diff.js
function diff (input, units, asFloat) {
    var that,
        zoneDelta,
        delta, output;

    if (!this.isValid()) {
        return NaN;
    }

    that = cloneWithOffset(input, this);

    if (!that.isValid()) {
        return NaN;
    }

    zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

    units = normalizeUnits(units);

    if (units === 'year' || units === 'month' || units === 'quarter') {
        output = monthDiff(this, that);
        if (units === 'quarter') {
            output = output / 3;
        } else if (units === 'year') {
            output = output / 12;
        }
    } else {
        delta = this - that;
        output = units === 'second' ? delta / 1e3 : // 1000
            units === 'minute' ? delta / 6e4 : // 1000 * 60
            units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
            units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
            units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
            delta;
    }
    return asFloat ? output : absFloor(output);
}

function monthDiff (a, b) {
    // difference in months
    var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
        // b is in (anchor - 1 month, anchor + 1 month)
        anchor = a.clone().add(wholeMonthDiff, 'months'),
        anchor2, adjust;

    if (b - anchor < 0) {
        anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
        // linear across the month
        adjust = (b - anchor) / (anchor - anchor2);
    } else {
        anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
        // linear across the month
        adjust = (b - anchor) / (anchor2 - anchor);
    }

    //check for negative zero, return zero if negative zero
    return -(wholeMonthDiff + adjust) || 0;
}

// node_modules/moment/src/lib/moment/format.js
hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

function toString () {
    return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
}

function toISOString() {
    if (!this.isValid()) {
        return null;
    }
    var m = this.clone().utc();
    if (m.year() < 0 || m.year() > 9999) {
        return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
    }
    if (isFunction$4(Date.prototype.toISOString)) {
        // native implementation is ~50x faster, use it when we can
        return this.toDate().toISOString();
    }
    return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
}

/**
 * Return a human readable representation of a moment that can
 * also be evaluated to get a new moment which is the same
 *
 * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
 */
function inspect () {
    if (!this.isValid()) {
        return 'moment.invalid(/* ' + this._i + ' */)';
    }
    var func = 'moment';
    var zone = '';
    if (!this.isLocal()) {
        func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
        zone = 'Z';
    }
    var prefix = '[' + func + '("]';
    var year = (0 <= this.year() && this.year() <= 9999) ? 'YYYY' : 'YYYYYY';
    var datetime = '-MM-DD[T]HH:mm:ss.SSS';
    var suffix = zone + '[")]';

    return this.format(prefix + year + datetime + suffix);
}

function format (inputString) {
    if (!inputString) {
        inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
    }
    var output = formatMoment(this, inputString);
    return this.localeData().postformat(output);
}

// node_modules/moment/src/lib/moment/from.js
function from (time, withoutSuffix) {
    if (this.isValid() &&
            ((isMoment(time) && time.isValid()) ||
             createLocal(time).isValid())) {
        return createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
    } else {
        return this.localeData().invalidDate();
    }
}

function fromNow (withoutSuffix) {
    return this.from(createLocal(), withoutSuffix);
}

// node_modules/moment/src/lib/moment/to.js
function to (time, withoutSuffix) {
    if (this.isValid() &&
            ((isMoment(time) && time.isValid()) ||
             createLocal(time).isValid())) {
        return createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
    } else {
        return this.localeData().invalidDate();
    }
}

function toNow (withoutSuffix) {
    return this.to(createLocal(), withoutSuffix);
}

// node_modules/moment/src/lib/moment/locale.js
// If passed a locale key, it will set the locale for this
// instance.  Otherwise, it will return the locale configuration
// variables for this instance.
function locale (key) {
    var newLocaleData;

    if (key === undefined) {
        return this._locale._abbr;
    } else {
        newLocaleData = getLocale(key);
        if (newLocaleData != null) {
            this._locale = newLocaleData;
        }
        return this;
    }
}

var lang = deprecate(
    'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
    function (key) {
        if (key === undefined) {
            return this.localeData();
        } else {
            return this.locale(key);
        }
    }
);

function localeData () {
    return this._locale;
}

// node_modules/moment/src/lib/moment/start-end-of.js
function startOf (units) {
    units = normalizeUnits(units);
    // the following switch intentionally omits break keywords
    // to utilize falling through the cases.
    switch (units) {
        case 'year':
            this.month(0);
            /* falls through */
        case 'quarter':
        case 'month':
            this.date(1);
            /* falls through */
        case 'week':
        case 'isoWeek':
        case 'day':
        case 'date':
            this.hours(0);
            /* falls through */
        case 'hour':
            this.minutes(0);
            /* falls through */
        case 'minute':
            this.seconds(0);
            /* falls through */
        case 'second':
            this.milliseconds(0);
    }

    // weeks are a special case
    if (units === 'week') {
        this.weekday(0);
    }
    if (units === 'isoWeek') {
        this.isoWeekday(1);
    }

    // quarters are also special
    if (units === 'quarter') {
        this.month(Math.floor(this.month() / 3) * 3);
    }

    return this;
}

function endOf (units) {
    units = normalizeUnits(units);
    if (units === undefined || units === 'millisecond') {
        return this;
    }

    // 'date' is an alias for 'day', so it should be considered as such.
    if (units === 'date') {
        units = 'day';
    }

    return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
}

// node_modules/moment/src/lib/moment/to-type.js
function valueOf () {
    return this._d.valueOf() - ((this._offset || 0) * 60000);
}

function unix () {
    return Math.floor(this.valueOf() / 1000);
}

function toDate () {
    return new Date(this.valueOf());
}

function toArray () {
    var m = this;
    return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
}

function toObject$1 () {
    var m = this;
    return {
        years: m.year(),
        months: m.month(),
        date: m.date(),
        hours: m.hours(),
        minutes: m.minutes(),
        seconds: m.seconds(),
        milliseconds: m.milliseconds()
    };
}

function toJSON () {
    // new Date(NaN).toJSON() === null
    return this.isValid() ? this.toISOString() : null;
}

// node_modules/moment/src/lib/moment/valid.js
function isValid$2 () {
    return isValid(this);
}

function parsingFlags () {
    return extend$53({}, getParsingFlags(this));
}

function invalidAt () {
    return getParsingFlags(this).overflow;
}

// node_modules/moment/src/lib/moment/creation-data.js
function creationData() {
    return {
        input: this._i,
        format: this._f,
        locale: this._locale,
        isUTC: this._isUTC,
        strict: this._strict
    };
}

// node_modules/moment/src/lib/units/week-year.js
// FORMATTING

addFormatToken(0, ['gg', 2], 0, function () {
    return this.weekYear() % 100;
});

addFormatToken(0, ['GG', 2], 0, function () {
    return this.isoWeekYear() % 100;
});

function addWeekYearFormatToken (token, getter) {
    addFormatToken(0, [token, token.length], 0, getter);
}

addWeekYearFormatToken('gggg',     'weekYear');
addWeekYearFormatToken('ggggg',    'weekYear');
addWeekYearFormatToken('GGGG',  'isoWeekYear');
addWeekYearFormatToken('GGGGG', 'isoWeekYear');

// ALIASES

addUnitAlias('weekYear', 'gg');
addUnitAlias('isoWeekYear', 'GG');

// PRIORITY

addUnitPriority('weekYear', 1);
addUnitPriority('isoWeekYear', 1);


// PARSING

addRegexToken('G',      matchSigned);
addRegexToken('g',      matchSigned);
addRegexToken('GG',     match1to2, match2);
addRegexToken('gg',     match1to2, match2);
addRegexToken('GGGG',   match1to4, match4);
addRegexToken('gggg',   match1to4, match4);
addRegexToken('GGGGG',  match1to6, match6);
addRegexToken('ggggg',  match1to6, match6);

addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
    week[token.substr(0, 2)] = toInt(input);
});

addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
    week[token] = hooks.parseTwoDigitYear(input);
});

// MOMENTS

function getSetWeekYear (input) {
    return getSetWeekYearHelper.call(this,
            input,
            this.week(),
            this.weekday(),
            this.localeData()._week.dow,
            this.localeData()._week.doy);
}

function getSetISOWeekYear (input) {
    return getSetWeekYearHelper.call(this,
            input, this.isoWeek(), this.isoWeekday(), 1, 4);
}

function getISOWeeksInYear () {
    return weeksInYear(this.year(), 1, 4);
}

function getWeeksInYear () {
    var weekInfo = this.localeData()._week;
    return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
}

function getSetWeekYearHelper(input, week, weekday, dow, doy) {
    var weeksTarget;
    if (input == null) {
        return weekOfYear(this, dow, doy).year;
    } else {
        weeksTarget = weeksInYear(input, dow, doy);
        if (week > weeksTarget) {
            week = weeksTarget;
        }
        return setWeekAll.call(this, input, week, weekday, dow, doy);
    }
}

function setWeekAll(weekYear, week, weekday, dow, doy) {
    var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
        date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

    this.year(date.getUTCFullYear());
    this.month(date.getUTCMonth());
    this.date(date.getUTCDate());
    return this;
}

// node_modules/moment/src/lib/units/quarter.js
// FORMATTING

addFormatToken('Q', 0, 'Qo', 'quarter');

// ALIASES

addUnitAlias('quarter', 'Q');

// PRIORITY

addUnitPriority('quarter', 7);

// PARSING

addRegexToken('Q', match1);
addParseToken('Q', function (input, array) {
    array[MONTH] = (toInt(input) - 1) * 3;
});

// MOMENTS

function getSetQuarter (input) {
    return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
}

// node_modules/moment/src/lib/units/day-of-month.js
// FORMATTING

addFormatToken('D', ['DD', 2], 'Do', 'date');

// ALIASES

addUnitAlias('date', 'D');

// PRIOROITY
addUnitPriority('date', 9);

// PARSING

addRegexToken('D',  match1to2);
addRegexToken('DD', match1to2, match2);
addRegexToken('Do', function (isStrict, locale) {
    // TODO: Remove "ordinalParse" fallback in next major release.
    return isStrict ?
      (locale._dayOfMonthOrdinalParse || locale._ordinalParse) :
      locale._dayOfMonthOrdinalParseLenient;
});

addParseToken(['D', 'DD'], DATE);
addParseToken('Do', function (input, array) {
    array[DATE] = toInt(input.match(match1to2)[0], 10);
});

// MOMENTS

var getSetDayOfMonth = makeGetSet('Date', true);

// node_modules/moment/src/lib/units/day-of-year.js
// FORMATTING

addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

// ALIASES

addUnitAlias('dayOfYear', 'DDD');

// PRIORITY
addUnitPriority('dayOfYear', 4);

// PARSING

addRegexToken('DDD',  match1to3);
addRegexToken('DDDD', match3);
addParseToken(['DDD', 'DDDD'], function (input, array, config) {
    config._dayOfYear = toInt(input);
});

// HELPERS

// MOMENTS

function getSetDayOfYear (input) {
    var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
    return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
}

// node_modules/moment/src/lib/units/minute.js
// FORMATTING

addFormatToken('m', ['mm', 2], 0, 'minute');

// ALIASES

addUnitAlias('minute', 'm');

// PRIORITY

addUnitPriority('minute', 14);

// PARSING

addRegexToken('m',  match1to2);
addRegexToken('mm', match1to2, match2);
addParseToken(['m', 'mm'], MINUTE);

// MOMENTS

var getSetMinute = makeGetSet('Minutes', false);

// node_modules/moment/src/lib/units/second.js
// FORMATTING

addFormatToken('s', ['ss', 2], 0, 'second');

// ALIASES

addUnitAlias('second', 's');

// PRIORITY

addUnitPriority('second', 15);

// PARSING

addRegexToken('s',  match1to2);
addRegexToken('ss', match1to2, match2);
addParseToken(['s', 'ss'], SECOND);

// MOMENTS

var getSetSecond = makeGetSet('Seconds', false);

// node_modules/moment/src/lib/units/millisecond.js
// FORMATTING

addFormatToken('S', 0, 0, function () {
    return ~~(this.millisecond() / 100);
});

addFormatToken(0, ['SS', 2], 0, function () {
    return ~~(this.millisecond() / 10);
});

addFormatToken(0, ['SSS', 3], 0, 'millisecond');
addFormatToken(0, ['SSSS', 4], 0, function () {
    return this.millisecond() * 10;
});
addFormatToken(0, ['SSSSS', 5], 0, function () {
    return this.millisecond() * 100;
});
addFormatToken(0, ['SSSSSS', 6], 0, function () {
    return this.millisecond() * 1000;
});
addFormatToken(0, ['SSSSSSS', 7], 0, function () {
    return this.millisecond() * 10000;
});
addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
    return this.millisecond() * 100000;
});
addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
    return this.millisecond() * 1000000;
});


// ALIASES

addUnitAlias('millisecond', 'ms');

// PRIORITY

addUnitPriority('millisecond', 16);

// PARSING

addRegexToken('S',    match1to3, match1);
addRegexToken('SS',   match1to3, match2);
addRegexToken('SSS',  match1to3, match3);

var token;
for (token = 'SSSS'; token.length <= 9; token += 'S') {
    addRegexToken(token, matchUnsigned);
}

function parseMs(input, array) {
    array[MILLISECOND] = toInt(('0.' + input) * 1000);
}

for (token = 'S'; token.length <= 9; token += 'S') {
    addParseToken(token, parseMs);
}
// MOMENTS

var getSetMillisecond = makeGetSet('Milliseconds', false);

// node_modules/moment/src/lib/units/timezone.js
// FORMATTING

addFormatToken('z',  0, 0, 'zoneAbbr');
addFormatToken('zz', 0, 0, 'zoneName');

// MOMENTS

function getZoneAbbr () {
    return this._isUTC ? 'UTC' : '';
}

function getZoneName () {
    return this._isUTC ? 'Coordinated Universal Time' : '';
}

// node_modules/moment/src/lib/moment/prototype.js
var proto = Moment.prototype;

proto.add               = add;
proto.calendar          = calendar$1;
proto.clone             = clone;
proto.diff              = diff;
proto.endOf             = endOf;
proto.format            = format;
proto.from              = from;
proto.fromNow           = fromNow;
proto.to                = to;
proto.toNow             = toNow;
proto.get               = stringGet;
proto.invalidAt         = invalidAt;
proto.isAfter           = isAfter;
proto.isBefore          = isBefore;
proto.isBetween         = isBetween;
proto.isSame            = isSame;
proto.isSameOrAfter     = isSameOrAfter;
proto.isSameOrBefore    = isSameOrBefore;
proto.isValid           = isValid$2;
proto.lang              = lang;
proto.locale            = locale;
proto.localeData        = localeData;
proto.max               = prototypeMax;
proto.min               = prototypeMin;
proto.parsingFlags      = parsingFlags;
proto.set               = stringSet;
proto.startOf           = startOf;
proto.subtract          = subtract;
proto.toArray           = toArray;
proto.toObject          = toObject$1;
proto.toDate            = toDate;
proto.toISOString       = toISOString;
proto.inspect           = inspect;
proto.toJSON            = toJSON;
proto.toString          = toString;
proto.unix              = unix;
proto.valueOf           = valueOf;
proto.creationData      = creationData;

// Year
proto.year       = getSetYear;
proto.isLeapYear = getIsLeapYear;

// Week Year
proto.weekYear    = getSetWeekYear;
proto.isoWeekYear = getSetISOWeekYear;

// Quarter
proto.quarter = proto.quarters = getSetQuarter;

// Month
proto.month       = getSetMonth;
proto.daysInMonth = getDaysInMonth;

// Week
proto.week           = proto.weeks        = getSetWeek;
proto.isoWeek        = proto.isoWeeks     = getSetISOWeek;
proto.weeksInYear    = getWeeksInYear;
proto.isoWeeksInYear = getISOWeeksInYear;

// Day
proto.date       = getSetDayOfMonth;
proto.day        = proto.days             = getSetDayOfWeek;
proto.weekday    = getSetLocaleDayOfWeek;
proto.isoWeekday = getSetISODayOfWeek;
proto.dayOfYear  = getSetDayOfYear;

// Hour
proto.hour = proto.hours = getSetHour;

// Minute
proto.minute = proto.minutes = getSetMinute;

// Second
proto.second = proto.seconds = getSetSecond;

// Millisecond
proto.millisecond = proto.milliseconds = getSetMillisecond;

// Offset
proto.utcOffset            = getSetOffset;
proto.utc                  = setOffsetToUTC;
proto.local                = setOffsetToLocal;
proto.parseZone            = setOffsetToParsedOffset;
proto.hasAlignedHourOffset = hasAlignedHourOffset;
proto.isDST                = isDaylightSavingTime;
proto.isLocal              = isLocal;
proto.isUtcOffset          = isUtcOffset;
proto.isUtc                = isUtc;
proto.isUTC                = isUtc;

// Timezone
proto.zoneAbbr = getZoneAbbr;
proto.zoneName = getZoneName;

// Deprecations
proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

// node_modules/moment/src/lib/moment/moment.js
function createUnix (input) {
    return createLocal(input * 1000);
}

function createInZone () {
    return createLocal.apply(null, arguments).parseZone();
}

// node_modules/moment/src/lib/locale/pre-post-format.js
function preParsePostFormat (string) {
    return string;
}

// node_modules/moment/src/lib/locale/prototype.js
var proto$1 = Locale.prototype;

proto$1.calendar        = calendar;
proto$1.longDateFormat  = longDateFormat;
proto$1.invalidDate     = invalidDate;
proto$1.ordinal         = ordinal;
proto$1.preparse        = preParsePostFormat;
proto$1.postformat      = preParsePostFormat;
proto$1.relativeTime    = relativeTime;
proto$1.pastFuture      = pastFuture;
proto$1.set             = set;

// Month
proto$1.months            =        localeMonths;
proto$1.monthsShort       =        localeMonthsShort;
proto$1.monthsParse       =        localeMonthsParse;
proto$1.monthsRegex       = monthsRegex;
proto$1.monthsShortRegex  = monthsShortRegex;

// Week
proto$1.week = localeWeek;
proto$1.firstDayOfYear = localeFirstDayOfYear;
proto$1.firstDayOfWeek = localeFirstDayOfWeek;

// Day of Week
proto$1.weekdays       =        localeWeekdays;
proto$1.weekdaysMin    =        localeWeekdaysMin;
proto$1.weekdaysShort  =        localeWeekdaysShort;
proto$1.weekdaysParse  =        localeWeekdaysParse;

proto$1.weekdaysRegex       =        weekdaysRegex;
proto$1.weekdaysShortRegex  =        weekdaysShortRegex;
proto$1.weekdaysMinRegex    =        weekdaysMinRegex;

// Hours
proto$1.isPM = localeIsPM;
proto$1.meridiem = localeMeridiem;

// node_modules/moment/src/lib/locale/lists.js
function get$1 (format, index, field, setter) {
    var locale = getLocale();
    var utc = createUTC().set(setter, index);
    return locale[field](utc, format);
}

function listMonthsImpl (format, index, field) {
    if (isNumber$2(format)) {
        index = format;
        format = undefined;
    }

    format = format || '';

    if (index != null) {
        return get$1(format, index, field, 'month');
    }

    var i;
    var out = [];
    for (i = 0; i < 12; i++) {
        out[i] = get$1(format, i, field, 'month');
    }
    return out;
}

// ()
// (5)
// (fmt, 5)
// (fmt)
// (true)
// (true, 5)
// (true, fmt, 5)
// (true, fmt)
function listWeekdaysImpl (localeSorted, format, index, field) {
    if (typeof localeSorted === 'boolean') {
        if (isNumber$2(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';
    } else {
        format = localeSorted;
        index = format;
        localeSorted = false;

        if (isNumber$2(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';
    }

    var locale = getLocale(),
        shift = localeSorted ? locale._week.dow : 0;

    if (index != null) {
        return get$1(format, (index + shift) % 7, field, 'day');
    }

    var i;
    var out = [];
    for (i = 0; i < 7; i++) {
        out[i] = get$1(format, (i + shift) % 7, field, 'day');
    }
    return out;
}

function listMonths (format, index) {
    return listMonthsImpl(format, index, 'months');
}

function listMonthsShort (format, index) {
    return listMonthsImpl(format, index, 'monthsShort');
}

function listWeekdays (localeSorted, format, index) {
    return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
}

function listWeekdaysShort (localeSorted, format, index) {
    return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
}

function listWeekdaysMin (localeSorted, format, index) {
    return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
}

// node_modules/moment/src/lib/locale/en.js
getSetGlobalLocale('en', {
    dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
    ordinal : function (number) {
        var b = number % 10,
            output = (toInt(number % 100 / 10) === 1) ? 'th' :
            (b === 1) ? 'st' :
            (b === 2) ? 'nd' :
            (b === 3) ? 'rd' : 'th';
        return number + output;
    }
});

// node_modules/moment/src/lib/locale/locale.js
// Side effect imports
hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);

// node_modules/moment/src/lib/duration/abs.js
var mathAbs = Math.abs;

function abs () {
    var data           = this._data;

    this._milliseconds = mathAbs(this._milliseconds);
    this._days         = mathAbs(this._days);
    this._months       = mathAbs(this._months);

    data.milliseconds  = mathAbs(data.milliseconds);
    data.seconds       = mathAbs(data.seconds);
    data.minutes       = mathAbs(data.minutes);
    data.hours         = mathAbs(data.hours);
    data.months        = mathAbs(data.months);
    data.years         = mathAbs(data.years);

    return this;
}

// node_modules/moment/src/lib/duration/add-subtract.js
function addSubtract$1 (duration, input, value, direction) {
    var other = createDuration(input, value);

    duration._milliseconds += direction * other._milliseconds;
    duration._days         += direction * other._days;
    duration._months       += direction * other._months;

    return duration._bubble();
}

// supports only 2.0-style add(1, 's') or add(duration)
function add$1 (input, value) {
    return addSubtract$1(this, input, value, 1);
}

// supports only 2.0-style subtract(1, 's') or subtract(duration)
function subtract$1 (input, value) {
    return addSubtract$1(this, input, value, -1);
}

// node_modules/moment/src/lib/utils/abs-ceil.js
function absCeil (number) {
    if (number < 0) {
        return Math.floor(number);
    } else {
        return Math.ceil(number);
    }
}

// node_modules/moment/src/lib/duration/bubble.js
function bubble () {
    var milliseconds = this._milliseconds;
    var days         = this._days;
    var months       = this._months;
    var data         = this._data;
    var seconds, minutes, hours, years, monthsFromDays;

    // if we have a mix of positive and negative values, bubble down first
    // check: https://github.com/moment/moment/issues/2166
    if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
            (milliseconds <= 0 && days <= 0 && months <= 0))) {
        milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
        days = 0;
        months = 0;
    }

    // The following code bubbles up values, see the tests for
    // examples of what that means.
    data.milliseconds = milliseconds % 1000;

    seconds           = absFloor(milliseconds / 1000);
    data.seconds      = seconds % 60;

    minutes           = absFloor(seconds / 60);
    data.minutes      = minutes % 60;

    hours             = absFloor(minutes / 60);
    data.hours        = hours % 24;

    days += absFloor(hours / 24);

    // convert days to months
    monthsFromDays = absFloor(daysToMonths(days));
    months += monthsFromDays;
    days -= absCeil(monthsToDays(monthsFromDays));

    // 12 months -> 1 year
    years = absFloor(months / 12);
    months %= 12;

    data.days   = days;
    data.months = months;
    data.years  = years;

    return this;
}

function daysToMonths (days) {
    // 400 years have 146097 days (taking into account leap year rules)
    // 400 years have 12 months === 4800
    return days * 4800 / 146097;
}

function monthsToDays (months) {
    // the reverse of daysToMonths
    return months * 146097 / 4800;
}

// node_modules/moment/src/lib/duration/as.js
function as (units) {
    if (!this.isValid()) {
        return NaN;
    }
    var days;
    var months;
    var milliseconds = this._milliseconds;

    units = normalizeUnits(units);

    if (units === 'month' || units === 'year') {
        days   = this._days   + milliseconds / 864e5;
        months = this._months + daysToMonths(days);
        return units === 'month' ? months : months / 12;
    } else {
        // handle milliseconds separately because of floating point math errors (issue #1867)
        days = this._days + Math.round(monthsToDays(this._months));
        switch (units) {
            case 'week'   : return days / 7     + milliseconds / 6048e5;
            case 'day'    : return days         + milliseconds / 864e5;
            case 'hour'   : return days * 24    + milliseconds / 36e5;
            case 'minute' : return days * 1440  + milliseconds / 6e4;
            case 'second' : return days * 86400 + milliseconds / 1000;
            // Math.floor prevents floating point math errors here
            case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
            default: throw new Error('Unknown unit ' + units);
        }
    }
}

// TODO: Use this.as('ms')?
function valueOf$1 () {
    if (!this.isValid()) {
        return NaN;
    }
    return (
        this._milliseconds +
        this._days * 864e5 +
        (this._months % 12) * 2592e6 +
        toInt(this._months / 12) * 31536e6
    );
}

function makeAs (alias) {
    return function () {
        return this.as(alias);
    };
}

var asMilliseconds = makeAs('ms');
var asSeconds      = makeAs('s');
var asMinutes      = makeAs('m');
var asHours        = makeAs('h');
var asDays         = makeAs('d');
var asWeeks        = makeAs('w');
var asMonths       = makeAs('M');
var asYears        = makeAs('y');

// node_modules/moment/src/lib/duration/get.js
function get$2 (units) {
    units = normalizeUnits(units);
    return this.isValid() ? this[units + 's']() : NaN;
}

function makeGetter(name) {
    return function () {
        return this.isValid() ? this._data[name] : NaN;
    };
}

var milliseconds = makeGetter('milliseconds');
var seconds      = makeGetter('seconds');
var minutes      = makeGetter('minutes');
var hours        = makeGetter('hours');
var days         = makeGetter('days');
var months       = makeGetter('months');
var years        = makeGetter('years');

function weeks () {
    return absFloor(this.days() / 7);
}

// node_modules/moment/src/lib/duration/humanize.js
var round = Math.round;
var thresholds = {
    ss: 44,         // a few seconds to seconds
    s : 45,         // seconds to minute
    m : 45,         // minutes to hour
    h : 22,         // hours to day
    d : 26,         // days to month
    M : 11          // months to year
};

// helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
    return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
}

function relativeTime$1 (posNegDuration, withoutSuffix, locale) {
    var duration = createDuration(posNegDuration).abs();
    var seconds  = round(duration.as('s'));
    var minutes  = round(duration.as('m'));
    var hours    = round(duration.as('h'));
    var days     = round(duration.as('d'));
    var months   = round(duration.as('M'));
    var years    = round(duration.as('y'));

    var a = seconds <= thresholds.ss && ['s', seconds]  ||
            seconds < thresholds.s   && ['ss', seconds] ||
            minutes <= 1             && ['m']           ||
            minutes < thresholds.m   && ['mm', minutes] ||
            hours   <= 1             && ['h']           ||
            hours   < thresholds.h   && ['hh', hours]   ||
            days    <= 1             && ['d']           ||
            days    < thresholds.d   && ['dd', days]    ||
            months  <= 1             && ['M']           ||
            months  < thresholds.M   && ['MM', months]  ||
            years   <= 1             && ['y']           || ['yy', years];

    a[2] = withoutSuffix;
    a[3] = +posNegDuration > 0;
    a[4] = locale;
    return substituteTimeAgo.apply(null, a);
}

// This function allows you to set the rounding function for relative time strings
function getSetRelativeTimeRounding (roundingFunction) {
    if (roundingFunction === undefined) {
        return round;
    }
    if (typeof(roundingFunction) === 'function') {
        round = roundingFunction;
        return true;
    }
    return false;
}

// This function allows you to set a threshold for relative time strings
function getSetRelativeTimeThreshold (threshold, limit) {
    if (thresholds[threshold] === undefined) {
        return false;
    }
    if (limit === undefined) {
        return thresholds[threshold];
    }
    thresholds[threshold] = limit;
    if (threshold === 's') {
        thresholds.ss = limit - 1;
    }
    return true;
}

function humanize (withSuffix) {
    if (!this.isValid()) {
        return this.localeData().invalidDate();
    }

    var locale = this.localeData();
    var output = relativeTime$1(this, !withSuffix, locale);

    if (withSuffix) {
        output = locale.pastFuture(+this, output);
    }

    return locale.postformat(output);
}

// node_modules/moment/src/lib/duration/iso-string.js
var abs$1 = Math.abs;

function toISOString$1() {
    // for ISO strings we do not use the normal bubbling rules:
    //  * milliseconds bubble up until they become hours
    //  * days do not bubble at all
    //  * months bubble up until they become years
    // This is because there is no context-free conversion between hours and days
    // (think of clock changes)
    // and also not between days and months (28-31 days per month)
    if (!this.isValid()) {
        return this.localeData().invalidDate();
    }

    var seconds = abs$1(this._milliseconds) / 1000;
    var days         = abs$1(this._days);
    var months       = abs$1(this._months);
    var minutes, hours, years;

    // 3600 seconds -> 60 minutes -> 1 hour
    minutes           = absFloor(seconds / 60);
    hours             = absFloor(minutes / 60);
    seconds %= 60;
    minutes %= 60;

    // 12 months -> 1 year
    years  = absFloor(months / 12);
    months %= 12;


    // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
    var Y = years;
    var M = months;
    var D = days;
    var h = hours;
    var m = minutes;
    var s = seconds;
    var total = this.asSeconds();

    if (!total) {
        // this is the same as C#'s (Noda) and python (isodate)...
        // but not other JS (goog.date)
        return 'P0D';
    }

    return (total < 0 ? '-' : '') +
        'P' +
        (Y ? Y + 'Y' : '') +
        (M ? M + 'M' : '') +
        (D ? D + 'D' : '') +
        ((h || m || s) ? 'T' : '') +
        (h ? h + 'H' : '') +
        (m ? m + 'M' : '') +
        (s ? s + 'S' : '');
}

// node_modules/moment/src/lib/duration/prototype.js
var proto$2 = Duration.prototype;

proto$2.isValid        = isValid$1;
proto$2.abs            = abs;
proto$2.add            = add$1;
proto$2.subtract       = subtract$1;
proto$2.as             = as;
proto$2.asMilliseconds = asMilliseconds;
proto$2.asSeconds      = asSeconds;
proto$2.asMinutes      = asMinutes;
proto$2.asHours        = asHours;
proto$2.asDays         = asDays;
proto$2.asWeeks        = asWeeks;
proto$2.asMonths       = asMonths;
proto$2.asYears        = asYears;
proto$2.valueOf        = valueOf$1;
proto$2._bubble        = bubble;
proto$2.get            = get$2;
proto$2.milliseconds   = milliseconds;
proto$2.seconds        = seconds;
proto$2.minutes        = minutes;
proto$2.hours          = hours;
proto$2.days           = days;
proto$2.weeks          = weeks;
proto$2.months         = months;
proto$2.years          = years;
proto$2.humanize       = humanize;
proto$2.toISOString    = toISOString$1;
proto$2.toString       = toISOString$1;
proto$2.toJSON         = toISOString$1;
proto$2.locale         = locale;
proto$2.localeData     = localeData;

// Deprecations
proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
proto$2.lang = lang;

// node_modules/moment/src/lib/duration/duration.js
// Side effect imports

// node_modules/moment/src/lib/units/timestamp.js
// FORMATTING

addFormatToken('X', 0, 0, 'unix');
addFormatToken('x', 0, 0, 'valueOf');

// PARSING

addRegexToken('x', matchSigned);
addRegexToken('X', matchTimestamp);
addParseToken('X', function (input, array, config) {
    config._d = new Date(parseFloat(input, 10) * 1000);
});
addParseToken('x', function (input, array, config) {
    config._d = new Date(toInt(input));
});

// node_modules/moment/src/lib/units/units.js
// Side effect imports

// node_modules/moment/src/moment.js
//! moment.js
//! version : 2.18.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

hooks.version = '2.18.1';

setHookCallback(createLocal);

hooks.fn                    = proto;
hooks.min                   = min;
hooks.max                   = max;
hooks.now                   = now;
hooks.utc                   = createUTC;
hooks.unix                  = createUnix;
hooks.months                = listMonths;
hooks.isDate                = isDate$1;
hooks.locale                = getSetGlobalLocale;
hooks.invalid               = createInvalid;
hooks.duration              = createDuration;
hooks.isMoment              = isMoment;
hooks.weekdays              = listWeekdays;
hooks.parseZone             = createInZone;
hooks.localeData            = getLocale;
hooks.isDuration            = isDuration;
hooks.monthsShort           = listMonthsShort;
hooks.weekdaysMin           = listWeekdaysMin;
hooks.defineLocale          = defineLocale;
hooks.updateLocale          = updateLocale;
hooks.locales               = listLocales;
hooks.weekdaysShort         = listWeekdaysShort;
hooks.normalizeUnits        = normalizeUnits;
hooks.relativeTimeRounding = getSetRelativeTimeRounding;
hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
hooks.calendarFormat        = getCalendarFormat;
hooks.prototype             = proto;

// src/utils/dates.coffee
var renderDate = function(date, format) {
  return hooks(date).format(format);
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

Shop.El = El$1;

El$1.View.prototype.renderCurrency = renderUICurrencyFromJSON;

El$1.View.prototype.renderDate = renderDate;

El$1.View.prototype.isEmpty = function() {
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

Shop.analytics = analytics$1$1;

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
    return index$1.get('referrer');
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
  var cartId, checkoutPayment, checkoutShippingAddress, checkoutUser, data, i, item, items, j, k2, len, len1, meta, p, promo, ps, queries, r, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref20, ref4, ref5, ref6, ref7, ref8, ref9, referrer, settings, tag, tags, v2;
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
  index$1.set('referrer', referrer);
  promo = (ref9 = queries.promo) != null ? ref9 : '';
  items = index$1.get('items');
  cartId = index$1.get('cartId');
  meta = index$1.get('order.metadata');
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
    if (data[k] == null) {
      data[k] = opts[k];
    } else {
      ref19 = data[k];
      for (k2 in ref19) {
        v2 = ref19[k2];
        if (v2 == null) {
          data[k][k2] = (ref20 = opts[k]) != null ? ref20[k2] : void 0;
        }
      }
    }
  }
  this.data.set(data);
  checkoutUser = index$1.get('checkout-user');
  checkoutShippingAddress = index$1.get('checkout-shippingAddress');
  checkoutPayment = index$1.get('checkout-payment');
  if (checkoutUser) {
    this.data.set('user', checkoutUser);
    index$1.remove('checkout-user');
  }
  if (checkoutShippingAddress) {
    this.data.set('order.shippingAddress', checkoutShippingAddress);
    index$1.remove('checkout-shippingAddress');
  }
  if (checkoutPayment) {
    this.data.set('payment', checkoutPayment);
    index$1.remove('checkout-payment');
  }
  settings = {};
  if (opts.key) {
    settings.key = opts.key;
  }
  if (opts.endpoint) {
    settings.endpoint = opts.endpoint;
  }
  this.client = new Api$1(settings);
  this.cart = new Cart$1(this.client, this.data, opts.cartOptions);
  this.cart.onCart = (function(_this) {
    return function() {
      var _, cart, mcCId, ref21;
      index$1.set('cartId', _this.data.get('order.cartId'));
      ref21 = getMCIds(queries), _ = ref21[0], mcCId = ref21[1];
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
  tags = El$1.mount(elementsToMount, {
    cart: this.cart,
    client: this.client,
    data: this.data
  });
  El$1.update = function() {
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
      index$1.set('items', items);
      _this.cart._cartUpdate({
        tax: _this.data.get('order.tax'),
        total: _this.data.get('order.total')
      });
      if (item != null) {
        m.trigger(Events.UpdateItem, item);
      }
      meta = _this.data.get('order.metadata');
      index$1.set('order.metadata', meta);
      _this.cart.invoice();
      return El$1.scheduleUpdate();
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
    p = new Promise$2(function(resolve) {
      return tag.one('updated', function() {
        return resolve();
      });
    });
    ps.push(p);
  }
  Promise$2.settle(ps).then(function() {
    requestAnimationFrame(function() {
      var j, len1, tagSelectors;
      tagSelectors = tagNames.join(', ');
      for (j = 0, len1 = tags.length; j < len1; j++) {
        tag = tags[j];
        $(tag.root).addClass('ready').find(tagSelectors).addClass('ready');
      }
      return m.trigger(Events.Ready);
    });
    return El$1.update();
  })["catch"](function(err) {
    var ref21;
    return typeof window !== "undefined" && window !== null ? (ref21 = window.Raven) != null ? ref21.captureException(err) : void 0 : void 0;
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
    var ref21;
    console.log(err);
    return typeof window !== "undefined" && window !== null ? (ref21 = window.Raven) != null ? ref21.captureException(err) : void 0 : void 0;
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
  El$1.scheduleUpdate();
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
        El$1.scheduleUpdate();
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

return Shop$1;

}());
