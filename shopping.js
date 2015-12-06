(function (global) {
  var process = {
    title: 'browser',
    browser: true,
    env: {},
    argv: [],
    nextTick: function (fn) {
      setTimeout(fn, 0)
    },
    cwd: function () {
      return '/'
    },
    chdir: function () {
    }
  };
  // Require module
  function require(file, callback) {
    if ({}.hasOwnProperty.call(require.cache, file))
      return require.cache[file];
    // Handle async require
    if (typeof callback == 'function') {
      require.load(file, callback);
      return
    }
    var resolved = require.resolve(file);
    if (!resolved)
      throw new Error('Failed to resolve module ' + file);
    var module$ = {
      id: file,
      require: require,
      filename: file,
      exports: {},
      loaded: false,
      parent: null,
      children: []
    };
    var dirname = file.slice(0, file.lastIndexOf('/') + 1);
    require.cache[file] = module$.exports;
    resolved.call(module$.exports, module$, module$.exports, dirname, file);
    module$.loaded = true;
    return require.cache[file] = module$.exports
  }
  require.modules = {};
  require.cache = {};
  require.resolve = function (file) {
    return {}.hasOwnProperty.call(require.modules, file) ? require.modules[file] : void 0
  };
  // define normal static module
  require.define = function (file, fn) {
    require.modules[file] = fn
  };
  require.waiting = {};
  // define asynchrons module
  require.async = function (url, fn) {
    require.modules[url] = fn;
    while (cb = require.waiting[url].shift())
      cb(require(url))
  };
  // Load module asynchronously
  require.load = function (url, cb) {
    var script = document.createElement('script'), existing = document.getElementsByTagName('script')[0], callbacks = require.waiting[url] = require.waiting[url] || [];
    // we'll be called when asynchronously defined.
    callbacks.push(cb);
    // load module
    script.type = 'text/javascript';
    script.async = true;
    script.src = url;
    existing.parentNode.insertBefore(script, existing)
  };
  // source: src/shopping.coffee
  require.define('./shopping', function (module, exports, __dirname, __filename) {
    var Shopping;
    module.exports = Shopping = function () {
      function Shopping() {
      }
      return Shopping
    }()
  });
  // source: src/index.coffee
  require.define('./index', function (module, exports, __dirname, __filename) {
    var Shopping;
    if (global.Crowdstart == null) {
      global.Crowdstart = {}
    }
    Shopping = require('./shopping');
    Crowdstart.Shopping = Shopping;
    module.exports = Crowdstart
  });
  require('./index')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNob3BwaW5nLmNvZmZlZSIsImluZGV4LmNvZmZlZSJdLCJuYW1lcyI6WyJTaG9wcGluZyIsIm1vZHVsZSIsImV4cG9ydHMiLCJnbG9iYWwiLCJDcm93ZHN0YXJ0IiwicmVxdWlyZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxRQUFKLEM7SUFFQUMsTUFBQSxDQUFPQyxPQUFQLEdBQWlCRixRQUFBLEdBQVksWUFBVztBQUFBLE1BQ3RDLFNBQVNBLFFBQVQsR0FBb0I7QUFBQSxPQURrQjtBQUFBLE1BR3RDLE9BQU9BLFFBSCtCO0FBQUEsS0FBWixFOzs7O0lDRjVCLElBQUFBLFFBQUEsQzs7TUFBQUcsTUFBQSxDQUFPQyxVQUFQLEdBQXFCLEU7O0lBRXJCSixRQUFBLEdBQVdLLE9BQUEsQ0FBUSxZQUFSLENBQVgsQztJQUNBRCxVQUFBLENBQVdKLFFBQVgsR0FBc0JBLFFBQXRCLEM7SUFFQUMsTUFBQSxDQUFPQyxPQUFQLEdBQWlCRSxVIiwic291cmNlUm9vdCI6Ii9zcmMifQ==