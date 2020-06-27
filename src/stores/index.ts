import ShopStore, { ILibraryClient } from './ShopStore'

export { default as ShopStore } from './ShopStore'
export * from './ShopStore'

let client: ILibraryClient | undefined
let store: ShopStore | undefined

const getStore = (cl?: ILibraryClient, analytics?: any, opts = {}): ShopStore => {
  client = cl ? cl : client

  if (!client) {
    if (store) {
      return store
    }

    throw new Error('store has not been initialized with a client')
  }

  if (!store) {
    store = new ShopStore(client, analytics, opts)
  }

  return store
}

export default getStore
