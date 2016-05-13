Select = require './select'
countries = require('../data/countries')

module.exports = class CountrySelect extends Select
  tag: 'country-select-control'
  options: ->
    return countries.data

  init: ()->
    super

    @on 'update', ()=>
      country = @input.ref.get 'order.shippingAddress.country'
      if country
        country = country.toLowerCase()
        if country.length == 2
          @input.ref.set 'order.shippingAddress.country', country
        else
          for k, v of countries.data
            if v.toLowerCase() == country
              @input.ref.set 'order.shippingAddress.country', k
              return
