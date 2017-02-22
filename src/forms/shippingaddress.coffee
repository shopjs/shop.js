CrowdControl = require 'crowdcontrol'
riot = require 'riot'
m = require '../mediator'
Events = require '../events'
{
  isRequired,
  isPostalRequired,
} = require './middleware'

module.exports = class ShippingAddressForm extends CrowdControl.Views.Form
  tag:  'shippingaddress'
  html: '''
    <form onsubmit={submit}>
      <yield/>
    </form>
  '''

  configs:
    'order.shippingAddress.name':       [ isRequired ]
    'order.shippingAddress.line1':      [ isRequired ]
    'order.shippingAddress.line2':      null
    'order.shippingAddress.city':       [ isRequired ]
    'order.shippingAddress.state':      [ isRequired ]
    'order.shippingAddress.postalCode': [ isPostalRequired ]
    'order.shippingAddress.country':    [ isRequired ]

  errorMessage: ''

  init: ()->
    if @parentData?
      @data = @parentData

    super

    @on 'update', ()=>
      if @parentData?
        @data = @parentData

  _submit: ()->
    opts =
      id:  @data.get 'order.id'
      shippingAddress: @data.get 'order.shippingAddress'

    @errorMessage = ''

    @update()
    m.trigger Events.ShippingAddressUpdate
    @client.account.updateOrder(opts).then((res)=>
      m.trigger Events.ShippingAddressUpdateSuccess, res
      @update()
    ).catch (err)=>
      @errorMessage = err.message
      m.trigger Events.ShippingAddressUpdateFailed, err
      @update()

