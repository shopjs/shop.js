Control = require './control'

module.exports = class Text extends Control
  tag:  'text-control'
  html: require '../../templates/controls/text.jade'
