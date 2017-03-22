import Control from './control'
import placeholder from '../utils/placeholder'

import html from '../../templates/controls/text'

export default class Text extends Control
  tag:          'text-control'
  html:         html
  type:         'text'
  formElement:  'input'
  autoComplete: 'on'
  init: ()->
    super

    @on 'updated', =>
      el = @root.getElementsByTagName(@formElement)[0]

      if @type != 'password'
        placeholder el
