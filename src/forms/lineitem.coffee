CrowdControl = require 'crowdcontrol'
riot = require 'riot'
m = require '../mediator'
Events = require '../events'

module.exports = class LineItemForm extends CrowdControl.Views.Form
  tag:  'lineitem'
  html: require '../../templates/forms/lineitem'
  configs:
    'quantity': null

  init: ()->
    # ie10 riot issue hack
    @originalParentElement = @root.parentElement

    super

  renderCurrency: require('../utils/currency').renderUICurrencyFromJSON
