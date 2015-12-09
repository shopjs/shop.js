CrowdControl = require 'crowdcontrol'

module.exports = class Control extends CrowdControl.Views.Input
  init: ()->
    # prevent weird yield bug
    if @input?
      super
  getValue: (event)->
    return $(event.target).val()?.trim()
