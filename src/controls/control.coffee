import El from 'el.js'
import Events       from  '../events'
import m            from  '../mediator'

scrolling = false

export default class Control extends El.Input
  init: ()->
    if !@input? && !@lookup?
      throw new Error 'No input or lookup provided'

    if !@input? && @inputs?
      @input = @inputs[@lookup]

    if !@input?
      @input =
        name:       @lookup
        ref:        @data.ref @lookup
        validate:   (ref, name)->
          return Promise.resolve [ref, name]

    # prevent weird yield bug
    if @input?
      super

  getValue: (event)->
    return $(event.target).val()?.trim()

  error: (err)->
    if err instanceof DOMException
      console.log('WARNING: Error in riot dom manipulation ignored.', err)
      return

    super

    if !scrolling
      scrolling = true
      $('html, body').animate(
        scrollTop: $(@root).offset().top - $(window).height()/2
      ,
        complete: ->
          scrolling = false
        duration: 500
      )
    m.trigger Events.ChangeFailed, @input.name, @input.ref.get @input.name

  change: ()->
    super
    m.trigger Events.Change, @input.name, @input.ref.get @input.name

  changed: (value)->
    m.trigger Events.ChangeSuccess, @input.name, value

