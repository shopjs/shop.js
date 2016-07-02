require 'shortcake'

use 'cake-version'
use 'cake-publish'

fs        = require 'mz/fs'
requisite = require 'requisite'
glob = require 'glob'
path = require 'path'

option '-b', '--browser [browser]', 'browser to use for tests'
option '-g', '--grep [filter]',     'test filter'
option '-t', '--test [test]',       'specify test to run'
option '-v', '--verbose',           'enable verbose test logging'

task 'clean', 'clean project', ->
  exec 'rm -rf lib'

task 'build', 'build project', ->
  # Compile src/ to lib/
  yield exec 'coffee -bcm -o lib/ src/'

  # Create shop.js bundle
  bundle = yield requisite.bundle
    entry:      'src/index.coffee'

  js = bundle.toString stripDebug: true
  yield fs.writeFile 'shop.js', js, 'utf8'

  glob 'src/templates/**/*.jade', (err, files) ->
    for file in files
      do (file) ->
        console.log file
        dst = file.replace /\.jade/, '.js'
                  .replace /^src\//, 'lib/'
        console.log dst
        requisite.bundle sourceMap: false, bare:true, naked: true, entry: file, (err, js) ->
          exec "mkdir -p #{path.dirname dst}", (err, sout, serr) ->
            console.log err, sout, serr, js.toString()
            fs.writeFile dst, js.toString()

task 'build-min', 'build project', ['build'], ->
  exec 'uglifyjs shop.js --compress --mangle --lint=false > shop.min.js'

server = do require 'connect'

task 'static-server', 'Run static server for tests', (cb) ->
  port = process.env.PORT ? 3333

  server.use (require 'serve-static') './test/fixtures'
  server = require('http').createServer(server).listen port, cb

task 'test', 'Run tests', ['build', 'static-server'], (opts) ->
  bail     = opts.bail     ? true
  coverage = opts.coverage ? false
  grep     = opts.grep     ? ''
  test     = opts.test     ? 'test/'
  verbose  = opts.verbose  ? ''

  bail    = '--bail' if bail
  grep    = "--grep #{opts.grep}" if grep
  verbose = 'DEBUG=nightmare VERBOSE=true CROWDSTART_DEBUG=1' if verbose

  if coverage
    bin = 'istanbul --print=none cover _mocha --'
  else
    bin = 'mocha'

  {status} = yield exec.interactive "NODE_ENV=test CROWDSTART_KEY='' CROWDSTART_ENDPOINT='' #{verbose}
        #{bin}
        --colors
        --reporter spec
        --timeout 10000000
        --compilers coffee:coffee-script/register
        --require co-mocha
        --require postmortem/register
        #{bail}
        #{grep}
        #{test}"

  server.close()
  process.exit status

task 'test-ci', 'Run tests', (opts) ->
  invoke 'test', bail: true, coverage: true

task 'coverage', 'Process coverage statistics', ->
  exec '''
    cat ./coverage/lcov.info | coveralls
    cat ./coverage/coverage.json | codecov
    rm -rf coverage/
    '''

task 'watch', 'watch for changes and recompile project', ->
  exec 'coffee -bcmw -o lib/ src/'
  exec 'bebop -o'

task 'watch:test', 'watch for changes and re-run tests', ->
  invoke 'watch'

  require('vigil').watch __dirname, (filename, stats) ->
    if /^src/.test filename
      invoke 'test'

    if /^test/.test filename
      invoke 'test', test: filename
