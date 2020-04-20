import React from 'react'
import ReactDOM from 'react-dom'
import { useLocalStore, useObserver } from 'mobx-react'

import { Checkout, PaymentForm, ShippingForm } from './components'
import initStore, { ShopStore, ILibraryClient } from './stores'

export interface Options {
  el: Element
  termsUrl?: string
  completionUrl?: string
}

export default function(client: ILibraryClient, opts: Options) {
  let el = opts.el

  const ShopJS = (): JSX.Element => {
    const shopStore = useLocalStore(() => (initStore(client, { track: (event, opts) => console.log(event, opts) })) as ShopStore)

    return useObserver(() => (
      <Checkout
        forms={[PaymentForm, ShippingForm]}
        stepLabels={['Payment Info', 'Shipping Info', 'Confirm Order']}
        contactIcon={null}
        contactTitle={null}
        shippingIcon={null}
        shippingTitle={null}
        paymentIcon={null}
        paymentTitle={null}
        cartIcon={null}
        cartTitle={null}
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
