import ShopStore, { ILibraryClient } from './ShopStore'

export { default as ShopStore } from './ShopStore'
export * from './ShopStore'

let store: ShopStore | undefined

const getStore = (client?: ILibraryClient, opts = {}): ShopStore | undefined => {
  if (!client) {
    return
  }

  if (!store) {
    store = new ShopStore(client, opts)
  }

  return store
}

export default getStore
