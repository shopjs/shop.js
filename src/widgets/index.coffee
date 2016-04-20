module.exports =
  CartCounter:  require './cart-counter'

  register: ()->
    @CartCounter.register()
