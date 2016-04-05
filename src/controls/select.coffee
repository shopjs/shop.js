Text = require './text'
riot = require 'riot'
isObject = require 'is-object'
requestAnimationFrame = require 'raf'

isABrokenBrowser = (window.navigator.userAgent.indexOf('MSIE') > 0 || window.navigator.userAgent.indexOf('Trident') > 0)

module.exports = class Select extends Text
  tag: 'select-control'
  html: require '../../templates/controls/select.jade'
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
        name: name
        value: value

      invertedOptions[name] = value

    $select.selectize(
      dropdownParent: 'body'
      valueField: 'value'
      labelField: 'name'
      searchField: 'name'
      items: [@input.ref.get(@input.name)] || []
      options: options
    ).on('change', (event)=>@change(event))

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
      if !@initialized
        requestAnimationFrame ()=>
          @initSelect $select
          @initialized = true
      else
        select.selectize.clear true
        select.selectize.addItem @input.ref.get(@input.name), true
    else
      $control = $(@root).find('.selectize-control')
      if !$control[0]?
        requestAnimationFrame ()=>
          @update()

    # @on 'unmount', ()=>
    #   $select = $(@root).find('select')
