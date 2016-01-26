fs        = require 'fs'
path      = require 'path'
exec      = require('executive').interactive
requisite = require 'requisite'

require 'broken'
Promise.suppressUncaughtRejectionError = false

compileCoffee = (src) ->
  return unless /^src|src\/index.coffee$/.test src

  requisite.bundle
    entry: 'src/index.coffee'
    globalRequire: true
  , (err, bundle) ->
    return console.error err if err?
    fs.writeFileSync 'shop.js', bundle.toString(), 'utf8'
    console.log 'compiled shop.js'

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
    coffee: compileCoffee
    jade:   compileCoffee
