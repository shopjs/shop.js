window.Promise ?= require 'broken'

raf = require 'raf'
window.requestAnimationFrame ?= raf
window.cancelAnimationFrame  ?= raf.cancel
