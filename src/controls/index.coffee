import Control from './control'
import Text from './text'
import TextArea from './textarea'
import Checkbox from './checkbox'
import Select from './select'
import QuantitySelect from './quantity-select'
import CountrySelect from './country-select'
import StateSelect from './state-select'
import UserEmail from './user-email'
import UserName from './user-name'
import UserCurrentPassword from './user-current-password'
import UserPassword from './user-password'
import UserPasswordConfirm from './user-password-confirm'
import ShippingAddressName from './shippingaddress-name.coffee'
import ShippingAddressLine1 from './shippingaddress-line1.coffee'
import ShippingAddressLine2 from './shippingaddress-line2.coffee'
import ShippingAddressCity from './shippingaddress-city'
import ShippingAddressPostalCode from './shippingaddress-postalcode.coffee'
import ShippingAddressState from './shippingaddress-state'
import ShippingAddressCountry from './shippingaddress-country'
import CardName from './card-name'
import CardNumber from './card-number'
import CardExpiry from './card-expiry'
import CardCVC from './card-cvc'
import Terms from './terms'
import GiftToggle from './gift-toggle'
import GiftType from './gift-type'
import GiftEmail from './gift-email'
import GiftMessage from './gift-message'
import PromoCode from './promocode'

export default {
  #Generic Control
  Control:          Control
  Text:             Text
  TextArea:         TextArea
  Checkbox:         Checkbox
  Select:           Select
  QuantitySelect:   QuantitySelect
  CountrySelect:    CountrySelect
  StateSelect:      StateSelect

  #Specific Controls
  UserEmail:                    UserEmail
  UserName:                     UserName
  UserCurrentPassword:          UserCurrentPassword
  UserPassword:                 UserPassword
  UserPasswordConfirm:          UserPasswordConfirm
  ShippingAddressName:          ShippingAddressName
  ShippingAddressLine1:         ShippingAddressLine1
  ShippingAddressLine2:         ShippingAddressLine2
  ShippingAddressCity:          ShippingAddressCity
  ShippingAddressPostalCode:    ShippingAddressPostalCode
  ShippingAddressState:         ShippingAddressState
  ShippingAddressCountry:       ShippingAddressCountry
  CardName:                     CardName
  CardNumber:                   CardNumber
  CardExpiry:                   CardExpiry
  CardCVC:                      CardCVC
  Terms:                        Terms
  GiftToggle:                   GiftToggle
  GiftType:                     GiftType
  GiftEmail:                    GiftEmail
  GiftMessage:                  GiftMessage
  PromoCode:                    PromoCode

  register: ()->
    Text.register()
    TextArea.register()
    Checkbox.register()
    Select.register()
    QuantitySelect.register()
    CountrySelect.register()
    StateSelect.register()

    UserEmail.register()
    UserName.register()
    UserCurrentPassword.register()
    UserPassword.register()
    UserPasswordConfirm.register()
    ShippingAddressName.register()
    ShippingAddressLine1.register()
    ShippingAddressLine2.register()
    ShippingAddressCity.register()
    ShippingAddressPostalCode.register()
    ShippingAddressState.register()
    ShippingAddressCountry.register()
    CardName.register()
    CardNumber.register()
    CardExpiry.register()
    CardCVC.register()
    Terms.register()
    GiftToggle.register()
    GiftType.register()
    GiftEmail.register()
    GiftMessage.register()
    PromoCode.register()
}
