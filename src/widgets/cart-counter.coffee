import CrowdControl from 'crowdcontrol'
import _ from '../utils/patches'

import html from '../../templates/widgets/cart-counter'

export default class CartCounterForm extends CrowdControl.Views.View
  tag:  'cart-counter'
  html: require '../../templates/widgets/cart-counter'

  init: ()->
    super

  countItems: ()->
    items = @data.get 'order.items'

    count = 0
    for item, i in items
      count += item.quantity

    return count

  totalPrice: ()->
    items = @data.get 'order.items'

    price = 0
    for item, i in items
      price += item.price * item.quantity

    return price

