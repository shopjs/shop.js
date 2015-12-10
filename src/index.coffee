global.Crowdstart ?= {}
refer = require 'referential'
riot = require 'riot'
Api = require 'crowdstart.js'
m = require './mediator'
Events = require './events'
Promise = require 'broken'

Shop = require './shop'
# Shop.templates require '../templates'
Shop.Forms = require './forms'
Shop.Controls = require './controls'

Shop.Cart = require './cart'
Shop.use = (templates)->
  Shop.Controls.Control.prototype.errorHtml = templates.Controls.Error if templates?.Controls?.Error
  Shop.Controls.Text.prototype.html = templates.Controls.Text if templates?.Controls?.Text

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
#Format of opts.referralProgram
# Referral Program Object
#
client = null
items = []
Shop.start = (token, opts)->
  Shop.Forms.register()
  Shop.Controls.register()

  opts = opts || {}

  search = /([^&=]+)=?([^&]*)/g
  q = window.location.href.split('?')[1]
  qs = {}
  if q?
    while (match = search.exec(q))
      qs[decodeURIComponent(match[1])] = decodeURIComponent(match[2])


  referrer = qs.referrer ? opts.order?.referrer

  o = refer
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
      items: items
  o.set opts

  client = new Api.Api
    key:      token
    endpoint: 'https://api.crowdstart.com'

  tags = riot.mount '*',
    data: o
    client: client

  ps = []
  for tag in tags
    p = new Promise (resolve)->
      tag.one 'updated', ()->
        resolve()
    ps.push p

  Promise.settle(ps).then ()->
    m.trigger Events.Ready

  # quite hacky
  m.trigger Events.SetData, o
  return m

waits = 0
itemUpdateQueue = []
Shop.setItem = (id, quantity)->
  itemUpdateQueue.push [id, quantity]

  if itemUpdateQueue.length == 1
    setItem()

setItem = ()->
  if itemUpdateQueue.length == 0
    return

  [id, quantity] = itemUpdateQueue.shift()

  # delete item
  if quantity == 0
    for item, i in items
      break if item.productId == id || item.productSlug == id

    if i < items.length
      items.splice i, 1
    setItem()
    return

  # try and update item quantity
  for item, i in items
    continue if item.productId != id && item.productSlug != id

    item.quantity = quantity

    setItem()
    return

  # fetch up to date information at time of checkout openning
  # TODO: Think about revising so we don't report old prices if they changed after checkout is open
  items.push
    id: id
    quantity: quantity

  # waiting for response so don't update
  waits++

  client.product.get(id).then((product)->
    waits--
    for item, i in items
      if product.id == item.id || product.slug == item.id
        updateItem product, item
        break
    setItem()
  ).catch (err)->
    waits--
    console.log "setItem Error: #{err}"
    setItem()

updateItem = (product, item)->
  item.id             = undefined
  item.productId      = product.id
  item.productSlug    = product.slug
  item.productName    = product.name
  item.price          = product.price
  item.listPrice      = product.listPrice
  m.trigger Events.UpdateItems
  riot.update()

module.exports = Crowdstart.Shop = Shop
