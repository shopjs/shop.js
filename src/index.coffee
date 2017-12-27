import './utils/patches'

import El           from 'el.js/src'
import Promise      from 'broken'
import objectAssign from 'es-object-assign'
import refer        from 'referential'
import store        from 'akasha'
import Hanzo        from 'hanzo.js/src/browser'
import {Cart}       from 'commerce.js/src'
import GMaps        from 'gmaps'

import {
  getQueries,
  getReferrer,
  getMCIds
} from 'shop.js-util/src/uri'

import {
  Control
  Copy
  Text
  TextBox
  CheckBox
  QRCode
  Select
  QuantitySelect
  CountrySelect
  Currency
  StateSelect
  UserEmail
  UserName
  UserCurrentPassword
  UserPassword
  UserPasswordConfirm
  UserUsername
  ShippingAddressName
  ShippingAddressLine1
  ShippingAddressLine2
  ShippingAddressCity
  ShippingAddressPostalCode
  ShippingAddressState
  ShippingAddressCountry
  CardName
  CardNumber
  CardExpiry
  CardCVC
  Terms
  GiftToggle
  GiftType
  GiftEmail
  GiftMessage
  PromoCode
} from './controls'

Controls =
  # Basic
  Control:  Control
  Text:     Text
  TextBox:  TextBox
  Checkbox: CheckBox
  Select:   Select

  # Advanced
  QuantitySelect: QuantitySelect

  # User
  UserEmail:            UserEmail
  UserName:             UserName
  UserCurrentPassword:  UserCurrentPassword
  UserPassword:         UserPassword
  UserPasswordConfirm:  UserPasswordConfirm

  # Shipping Address
  ShippingAddressName:          ShippingAddressName
  ShippingAddressLine1:         ShippingAddressLine1
  ShippingAddressLine2:         ShippingAddressLine2
  ShippingAddressCity:          ShippingAddressCity
  ShippingAddressPostalCode:    ShippingAddressPostalCode
  ShippingAddressState:         ShippingAddressState
  ShippingAddressCountry:       ShippingAddressCountry

  # Card
  CardName:     CardName
  CardNumber:   CardNumber
  CardExpiry:   CardExpiry
  CardCVC:      CardCVC

  # Misc
  Terms:        Terms
  GiftToggle:   GiftToggle
  GiftType:     GiftType
  GiftEmail:    GiftEmail
  GiftMessage:  GiftMessage
  PromoCode:    PromoCode

import Events        from './events'
import Containers    from './containers'
import Widgets       from './widgets'
import analytics     from 'shop.js-util/src/analytics'
import m             from './mediator'

# Monkey Patch common utils onto every View/Instance
import {renderUICurrencyFromJSON} from 'shop.js-util/src/currency'
import {renderDate, rfc3339} from 'shop.js-util/src/dates'

Api = Hanzo.Api

Shop = {}
Shop.Controls = Controls
Shop.Events = Events
Shop.Containers = Containers
Shop.Widgets = Widgets
Shop.El = El

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

# Deal with mounting procedure for only Shop.js components
tagNames = []
for k, v of Shop.Containers
  tagNames.push(v::tag.toUpperCase()) if v::tag?
for k, v of Shop.Widgets
  tagNames.push(v::tag.toUpperCase()) if v::tag?

# initialize the data schema
initData = (opts)->
  queries = getQueries()

  referrer = ''
  referrer = getReferrer(opts.config?.hashReferrer) ? opts.order?.referrer
  store.set 'referrer', referrer

  items  = store.get 'items'
  cartId = store.get 'cartId'
  meta   = store.get 'order.metadata'

  d =
    taxRates:       null
    shippingRates:  null
    countries:      []
    tokenId:        queries.tokenid
    terms:          opts.terms ? false
    autoGeo:        opts.autoGeo ? false
    order:
      giftType:     'physical'
      type:         opts.processor ? opts.order?.type ? 'stripe'
      shippingRate: opts.config?.shippingRate   ? opts.order?.shippingRate  ? 0
      taxRate:      opts.config?.taxRate        ? opts.order?.taxRate       ? 0
      currency:     opts.config?.currency       ? opts.order?.currency      ? 'usd'
      referrerId:   referrer
      discount:    0
      tax:         0
      subtotal:    0
      total:       0
      mode:        opts.mode ? opts.order?.mode ? ''
      items:       items                    ? []
      cartId:      cartId                   ? null
      checkoutUrl: opts.config?.checkoutUrl ? null
      metadata:    meta                     ? {}
    user: null
    payment:
      type: opts.processor

  for k, v of opts
    unless d[k]?
      d[k] = opts[k]
    else
      for k2, v2 of d[k]
        unless v2?
          d[k][k2] = opts[k]?[k2]

  data = refer d

  # load multipage partial checkout data
  checkoutUser = store.get 'checkout-user'
  if checkoutUser
    data.set 'user', checkoutUser
    store.remove 'checkout-user'

  checkoutShippingAddress = store.get 'checkout-shippingAddress'
  if checkoutShippingAddress
    data.set 'order.shippingAddress', checkoutShippingAddress
    store.remove 'checkout-shippingAddress'

  checkoutPayment = store.get 'checkout-payment'
  if checkoutPayment
    data.set 'payment', checkoutPayment
    store.remove 'checkout-payment'

  # fetch default geoloc data
  state = store.get 'default-state' ? ''
  country = store.get 'default-country' ? ''

  countriesReady = false
  dontPrefill = false

  if data.get('autoGeo') && (!state || !country)
    # get country/state
    # requires google maps to be in the namespace
    if window?.google && window?.navigator?.geolocation
      navigator.geolocation.getCurrentPosition (position)=>
        # abort if manually selected

        GMaps.geocode
          address: "#{position.coords.latitude}, #{position.coords.longitude}"
          callback: (results, status)=>
            # abort if manually selected
            if data.get('order.shippingAddress.country') || data.get('order.shippingAddress.state')
              dontPrefill = true

            if status == 'OK'
              state = ''
              country = ''

              for result in results
                if 'administrative_area_level_1' in result.types
                  state = result.address_components[0].short_name
                else if 'country' in result.types
                  country = result.address_components[0].short_name

              # cache default geoloc data
              store.set 'default-state', state
              store.set 'default-country', country

              if countriesReady
                data.set 'order.shippingAddress.country', country
                data.set 'order.shippingAddress.state', state

            m.trigger Events.GeoReady, {
              status: 'success'
              geolocation: position
              gmaps: results
            }
    else
      # makes more sense to force sequencing after all the synchronous stuff
      requestAnimationFrame ()->
        m.trigger Events.GeoReady, {
          status: 'disabled'
        }

  # use default geoloc
  data.on 'set', (k, v)->
    if k == 'countries' && !dontPrefill
      countriesReady = true
      data.set 'order.shippingAddress.country', country
      data.set 'order.shippingAddress.state', state

  return data

# initialize hanzo.js client
initClient = (opts)->
  settings = {}
  settings.key      = opts.key      if opts.key
  settings.endpoint = opts.endpoint if opts.endpoint

  return new Api settings

# initialize the cart from commerce.js
initCart = (client, data, cartOptions)->
  cart = new Cart client, data

  # fetch library data
  lastChecked   = store.get 'lastChecked'
  countries     = store.get('countries') ? []
  taxRates      = store.get 'taxRates'
  shippingRates = store.get 'shippingRates'

  data.set 'countries', countries
  data.set 'taxRates', taxRates
  data.set 'shippingRates', shippingRates

  lastChecked = renderDate(new Date(), rfc3339)

  client.library.shopjs(
    hasCountries:       !!countries && countries.length != 0
    hasTaxRates:        !!taxRates
    hasShippingRates:   !!shippingRates
    lastChecked:        renderDate(lastChecked || '2000-01-01', rfc3339)
  ).then (res) ->
    countries = res.countries ? countries
    taxRates = res.taxRates ? taxRates
    shippingRates = res.shippingRates ? shippingRates

    store.set 'countries', countries
    store.set 'taxRates', taxRates
    store.set 'shippingRates', shippingRates
    store.set 'lastChecked', lastChecked

    data.set 'countries', countries
    data.set 'taxRates', taxRates
    data.set 'shippingRates', shippingRates

    if res.currency
      data.set 'order.currency', res.currency

    cart.taxRates res.taxRates ? taxRates
    cart.shippingRates res.shippingRates ? shippingRates

    cart.invoice()

    m.trigger Events.AsyncReady, res

    El.scheduleUpdate()

  cart.onCart = ->
    store.set 'cartId', data.get 'order.cartId'
    [_, mcCId] = getMCIds()
    cart =
      mailchimp:
        checkoutUrl: data.get 'order.checkoutUrl'
      currency: data.get 'order.currency'

    if mcCId
      cart.mailchimp.campaignId = mcCId

    # try get userId
    client.account.get().then (res) ->
      cart._cartUpdate
        email:  res.email
        userId: res.email
    .catch ->
      # ignore error, does not matter

  cart.onUpdate = (item) ->
    items = data.get 'order.items'
    store.set 'items', items

    cart._cartUpdate
      tax:   data.get 'order.tax'
      total: data.get 'order.total'

    if item?
      m.trigger Events.UpdateItem, item

    meta = data.get 'order.metadata'
    store.set 'order.metadata', meta

    cart.invoice()
    El.scheduleUpdate()

  items  = store.get 'items'
  # Fix incompletely loaded items
  if items? && items.length > 0
    for item in items
      if item.id?
        cart.load item.id
      else if item.productId?
        cart.refresh item.productId

  return cart

initMediator = (data, cart) ->
  # initialize mediator
  m.on Events.Started, (data) ->
    cart.invoice()
    El.scheduleUpdate()

  m.on Events.DeleteLineItem, (item) ->
    id = item.get 'id'
    if !id
      id = item.get 'productId'
    if !id
      id = item.get 'productSlug'
    Shop.setItem id, 0

  m.on 'error', (err) ->
    console.log err
    window?.Raven?.captureException err

  return m

Shop.start = (opts = {}) ->
  unless opts.key?
    throw new Error 'Please specify your API Key'

  # initialize everything
  @data     = initData opts
  @client   = initClient opts

  @cart     = initCart @client, @data, opts.cartOptions
  @m        = initMediator @data, @cart

  # update referrer data
  queries = getQueries()
  promo  = queries.promo ? ''
  referrer = @data.get 'order.referrerId'

  if referrer? && referrer != ''
    @client.referrer.get(referrer).then (res) =>
      promoCode = res.affiliate.couponId
      @data.set 'order.promoCode', promocode
      m.trigger Events.ForceApplyPromoCode
    .catch ->
  else if promo != ''
    @data.set 'order.promoCode', promo
    m.trigger Events.ForceApplyPromoCode

  # create list of elements to mount
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

  # mount
  tags = El.mount elementsToMount,
    cart:     @cart
    client:   @client
    data:     @data
    mediator: m

    renderCurrency: renderUICurrencyFromJSON
    renderDate:     renderDate

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
    El.scheduleUpdate()
  .catch (err) ->
    window?.Raven?.captureException err

  m.trigger Events.Started, @data
  return m

Shop.mount = ->
  return El.mount arguments,
    cart:     @cart
    client:   @client
    data:     @data
    mediator: m

    renderCurrency: renderUICurrencyFromJSON
    renderDate:     renderDate

Shop.initCart = ->
  @cart.initCart()

Shop.clear = ->
  @cart.clear()

Shop.getMediator = ->
  return m

Shop.getData = ->
  return @data

Shop.isEmpty   = ->
  items = @data.get 'order.items'
  items.length == 0

# cart item is in the form of:
#
# id:       string
# sku:      string
# name:     string
# quantity: number
# price:    number in cents
#

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

Shop.addItem = (id, quantity, locked) ->
  item = Shop.getItem(id)
  Shop.setItem(id, item.quantity += quantity, locked)

Shop.getItem = (id) ->
  item =  @cart.get id
  return {
    id:         item?.id ? ''
    sku:        item?.sku ? ''
    name:       item?.name ? ''
    quantity:   item?.quantity ? 0
    price:      item?.price ? 0
  }

# Support inline load
if document?.currentScript?
  key = document.currentScript.getAttribute('data-key')
  endpoint = document.currentScript.getAttribute('data-endpoint')

  if key
    opts =
      key: key

    if endpoint
      opts.endpoint = endpoint

    requestAnimationFrame ()->
      Shop.start opts

if window?
  window.Shop = Shop

export default Shop
