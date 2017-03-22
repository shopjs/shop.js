import CrowdControl from 'crowdcontrol'

import html from '../../templates/forms/orders'

export default class Orders extends CrowdControl.Views.View
  tag:  'orders'
  html: html
  init: ()->
    super
