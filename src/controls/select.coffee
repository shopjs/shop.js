Control = require './control'

isABrokenBrowser = (window.navigator.userAgent.indexOf('MSIE') > 0 || window.navigator.userAgent.indexOf('Trident') > 0)

module.exports = class Select extends Control
  tag: 'select-control'
  html: require '../../templates/controls/select.jade'
  tags: false
  min: 10

  lastValueSet: null

  options: ()->
    return @opts

  changed: false

  change: ()->
    super
    @changed = true

  isCustom: (o)->
    options = o
    if !options?
      options = @options()

    for name, value of options
      if isObject value
        if !@isCustom value
          return false

      else if name == @input.ref input.name
        return false

    return true

  initSelect: ($select)->
    $select.select2(
      tags: @tags
      placeholder: @placeholder
      minimumResultsForSearch: @min
      width: '100%' if isABrokenBrowser
    ).change((event)=>@change(event))

  init:(opts)->
    super

    @style = @style || 'width:100%'

    @on 'updated', ()=>
      $select = $(@root).find('select')
      if $select[0]?
        if isABrokenBrowser
          $(@root).children('.select2').css width: '100%'
        if !@initialized
          requestAnimationFrame ()=>
            @initSelect($select)
            @initialized = true
            @changed = true
        else if @changed
          requestAnimationFrame ()=>
            # this bypasses caching of select option names
            # no other way to force select2 to flush cache
            if @isCustom()
              $select.select('destroy')
              @initSelect($select)
            @changed = false
            $select.select2('val', @input.ref input.name)
      else
        requestAnimationFrame ()=>
          @update()

    @on 'unmount', ()=>
      $select = $(@root).find('select')

Select.register()
