export Text from './text'

import html from '../../templates/controls/textarea'

export default class TextArea extends Text
  tag:  'textarea-control'
  html: html
  formElement: 'textarea'
