# import { CountrySelect } from 'el-controls'
import CountrySelect from 'el-controls/src/controls/country-select'

export default class AddressCountry extends CountrySelect
  tag:  'address-country'
  bind: 'address.country'
  countriesField: 'countries'

  init: ->
    super arguments...

    @input.ref.on 'set', (k, v)=>
      if k.indexOf(@countriesField) > -1
        # force update of selectOptions
        @options()
        @update()

AddressCountry.register()
