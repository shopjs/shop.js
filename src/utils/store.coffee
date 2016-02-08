store = require 'store'
cookies = require 'cookies-js'

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
      return cookies.set k, JSON.stringify(v)

