#addEventListener polyfill 1.0 / Eirik Backer / MIT Licence
export default () ->
  if !window || !document
    return

  win = window
  doc = document
  #No need to polyfill

  docHijack = (p) ->
    old = doc[p]

    doc[p] = (v) ->
      addListen old(v)

    return

  addEvent = (event, fn, self) ->
    (self = this).attachEvent 'on' + event, (ev) ->
      e = ev or win.event
      e.preventDefault = e.preventDefault or ->
        e.returnValue = false
        return
      e.stopPropagation = e.stopPropagation or ->
        e.cancelBubble = true
        return
      fn.call self, e
      return

  addListen = (obj, i) ->
    if i = obj.length
      while i--
        obj[i].addEventListener = addEvent
    else
      obj.addEventListener = addEvent
    obj

  if win.addEventListener
    return
  addListen [
    doc
    win
  ]
  if 'Element' of win
    win.Element::addEventListener = addEvent
  else
    #IE < 8
    doc.attachEvent 'onreadystatechange', ->
      addListen doc.all
      return
    #Make sure we also init at domReady
    docHijack 'getElementsByTagName'
    docHijack 'getElementById'
    docHijack 'createElement'
    addListen doc.all
