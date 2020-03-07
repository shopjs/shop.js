import React from 'react'
import ReactDOM from 'react-dom'
import { useLocalStore, useObserver } from 'mobx-react'

import { Checkout } from './components'
import { ShopStore, ILibraryClient } from './stores'

export default function(client: ILibraryClient, el: Element) {
  const ShopJS = (): JSX.Element => {
    const shopStore = useLocalStore(() => new ShopStore(client, {}))

    shopStore.commerce.set('sad-keanu-shirt', 1)

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
