import './utils/patches'

import El           from 'el.js'
import Promise      from 'broken'
import objectAssign from 'es-object-assign'
import refer        from 'referential'
import store        from 'akasha'
import {Api}        from 'hanzo.js'
import {Cart}       from 'commerce.js'

import Controls  from './controls'
import Events    from './events'
import Forms     from './forms'
import Widgets   from './widgets'
import analytics from './utils/analytics'
import m         from './mediator'

# Monkey Patch common utils onto every View/Instance
import {renderUICurrencyFromJSON} from './utils/currency'
import {renderDate} from './utils/dates'

Shop.Controls = Controls
Shop.Events = Events
Shop.Forms = Forms
Shop.Widgets = Widgets

El.View::renderCurrency = renderUICurrencyFromJSON
El.View::renderDate = renderDate
El.View::isEmpty = ->
  Shop.isEmpty()

Shop.use = (templates) ->
  Shop.Controls.Control::errorHtml = templates.Controls.Error if templates?.Controls?.Error
  Shop.Controls.Text::html         = templates.Controls.Text  if templates?.Controls?.Text

# Format of opts.config
# {
#   ########################
#   ### Order Overrides ####
#   ########################
#   currency:           string (3 letter ISO code)
#   taxRate:            number (decimal) taxRate, overridden by opts.taxRates
#   shippingRate:       number (per item cost in cents or base unit for zero decimal currencies)
#   checkoutUrl:        string checkoutUrl for marketing emails
#   hasReferrer:        bool use hash for referrer, defaults to false
# }
#
# Format of opts.taxRates
# Tax rates are filtered based on exact string match of city, state, and country.
# Tax rates are evaluated in the order listed in the array.  This means if the first tax rate
# is matched, then the subsequent tax rates will not be evaluated.
# Therefore, list tax rates from specific to general
#
# If no city, state, or country is set, then the tax rate will be used if evaluated
#
# [
#   {
#     taxRate:  number (decimal tax rate)
#     city:     null or string (name of city where tax is charged)
#     state:    null or string (2 digit Postal code of US state or name of non-US state where tax is charged)
#     country:  null or string (2 digit ISO country code eg. 'us' where tax is charged)
#   }
# ]
#
# Format of opts.referralProgram
# Referral Program Object

Shop.analytics = analytics
Shop.isEmpty   = ->
  items = @data.get 'order.items'
  items.length == 0

getQueries = ->
  search = /([^&=]+)=?([^&]*)/g
  q = window.location.href.split('?')[1]
  qs = {}
  if q?
    while (match = search.exec(q))
      k = match[1]
      try
        k = decodeURIComponent k
      v = match[2]
      try
        v = decodeURIComponent v
      catch err
      qs[k] = v

  qs

getReferrer = (qs) ->
  if qs.referrer?
    qs.referrer
  else
    store.get 'referrer'

getMCIds = (qs) ->
  [qs['mc_eid'], qs['mc_cid']]

tagNames = []
for k, v of Shop.Forms
  tagNames.push(v::tag.toUpperCase()) if v::tag?
for k, v of Shop.Widgets
  tagNames.push(v::tag.toUpperCase()) if v::tag?

searchQueue     = [document.body]
elementsToMount = []

# move to El
loop
  if searchQueue.length == 0
    break

  root = searchQueue.shift()

  if !root?
    continue

  if root.tagName? && root.tagName in tagNames
    elementsToMount.push root
  else if root.children?.length > 0
    children = Array.prototype.slice.call root.children
    children.unshift 0
    children.unshift searchQueue.length
    searchQueue.splice.apply searchQueue, children

Shop.start = (opts = {}) ->
  unless opts.key?
    throw new Error 'Please specify your API Key'

  Shop.Forms.register()
  Shop.Widgets.register()
  Shop.Controls.register()

  referrer = ''

  queries = getQueries()
  if opts.config?.hashReferrer
    r = window.location.hash.replace('#','')
    if r != ''
      referrer = r
    else
      referrer = getReferrer(queries) ? opts.order?.referrer
  else
    referrer = getReferrer(queries) ? opts.order?.referrer

  store.set 'referrer', referrer

  promo  = queries.promo ? ''
  items  = store.get 'items'
  cartId = store.get 'cartId'
  meta   = store.get 'order.metadata'

  @data = refer
    taxRates:       opts.taxRates || []
    shippingRates:  opts.shippingRates || []
    tokenId:        queries.tokenid
    terms:          opts.terms ? false
    order:
      giftType:     'physical'
      type:         'stripe'
      shippingRate: opts.config?.shippingRate   || opts.order?.shippingRate  || 0
      taxRate:      opts.config?.taxRate        || opts.order?.taxRate       || 0
      currency:     opts.config?.currency       || opts.order?.currency      || 'usd'
      referrerId:   referrer
      shippingAddress:
        country: 'us'
      discount:    0
      tax:         0
      subtotal:    0
      total:       0
      items:       items                    ? []
      cartId:      cartId                   ? null
      checkoutUrl: opts.config?.checkoutUrl ? null
      metadata:    meta                     ? {}

  data = @data.get()
  for k, v of opts
    if opts[k]
      if !data[k]?
        data[k] = opts[k]
      else
        for k2, v2 of data[k]
          extend data[k][k2], opts[k][k2]


  @data.set data

  # load multipage partial checkout data
  checkoutUser            = store.get 'checkout-user'
  checkoutShippingAddress = store.get 'checkout-shippingAddress'
  checkoutPayment         = store.get 'checkout-payment'

  if checkoutUser
    @data.set 'user', checkoutUser
    store.remove 'checkout-user'

  if checkoutShippingAddress
    @data.set 'order.shippingAddress', checkoutShippingAddress
    store.remove 'checkout-shippingAddress'

  if checkoutPayment
    @data.set 'payment', checkoutPayment
    store.remove 'checkout-payment'

  settings = {}
  settings.key      = opts.key      if opts.key
  settings.endpoint = opts.endpoint if opts.endpoint

  @client = new Api settings
  @cart   = new Cart @client, @data, opts.cartOptions

  @cart.onCart = =>
    store.set 'cartId', @data.get 'order.cartId'
    [_, mcCId] = getMCIds queries
    cart =
      mailchimp:
        checkoutUrl: @data.get 'order.checkoutUrl'
      currency: @data.get 'order.currency'

    if mcCId
      cart.mailchimp.campaignId = mcCId

    # try get userId
    @client.account.get().then (res) =>
      @cart._cartUpdate
        email:  res.email
        userId: res.email
    .catch ->
      # ignore error, does not matter

  tags = El.mount elementsToMount,
    cart:   @cart
    client: @client
    data:   @data

  El.update = ->
    for tag in tags
      tag.update()

  @cart.onUpdate = (item) =>
    items = @data.get 'order.items'
    store.set 'items', items
    @cart._cartUpdate
      tax:   @data.get 'order.tax'
      total: @data.get 'order.total'

    if item?
      m.trigger Events.UpdateItem, item

    meta = @data.get 'order.metadata'
    store.set 'order.metadata', meta

    @cart.invoice()
    El.scheduleUpdate()

  if referrer? && referrer != ''
    @client.referrer.get(referrer).then (res) =>
      promoCode = res.affiliate.couponId
      @data.set 'order.promoCode', promocode
      m.trigger Events.ForceApplyPromoCode
    .catch ->
  else if promo != ''
    @data.set 'order.promoCode', promo
    m.trigger Events.ForceApplyPromoCode

  ps = []
  for tag in tags
    p = new Promise (resolve) ->
      tag.one 'updated', ->
        resolve()
    ps.push p

  Promise.settle(ps).then ->
    requestAnimationFrame ->
      tagSelectors = tagNames.join ', '
      for tag in tags
        $(tag.root)
          .addClass 'ready'
          .find tagSelectors
          .addClass 'ready'

      m.trigger Events.Ready
    #try to deal with long running stuff
    El.update()
  .catch (err) ->
    window?.Raven?.captureException err

  # quite hacky
  m.data = @data
  m.on Events.SetData, (@data) =>
    @cart.invoice()

  m.on Events.DeleteLineItem, (item) ->
    id = item.get 'id'
    if !id
      id = item.get 'productId'
    if !id
      id = item.get 'productSlug'
    Shop.setItem id, 0

  m.trigger Events.SetData, @data

  m.on 'error', (err) ->
    console.log err
    window?.Raven?.captureException err

  # Fix incompletely loaded items
  if items? && items.length > 0
    for item in items
      if item.id?
        @cart.load item.id
      else if item.productId?
        @cart.refresh item.productId

  # Force update
  El.scheduleUpdate()

  return m

waits           = 0
itemUpdateQueue = []

Shop.initCart = ->
  @cart.initCart()

Shop.setItem = (id, quantity, locked=false) ->
  m.trigger Events.TryUpdateItem, id
  p = @cart.set id, quantity, locked
  if @promise != p
    @promise = p
    @promise.then =>
      El.scheduleUpdate()
      m.trigger Events.UpdateItems, @data.get 'order.items'
    .catch (err) ->
      window?.Raven?.captureException err

Shop.getItem = (id) ->
  return @cart.get id

export default Shop
