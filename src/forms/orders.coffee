import CrowdControl from 'crowdcontrol'
import riot         from 'riot'
import refer        from 'referential'

import Events from '../events'
import html   from '../../templates/forms/orders'
import m      from '../mediator'

class Orders extends CrowdControl.Views.View
  tag:  'orders'
  html: html
  init: ->
    super

export default Orders
