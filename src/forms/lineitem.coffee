import El from 'el.js'

import Events from '../events'
import html   from '../../templates/forms/lineitem'

class LineItemForm extends El.Form
  tag:  'lineitem'
  html: html
  configs:
    'quantity': null

  init: ->
    super

  delete: (event) ->
    @mediator.trigger Events.DeleteLineItem, @data

export default LineItemForm
