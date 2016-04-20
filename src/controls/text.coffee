Control = require './control'
placeholder = require '../utils/placeholder'

module.exports = class Text extends Control
  tag:  'text-control'
  html: require '../templates/controls/text'
  formElement: 'input'
  init: ()->
    super

    @on 'updated', =>
      el = @root.getElementsByTagName(@formElement)[0]
      placeholder el
