Text = require './text'
riot = require 'riot'
isObject = require 'is-object'
requestAnimationFrame = require 'raf'

isABrokenBrowser = (window.navigator.userAgent.indexOf('MSIE') > 0 || window.navigator.userAgent.indexOf('Trident') > 0)

coolDown = -1

module.exports = class Select extends Text
  tag: 'select-control'
  html: require '../../templates/controls/select'
  tags: false
  min: 10

  selectOptions: {}

  options: ->
    return @selectOptions

  readOnly: false
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
    options = []
    invertedOptions = {}
    for value, name of @options()
      options.push
        text: name
        value: value

      invertedOptions[name] = value

    $select.selectize(
      dropdownParent: 'body'
      # valueField: 'value'
      # labelField: 'text'
      # searchField: 'text'
    ).on 'change', (event)=>
      # This isn't working right, sometimes you have one change firing events on unrelated fields
      if coolDown != -1
        return

      coolDown = setTimeout ()->
        coolDown = -1
      , 100

      @change(event)
      event.preventDefault()
      event.stopPropagation()
      return false

    select = $select[0]
    select.selectize.addOption options
    select.selectize.addItem [@input.ref.get(@input.name)] || [], true
    select.selectize.refreshOptions false

    #support auto fill
    $input = $select.parent().find('.selectize-input input:first')
    $input.on('change', (event)->
      val = $(event.target).val()
      if invertedOptions[val]?
        $select[0].selectize.setValue(invertedOptions[val])
    )

    #support read only
    if @readOnly
      $input.attr('readonly', true)

  init:(opts)->
    super

    @style = @style || 'width:100%'

  onUpdated: ()->
    if !@input?
      return

    $select = $(@root).find('select')
    select = $select[0]
    if select?
      v = @input.ref.get @input.name
      if !@initialized
        requestAnimationFrame ()=>
          @initSelect $select
          @initialized = true
      else if v != select.selectize.getValue()
        select.selectize.clear true
        select.selectize.addItem v, true
    else
      $control = $(@root).find('.selectize-control')
      if !$control[0]?
        requestAnimationFrame ()=>
          @update()

    # @on 'unmount', ()=>
    #   $select = $(@root).find('select')
