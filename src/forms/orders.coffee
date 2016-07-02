CrowdControl = require 'crowdcontrol'
riot = require 'riot'
m = require '../mediator'
Events = require '../events'
refer = require 'referential'

module.exports = class Orders extends CrowdControl.Views.View
  tag:  'orders'
  html: require '../../templates/forms/orders.jade'
  init: ()->
    super
