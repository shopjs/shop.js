import El from 'el.js'

import Events from '../events'
import html   from '../../templates/containers/lineitem'

class LineItemForm extends El.Form
  tag:  'lineitem'
  html: html
  configs:
    'quantity': null

  init: ->
    super arguments...

  delete: (event) ->
    @mediator.trigger Events.DeleteLineItem, @data

LineItemForm.register()

export default LineItemForm
