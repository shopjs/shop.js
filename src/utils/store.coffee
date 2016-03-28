store = require 'store'
cookies = require 'js-cookies'

if store.enabled
  module.exports = store
else
  module.exports =
    get: (k)->
      v = cookies.get(k)
      try
        v = JSON.parse v
      catch e

      return v

    set: (k, v)->
      keys = cookies.get('_keys') ? ''
      cookies.set '_keys', keys += ' ' + k
      return cookies.set k, JSON.stringify(v)

    clear: ->
      keys = cookies.get('_keys') ? ''
      ks = keys.split ' '
      for k in ks
        cookies.expire k

      cookies.expire '_keys'
