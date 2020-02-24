import React, { Component } from 'react'

import classnames from 'classnames'
import {
  isFunction,
  valueOrError,
  valueOrEvent,
} from '@hanzo/utils'

//
// *** Hanzo Standardized Control Decorator ***
//
// A standardized control wrapper for making Hanzo controls all behave the same
// way and share a common props api.
//
// Features
// - Support react style hooks with getValue/setValue
// - setValue standarizes behavior use onBlur.  This mostly has to do with
//   Material UI using a nonstandard onChange event for controlled inputs
// - Standardizes the error field for setting the correct error and helperText
//   states
// - The 'nice' api for controls:
//
// const {
//   getValue
//   setValue
//   inputValue
//   error
//   showError
// } = this.props
//
// - Fully optional and compatible with normal Material UI
//
// Custom Fields
// - getValue - a function that is evaluated and is used to set value
//   internally converted into a onBlur function
// - setValue - a function for taking value instead of an event, executes
//   alongside onBlur.  This is designed for creating uncontrolled inputs.
// - inputValue - a function fo taking value instead of an event, events
//   alongside Material UI onChange (standard onInput).  This is designed for
//   creating controleld inputs.
// - error - setting to true or false replicates
// - showError - overwrite showing/hiding the error
//

let controlId = 0

export default function control(ControlComponent) {
  return class Control extends Component {
    constructor(props) {
      super(props)

      this.controlId = controlId++
    }

    get id() {
      return 'control-' + this.controlId
    }

    render() {
      let {
        getValue,
        setValue,
        inputValue,
        onBlur,
        onChange,
        defaultValue,
        value,
        error,
        helperText,
        showError,
        ...props
      } = this.props

      // show error defaults to true
      if (showError == null) {
        showError = true
      }

      // getValue supercedes both defaultValue and value
      if (isFunction(getValue)) {
        value = getValue()
        defaultValue = undefined
      }

      // inputValue supercedes setValue
      if (isFunction(inputValue)) {
        let originalOnChange = onChange
        onChange = (e) => {
          inputValue(valueOrEvent(e))
          if(isFunction(originalOnChange)) {
            originalOnChange(e)
          }
        }

        setValue = undefined
      // setValue supercedes both onBlue and onChange
      } else if (isFunction(setValue)) {
        let originalOnBlur = onBlur
        onBlur = (e) => {
          setValue(valueOrEvent(e))
          if(isFunction(originalOnBlur)) {
            originalOnBlur(e)
          }
        }
        onChange = undefined

        // if we are not using the getValue/setValue api, then we must load
        // a value into the system
        // some falsy values of value should not cause an initial update
        if (!this.firstValue && value != null && value !== '' && value !== this.lastValue) {
          this.firstValue = defaultValue != null && value !== ''
          onBlur(value)
          this.lastValue = value
        } else if (!this.firstValue && defaultValue !== undefined) {
          this.firstValue = defaultValue != null && value !== ''
          onBlur(defaultValue);
        }
      } else {
        setValue = undefined
        inputValue = undefined
      }

      // error must be a string
      error = valueOrError(error)

      return pug`
        .control(
          ref=this.inputRef
          className=classnames({
            valid: !error,
            invalid: error,
          })
        )
          ControlComponent(
            ...props
            id         = this.id
            onBlur     = onBlur
            onChange   = onChange
            error      = !!(showError && error)
            helperText = (showError && error !== undefined && error !== false && error !== true) ? error : helperText

            value        = value
            defaultValue = defaultValue
          )
      `
    }
  }
}
