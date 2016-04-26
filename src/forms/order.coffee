CrowdControl = require 'crowdcontrol'
riot = require 'riot'
m = require '../mediator'
Events = require '../events'
refer = require 'referential'

module.exports = class OrderForm extends CrowdControl.Views.Form
  tag:  'order'
  html: require '../../templates/forms/order'
  lineItemData: null

  init: ()->
    super
    @lineItemData = refer {}

    @on 'update', ()=>
      if @data?
        @lineItemData.set 'order', @data.get()
        items = @data.get 'items'
        if !items?
          return
        for item, i in items
          @lineItemData.set 'order.items.' + i + '.locked', true

  isEmpty: ()->
    return @data.get('items').length == 0

  delete: (event)->
    m.trigger Events.DeleteLineItem, @data
