import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import MenuItem from '@material-ui/core/MenuItem'
import RootRef from '@material-ui/core/RootRef'

import 'flag-icon-css/css/flag-icon.css'

class Item extends PureComponent {
  render() {
    const {
      name, iso2, dialCode, localization, itemRef, native, ...restProps
    } = this.props

    if (native) {
      return (
        <option
          className="country"
          data-dial-code="1"
          data-country-code={iso2}
          value={iso2}
          {...restProps}
        >
          {localization || name}
          {' '}
          {`+${dialCode}`}
        </option>
      )
    }

    return (
      <RootRef rootRef={(node) => itemRef(node)}>
        <MenuItem
          className="country"
          data-dial-code="1"
          data-country-code={iso2}
          {...restProps}
        >
          <span className={`flag-icon flag-icon-${iso2}`}
            style={{ width: 16, marginRight: 8 }}
          />
          <span className="country-name">
            {localization || name}
          </span>

          <span className="dial-code">{`+${dialCode}`}</span>
        </MenuItem>
      </RootRef>
    )
  }
}

Item.propTypes = {
  name: PropTypes.string.isRequired,
  iso2: PropTypes.string.isRequired,
  dialCode: PropTypes.string.isRequired,
  itemRef: PropTypes.func.isRequired,
  localization: PropTypes.string,
  native: PropTypes.bool,
}

Item.defaultProps = {
  localization: null,
  native: false,
}

export default Item
