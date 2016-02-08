Select = require './select'

module.exports = class StateSelect extends Select
  tag: 'state-select-control'
  html: require '../../templates/controls/state-select'
  options: ->
    return require('../data/states').data
  countryField: 'order.shippingAddress.country'

  onUpdated: ()->
    if !@input?
      return

    if @input.ref(@countryField) == 'us'
      $(@root).find('.selectize-control').show()
    else
      $(@root).find('.selectize-control').hide()
      value = @input.ref(@input.name)
      @input.ref.set(@input.name, value.toUpperCase()) if value
    super
