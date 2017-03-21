import Control from './control'

export default class Checkbox extends Control
  tag: 'checkbox-control'
  html: require '../../templates/controls/checkbox'
  getValue: (event)->
    return event.target.checked
