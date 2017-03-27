import CartCounter   from './cart-counter'
import Modal         from './modal'
import NestedForm    from './nested-form'
import SidePane      from './side-pane'

export default Widgets =
  CartCounter:   CartCounter
  Modal:         Modal
  NestedForm:    NestedForm
  SidePane:      SidePane

  register: ->
    CartCounter.register()
    Modal.register()
    NestedForm.register()
    SidePane.register()
