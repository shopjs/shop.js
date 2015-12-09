module.exports =
  Control:          require './control'
  Text:             require './text'
  Select:           require './select'
  CountrySelect:    require './country-select'
  StateSelect:      require './state-select'
  register: ()->
    @Text.register()
    @Select.register()
    @CountrySelect.register()
    @StateSelect.register()
