module.exports =
  CartCounter:      require './cart-counter'
  CheckoutModal:    require './checkout-modal'
  CheckoutPage:     require './checkout-page'
  Modal:            require './modal'
  NestedForm:       require './nested-form'
  SideCart:         require './side-cart'

  register: ()->
    @CartCounter.register()
    @NestedForm.register()
