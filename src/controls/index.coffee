module.exports =
  Control:          require './control'
  Text:             require './text'
  Checkbox:         require './checkbox'
  Select:           require './select'
  QuantitySelect:   require './quantity-select'
  CountrySelect:    require './country-select'
  StateSelect:      require './state-select'
  register: ()->
    @Text.register()
    @Checkbox.register()
    @Select.register()
    @QuantitySelect.register()
    @CountrySelect.register()
    @StateSelect.register()
