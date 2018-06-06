import El from 'el.js'
import '../utils/patches'

import html from '../../templates/widgets/cart-counter'

class CartCounter extends El.View
  tag:  'cart-counter'
  html: html

  init: ->
    super arguments...

  countItems: ->
    items = @data.get 'order.items'

    count = 0
    for item, i in items
      count += item.quantity

    count

  totalPrice: ->
    items = @data.get 'order.items'

    price = 0
    for item, i in items
      price += item.price * item.quantity

    price

CartCounter.register()

export default CartCounter
