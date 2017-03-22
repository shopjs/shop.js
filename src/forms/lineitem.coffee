import El from 'el.js'

import Events from '../events'
import html   from '../../templates/forms/lineitem'
import m      from '../mediator'

class LineItemForm extends El.Views.Form
  tag:  'lineitem'
  html: html
  configs:
    'quantity': null

  init: ->
    super

  delete: (event) ->
    m.trigger Events.DeleteLineItem, @data

export default LineItemForm
