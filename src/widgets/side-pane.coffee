import El from 'el.js'

import Events  from '../events'
import html from '../../templates/widgets/side-pane'
import m       from '../mediator'

class SidePane extends El.View
  tag:  'side-pane'
  html: html

  opened: false

  init: ->
    super

    m.on Events.SidePaneOpen, =>
      @toggle true
    m.on Events.SidePaneClose, =>
      @toggle false

  open: ()->
    @toggle true

  close: ()->
    @toggle false

  toggle: (opened)->
    if opened == true || opened == false
      @opened = opened
    else
      @opened = !@opened

    if @opened
      m.trigger Events.SidePaneOpened
    else
      m.trigger Events.SidePaneClosed

    @scheduleUpdate()

export default SidePane

