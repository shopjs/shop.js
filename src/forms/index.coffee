module.exports =
  Checkout: require './checkout'
  Cart:     require './cart'
  LineItem: require './lineitem'
  LineItems:    require './lineitems'
  Login:    require './login'
  Register: require './register'

  register: ()->
    @Checkout.register()
    @Cart.register()
    @LineItem.register()
    @LineItems.register()
    @Login.register()
    @Register.register()
