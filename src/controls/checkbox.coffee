Control = require './control'

module.exports = class Checkbox extends Control
  tag: 'checkbox-control'
  html: require '../../templates/controls/checkbox.jade'
  getValue: (event)->
    return event.target.checked
