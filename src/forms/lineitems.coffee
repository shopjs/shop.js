import CrowdControl from 'crowdcontrol'
import riot         from 'riot'

import Events from '../events'
import m      from '../mediator'
import html   from '../../templates/forms/lineitems'

class LineItems extends CrowdControl.Views.View
  tag:  'lineitems'
  html: html
  init: ->
    if @parentData?
      @data = @parentData

    super

    @on 'update', =>
      if @parentData?
        @data = @parentData

export default LineItems
