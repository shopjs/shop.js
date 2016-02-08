Select = require './select'

module.exports = class CountrySelect extends Select
  tag: 'country-select-control'
  options: ->
    return require('../data/countries').data
