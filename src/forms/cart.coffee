CrowdControl = require 'crowdcontrol'
riot = require 'riot'
m = require '../mediator'
Events = require '../events'
store = require 'store'

module.exports = class CartForm extends CrowdControl.Views.Form
  tag:  'cart'
  html: '''
    <lineitem each="{ item, v in data('order.items') }" cartdata="{ this.parent.data }" data="{ this.parent.data.ref('order.items.' + v) }" if="{ item.quantity > 0 }">
    </lineitem>
    <yield/>
  '''
  init: ()->
    super
    promoCode = store.get 'promoCode'

    if promoCode
      @data.set 'order.promoCode', promoCode
      @applyPromoCode()
      @update()

  configs: require './config'

  renderCurrency: require('../utils/currency').renderUICurrencyFromJSON

  applying: false
  promoMessage: ''

  applyPromoCode: ()->
    @promoMessage = ''
    promoCode = @data.get('order.promoCode')
    if !promoCode
      return

    store.set 'promoCode', promoCode

    @promoMessage = 'Applying...'
    @applying = true
    promoCode = promoCode.toUpperCase()

    @client.coupon.get(promoCode).then((coupon)=>
      if coupon.enabled
        @data.set 'order.coupon', coupon
        @data.set 'order.couponCodes', [promoCode]
        if coupon.freeProductId != "" && coupon.freeQuantity > 0
          @client.product.get(coupon.freeProductId).then((freeProduct)=>
            @applying = false
            @promoMessage = "#{ coupon.freeQuantity } Free #{ freeProduct.name }"
            @update()
            m.trigger Events.UpdateItems
          ).catch (err)=>
            store.remove 'promoCode'

            @applying = false
            @update()
            console.log "couponFreeProduct Error: #{err}"
        else
          m.trigger Events.UpdateItems
          @applying = false
          @promoMessage = promoCode + ' Applied!'
      else
        store.remove 'promoCode'

        @applying = false
        @promoMessage = 'This code is expired.'
      @update()
    ).catch (err)=>
      store.remove 'promoCode'

      @applying = false
      @promoMessage = 'This code is invalid.'
      @update()
