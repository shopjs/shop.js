CrowdControl = require 'crowdcontrol'

module.exports = class NestedForm extends CrowdControl.Views.View
  tag:  'nested-form'
  html: '''
    <form method="{ method }" action="{ action }">
      <yield></yield>
    </form>
  '''
