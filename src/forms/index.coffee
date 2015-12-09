module.exports =
  Checkout: require './checkout'
  Controls : require './controls'
  register: ()->
    @Checkout.register()

    @Controls.register()


