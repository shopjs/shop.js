import React from 'react'
import ReactDOM from 'react-dom'
import { useLocalStore, useObserver } from 'mobx-react'

import { Checkout } from './components'
import initStore, { ShopStore, ILibraryClient } from './stores'

export interface Options {
  el: Element
  termsUrl?: string
  completionUrl?: string
}

export default function(client: ILibraryClient, opts: Options) {
  let el = opts.el

  const ShopJS = (): JSX.Element => {
    const shopStore = useLocalStore(() => (initStore(client, {})) as ShopStore)

    return useObserver(() => (
      <Checkout
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
      />
    ))
  }

  ReactDOM.render(
    <ShopJS/>,
    el,
  )
}
