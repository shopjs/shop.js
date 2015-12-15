Control = require './control'
riot = require 'riot'
isObject = require 'is-object'

isABrokenBrowser = (window.navigator.userAgent.indexOf('MSIE') > 0 || window.navigator.userAgent.indexOf('Trident') > 0)

module.exports = class Select extends Control
  tag: 'select-control'
  html: require '../../templates/controls/select.jade'
  tags: false
  min: 10
  options: null

  lastValueSet: null
  ignore: false

  events:
    updated: ()->
      @onUpdated()

  getValue: (event)->
    return $(event.target).val()?.trim().toLowerCase()

  change: ()->
    super
    riot.update()

  initSelect: ($select)->
    $select.val @input.ref.get(@input.name)
    $select.select2(
      tags: @tags
      placeholder: @placeholder
      minimumResultsForSearch: @min
      width: '100%' if isABrokenBrowser
    ).change((event)=>@change(event))

  init:(opts)->
    super

    @style = @style || 'width:100%'

  onUpdated: ()->
    if !@input?
      return

    $select = $(@root).find('select')
    if $select[0]?
      if isABrokenBrowser
        $(@root).children('.select2').css width: '100%'
      if !@initialized
        requestAnimationFrame ()=>
          @initSelect($select)
          @initialized = true
    else
      requestAnimationFrame ()=>
        @update()

    @on 'unmount', ()=>
      $select = $(@root).find('select')
