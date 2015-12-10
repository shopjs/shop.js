module.exports =
  Checkout: require './checkout'
  Cart:     require './cart'
  LineItem: require './lineitem'

  register: ()->
    @Checkout.register()
    @Cart.register()
    @LineItem.register()
