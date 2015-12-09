global.Crowdstart ?= {}
refer = require 'referential'

Shop = require './shop'
# Shop.templates require '../templates'
Shop.Forms = require './forms'

Shop.Cart
Shop.use = (templates)->
  Shop.Forms.Controls.Control.prototype.errorHtml = templates?.Controls?.Error
  Shop.Forms.Controls.Text.prototype.html = templates?.Controls?.Text

Shop.start = (data)->
  Shop.Forms.register()

  d = refer {}
  d.set data
  riot.mount '*',
    data: d

module.exports = Crowdstart.Shop = Shop
