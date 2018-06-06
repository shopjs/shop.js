import El from 'el.js'

import Events from '../events'
import html   from '../../templates/containers/form'
import {
  isRequired
  isPostalRequired
} from './middleware'

class ShippingAddressForm extends El.Form
  tag:  'shippingaddress'
  html: html

  configs:
    'order.shippingAddress.name':       [ isRequired ]
    'order.shippingAddress.line1':      [ isRequired ]
    'order.shippingAddress.line2':      null
    'order.shippingAddress.city':       [ isRequired ]
    'order.shippingAddress.state':      [ isRequired ]
    'order.shippingAddress.postalCode': [ isPostalRequired ]
    'order.shippingAddress.country':    [ isRequired ]

  errorMessage: ''

  init: ->
    if @parentData?
      @data = @parentData

    super arguments...

    @on 'update', =>
      if @parentData?
        @data = @parentData

  _submit: ->
    opts =
      id:              @data.get 'order.id'
      shippingAddress: @data.get 'order.shippingAddress'

    @errorMessage = ''

    @scheduleUpdate()
    @mediator.trigger Events.ShippingAddressUpdate
    @client.account.updateOrder(opts).then (res) =>
      @mediator.trigger Events.ShippingAddressUpdateSuccess, res
      @scheduleUpdate()
    .catch (err)=>
      @errorMessage = err.message
      @mediator.trigger Events.ShippingAddressUpdateFailed, err
      @scheduleUpdate()

ShippingAddressForm.register()

export default ShippingAddressForm
