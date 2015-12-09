module.exports =
  Checkout : require './checkout'
  register: ()->
    @Checkout.register()



