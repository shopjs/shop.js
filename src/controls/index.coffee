module.exports =
  Control:  require './control'
  Text:     require './text'
  Select:   require './select'
  register: ()->
    @Text.register()
    @Select.register()
