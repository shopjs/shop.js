export default Controls =
  #Generic Control
  Control:          require './control'
  Text:             require './text'
  TextArea:         require './textarea'
  Checkbox:         require './checkbox'
  Select:           require './select'
  QuantitySelect:   require './quantity-select'
  CountrySelect:    require './country-select'
  StateSelect:      require './state-select'

  #Specific Controls
  UserEmail:                    require './user-email'
  UserName:                     require './user-name'
  UserCurrentPassword:          require './user-current-password'
  UserPassword:                 require './user-password'
  UserPasswordConfirm:          require './user-password-confirm'
  ShippingAddressName:          require './shippingaddress-name'
  ShippingAddressLine1:         require './shippingaddress-line1'
  ShippingAddressLine2:         require './shippingaddress-line2'
  ShippingAddressCity:          require './shippingaddress-city'
  ShippingAddressPostalCode:    require './shippingaddress-postalcode'
  ShippingAddressState:         require './shippingaddress-state'
  ShippingAddressCountry:       require './shippingaddress-country'
  CardName:                     require './card-name'
  CardNumber:                   require './card-number'
  CardExpiry:                   require './card-expiry'
  CardCVC:                      require './card-cvc'
  Terms:                        require './terms'
  GiftToggle:                   require './gift-toggle'
  GiftType:                     require './gift-type'
  GiftEmail:                    require './gift-email'
  GiftMessage:                  require './gift-message'
  PromoCode:                    require './promocode'

  register: ()->
    @Text.register()
    @TextArea.register()
    @Checkbox.register()
    @Select.register()
    @QuantitySelect.register()
    @CountrySelect.register()
    @StateSelect.register()

    @UserEmail.register()
    @UserName.register()
    @UserCurrentPassword.register()
    @UserPassword.register()
    @UserPasswordConfirm.register()
    @ShippingAddressName.register()
    @ShippingAddressLine1.register()
    @ShippingAddressLine2.register()
    @ShippingAddressCity.register()
    @ShippingAddressPostalCode.register()
    @ShippingAddressState.register()
    @ShippingAddressCountry.register()
    @CardName.register()
    @CardNumber.register()
    @CardExpiry.register()
    @CardCVC.register()
    @Terms.register()
    @GiftToggle.register()
    @GiftType.register()
    @GiftEmail.register()
    @GiftMessage.register()
    @PromoCode.register()

