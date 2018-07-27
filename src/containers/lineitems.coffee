import El from 'el.js'

import Events from '../events'
import html   from '../../templates/containers/lineitems'

class LineItems extends El.View
  tag:  'lineitems'
  html: html

  init: ->
    if @parentData?
      @data = @parentData

    super arguments...

    @on 'update', =>
      if @parentData?
        @data = @parentData

  isSubmitted: ->
    return !!@data.get 'order.status'

LineItems.register()

export default LineItems
