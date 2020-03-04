import {
  ShippingForm,
  PaymentForm,
  Checkout,
} from './components/index'
import start from './bootstrap'
import Client from 'hanzo.js'

export * from './components/index'
export { default as start } from './bootstrap'
export { default as Client } from 'hanzo.js'

if (typeof window !== 'undefined') {
  window['ShopJS'] = {
    Client,
    ShippingForm,
    PaymentForm,
    Checkout,
    start,
  }
}
