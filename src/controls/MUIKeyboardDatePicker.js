import React, { Component } from 'react'
import moment from 'moment-timezone'
import MomentUtils from '@date-io/moment'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'

import control from './control'
import { KeyboardDatePicker } from '@material-ui/pickers'

import {
  defaultFormat,
  renderJSONDate,
  isFunction,
} from '@hanzo/utils'

//
// *** Hanzo Standardized Keyboard Date Picker ***
//
// A Material UI Date Picker with Keyboard Support.  It returns hanzo
// compatible dates (rfc3339) and converts from hanzo compatible dates.
//
// Custom Fields
// - unix - instead of converting to and from rfc3339, target unix time integers
//   instead
//

export class BaseMUIKeyboardDatePicker extends Component {
  options = undefined

  constructor(props) {
    super(props)
  }

  // Make it so that setters convert to unix dates if set to do so
  wrapUnixSetter(setter) {
    return (e) => {
      return setter(this.props.unix != null ? e.unix() : renderJSONDate(e))
    }
  }

  render() {
    let {
      value,
      defaultValue,
      format,
      shrink,
      onChange,
      onBlur,
      unix,
      inputVariant,
      variant,
      ...props
    } = this.props

    let isUnix = unix != null

    if (isFunction(onChange)) {
      onChange = this.wrapUnixSetter(onChange)
    }

    if (isFunction(onBlur)) {
      onBlur = this.wrapUnixSetter(onBlur)
    }

    // handle dates in unix mode
    if (isUnix) {
      if (value) {
        value = moment(value).unix()
      }

      if (defaultValue) {
        defaultValue = moment(defaultValue).unix()
      }
    }

    return pug`
      MuiPickersUtilsProvider(utils=MomentUtils)
        KeyboardDatePicker(
          ...props
          inputVariant=variant || inputVariant
          format=format || defaultFormat()
          onChange=onBlur || onChange
          value=value || defaultValue
          InputLabelProps={ shrink: !!value || !!defaultValue || shrink }
        )
        `
  }
}

@control
export default class MUIKeyboardDatePicker extends BaseMUIKeyboardDatePicker {}
