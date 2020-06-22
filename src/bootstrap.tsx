import React from 'react'
import ReactDOM from 'react-dom'
import { AutoSizer } from 'react-virtualized'

import { useLocalStore, useObserver } from 'mobx-react'

import { Checkout, Cart, PaymentForm, ShippingForm } from './components'
import initStore, { ShopStore, ILibraryClient } from './stores'

export interface Options {
  el: Element
  termsUrl?: string
  completionUrl?: string
  width?: number,
  height?: number,
  locked?: boolean,
  contactIcon?: any,
  contactTitle?: string,
  shippingIcon?: any,
  shippingTitle?: string,
  paymentIcon?: any,
  paymentTitle?: string,
  cartIcon?: any,
  cartTitle?: string,
}

export default function(client: ILibraryClient, opts: Options) {
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
      />
    ))
  }

  ReactDOM.render(
    <ShopJS/>,
    el,
  )
}

export const cart = function(client: ILibraryClient, opts: Options) {
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
      />
    ))
  }

  ReactDOM.render(
    <ShopJSCart/>,
    el,
  )
}
