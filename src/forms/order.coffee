import El from 'el.js'
import refer from 'referential'

import Events from '../events'
import html   from '../../templates/forms/order'

class OrderForm extends El.Form
  tag:  'order'
  html: html
  parentData: null

  init: ->
    super
    @parentData = refer {}

    @on 'update', =>
      if @data?
        @parentData.set 'order', @data.get()
        items = @data.get 'items'
        if !items?
          return
        for item, i in items
          @parentData.set 'order.items.' + i + '.locked', true

  delete: (event) ->
    @mediator.trigger Events.DeleteLineItem, @data

export default OrderForm
