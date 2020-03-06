import { useLocalStore, useStaticRendering } from 'mobx-react'
import React from 'react'

import {
  IClient,
} from 'commerce.js'

import ShopStore from './ShopStore'

const isServer = typeof window === 'undefined'
useStaticRendering(isServer)

let client: IClient =

type Store = {
  shopStore: any
}

let store: Store = {
  shopStore: {},
}

type Data = {
  shopData: any
}

const defaultData: Data = {
  shopData: {},
}

export const initStore = (): Store => {
  const data = defaultData

  if (isServer) {
    // Server stuff
    store = {
      shopStore: new ShopStore(data.shopData, client),
    }
  } else if (!store) {
    // Client stuff
    store = {
      shopStore: new ShopStore(data.shopData, client),
    }
  }

  // Otherwise we don't need to re-initialize the store
  return store
}

const storeContext = React.createContext({})

export const StoreProvider = ({ children }) => {
  const s = useLocalStore(initStore)
  return <storeContext.Provider value={s}>{children}</storeContext.Provider>
}

export const useStore = () => {
  const s = React.useContext(storeContext)
  if (!s) {
    // this is especially useful in TypeScript so you don't need to
    // be checking for null all the time
    throw new Error('useStore must be used within a StoreProvider.')
  }
  return store
}
