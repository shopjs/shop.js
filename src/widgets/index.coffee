import CartCounter from './cart-counter'
import NestedForm  from './nested-form'

export default Widgets =
  CartCounter: CartCounter
  NestedForm:  NestedForm

  register: ->
    @CartCounter.register()
    @NestedForm.register()
