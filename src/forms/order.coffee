CrowdControl = require 'crowdcontrol'
riot = require 'riot'
m = require '../mediator'
Events = require '../events'
refer = require 'referential'

module.exports = class OrderForm extends CrowdControl.Views.Form
  tag:  'order'
  html: require '../../templates/forms/order'
  orderData: null

  init: ()->
    super
    @orderData = refer {}

    @on 'update', ()=>
      if @data?
        @orderData.set 'order', @data.get()
        items = @data.get 'items'
        if !items?
          return
        for item, i in items
          @orderData.set 'order.items.' + i + '.locked', true

  isEmpty: ()->
    return @data.get('items').length == 0

  delete: (event)->
    m.trigger Events.DeleteLineItem, @data
