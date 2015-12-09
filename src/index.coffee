global.Crowdstart ?= {}
refer = require 'referential'

Shop = require './shop'
# Shop.templates require '../templates'
Shop.Forms = require './forms'
Shop.Controls = require './controls'

Shop.Cart
Shop.use = (templates)->
  Shop.Controls.Control.prototype.errorHtml = templates?.Controls?.Error
  Shop.Controls.Text.prototype.html = templates?.Controls?.Text

Shop.start = (data)->
  Shop.Forms.register()
  Shop.Controls.register()

  d = refer {}
  d.set data
  riot.mount '*',
    data: d

module.exports = Crowdstart.Shop = Shop
