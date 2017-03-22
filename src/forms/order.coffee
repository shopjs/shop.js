import CrowdControl from 'crowdcontrol'
import m from '../mediator'
import Events from '../events'
import refer from 'referential'

import html from '../../templates/forms/order'

export default class OrderForm extends CrowdControl.Views.Form
  tag:  'order'
  html: html
  parentData: null

  init: ()->
    super
    @parentData = refer {}

    @on 'update', ()=>
      if @data?
        @parentData.set 'order', @data.get()
        items = @data.get 'items'
        if !items?
          return
        for item, i in items
          @parentData.set 'order.items.' + i + '.locked', true

  delete: (event)->
    m.trigger Events.DeleteLineItem, @data
