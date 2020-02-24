import React, { Component } from 'react'

import control from './control'
import {
  Checkbox,
  MenuItem,
  FormControl,
  FormControlLabel,
  FormHelperText
} from '@material-ui/core'

import { withStyles } from '@material-ui/core/styles'

//
// *** Hanzo Standardized Checkbox ***
//

export class BaseMUICheckbox extends Component{
  constructor(props) {
    super(props)
  }

  change(e, checked) {
    let { onChange, onBlur } = this.props
    onChange = onChange || onBlur

    if (onChange) {
      onChange(checked)
    }
  }

  render() {
    let {
      id,
      value,
      defaultValue,
      error,
      helperText,
      disabled,
      children,
      classes,
      label,
      onBlur,
      onChange,
      ...props
    } = this.props

    if (!disabled) {
      disabled = this.disabled
    }

    value = value || defaultValue || false

    let c = pug`Checkbox(
        ...props
        id=id
        disabled=disabled
        checked=!!value
        onChange=this.change.bind(this)
        className=classes.pointer
        type='checkbox'
      )`


    return pug`
      .switch
        FormControl(className=classes.row)
          FormControlLabel(
            control=c
            label=label
          )
          div(className=classes.break)
          if !!helperText
            FormHelperText(
              disabled=disabled
              error=!!error
              className=classes.helper
            )
              =helperText
      `
  }
}

const styles = theme => ({
  pointer: {
    cursor: 'pointer',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  break: {
    flexBasis: '100%',
    height: 0,
  },
  label: {
    textAlign: 'left',
    cursor: 'pointer',
  },
  helper: {
    padding: '0 15px 15px',
    margin: '-3px 0 0',
  },
})

@control
export default withStyles(styles)(class MUICheckbox extends BaseMUICheckbox {})
