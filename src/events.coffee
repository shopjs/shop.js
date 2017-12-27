import ControlEvents from 'el-controls/src/events'

export default Events =
  # Shop.js is Started
  Started:
    'started'
  # Shop.js is ready to take commands
  Ready:
    'ready'
  # Shop.js has completed asynchronous tasks
  AsyncReady:
    'async-ready'
  # Geolocation has completed
  GeoReady:
    'geo-ready'

  TryUpdateItem:
    'try-update-item'
  UpdateItem:
    'update-item'
  UpdateItems:
    'update-items'

  Change:        ControlEvents.Change
  ChangeSuccess: ControlEvents.ChangeSuccess
  ChangeFailed:  ControlEvents.ChangeFailed

  Checkout:
    'checkout'
  ContinueShopping:
    'continue-shopping'

  Submit:
    'submit'
  SubmitCard:
    'submit-card'
  SubmitShippingAddress:
    'submit-shipping-address'

  SubmitSuccess:
    'submit-success'
  SubmitFailed:
    'submit-failed'

  ForceApplyPromoCode:
    'force-apply-promocode'
  ApplyPromoCode:
    'apply-promocode'
  ApplyPromoCodeSuccess:
    'apply-promocode-success'
  ApplyPromoCodeFailed:
    'apply-promocode-failed'

  Login:
    'login'
  LoginSuccess:
    'login-success'
  LoginFailed:
    'login-failed'

  Register:
    'register'
  RegisterSuccess:
    'register-success'
  RegisterFailed:
    'register-failed'

  RegisterComplete:
    'register-complete'
  RegisterCompleteSuccess:
    'register-complete-success'
  RegisterCompleteFailed:
    'register-complete-failed'

  ResetPassword:
    'reset-password'
  ResetPasswordSuccess:
    'reset-password-success'
  ResetPasswordFailed:
    'reset-password-failed'

  ResetPasswordComplete:
    'reset-password-complete'
  ResetPasswordCompleteSuccess:
    'reset-password-complete-success'
  ResetPasswordCompleteFailed:
    'reset-password-complete-failed'

  ProfileLoad:
    'profile-load'
  ProfileLoadSuccess:
    'profile-load-success'
  ProfileLoadFailed:
    'profile-load-failed'

  ProfileUpdate:
    'profile-update'
  ProfileUpdateSuccess:
    'profile-update-success'
  ProfileUpdateFailed:
    'profile-update-failed'

  ShippingAddressUpdate:
    'shipping-address-update'
  ShippingAddressUpdateSuccess:
    'shipping-address-update-success'
  ShippingAddressUpdateFailed:
    'shipping-address-update-failed'

  SidePaneOpen:
    'side-pane-open'
  SidePaneOpened:
    'side-pane-opened'
  SidePaneClose:
    'side-pane-close'
  SidePaneClosed:
    'side-pane-closed'

  CheckoutOpen:
    'checkout-open'
  CheckoutOpened:
    'checkout-opened'
  CheckoutClose:
    'checkout-close'
  CheckoutClosed:
    'checkout-closed'

  # Internal
  DeleteLineItem:
    'delete-line-item'
  CreateReferralProgram:
    'create-referral-program'
  CreateReferralProgramSuccess:
    'create-referral-program-success'
  CreateReferralProgramFailed:
    'create-referral-program-failed'

  # Metamask
  PayWithMetamask:
    'pay-with-metamask'
  PayWithMetamaskSuccess:
    'pay-with-metamask-success'
  PayWithMetamaskFailed:
    'pay-with-metamask-failed'

