import CrowdControl from 'crowdcontrol'

class NestedForm extends CrowdControl.Views.View
  tag:  'nested-form'
  html: '''
    <form method="{ method }" action="{ action }">
      <yield></yield>
    </form>
  '''

export default NestedForm
