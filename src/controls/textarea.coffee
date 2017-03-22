import Text from './text'
import html from '../../templates/controls/textarea'

class TextArea extends Text
  tag:         'textarea-control'
  html:         html
  formElement: 'textarea'

export default TextArea
