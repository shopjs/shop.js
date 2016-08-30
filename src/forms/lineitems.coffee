CrowdControl = require 'crowdcontrol'
riot = require 'riot'
m = require '../mediator'
Events = require '../events'

module.exports = class LineItems extends CrowdControl.Views.View
  tag:  'lineitems'
  html: require '../../templates/forms/lineitems.jade'
  init: ()->
    if @parentData?
      @data = @parentData

    super

    @on 'update', ()=>
      if @parentData?
        @data = @parentData
