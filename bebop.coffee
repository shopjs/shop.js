exec = require 'executive'
fs   = require 'fs'
path = require 'path'

debounce = (fn, wait = 500) ->
  last = (new Date) - wait
  ->
    now = new Date

    # Return if we haven't waited long enough
    return if wait > (now - last)

    fn.apply null, arguments
    last = now

writeFile = (dst, content) ->
  fs.writeFile dst, content, 'utf8', (err) ->
    console.error err if err?

compileCoffee = (src) ->
  return
  return unless /^src|src\/index.coffee$/.test src
  exec 'cake build'

compileStylus = ->
  src = 'src/css/theme.styl'
  dst = 'lib/theme.css'

  stylus       = require 'stylus'
  postcss      = require 'poststylus'
  autoprefixer = require 'autoprefixer'
  comments     = require 'postcss-discard-comments'
  lost         = require 'lost-stylus'
  rupture      = require 'rupture'
  CleanCSS     = require 'clean-css'

  style = stylus fs.readFileSync src, 'utf8'
    .set 'filename', src
    .set 'paths', [
      __dirname + '/src/css'
      __dirname + '/node_modules'
    ]
    .set 'include css', true
    .set 'sourcemap',
      basePath:   ''
      sourceRoot: '../'
    .use lost()
    .use rupture()
    .use postcss [
      autoprefixer browsers: '> 1%'
      'lost'
      'rucksack-css'
      'css-mqpacker'
      comments removeAll: true
    ]

  style.render (err, css) ->
    return console.error err if err
    # if process.env.PRODUCTION
    #   minifier = new CleanCSS
    #     aggressiveMerging: false
    #     semanticMerging:   false
    #   minified = minifier.minify css
    #   writeFile dst, minified.styles
    # else
    sourceMapURL = (path.basename dst) + '.map'
    css = css + "/*# sourceMappingURL=#{sourceMapURL} */"
    writeFile dst, css
    writeFile dst + '.map', JSON.stringify style.sourcemap
  true

coffeeCompiler = debounce compileCoffee
stylusCompiler = debounce compileStylus

module.exports =
  port: 4242

  cwd: process.cwd()

  exclude: [
    /lib/
    /node_modules/
    /vendor/
  ]

  compilers:
    css: -> false
    coffee: coffeeCompiler
    pug:    coffeeCompiler
    styl:   stylusCompiler
