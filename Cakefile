require 'shortcake'

fs        = require 'fs'
requisite = require 'requisite'

option '-b', '--browser [browser]', 'browser to use for tests'
option '-g', '--grep [filter]',     'test filter'
option '-t', '--test [test]',       'specify test to run'
option '-v', '--verbose',           'enable verbose test logging'

task 'clean', 'clean project', ->
  exec 'rm -rf lib'

task 'build', 'build project', (cb) ->
  todo = 2
  done = (err) ->
    throw err if err?
    cb() if --todo is 0

  exec 'coffee -bcm -o lib/ src/', done

  opts =
    entry:      'src/browser.coffee'
    stripDebug: true

  requisite.bundle opts, (err, bundle) ->
    return done err if err?

    # Strip out unnecessary api bits
    bundle.moduleCache['./blueprints/browser'].walkAst (node) ->
      if (node.type == 'ObjectExpression') and (Array.isArray node.properties)

        node.properties = node.properties.filter (prop) ->
          if prop?.key?.name == 'method' and prop?.value?.value == 'POST'
            return false
          if prop?.key?.name == 'expects' and prop?.value?.name == 'statusOk'
            return false
          true

      false

    fs.writeFile 'crowdstart.js', (bundle.toString opts), 'utf8', done

task 'build-min', 'build project', ['build'], ->
  exec 'uglifyjs crowdstart.js --compress --mangle --lint=false > crowdstart.min.js'

server = do require 'connect'

task 'static-server', 'Run static server for tests', (cb) ->
  port = process.env.PORT ? 3333

  server.use (require 'serve-static') './test/fixtures'
  server = require('http').createServer(server).listen port, cb

task 'test', 'Run tests', ['build', 'static-server'], (opts) ->
  bail     = opts.bail     ? true
  coverage = opts.coverage ? false
  grep     = opts.grep     ? ''
  test     = opts.test     ? 'test/ test/server/ test/browser/'
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

task 'watch:test', 'watch for changes and re-run tests', ->
  invoke 'watch'

  require('vigil').watch __dirname, (filename, stats) ->
    if /^src/.test filename
      invoke 'test'

    if /^test/.test filename
      invoke 'test', test: filename

task 'major', ['version'], ->
task 'minor', ['version'], ->
task 'patch', ['version'], ->
task 'version', 'change version of project', (opts) ->
  {stdout, stderr} = yield exec.quiet 'git status --porcelain'
  if stderr or stdout
    console.log 'working directory not clean'
    return

  yield invoke 'build-min'

  pkg     = require './package'
  version = pkg.version

  level = (opts.arguments.filter (v) -> v isnt 'version')[0]
  [major, minor, patch] = (parseInt n for n in version.split '.')

  switch level
    when 'major'
      newVersion = "#{major + 1}.0.0"
    when 'minor'
      newVersion = "#{major}.#{minor + 1}.0"
    when 'patch'
      newVersion = "#{major}.#{minor}.#{patch + 1}"
    else
      console.log 'Unable to parse versioning'
      process.exit 1

  console.log "v#{version} -> v#{newVersion}"
  console.log

  data = fs.readFileSync 'README.md', 'utf8'
  data = data.replace (new RegExp version, 'g'), newVersion
  fs.writeFileSync 'README.md', data, 'utf8'

  pkg.version = newVersion
  fs.writeFileSync 'package.json', (JSON.stringify pkg, null, 2), 'utf8'

  yield exec """
  git add .
  git commit -m #{newVersion}
  git tag v#{newVersion}
  """

task 'publish', 'publish project', ->
  exec.parallel '''
  git push
  git push --tags
  npm publish
  '''
