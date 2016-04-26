CrowdControl = require 'crowdcontrol'
riot = require 'riot'
m = require '../mediator'
Events = require '../events'

module.exports = class LineItems extends CrowdControl.Views.View
  tag:  'lineitems'
  html: require '../../templates/forms/lineitems'
  init: ()->
    super

    @on 'update', ()=>
      if @lineItemData?
        @data = @lineItemData
