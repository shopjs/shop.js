import CrowdControl from 'crowdcontrol'
import m from '../mediator'
import Events from '../events'

import html from '../../templates/forms/lineitem'

export default class LineItemForm extends CrowdControl.Views.Form
  tag:  'lineitem'
  html: html
  configs:
    'quantity': null

  init: ()->
    super

  delete: (event)->
    m.trigger Events.DeleteLineItem, @data
