# import { StateSelect } from 'el-controls'
import StateSelect from 'el-controls/src/controls/state-select'

export default class AddressState extends StateSelect
  tag:  'address-state'
  bind: 'address.state'
  countryField: 'address.country'

  getCountry: ->
    return @data.get @countryField

  init: ->
    super arguments...

    @input.ref.on 'set', (k, v)=>
      if k.indexOf(@countryField) > -1
        # force update of selectOptions
        @options()
        @update()

AddressState.register()

