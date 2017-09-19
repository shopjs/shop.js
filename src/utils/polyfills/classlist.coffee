# https://github.com/remy/polyfills/blob/master/classList.js
export default ()->
  if !window
    return

  DOMTokenList = (el) ->

    @el = el
    # The className needs to be trimmed and split on whitespace
    # to retrieve a list of classes.
    classes = el.className.replace(/^\s+|\s+$/g, '').split(/\s+/)
    i = 0
    while i < classes.length
      push.call this, classes[i]
      i++
    return

  defineElementGetter = (obj, prop, getter) ->
    if Object.defineProperty
      Object.defineProperty obj, prop, get: getter
    else
      obj.__defineGetter__ prop, getter
    return

  if typeof window.Element == 'undefined' or 'classList' of document.documentElement
    return

  prototype = Array.prototype
  push = prototype.push
  splice = prototype.splice
  join = prototype.join

  DOMTokenList.prototype =
    add: (token) ->
      if @contains(token)
        return
      push.call this, token
      @el.className = @toString()
      return
    contains: (token) ->
      @el.className.indexOf(token) != -1
    item: (index) ->
      @[index] or null
    remove: (token) ->
      if !@contains(token)
        return
      i = 0
      while i < @length
        if @[i] == token
          break
        i++
      splice.call this, i, 1
      @el.className = @toString()
      return
    toString: ->
      join.call this, ' '
    toggle: (token) ->
      if !@contains(token)
        @add token
      else
        @remove token
      @contains token

  window.DOMTokenList = DOMTokenList
  defineElementGetter Element.prototype, 'classList', ->
    new DOMTokenList(this)
