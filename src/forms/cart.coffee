CrowdControl = require 'crowdcontrol'
m = require '../mediator'
Events = require '../events'
store = require '../utils/store'

module.exports = class CartForm extends CrowdControl.Views.Form
  tag:  'cart'
  html: '''
    <yield>
      <lineitems if="{ !isEmpty() }"></lineitems>
    </yield>
  '''

  init: ()->
    super
    promoCode = store.get 'promoCode'

    if promoCode
      @data.set 'order.promoCode', promoCode
      @applyPromoCode()
      @update()

    m.on Events.ForceApplyPromoCode, ()=>
      @applyPromoCode()

  configs:
    'order.promoCode': null

  applying: false
  promoMessage: ''

  isEmpty: ()->
    return @data('order.items').length == 0

  count: ()->
    count = 0
    for item in @data('order.items')
      count += item.quantity
    return count

  applyPromoCode: ()->
    @promoMessage = ''
    promoCode = @data.get 'order.promoCode'
    if !promoCode
      return

    store.set 'promoCode', promoCode

    @promoMessage = 'Applying...'
    @applying = true

    m.trigger Events.ApplyPromoCode, promoCode
    @cart.promoCode(promoCode).then(=>
      @applying = false

      coupon = @data.get 'order.coupon'
      if coupon?.freeProductId? && coupon.freeProductId != "" && coupon.freeQuantity > 0
        @promoMessage = "#{ coupon.freeQuantity } Free #{ freeProduct.name }"
      else
        @promoMessage = promoCode + ' Applied!'

      m.trigger Events.ApplyPromoCodeSuccess, coupon
      @update()
    ).catch (err)=>
      store.remove 'promoCode'
      @applying = false

      coupon = @data.get 'order.coupon'
      if coupon?.enabled
        @promoMessage = 'This code is expired.'
      else
        @promoMessage = 'This code is invalid.'

      m.trigger Events.ApplyPromoCodeFailed, err
      @update()
