Control = require './control'
placeholder = require '../utils/placeholder'

module.exports = class Text extends Control
  tag:          'text-control'
  html:         require '../../templates/controls/text.jade'
  type:         'text'
  formElement:  'input'
  autoComplete: 'on'
  init: ()->
    super

    @on 'updated', =>
      el = @root.getElementsByTagName(@formElement)[0]

      if @type != 'password'
        placeholder el
