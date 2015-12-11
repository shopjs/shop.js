Control = require './control'

module.exports = class Text extends Control
  tag:  'textarea-control'
  html: require '../../templates/controls/textarea.jade'
