import Checkout                from './checkout'
import CheckoutCard            from './checkout-card'
import CheckoutShippingAddress from './checkout-shippingaddress'

import Cart                    from './cart'
import Deposit                 from './deposit'
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
import ThankYou                from './thankyou'

export default Forms =
  Checkout:                 Checkout
  CheckoutCard:             CheckoutCard
  CheckoutShippingAddress:  CheckoutShippingAddress
  Deposit:                  Deposit

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
  ThankYou:                 ThankYou
