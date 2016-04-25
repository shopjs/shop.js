CrowdControl = require 'crowdcontrol'
riot = require 'riot'
m = require '../mediator'
Events = require '../events'

module.exports = class LineItemForm extends CrowdControl.Views.Form
  tag:  'lineitem'
  html: require '../../templates/forms/lineitem'
  configs:
    'quantity': null

  renderCurrency: require('../utils/currency').renderUICurrencyFromJSON

  init: ()->
    super

  delete: (event)->
    m.trigger Events.DeleteLineItem, @data
