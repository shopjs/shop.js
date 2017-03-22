import CartCounter   from './cart-counter'
import CheckoutModal from './checkout-modal'
import CheckoutPage  from './checkout-page'
import Modal         from './modal'
import NestedForm    from './nested-form'
import SideCart      from './side-cart'

export default Widgets =
  CartCounter:   CartCounter
  CheckoutModal: CheckoutModal
  CheckoutPage:  CheckoutPage
  Modal:         Modal
  NestedForm:    NestedForm
  SideCart:      SideCart

  register: ->
    CartCounter.register()
    CheckoutModal.register()
    CheckoutPage.register()
    Modal.register()
    NestedForm.register()
    SideCart.register()
