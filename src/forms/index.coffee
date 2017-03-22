import Checkout                from './checkout'
import CheckoutShippingAddress from './checkout-shippingaddress'

import Cart                    from './cart'
import LineItem                from './lineitem'
import LineItems               from './lineitems'
import Login                   from './login'
import Order                   from './order'
import Orders                  from './orders'
import Profile                 from './profile'
import Register                from './register'
import RegisterComplete        from './register-complete'
import ResetPassword           from './reset-password'
import ResetPasswordComplete   from './reset-password-complete'
import ShippingAddress         from './shippingaddress'

export default Forms =
  Checkout:                 Checkout
  CheckoutShippingAddress:  CheckoutShippingAddress

  Cart:                     Cart
  LineItem:                 LineItem
  LineItems:                LineItems
  Login:                    Login
  Order:                    Order
  Orders:                   Orders
  Profile:                  Profile
  Register:                 Register
  RegisterComplete:         RegisterComplete
  ResetPassword:            ResetPassword
  ResetPasswordComplete:    ResetPasswordComplete
  ShippingAddress:          ShippingAddress

  register: ->
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
