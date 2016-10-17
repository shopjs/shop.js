fs        = require 'fs'
path      = require 'path'
exec      = require('shortcake').exec
requisite = require 'requisite'

require 'broken'
Promise.suppressUncaughtRejectionError = false

compileCoffee = (src) ->
  return unless /^src|src\/index.coffee$/.test src

  exec 'cake build'

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
