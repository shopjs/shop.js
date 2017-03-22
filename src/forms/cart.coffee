import El from 'el.js'
import store        from 'akasha'

import Events from '../events'
import html from '../../templates/forms/cart'
import m from '../mediator'

class CartForm extends El.Views.Form
  tag:  'cart'
  html: html

  init: ->
    super
    promoCode = store.get 'promoCode'

    if promoCode
      @data.set 'order.promoCode', promoCode
      @applyPromoCode()
      @scheduleUpdate()

    m.on Events.ForceApplyPromoCode, ()=>
      @applyPromoCode()

  configs:
    'order.promoCode': null

  applying: false
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

    m.trigger Events.ApplyPromoCode, promoCode
    @cart.promoCode(promoCode).then(=>
      @applying = false

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

      coupon = @data.get 'order.coupon'
      if coupon?.enabled
        @promoMessage = 'This code is expired.'
      else
        @promoMessage = 'This code is invalid.'

      m.trigger Events.ApplyPromoCodeFailed, err
      @scheduleUpdate()

export default CartForm
