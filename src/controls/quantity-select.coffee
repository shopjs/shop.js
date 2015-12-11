Select = require './select'
analytics = require '../utils/analytics'

module.exports = class QuantitySelect extends Select
  tag: 'quantity-select-control'
  options:
    1: 1
    2: 2
    3: 3
    4: 4
    5: 5
    6: 6
    7: 7
    8: 8
    9: 9

  getValue: (event)->
    return parseFloat($(event.target).val()?.trim())

  change: ()->
    oldValue = @data.get 'quantity'
    super
    newValue = @data.get 'quantity'

    deltaQuantity = newValue - oldValue
    if deltaQuantity > 0
      analytics.track 'Added Product',
        id: @data.get 'productId'
        sku: @data.get 'productSlug'
        name: @data.get 'productName'
        quantity: deltaQuantity
        price: parseFloat(@data.get('price') / 100)
    else if deltaQuantity < 0
      analytics.track 'Removed Product',
        id: @data.get 'productId'
        sku: @data.get 'productSlug'
        name: @data.get 'productName'
        quantity: deltaQuantity
        price: parseFloat(@data.get('price') / 100)
