import CrowdControl from 'crowdcontrol'
import '../utils/patches'

import html from '../../templates/widgets/cart-counter'

class CartCounterForm extends CrowdControl.Views.View
  tag:  'cart-counter'
  html: html

  init: ->
    super

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

export default CartCounterForm
