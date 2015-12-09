class Cart
  constructor: ->
    riot.observable @
    @items = []

  add: (item) ->
    @items.push item

  remove: (item) ->
    for _item, index in @items by -1
      if item.id == _item.id
        return @items.splice index, 1

  get: ->
    items = []

    subtotal = 0

    for item in @items
      items.push items
      subtotal += item.quantity * item.price
    return
      items:    items
      subtotal: subtotal

module.exports = new Cart
