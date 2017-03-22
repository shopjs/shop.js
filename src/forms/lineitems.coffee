import CrowdControl from 'crowdcontrol'
import m from '../mediator'
import Events from '../events'

import html from '../../templates/forms/lineitems'

export default class LineItems extends CrowdControl.Views.View
  tag:  'lineitems'
  html: html
  init: ()->
    if @parentData?
      @data = @parentData

    super

    @on 'update', ()=>
      if @parentData?
        @data = @parentData
