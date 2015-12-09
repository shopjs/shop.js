CrowdControl = require 'crowdcontrol'

module.exports = class Input extends CrowdControl.Views.Input
  getValue: (event)->
    return $(event.target).val().trim()
