import CardCVC      from './card/card-cvc'
import CardExpiry   from './card/card-expiry'
import CardName     from './card/card-name'
import CardNumber   from './card/card-number'

import PromoCode                    from './checkout/promocode'
import QuantitySelect               from './checkout/quantity-select'
import ShippingAddressCity          from './checkout/shippingaddress-city'
import ShippingAddressCountry       from './checkout/shippingaddress-country'
import ShippingAddressLine1         from './checkout/shippingaddress-line1'
import ShippingAddressLine2         from './checkout/shippingaddress-line2'
import ShippingAddressName          from './checkout/shippingaddress-name'
import ShippingAddressPostalCode    from './checkout/shippingaddress-postalcode'
import ShippingAddressState         from './checkout/shippingaddress-state'
import Terms                        from './checkout/terms'

import UserCurrentPassword  from './user/user-current-password'
import UserEmail            from './user/user-email'
import UserName             from './user/user-name'
import UserPasswordConfirm  from './user/user-password-confirm'
import UserPassword         from './user/user-password'
import UserUsername         from './user/user-username'

import GiftEmail    from './gift/gift-email'
import GiftMessage  from './gift/gift-message'
import GiftToggle   from './gift/gift-toggle'
import GiftType     from './gift/gift-type'

import CheckBox         from 'el-controls/src/controls/checkbox'
import Control          from 'el-controls/src/controls/control'
import CountrySelect    from 'el-controls/src/controls/country-select'
import Copy             from 'el-controls/src/controls/copy'
import Currency         from 'el-controls/src/controls/currency'
# import Dropdown         from 'el-controls/src/controls/dropdown'
import QRCode           from 'el-controls/src/controls/qrcode'
import Select           from 'el-controls/src/controls/selection'
import StateSelect      from 'el-controls/src/controls/state-select'
import Text             from 'el-controls/src/controls/text'
import TextBox          from 'el-controls/src/controls/textbox'

export {
  CardCVC
  CardName
  CardNumber
  CardExpiry

  CheckBox
  Control
  Copy
  CountrySelect
  Currency
  # Dropdown
  QRCode
  Select
  StateSelect
  Text
  TextBox

  PromoCode
  QuantitySelect
  ShippingAddressCity
  ShippingAddressCountry
  ShippingAddressLine1
  ShippingAddressLine2
  ShippingAddressPostalCode
  ShippingAddressName
  ShippingAddressState
  Terms

  GiftToggle
  GiftType
  GiftEmail
  GiftMessage

  UserCurrentPassword
  UserEmail
  UserName
  UserPasswordConfirm
  UserPassword
  UserUsername
}


