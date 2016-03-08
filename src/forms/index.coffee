module.exports =
  Checkout: require './checkout'
  Cart:     require './cart'
  LineItem: require './lineitem'
  Login:    require './login'
  Register: require './register'

  register: ()->
    @Checkout.register()
    @Cart.register()
    @LineItem.register()
    @Login.register()
    @Register.register()
