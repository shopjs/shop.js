import CrowdControl from 'crowdcontrol'
import riot         from 'riot'

import Events from '../events'
import m      from '../mediator'

class LineItemForm extends CrowdControl.Views.Form
  tag:  'lineitem'
  html: require '../../templates/forms/lineitem'
  configs:
    'quantity': null

  init: ->
    super

  delete: (event) ->
    m.trigger Events.DeleteLineItem, @data

export default LineItemForm
