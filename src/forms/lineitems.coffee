import El from 'el.js'

import Events from '../events'
import html   from '../../templates/forms/lineitems'

class LineItems extends El.View
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
