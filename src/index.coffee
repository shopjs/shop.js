global.Crowdstart ?= {}

Shop = require './shop'
# Shop.templates require '../templates'
Shop.Forms = require './forms'
Shop.Cart
Shop.start = ()->
  riot.mount '*'

module.exports = Crowdstart.Shop = Shop
