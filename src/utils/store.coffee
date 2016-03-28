store = require 'store'
cookie = require 'js-cookie'

if store.enabled
  module.exports = store
else
  module.exports =
    get: (k)->
      v = cookie.get(k)
      try
        v = JSON.parse v
      catch e

      return v

    set: (k, v)->
      keys = cookie.get('_keys') ? ''
      cookie.set '_keys', keys += ' ' + k
      return cookie.set k, JSON.stringify(v)

    clear: ->
      keys = cookie.get('_keys') ? ''
      ks = keys.split ' '
      for k in ks
        cookie.expire k

      cookie.expire '_keys'
