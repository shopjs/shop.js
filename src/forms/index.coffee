module.exports =
  Checkout:         require './checkout'
  Cart:             require './cart'
  LineItem:         require './lineitem'
  LineItems:        require './lineitems'
  Login:            require './login'
  Order:            require './order'
  Orders:           require './orders'
  Profile:          require './profile'
  Register:         require './register'
  ShippingAddress:  require './shippingaddress'

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
    @ShippingAddress.register()
