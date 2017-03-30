import El from 'el.js'
import store        from 'akasha'

import Events from '../events'
import html from '../../templates/forms/cart'
import m from '../mediator'

class CartForm extends El.Form
  tag:  'cart'
  html: html

  # Support Attrs
  # passed in image dict
  # images: null
  # showButtons: true

  init: ->
    super
    promoCode = store.get 'promoCode'

    if promoCode
      @data.set 'order.promoCode', promoCode
      @applyPromoCode()

    m.on Events.ForceApplyPromoCode, ()=>
      @applyPromoCode()

    @data.on 'set', (name, value)=>
      if name == 'order.promoCode' && @applied
        @applyPromoCode()

  configs:
    'order.promoCode': null


  promoMessage: ''

  isEmpty: ->
    return @data('order.items').length == 0

  count: ->
    count = 0
    for item in @data('order.items')
      count += item.quantity
    return count

  applyPromoCode: ->
    @promoMessage = ''
    promoCode = @data.get 'order.promoCode'
    if !promoCode
      return

    store.set 'promoCode', promoCode

    @promoMessage = 'Applying...'
    @applying = true
    @applied = false
    @failed = false

    # TODO: Move to commerce.js
    @data.set 'order.coupon', {}

    @scheduleUpdate()

    m.trigger Events.ApplyPromoCode, promoCode
    @cart.promoCode(promoCode).then(=>
      @applying = false
      @applied = true
      @failed = false

      coupon = @data.get 'order.coupon'
      if coupon?.freeProductId? && coupon.freeProductId != "" && coupon.freeQuantity > 0
        @promoMessage = "#{ coupon.freeQuantity } Free #{ freeProduct.name }"
      else
        @promoMessage = promoCode + ' Applied!'

      m.trigger Events.ApplyPromoCodeSuccess, coupon
      @scheduleUpdate()
    ).catch (err)=>
      store.remove 'promoCode'
      @applying = false
      @applied = false
      @failed = true

      coupon = @data.get 'order.coupon'
      if coupon?.enabled
        @promoMessage = 'This code is expired.'
      else
        @promoMessage = 'This code is invalid.'

      m.trigger Events.ApplyPromoCodeFailed, err
      @scheduleUpdate()

  checkout: ()->
    m.trigger Events.Checkout

  continueShopping: ()->
    m.trigger Events.ContinueShopping

export default CartForm
