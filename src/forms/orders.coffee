import CrowdControl from 'crowdcontrol'

import html from '../../templates/forms/orders'

class Orders extends CrowdControl.Views.View
  tag:  'orders'
  html: html
  init: ->
    super

export default Orders
