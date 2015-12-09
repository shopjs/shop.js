Select = require './select'

module.exports = class CountrySelect extends Select
  tag: 'country-select-control'
  options: require('../data/countries').data
