import Control from './control'

import html from '../../templates/controls/checkbox'

export default class Checkbox extends Control
  tag: 'checkbox-control'
  html: html
  getValue: (event)->
    return event.target.checked
