global.Crowdstart ?= {}
refer = require 'referential'
riot = require 'riot'
Api = require 'crowdstart.js'

Shop = require './shop'
# Shop.templates require '../templates'
Shop.Forms = require './forms'
Shop.Controls = require './controls'

Shop.Cart
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
Shop.start = (token, opts)->
  Shop.Forms.register()
  Shop.Controls.register()

  opts = opts || {}

  o = refer
    taxRates:       opts.taxRates || []
    order:
      type:         'stripe'
      shippingRate: opts.config?.shippingRate   || opts.order?.shippingRate  || 0
      taxRate:      opts.config?.taxRate        || opts.order?.taxRate       || 0
      currency:     opts.config?.currency       || opts.order?.currency      || 'usd'
      shippingAddress:
        country: 'us'
  o.set opts
  riot.mount '*',
    data: o
    client: new Api.Api
      key:      token
      endpoint: 'https://api.crowdstart.com'

module.exports = Crowdstart.Shop = Shop
