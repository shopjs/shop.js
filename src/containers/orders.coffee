import El from 'el.js'

import html from '../../templates/containers/orders'

class Orders extends El.View
  tag:  'orders'
  html: html
  init: ->
    super

Orders.register()

export default Orders
