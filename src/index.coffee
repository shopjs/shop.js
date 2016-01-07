Promise       = require 'broken'
refer         = require 'referential'
riot          = require 'riot'
store         = require 'store'

Crowdstart    = require 'crowdstart.js'

m             = require './mediator'
Events        = require './events'
analytics     = require './utils/analytics'

Shop          = require './shop'
Shop.Forms    = require './forms'
Shop.Controls = require './controls'
Shop.Cart     = require './cart'

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
# Format of opts.analytics
# {
#   pixels: map of string to string (map of pixel names to pixel url)
# }
#
#Format of opts.referralProgram
# Referral Program Object
#
client = null
data = null

Shop.analytics = analytics

Shop.isEmpty = ->
  items = data.get 'order.items'
  return items.length == 0

getReferrer = ->
  search = /([^&=]+)=?([^&]*)/g
  q = window.location.href.split('?')[1]
  qs = {}
  if q?
    while (match = search.exec(q))
      qs[decodeURIComponent(match[1])] = decodeURIComponent(match[2])

  qs.referrer

Shop.start = (opts = {}) ->
  unless opts.key?
    throw new Error 'Please specify your API Key'

  Shop.Forms.register()
  Shop.Controls.register()

  referrer = getReferrer() ? opts.order?.referrer

  items = store.get 'items'

  d = refer
    taxRates:       opts.taxRates || []
    order:
      giftType:     'physical'
      type:         'stripe'
      shippingRate: opts.config?.shippingRate   || opts.order?.shippingRate  || 0
      taxRate:      opts.config?.taxRate        || opts.order?.taxRate       || 0
      currency:     opts.config?.currency       || opts.order?.currency      || 'usd'
      referrerId:   referrer
      shippingAddress:
        country: 'us'
      discount: 0
      tax: 0
      subtotal: 0
      total: 0
      items: items ? []
  d.set opts

  client = new Crowdstart.Api
    key:      opts.key
    endpoint: opts.endpoint

  data = d
  tags = riot.mount '*',
    data: d
    client: client

  ps = []
  for tag in tags
    p = new Promise (resolve)->
      tag.one 'updated', ->
        resolve()
    ps.push p

  Promise.settle(ps).then ->
    m.trigger Events.Ready

  # quite hacky
  m.trigger Events.SetData, d

  m.on Events.SubmitSuccess, ->
    options =
        orderId:  data.get 'order.id'
        total:    parseFloat(data.get('order.total') /100),
        # revenue: parseFloat(order.total/100),
        shipping: parseFloat(data.get('order.shipping') /100),
        tax:      parseFloat(data.get('order.tax') /100),
        discount: parseFloat(data.get('order.discount') /100),
        coupon:   data.get('order.couponCodes.0') || '',
        currency: data.get('order.currency'),
        products: []

    for item, i in data.get 'order.items'
      options.products[i] =
        id: item.productId
        sku: item.productSlug
        name: item.productName
        quantity: item.quantity
        price: parseFloat(item.price / 100)

    analytics.track 'Completed Order', options
    pixels =  data.get 'analytics.pixels.checkout'
    if pixels?
      analytics.track 'checkout', pixels

  # Fix incompletely loaded items
  if items? && items.length > 0
    for item in items
      if item.id?
        reloadItem item.id

  # Force update
  riot.update()

  return m

waits           = 0
itemUpdateQueue = []

Shop.setItem = (id, quantity, locked=false)->
  itemUpdateQueue.push [id, quantity, locked]

  if itemUpdateQueue.length == 1
    setItem()

setItem = ->
  items = data.get 'order.items'

  if itemUpdateQueue.length == 0
    return

  [id, quantity, locked] = itemUpdateQueue.shift()

  # delete item
  if quantity == 0
    for item, i in items
      break if item.productId == id || item.productSlug == id || item.id == id

    if i < items.length
      # Do this until there is a riot version that fixes loops and riot.upate
      items[i].quantity = 0
      #items.splice i, 1

      analytics.track 'Removed Product',
        id: item.productId
        sku: item.productSlug
        name: item.productName
        quantity: item.quantity
        price: parseFloat(item.price / 100)

    m.trigger Events.UpdateItems
    setItem()
    return

  # try and update item quantity
  for item, i in items
    continue if item.productId != id && item.productSlug != id

    item.quantity = quantity
    item.locked = locked

    oldValue = item.quantity
    newValue = quantity

    deltaQuantity = newValue - oldValue
    if deltaQuantity > 0
      analytics.track 'Added Product',
        id: item.productId
        sku: item.productSlug
        name: item.productName
        quantity: deltaQuantity
        price: parseFloat(item.price / 100)
    else if deltaQuantity < 0
      analytics.track 'Removed Product',
        id: item.productId
        sku: item.productSlug
        name: item.productName
        quantity: deltaQuantity
        price: parseFloat(item.price / 100)

    m.trigger Events.UpdateItems
    setItem()
    return

  # Fetch up to date information at time of checkout openning
  # TODO: Think about revising so we don't report old prices if they changed after checkout is open

  items.push
    id:         id
    quantity:   quantity
    locked:     locked

  # waiting for response so don't update
  waits++

  reloadItem id

reloadItem = (id) ->
  items = data.get 'order.items'

  client.product.get id
    .then (product) ->
      waits--
      for item, i in items
        if product.id == item.id || product.slug == item.id
          analytics.track 'Added Product',
            id: product.id
            sku: product.slug
            name: product.name
            quantity: item.quantity
            price: parseFloat(product.price / 100)

          updateItem product, item
          break
      setItem()
    .catch (err) ->
      waits--
      console.log "setItem Error: #{err}"
      setItem()

updateItem = (product, item) ->
  item.id             = undefined
  item.productId      = product.id
  item.productSlug    = product.slug
  item.productName    = product.name
  item.price          = product.price
  item.listPrice      = product.listPrice
  m.trigger Events.UpdateItems
  riot.update()

module.exports = Crowdstart.Shop = Shop
