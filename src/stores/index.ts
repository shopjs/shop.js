import ShopStore, { ILibraryClient } from './ShopStore'

export { default as ShopStore } from './ShopStore'
export * from './ShopStore'

let client: ILibraryClient | undefined
let store: ShopStore | undefined

const getStore = (cl?: ILibraryClient, analytics: any = undefined, opts = {}): ShopStore | undefined => {
  client = cl ? cl : client

  if (!client) {
    return
  }

  if (!store) {
    store = new ShopStore(client, analytics, opts)
  }

  return store
}

export default getStore
