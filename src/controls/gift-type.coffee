Select = require './state-select'

module.exports = class GiftType extends Select
  tag:  'gift-type'
  lookup: 'order.giftType'

