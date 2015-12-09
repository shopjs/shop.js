global.Crowdstart ?= {}
refer = require 'referential'
riot = require 'riot'

Shop = require './shop'
# Shop.templates require '../templates'
Shop.Forms = require './forms'
Shop.Controls = require './controls'

Shop.Cart
Shop.use = (templates)->
  Shop.Controls.Control.prototype.errorHtml = templates.Controls.Error if templates?.Controls?.Error
  Shop.Controls.Text.prototype.html = templates.Controls.Text if templates?.Controls?.Text

Shop.start = (data)->
  Shop.Forms.register()
  Shop.Controls.register()

  d = refer
    type: 'stripe'
    order:
      shippingAddress:
        country: 'us'
  d.set data
  riot.mount '*',
    data: d

module.exports = Crowdstart.Shop = Shop
