store = require 'store'
cookie = require 'js-cookie'

md5 = require 'crypto-js/md5'
postFix = md5 window.location.host

if store.enabled
  module.exports =
    get: (k)->
      k += "_" + postFix
      store.get k
    set: (k, v)->
      k += "_" + postFix
      store.set k, v

    remove: (k)->
      k += "_" + postFix
      store.remove k

    clear: ->
      store.clear()
else
  module.exports =
    get: (k)->
      k += "_" + postFix
      v = cookie.get(k)
      try
        v = JSON.parse v
      catch e

      return v

    set: (k, v)->
      k += "_" + postFix
      keys = cookie.get('_keys' + postFix) ? ''
      cookie.set '_keys', keys += ' ' + k
      return cookie.set k, JSON.stringify(v)

    remove: (k)->
      k+= "_" + postFix
      cookie.remove k

    clear: ->
      keys = cookie.get('_keys' + postFix) ? ''
      ks = keys.split ' '
      for k in ks
        cookie.remove k

      cookie.remove '_keys'
