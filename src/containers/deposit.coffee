import CheckoutForm from './checkout'
import store   from 'akasha'

import Events  from '../events'
import configs from './configs'
import { isRequired } from './middleware'
import html    from '../../templates/containers/deposit'

class DepositForm extends CheckoutForm
  tag:  'deposit'
  html: html

  configs:
    'order.subtotal': [isRequired]

DepositForm.register()

export default DepositForm

