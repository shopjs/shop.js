import CrowdControl from 'crowdcontrol'

import Events from '../events'
import html   from '../../templates/forms/lineitems'
import m      from '../mediator'

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
