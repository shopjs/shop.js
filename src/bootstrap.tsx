import React from 'react'
import ReactDOM from 'react-dom'
import { AutoSizer } from 'react-virtualized'
import './poly'

import { useLocalStore, useObserver } from 'mobx-react'

import { Checkout, Cart, CartCount, PaymentForm, ShippingForm } from './components'
import getStore, { ShopStore, ILibraryClient } from './stores'

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
    const shopStore = useLocalStore(() => (getStore(client, { track: (event, opts) => console.log(event, opts) })) as ShopStore)

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
    const shopStore = useLocalStore(() => (getStore(client, { track: (event, opts) => console.log(event, opts) })) as ShopStore)

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
    const shopStore = useLocalStore(() => (getStore(client, { track: (event, opts) => console.log(event, opts) })) as ShopStore)

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
  form.cart {
    display: none;
  }
  .shopify-payment-button {
    display: none;
  }
  `
  css.appendChild(document.createTextNode(styles))

  document.getElementsByTagName('head')[0].appendChild(css)

  // replace side cart element
  const cartEl1 = document.getElementById('CartContainer') as HTMLElement
  if (cartEl1) {
    cartEl1.removeAttribute('id')
    const cartEl2 = cartEl1.cloneNode(true) as HTMLElement

    (cartEl1.parentNode as any).replaceChild(cartEl2 as HTMLElement, cartEl1)

    // init side cart
    cart(client, {
      ...opts,
      el: cartEl2,
      showDescription: false,
      showTotals: false,
      nativeSelects: true,
    })
  }

  // replace count element
  const countEl1 = document.getElementById('CartCount') as HTMLElement
  if (countEl1) {
    countEl1.removeAttribute('id')
    const countEl2 = countEl1.cloneNode(true) as HTMLElement

    (countEl1.parentNode as any).replaceChild(countEl2 as HTMLElement, countEl1)

    // init count
    count(client, {
      ...opts,
      el: countEl2,
      showDescription: false,
      nativeSelects: true,
    })
  }

  // replace cart with checkout
  const checkoutEl1 = (document.querySelector('form.cart') as HTMLElement)
  if (checkoutEl1) {
    checkoutEl1.removeAttribute('id')
    const checkoutEl2 = (document.createElement('div') as HTMLElement)
    checkoutEl2.classList.add('cart');

    (checkoutEl1.parentNode as any).replaceChild(checkoutEl2 as HTMLElement, checkoutEl1)

    // init checkout
    checkout(client, {
      ...opts,
      el: checkoutEl2,
      showDescription: false,
      nativeSelects: true,
    })
  }

  // add events to cart button
  const buttonEl = (document.querySelector('button.addToCart') as HTMLElement)
  if (buttonEl) {
    buttonEl.addEventListener('click', (event) => {
      const formEl = (buttonEl.closest('form') as HTMLElement)
      let options = ([].slice.call(formEl.querySelectorAll('select.single-option-selector'))) as HTMLSelectElement[]
      let slug = ''

      let slugOpts = options.map((d, i) => {
        console.log(`option${i}`, d.classList)
        const classes = [].slice.call(d.classList)
        classes.map((x) => {
          let res = (/single-option-selector-section-(.*)/g).exec(x)
          if (res && res[1]) {
            slug = res[1]
          }
        })

        return d.value
      })

      slug = `${slug}-${slugOpts.join('-')}`
      const quantity = parseInt((document.getElementById('Quantity') as HTMLInputElement).value, 10)

      console.log('slug', slug, quantity)

      const s = getStore()
      s.addItem(slug, quantity)

      event.preventDefault()
      event.stopPropagation()
      return false
    })
  }
}
