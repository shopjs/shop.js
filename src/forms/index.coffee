module.exports =
  Checkout:     require './checkout'
  Cart:         require './cart'
  LineItem:     require './lineitem'
  LineItems:    require './lineitems'

  register: ()->
    @Checkout.register()
    @Cart.register()
    @LineItem.register()
    @LineItems.register()
