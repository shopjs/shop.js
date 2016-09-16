module.exports =
  Checkout:                 require './checkout'
  CheckoutShippingAddress:  require './checkout-shippingaddress'

  Cart:                     require './cart'
  LineItem:                 require './lineitem'
  LineItems:                require './lineitems'
  Login:                    require './login'
  Order:                    require './order'
  Orders:                   require './orders'
  Profile:                  require './profile'
  Register:                 require './register'
  RegisterComplete:         require './register-complete'
  ResetPassword:            require './reset-password'
  ResetPasswordComplete:    require './reset-password-complete'
  ShippingAddress:          require './shippingaddress'

  register: ()->
    @Checkout.register()
    @Cart.register()
    @LineItem.register()
    @LineItems.register()
    @Login.register()
    @Order.register()
    @Orders.register()
    @Profile.register()
    @Register.register()
    @RegisterComplete.register()
    @ResetPassword.register()
    @ResetPasswordComplete.register()
    @ShippingAddress.register()
