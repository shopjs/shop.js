Text = require './text'

module.exports = class TextArea extends Text
  tag:  'textarea-control'
  html: require '../../templates/controls/textarea.jade'
  formElement: 'textarea'
