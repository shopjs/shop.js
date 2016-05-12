module.exports =
  CartCounter:  require './cart-counter'
  NestedForm:  require './nested-form'

  register: ()->
    @CartCounter.register()
    @NestedForm.register()
