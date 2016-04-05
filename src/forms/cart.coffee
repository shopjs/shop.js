CrowdControl = require 'crowdcontrol'
riot = require 'riot'
m = require '../mediator'
Events = require '../events'
store = require '../utils/store'
require '../utils/patches'

module.exports = class CartForm extends CrowdControl.Views.Form
  tag:  'cart'
  html: '''
    <yield>
      <lineitems if="{ !isEmpty() }"></lineitems>
    </yield>
  '''

  init: ()->
    # ie10 riot issue hack
    @originalParentElement = @root.parentElement

    super
    promoCode = store.get 'promoCode'

    if promoCode
      @data.set 'order.promoCode', promoCode
      @applyPromoCode()
      @update()

  configs: require './config'

  applying: false
  promoMessage: ''

  isEmpty: ()->
    return @data('order.items').length == 0

  applyPromoCode: ()->
    @promoMessage = ''
    promoCode = @data.get 'order.promoCode'
    if !promoCode
      return

    store.set 'promoCode', promoCode

    @promoMessage = 'Applying...'
    @applying = true
    promoCode = promoCode.toUpperCase()

    m.trigger Events.ApplyCoupon, promoCode
    @cart.promoCode(promoCode).then(=>
      @applying = false

      coupon = @data.get 'order.coupon'
      if coupon?.freeProductId? && coupon.freeProductId != "" && coupon.freeQuantity > 0
        @promoMessage = "#{ coupon.freeQuantity } Free #{ freeProduct.name }"
      else
        @promoMessage = promoCode + ' Applied!'

      m.trigger Events.ApplyCouponSuccess, coupon
      @update()
    ).catch (err)=>
      store.remove 'promoCode'
      @applying = false

      coupon = @data.get 'order.coupon'
      if coupon?.enabled
        @promoMessage = 'This code is expired.'
      else
        @promoMessage = 'This code is invalid.'

      m.trigger Events.ApplyCouponFailed, err
      @update()
