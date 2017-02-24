import * as store from 'store'
import * as cookie from 'js-cookie'
import * as md5 from 'blueimp-md5'

export default do ->
  postFix = md5 window.location.host
  key = (k) -> "#{k}_#{postFix}"

  if store.enabled
      get: (k) ->
        store.get key k

      set: (k, v) ->
        store.set (key k), v

      remove: (k) ->
        store.remove key k

      clear: ->
        store.clear()
  else
      get: (k) ->
        cookie.getJSON key k

      set: (k, v) ->
        ks = (cookie.getJSON key '_keys') ? []
        ks.push k
        cookie.set (key '_keys'), ks
        cookie.set (key k), v

      remove: (k) ->
        cookie.remove key k

      clear: ->
        ks = (cookie.getJSON key '_keys') ? []
        for k in ks
          cookie.remove k
        cookie.remove key '_keys'
