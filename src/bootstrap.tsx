import React from 'react'
import ReactDOM from 'react-dom'
import { AutoSizer } from 'react-virtualized'

import { useLocalStore, useObserver } from 'mobx-react'

import { Checkout, Cart, CartCount, PaymentForm, ShippingForm } from './components'
import initStore, { ShopStore, ILibraryClient } from './stores'

export interface Options {
  el?: Element
  termsUrl?: string
  completionUrl?: string
  width?: number
  height?: number
  locked?: boolean
  contactIcon?: any
  contactTitle?: string
  shippingIcon?: any
  shippingTitle?: string
  paymentIcon?: any
  paymentTitle?: string
  cartIcon?: any
  cartTitle?: string
  showDescription?: boolean
  showTotals?: boolean
  cartCheckoutUrl?: string
  nativeSelects?: boolean
}

const checkout = (client: ILibraryClient, opts: Options = {}) => {
  let el = opts.el

  const ShopJS = (): JSX.Element => {
    const shopStore = useLocalStore(() => (initStore(client, { track: (event, opts) => console.log(event, opts) })) as ShopStore)

    return useObserver(() => (
      <Checkout
        forms={[PaymentForm, ShippingForm]}
        stepLabels={['Payment Info', 'Shipping Info', 'Confirm Order']}
        contactIcon={opts.contactIcon}
        contactTitle={opts.contactTitle}
        shippingIcon={opts.shippingIcon}
        shippingTitle={opts.shippingTitle}
        paymentIcon={opts.paymentIcon}
        paymentTitle={opts.paymentTitle}
        cartIcon={opts.cartIcon}
        cartTitle={opts.cartTitle}
        address={shopStore.address}
        setAddress={(k: string, v: any) => shopStore.setAddress(k, v)}
        order={shopStore.order}
        setOrder={(k: string, v: any) => shopStore.setOrder(k, v)}
        payment={shopStore.payment}
        setPayment={(k: string, v: any) => shopStore.setPayment(k, v)}
        user={shopStore.user}
        setUser={(k: string, v: any) => shopStore.setUser(k, v)}
        setCoupon={(c: string) => shopStore.setCoupon(c)}
        checkout={() => shopStore.checkout() }
        setItem={(id: string, quantity: number) => shopStore.setItem(id, quantity)}
        countryOptions={ shopStore.countryOptions }
        stateOptions={ shopStore.stateOptions }
        isLoading={ shopStore.isLoading }
        track={(event, opts) => shopStore.track(event, opts)}
        termsUrl={opts.termsUrl || '/terms'}
        showDescription={opts.showDescription}
        showTotals={opts.showTotals}
        cartCheckoutUrl={opts.cartCheckoutUrl}
        nativeSelects={opts.nativeSelects}
      />
    ))
  }

  ReactDOM.render(
    <ShopJS/>,
    el,
  )
}

export default checkout

export const cart = (client: ILibraryClient, opts: Options = {}) => {
  let el = opts.el

  const ShopJSCart = (): JSX.Element => {
    const shopStore = useLocalStore(() => (initStore(client, { track: (event, opts) => console.log(event, opts) })) as ShopStore)

    return useObserver(() => (
      <Cart
        cartIcon={opts.cartIcon}
        cartTitle={opts.cartTitle}
        order={shopStore.order}
        setCoupon={(c: string) => shopStore.setCoupon(c)}
        setItem={(id: string, quantity: number) => shopStore.setItem(id, quantity)}
        locked={opts.locked}
        showDescription={opts.showDescription}
        showTotals={opts.showTotals}
        cartCheckoutUrl={opts.cartCheckoutUrl}
        nativeSelects={opts.nativeSelects}
      />
    ))
  }

  ReactDOM.render(
    <ShopJSCart/>,
    el,
  )
}

export const count = (client: ILibraryClient, opts: Options = {}) => {
  let el = opts.el

  const ShopJSCartCount = (): JSX.Element => {
    const shopStore = useLocalStore(() => (initStore(client, { track: (event, opts) => console.log(event, opts) })) as ShopStore)

    return useObserver(() => (
      <CartCount
        count={shopStore.count}
      />
    ))
  }

  ReactDOM.render(
    <ShopJSCartCount/>,
    el,
  )
}

export const shopify = function(client: ILibraryClient, opts: Options = {}) {
  const cartEl1 = document.getElementById('CartContainer') as HTMLElement
  cartEl1.removeAttribute('id')
  const cartEl2 = cartEl1.cloneNode(true) as HTMLElement

  (cartEl1.parentNode as any).replaceChild(cartEl2 as HTMLElement, cartEl1)

  const countEl1 = document.getElementById('CartCount') as HTMLElement
  countEl1.removeAttribute('id')
  const countEl2 = countEl1.cloneNode(true) as HTMLElement

  (countEl1.parentNode as any).replaceChild(countEl2 as HTMLElement, countEl1)

  cart(client, {
    ...opts,
    el: cartEl2,
    showDescription: false,
    showTotals: false,
    nativeSelects: true,
  })

  count(client, {
    ...opts,
    el: countEl2,
    showDescription: false,
    nativeSelects: true,
  })

  const css = document.createElement('style')
  css.type = 'text/css'

  const styles = `
  .cart-drawer.drawer .cart-items {
    padding: 0 !important;
  }
  .cart-drawer.drawer .cart {
    padding: 0 !important;
  }
  .cart-drawer.drawer .cart-icon {
    display: none;
  }
  .cart-drawer.drawer .cart-your-items-title {
    display: none;
  }
  `
  css.appendChild(document.createTextNode(styles))

  document.getElementsByTagName('head')[0].appendChild(css)
}
