import React, { createRef, Component } from 'react'

import control from './control'

import MUIPhoneNumber from './material-ui-phone-number'

//
// *** Hanzo Standardized Material UI Phone Input ***
//
// This control requires onChange
//

export class BaseMUIPhone extends Component {
  firstValue = undefined
  ref = createRef()

  render() {
    let {
      value,
      defaultValue,
      defaultCountry,
      onChange,
      onBlur,
      ...props
    } = this.props

    onChange = onChange || onBlur

    // A real default value system for asynchronous uncontrolled inputs
    if (this.firstValue === undefined || this.firstValue === '') {
      this.firstValue = value || defaultValue
      console.log('try fv', this.firstValue)

      if (this.firstValue !== undefined && this.firstValue !== '') {
        // Keep trying to set until inputRef is assigned
        const forceSet = () => {
          if (this.ref.current && this.ref.current.getElementsByTagName('input')[0]) {
            this.ref.current.value = this.firstValue
            // This is needed due to how phone executes onChange immediately
            // with empty string
            console.log('fv', this.firstValue)
            onChange(this.firstValue)
          } else {
            requestAnimationFrame(forceSet)
          }
        }

        requestAnimationFrame(forceSet)
      }
    }

    return pug`
      div(ref=this.ref)
        MUIPhoneNumber(
          defaultCountry=defaultCountry === undefined ? 'us' : ''
          value=value
          defaultValue=defaultValue
          onChange=onChange
          ...props
        )
      `
  }
}

@control
export default class MUIPhone extends BaseMUIPhone {}
