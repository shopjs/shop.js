import El    from 'el.js'
import html   from '../../templates/containers/view'

class View extends El.View
  tag:  'view'
  html: html

  init: ->
    super

View.register()
