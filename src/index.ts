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

import getStore from './stores'

if (typeof window !== 'undefined') {
  window['ShopJS'] = {
    Client,
    ShippingForm,
    PaymentForm,
    Checkout,
    start,
    set: (...args) => {
      const s = getStore()
      if (!s) {
        throw new Error('Use ShopJS.start before setting any items')
      }
      s.commerce.set.apply(window, (args as any))
    },
  }
}
