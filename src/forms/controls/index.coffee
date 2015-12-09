module.exports =
  Control: require './control'
  Text: require './text'
  register: ()->
    @Text.register()
