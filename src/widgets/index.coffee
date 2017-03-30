import CartCounter   from './cart-counter'
import CheckoutModal from './checkout-modal'
import NestedForm    from './nested-form'
import SidePane      from './side-pane'

export default Widgets =
  CartCounter:   CartCounter
  CheckoutModal: CheckoutModal
  NestedForm:    NestedForm
  SidePane:      SidePane

  register: ->
    CartCounter.register()
    CheckoutModal.register()
    NestedForm.register()
    SidePane.register()
