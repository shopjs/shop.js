CrowdControl = require 'crowdcontrol'
m = require '../mediator'
Events = require '../events'

module.exports = class OrderForm extends CrowdControl.Views.Form
  tag:  'order'
  html: '''
    <form onsubmit={submit}>
      <yield/>
    </form>
  '''
