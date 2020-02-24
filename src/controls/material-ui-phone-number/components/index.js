import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import Divider from '@material-ui/core/Divider'
import NativeSelect from '@material-ui/core/NativeSelect'
import withStyles from '@material-ui/core/styles/withStyles'
import memoize from 'fast-memoize'
import countryData from '../country_data'
import Item from './Item'

import { isString, debounce } from '@hanzo/utils'

import './polyfills'

const head = (array) => {
  let [h, ...t] = array
  return h
}

const tail = (array) => {
  let [h, ...t] = array
  return t
}

const styles = () => ({
  flagButton: {
    minWidth: 30,
    padding: 0,
    height: 30,
  },
  native: {
    width: 30,
    height: 30,
    padding: 8,
  },
  nativeRoot: {
    padding: 0,

    '& + svg': {
      display: 'none',
    },
  },
  nativeSelect: {
    padding: 0,
    lineHeight: 0,
    height: 11,
  },
  positionStart: {
    position: 'relative',
  },
})

class MaterialUiPhoneNumber extends Component {
  flags = {}

  guessSelectedCountry = memoize((inputNumber, onlyCountries, defaultCountry) => {
    const secondBestGuess = onlyCountries.find((c) => c.iso2 === defaultCountry ) || {}
    if (inputNumber.trim() === '') return secondBestGuess

    const bestGuess = onlyCountries.reduce((selectedCountry, country) => {
      if (inputNumber.startsWith(country.dialCode)) {
        if (country.dialCode.length > selectedCountry.dialCode.length) {
          return country
        }
        if (country.dialCode.length === selectedCountry.dialCode.length && country.priority < selectedCountry.priority) {
          return country
        }
      }
      return selectedCountry
    }, { dialCode: '', priority: 10001 }, this)

    if (!bestGuess.name) return secondBestGuess
    return bestGuess
  })

  constructor(props) {
    super(props)
    let filteredCountries = countryData.allCountries

    if (props.disableAreaCodes) filteredCountries = this.deleteAreaCodes(filteredCountries)
    if (props.regions) filteredCountries = this.filterRegions(props.regions, filteredCountries)

    const onlyCountries = this.excludeCountries(
      this.getOnlyCountries(props.onlyCountries, filteredCountries), props.excludeCountries,
    )

    const preferredCountries = filteredCountries.filter((country) => props.preferredCountries.some((preferredCountry) => preferredCountry === country.iso2))

    const inputNumber = props.value || ''

    let countryGuess
    if (inputNumber.length > 1) {
      // Country detect by value field
      countryGuess = this.guessSelectedCountry(inputNumber.replace(/\D/g, '').substring(0, 6), onlyCountries, props.defaultCountry) || 0
    } else if (props.defaultCountry) {
      // Default country
      countryGuess = onlyCountries.find((c) => c.iso2 == props.defaultCountry) || 0
    } else {
      // Empty params
      countryGuess = 0
    }

    const countryGuessIndex = countryData.allCountries.findIndex((c) => c.iso2 === countryGuess)
    const dialCode = (
      inputNumber.length < 2
      && countryGuess
      && !inputNumber.replace(/\D/g, '').startsWith(countryGuess.dialCode)
    ) ? countryGuess.dialCode : ''

    const formattedNumber = (inputNumber === '' && countryGuess === 0) ? ''
      : this.formatNumber(
        (props.disableCountryCode ? '' : dialCode) + inputNumber.replace(/\D/g, ''),
        countryGuess.name ? countryGuess.format : undefined,
      )

    this.state = {
      formattedNumber,
      placeholder: props.placeholder,
      onlyCountries,
      preferredCountries,
      defaultCountry: props.defaultCountry,
      selectedCountry: countryGuess,
      highlightCountryIndex: countryGuessIndex,
      queryString: '',
      freezeSelection: false,
      debouncedQueryStringSearcher: debounce(this.searchCountry, 100),
      anchorEl: null,
    }
  }

  componentDidMount() {
    if (document.addEventListener) {
      document.addEventListener('keydown', this.handleKeydown)
    }
  }

  componentDidUpdate({ value: prevValue }) {
    const { defaultCountry: prevDefaultCountry, formattedNumber } = this.state
    const { defaultCountry, value } = this.props

    if (defaultCountry && defaultCountry !== prevDefaultCountry) {
      this.updateDefaultCountry(defaultCountry)
    }

    if (typeof value === 'string' && value !== prevValue && value !== formattedNumber) {
      this.updateFormattedNumber(value)
    }
  }

  componentWillUnmount() {
    if (document.removeEventListener) {
      document.removeEventListener('keydown', this.handleKeydown)
    }
  }

  getProbableCandidate = memoize((queryString) => {
    if (!queryString || queryString.length === 0) {
      return null
    }

    const { onlyCountries } = this.state

    // don't include the preferred countries in search
    const probableCountries = onlyCountries.filter((country) => country.name.toLowerCase().startsWith(queryString.toLowerCase()), this)
    return probableCountries[0]
  })

  getOnlyCountries = (onlyCountriesArray, filteredCountries) => {
    if (onlyCountriesArray.length === 0) return filteredCountries

    return filteredCountries.filter((country) => onlyCountriesArray.some((element) => element === country.iso2))
  }

  excludeCountries = (selectedCountries, excludedCountries) => {
    if (excludedCountries.length === 0) {
      return selectedCountries
    }
    return selectedCountries.filter((selCountry) => !excludedCountries.includes(selCountry.iso2))
  }

  filterRegions = (regions, filteredCountries) => {
    if (typeof regions === 'string') {
      const region = regions
      return filteredCountries.filter((country) => country.regions.some((element) => element === region))
    }

    return filteredCountries.filter((country) => {
      const matches = regions.map((region) => country.regions.some((element) => element === region))
      return matches.some((el) => el)
    })
  }

  // Countries array methods
  deleteAreaCodes = (filteredCountries) => filteredCountries.filter((country) => country.isAreaCode !== true)

  // Hooks for updated props
  updateDefaultCountry = (country) => {
    const { onlyCountries } = this.state
    const { disableCountryCode } = this.props

    const newSelectedCountry = onlyCountries.find((c) => c.iso2 === country )

    this.setState({
      defaultCountry: country,
      selectedCountry: newSelectedCountry,
      formattedNumber: disableCountryCode ? '' : `+${newSelectedCountry.dialCode}`,
    })
  }

  // View methods
  scrollTo = (country) => {
    if (!country) { return }

    const container = this.dropdownContainerRef

    if (!container || !document.body) { return }
    container.scrollTop = country.offsetTop
  }

  formatNumber = (text, patternArg) => {
    const { disableCountryCode, enableLongNumbers, autoFormat } = this.props

    let pattern
    if (disableCountryCode && patternArg) {
      pattern = patternArg.split(' ')
      pattern.shift()
      pattern = pattern.join(' ')
    } else {
      pattern = patternArg
    }

    if (!text || text.length === 0) {
      return disableCountryCode ? '' : '+'
    }

    // for all strings with length less than 3, just return it (1, 2 etc.)
    // also return the same text if the selected country has no fixed format
    if ((text && text.length < 2) || !pattern || !autoFormat) {
      return disableCountryCode ? text : `+${text}`
    }

    const formattedObject = pattern.split('').reduce((acc, character) => {
      if (acc.remainingText.length === 0) {
        return acc
      }

      if (character !== '.') {
        return {
          formattedText: acc.formattedText + character,
          remainingText: acc.remainingText,
        }
      }

      return {
        formattedText: acc.formattedText + head(acc.remainingText),
        remainingText: tail(acc.remainingText),
      }
    }, {
      formattedText: '',
      remainingText: text.split(''),
    })

    let formattedNumber
    if (enableLongNumbers) {
      formattedNumber = formattedObject.formattedText + formattedObject.remainingText.join('')
    } else {
      formattedNumber = formattedObject.formattedText
    }

    // Always close brackets
    if (formattedNumber.includes('(') && !formattedNumber.includes(')')) formattedNumber += ')'
    return formattedNumber
  }

  // Put the cursor to the end of the input (usually after a focus event)
  cursorToEnd = () => {
    const { isModernBrowser } = this.props

    const input = this.inputRef
    input.focus()
    if (isModernBrowser) {
      const len = input.value.length
      input.setSelectionRange(len, len)
    }
  }

  getElement = (index) => this.flags[`flag_no_${index}`]

  // return country data from state
  getCountryData = () => {
    const { selectedCountry } = this.state

    if (!selectedCountry) return {}

    return {
      name: selectedCountry.name || '',
      dialCode: selectedCountry.dialCode || '',
      countryCode: selectedCountry.iso2 || '',
    }
  }

  handleFlagDropdownClick = () => {
    const {
      anchorEl, selectedCountry, preferredCountries, onlyCountries,
    } = this.state
    const { disabled } = this.props

    if (!anchorEl && disabled) return

    const highlightCountryIndex = preferredCountries.includes(selectedCountry)
      ? preferredCountries.findIndex((c) => { c.iso2 === selectedCountry.iso2 })
      : onlyCountries.findIndex((c) => { c.iso2 === selectedCountry.iso2 })

    if (preferredCountries.includes(selectedCountry)) {
      this.setState({
        highlightCountryIndex,
      }, () => {
        if (anchorEl) {
          this.scrollTo(this.getElement(highlightCountryIndex))
        }
      })
    } else {
      this.setState({
        highlightCountryIndex,
      }, () => {
        if (anchorEl) {
          this.scrollTo(this.getElement(highlightCountryIndex + preferredCountries.length))
        }
      })
    }
  }

  handleInput = (e) => {
    let { selectedCountry: newSelectedCountry, freezeSelection } = this.state
    const {
      selectedCountry, formattedNumber: oldFormattedText, onlyCountries, defaultCountry,
    } = this.state
    const {
      disableCountryCode, countryCodeEditable, isModernBrowser, onChange,
    } = this.props

    let formattedNumber = disableCountryCode ? '' : '+'

    if (!countryCodeEditable) {
      const updatedInput = `+${newSelectedCountry.dialCode}`
      if (e.target.value.length < updatedInput.length) {
        return
      }
    }

    // Does not exceed 15 digit phone number limit
    if (e.target.value.replace(/\D/g, '').length > 15) {
      return
    }

    // if the input is the same as before, must be some special key like enter etc.
    if (e.target.value === oldFormattedText) {
      return
    }

    // ie hack
    if (e.preventDefault) {
      e.preventDefault()
    } else {
      e.returnValue = false
    }

    if (e.target.value.length > 0) {
      // before entering the number in new format, lets check if the dial code now matches some other country
      const inputNumber = e.target.value.replace(/\D/g, '')

      // we don't need to send the whole number to guess the country... only the first 6 characters are enough
      // the guess country function can then use memoization much more effectively since the set of input it
      // gets has drastically reduced
      if (!freezeSelection || selectedCountry.dialCode.length > inputNumber.length) {
        newSelectedCountry = this.guessSelectedCountry(inputNumber.substring(0, 6), onlyCountries, defaultCountry)
        freezeSelection = false
      }
      // let us remove all non numerals from the input
      formattedNumber = this.formatNumber(inputNumber, newSelectedCountry.format)
    }

    let caretPosition = e.target.selectionStart
    const diff = formattedNumber.length - oldFormattedText.length

    this.setState({
      formattedNumber,
      freezeSelection,
      selectedCountry: newSelectedCountry.dialCode
        ? newSelectedCountry
        : selectedCountry,
    }, () => {
      if (isModernBrowser) {
        if (diff > 0) {
          caretPosition -= diff
        }

        const lastChar = formattedNumber.charAt(formattedNumber.length - 1)

        if (lastChar === ')') {
          this.inputRef.setSelectionRange(formattedNumber.length - 1, formattedNumber.length - 1)
        } else if (caretPosition > 0 && oldFormattedText.length >= formattedNumber.length) {
          this.inputRef.setSelectionRange(caretPosition, caretPosition)
        }
      }

      if (onChange) {
        onChange(formattedNumber, this.getCountryData())
      }
    })
  }

  handleRefInput = (ref) => {
    const { inputRef, InputProps } = this.props
    this.inputRef = ref

    let refProp

    if (inputRef) {
      refProp = inputRef
    } else if (InputProps && InputProps.ref) {
      refProp = InputProps.ref
    }

    if (refProp) {
      if (typeof refProp === 'function') {
        refProp(ref)
      } else {
        refProp.current = ref
      }
    }
  }

  handleInputClick = (e) => {
    const { onClick } = this.props

    if (onClick) {
      onClick(e, this.getCountryData())
    }
  }

  handleFlagItemClick = (country) => {
    const { formattedNumber, selectedCountry, onlyCountries } = this.state
    const { onChange } = this.props

    const currentSelectedCountry = selectedCountry
    const nextSelectedCountry = isString(country) ? onlyCountries.find((c) => c.iso2 === country) : onlyCountries.find((c) => c.iso2 === country.iso2)

    const unformattedNumber = formattedNumber.replace(' ', '').replace('(', '').replace(')', '').replace('-', '')
    const newNumber = unformattedNumber.length > 1 ? unformattedNumber.replace(currentSelectedCountry.dialCode, nextSelectedCountry.dialCode) : nextSelectedCountry.dialCode

    const newFormattedNumber = this.formatNumber(newNumber.replace(/\D/g, ''), nextSelectedCountry.format)

    this.setState({
      anchorEl: null,
      selectedCountry: nextSelectedCountry,
      freezeSelection: true,
      formattedNumber: newFormattedNumber,
    }, () => {
      this.cursorToEnd()
      if (onChange) {
        onChange(newFormattedNumber, this.getCountryData())
      }
    })
  }

  handleInputFocus = (e) => {
    const { selectedCountry } = this.state
    const { disableCountryCode, onFocus } = this.props

    // if the input is blank, insert dial code of the selected country
    if (this.inputRef) {
      if (this.inputRef.value === '+' && selectedCountry && !disableCountryCode) {
        this.setState({
          formattedNumber: `+${selectedCountry.dialCode}`,
        }, () => setTimeout(this.cursorToEnd, 10))
      }
    }

    this.setState({ placeholder: '' })

    if (onFocus) {
      onFocus(e, this.getCountryData())
    }

    setTimeout(this.cursorToEnd, 10)
  }

  handleInputBlur = (e) => {
    const { placeholder, onBlur } = this.props

    if (!e.target.value) {
      this.setState({ placeholder })
    }

    if (onBlur) {
      onBlur(e, this.getCountryData())
    }
  }

  getHighlightCountryIndex = (direction) => {
    const { highlightCountryIndex: oldHighlightCountryIndex, onlyCountries, preferredCountries } = this.state

    // had to write own function because underscore does not have findIndex. lodash has it
    const highlightCountryIndex = oldHighlightCountryIndex + direction

    if (highlightCountryIndex < 0 || highlightCountryIndex >= (onlyCountries.length + preferredCountries.length)) {
      return highlightCountryIndex - direction
    }

    return highlightCountryIndex
  }

  searchCountry = () => {
    const { queryString, onlyCountries, preferredCountries } = this.state

    const probableCandidate = this.getProbableCandidate(queryString) || onlyCountries[0]
    const probableCandidateIndex = onlyCountries.findIndex((c) => c.iso2 === probableCandidate.iso2) + preferredCountries.length

    this.scrollTo(this.getElement(probableCandidateIndex), true)

    this.setState({ queryString: '', highlightCountryIndex: probableCandidateIndex })
  }

  handleKeydown = (e) => {
    const {
      anchorEl, highlightCountryIndex, preferredCountries, onlyCountries,
      queryString, debouncedQueryStringSearcher,
    } = this.state
    const { keys, disabled } = this.props

    if (!anchorEl || disabled) return true

    // ie hack
    if (e.preventDefault) {
      e.preventDefault()
    } else {
      e.returnValue = false
    }

    const moveHighlight = (direction) => {
      this.setState({
        highlightCountryIndex: this.getHighlightCountryIndex(direction),
      }, () => {
        this.scrollTo(this.getElement(
          highlightCountryIndex + preferredCountries.length,
        ), true)
      })
    }

    switch (e.which) {
      case keys.DOWN:
        moveHighlight(1)
        break
      case keys.UP:
        moveHighlight(-1)
        break
      case keys.ENTER:
        this.handleFlagItemClick(onlyCountries[highlightCountryIndex], e)
        break
      case keys.ESC:
        this.setState({
          anchorEl: null,
        }, this.cursorToEnd)
        break
      default:
        if ((e.which >= keys.A && e.which <= keys.Z) || e.which === keys.SPACE) {
          this.setState({
            queryString: queryString + String.fromCharCode(e.which),
          }, debouncedQueryStringSearcher)
        }
    }
  }

  handleInputKeyDown = (e) => {
    const { keys, onEnterKeyPress, onKeyDown } = this.props
    if (e.which === keys.ENTER && onEnterKeyPress) {
      onEnterKeyPress(e)
    }

    if (onKeyDown) {
      onKeyDown(e)
    }
  }

  checkIfValid = () => {
    const { formattedNumber } = this.state
    const { isValid } = this.props

    return isValid(formattedNumber.replace(/\D/g, ''))
  }

  updateFormattedNumber = (number) => {
    const { onlyCountries, defaultCountry } = this.state
    const { disableCountryCode } = this.props

    let countryGuess
    let inputNumber = number
    let formattedNumber = number

    // if inputNumber does not start with '+', then use default country's dialing prefix,
    // otherwise use logic for finding country based on country prefix.
    if (!inputNumber.startsWith('+')) {
      countryGuess = onlyCountries.find((c) => c.iso2 === defaultCountry)
      const dialCode = countryGuess && !inputNumber.replace(/\D/g, '').startsWith(countryGuess.dialCode) ? countryGuess.dialCode : ''
      formattedNumber = this.formatNumber(
        (disableCountryCode ? '' : dialCode) + inputNumber.replace(/\D/g, ''),
        countryGuess ? countryGuess.format : undefined,
      )
    } else {
      inputNumber = inputNumber.replace(/\D/g, '')
      countryGuess = this.guessSelectedCountry(inputNumber.substring(0, 6), onlyCountries, defaultCountry)
      formattedNumber = this.formatNumber(inputNumber, countryGuess.format)
    }

    this.setState({ selectedCountry: countryGuess, formattedNumber })
  }

  getDropdownProps = () => {
    const {
      selectedCountry, anchorEl, preferredCountries, onlyCountries,
    } = this.state

    const {
      classes, dropdownClass, localization, disableDropdown, native,
    } = this.props

    const inputFlagClasses = `flag-icon flag-icon-${selectedCountry.iso2}`

    const dropdownProps = disableDropdown ? {} : {
      startAdornment: (
        <InputAdornment
          className={classes.positionStart}
          position="start"
        >
          {native ? (
            <>
              <NativeSelect
                id="country-menu"
                open={Boolean(anchorEl)}
                onClose={() => this.setState({ anchorEl: null })}
                className={classes.native}
                classes={{
                  root: classNames(classes.nativeRoot, 'native', inputFlagClasses),
                  select: classes.nativeSelect,
                }}
                onChange={(e) => this.handleFlagItemClick(e.target.value)}
                disableUnderline
              >
                {!!preferredCountries.length && preferredCountries.map((country, index) => (
                  <Item
                    key={`preferred_${country.iso2}_${index}`}
                    itemRef={(node) => {
                      this.flags[`flag_no_${index}`] = node
                    }}
                    name={country.name}
                    iso2={country.iso2}
                    dialCode={country.dialCode}
                    localization={localization && localization[country.name]}
                    native
                  />
                ))}

                { onlyCountries.map((country, index) => (
                  <Item
                    key={`preferred_${country.iso2}_${index}`}
                    itemRef={(node) => {
                      this.flags[`flag_no_${index}`] = node
                    }}
                    name={country.name}
                    iso2={country.iso2}
                    dialCode={country.dialCode}
                    localization={localization && localization[country.name]}
                    native
                  />
                ))}
              </NativeSelect>
            </>
          ) : (
            <>
              <Button
                className={classes.flagButton}
                aria-owns={anchorEl ? 'country-menu' : null}
                aria-label="Select country"
                onClick={(e) => this.setState({ anchorEl: e.currentTarget })}
                aria-haspopup
              >
                <div className={inputFlagClasses} />
              </Button>

              <Menu
                className={dropdownClass}
                id="country-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => this.setState({ anchorEl: null })}
                onEnter={this.handleFlagDropdownClick}
                PaperProps={{
                  ref: (node) => {
                    this.dropdownContainerRef = node
                  },
                }}
              >
                {!!preferredCountries.length && preferredCountries.map((country, index) => (
                  <Item
                    key={`preferred_${country.iso2}_${index}`}
                    itemRef={(node) => {
                      this.flags[`flag_no_${index}`] = node
                    }}
                    onClick={() => this.handleFlagItemClick(country)}
                    name={country.name}
                    iso2={country.iso2}
                    dialCode={country.dialCode}
                    localization={localization && localization[country.name]}
                  />
                ))}

                {!!preferredCountries.length && <Divider />}

                { onlyCountries.map((country, index) => (
                  <Item
                    key={`preferred_${country.iso2}_${index}`}
                    itemRef={(node) => {
                      this.flags[`flag_no_${index}`] = node
                    }}
                    onClick={() => this.handleFlagItemClick(country)}
                    name={country.name}
                    iso2={country.iso2}
                    dialCode={country.dialCode}
                    localization={localization && localization[country.name]}
                  />
                ))}
              </Menu>
            </>
          )}
        </InputAdornment>
      ),
    }

    return dropdownProps
  }

  render() {
    const {
      formattedNumber, placeholder: statePlaceholder,
    } = this.state

    const {
      // start placeholder props
      native, defaultCountry, excludeCountries, onlyCountries, preferredCountries,
      dropdownClass, autoFormat, disableAreaCodes, isValid, disableCountryCode,
      disableDropdown, enableLongNumbers, countryCodeEditable, onEnterKeyPress,
      isModernBrowser, classes, keys, localization, placeholder, regions, onChange,
      value,
      // end placeholder props
      inputClass, error, InputProps,
      ...restProps
    } = this.props

    const dropdownProps = this.getDropdownProps()

    return (
      <TextField
        placeholder={statePlaceholder}
        value={formattedNumber}
        className={inputClass}
        inputRef={this.handleRefInput}
        error={error || !this.checkIfValid()}
        onChange={this.handleInput}
        onClick={this.handleInputClick}
        onFocus={this.handleInputFocus}
        onBlur={this.handleInputBlur}
        onKeyDown={this.handleInputKeyDown}
        type="tel"
        InputProps={{
          ...dropdownProps,
          ...InputProps,
        }}
        {...restProps}
      />
    )
  }
}

MaterialUiPhoneNumber.propTypes = {
  classes: PropTypes.object,

  excludeCountries: PropTypes.arrayOf(PropTypes.string),
  onlyCountries: PropTypes.arrayOf(PropTypes.string),
  preferredCountries: PropTypes.arrayOf(PropTypes.string),
  defaultCountry: PropTypes.string,

  value: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  variant: PropTypes.string,
  native: PropTypes.bool,

  inputClass: PropTypes.string,
  dropdownClass: PropTypes.string,
  InputProps: PropTypes.object,
  inputProps: PropTypes.object,
  inputRef: PropTypes.func,

  autoFormat: PropTypes.bool,
  disableAreaCodes: PropTypes.bool,
  disableCountryCode: PropTypes.bool,
  disableDropdown: PropTypes.bool,
  enableLongNumbers: PropTypes.bool,
  countryCodeEditable: PropTypes.bool,

  regions: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),

  localization: PropTypes.object,

  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onClick: PropTypes.func,
  onKeyDown: PropTypes.func,

  isValid: PropTypes.func,
  isModernBrowser: PropTypes.func,
  onEnterKeyPress: PropTypes.func,
  keys: PropTypes.object,
}

MaterialUiPhoneNumber.defaultProps = {
  excludeCountries: [],
  onlyCountries: [],
  preferredCountries: [],
  defaultCountry: '',

  placeholder: '+1 (702) 123-4567',
  disabled: false,
  error: false,
  variant: 'standard',
  native: false,

  inputClass: '',
  dropdownClass: '',

  autoFormat: true,
  disableAreaCodes: false,
  isValid: (inputNumber) => countryData.allCountries.some((country) => inputNumber.startsWith(country.dialCode) || country.dialCode.startsWith(inputNumber)),
  disableCountryCode: false,
  disableDropdown: false,
  enableLongNumbers: false,
  countryCodeEditable: true,

  regions: '',

  localization: {},

  onEnterKeyPress: () => { },
  onChange: () => {},

  isModernBrowser: () => (document.createElement ? Boolean(document.createElement('input').setSelectionRange) : false),

  keys: {
    UP: 38,
    DOWN: 40,
    RIGHT: 39,
    LEFT: 37,
    ENTER: 13,
    ESC: 27,
    PLUS: 43,
    A: 65,
    Z: 90,
    SPACE: 32,
  },
}

MaterialUiPhoneNumber.displayName = 'MuiPhoneNumber'

export default withStyles(styles)(MaterialUiPhoneNumber)
