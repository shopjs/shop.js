CrowdControl = require 'crowdcontrol'
riot = require 'riot'
m = require '../mediator'
Events = require '../events'

module.exports = class CartForm extends CrowdControl.Views.Form
  tag:  'cart'
  html: '''
    <lineitem each="{ item, v in data('order.items') }" cartdata="{ this.parent.data }" data="{ this.parent.data.ref('order.items.' + v) }">
    </lineitem>
    <yield/>
  '''

  renderCurrency: require('../utils/currency').renderUICurrencyFromJSON
