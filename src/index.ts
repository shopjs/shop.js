import {
  ShippingForm,
  PaymentForm,
  Checkout,
  Cart,
  CartCount,
} from './components/index'
import start, { cart, count, shopify } from './bootstrap'
import Client from 'hanzo.js'
import getStore from './stores'

export * from './components/index'
export { default as start, cart, count, shopify } from './bootstrap'
export { default as Client } from 'hanzo.js'
export { default as getStore } from './stores'

if (typeof window !== 'undefined') {
  window['ShopJS'] = {
    Client,
    ShippingForm,
    PaymentForm,
    Checkout,
    start,
    cart,
    count,
    shopify,
    getStore,
    set: (...args) => {
      const s = getStore()
      if (!s) {
        throw new Error('Use ShopJS.start before setting any items')
      }
      s.commerce.set.apply(s.commerce, (args as any))
    },
    clear: () => {
      const s = getStore()
      if (!s) {
        throw new Error('Use ShopJS.start before setting any items')
      }
      s.commerce.clear()
    }
  }
}
