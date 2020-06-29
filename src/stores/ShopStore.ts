import {
  action,
  computed,
  observable,
  runInAction,
} from 'mobx'

import {
  Commerce,
  Order,
  IAddress,
  IClient,
  ICoupon,
  IOrder,
  IPayment,
  IGeoRate,
} from 'commerce.js'

import {
  renderDate,
  rfc3339
} from '@hanzo/utils'

import akasha from 'akasha'

export interface IRegion {
  name: string
  code: string
}

export interface ICountry extends IRegion{
  subdivisions: IRegion[]
}

export interface LibraryResponse {
  countries: ICountry[]
  storeId: string
  currency: string
  shippingRates: {
    geoRates: IGeoRate[]
  },
  taxRates: {
    geoRates: IGeoRate[]
  },
}

export interface ILibraryClient extends IClient {
  library: {
    shopjs: (opts: any) => Promise<LibraryResponse>
  }
}

export default class ShopStore {
  @observable
  lastChecked = undefined

  @observable
  countries: ICountry[] = []

  @observable
  isLoading = false

  @observable
  tempOrder?: IOrder

  @observable
  step: number = 0

  @observable
  commerce: Commerce

  @observable
  bootstrapPromise: Promise<any> = new Promise(() => {})

  @observable
  client: ILibraryClient

  @observable
  _payment: IPayment = {
    account: {
      name: '',
      number: '',
      cvc: '',
      month: '',
      year: '',
    },
  }

  constructor(
    client: ILibraryClient,
    analytics: any,
    raw: any = {},
  ) {
    Object.assign(this, raw)

    this.client = client

    this.commerce = new Commerce(client, undefined, [], [], analytics)
    if (raw.storeId || this.order.storeId) {
      this.commerce.setStoreId(raw.storeId ?? this.order.storeId)
    }

    if (!this.order.currency) {
      this.order.currency = 'usd'
    }

    this.load()
  }

  save() {
    akasha.set('library.lastChecked', this.lastChecked)
    akasha.set('library.countries',   this.countries)
  }

  @action async setStoreId(storeId: string): Promise<void> {
    this.commerce.setStoreId(storeId)
    return this.load()
  }

  @action async load(): Promise<void> {
    let resolve, reject
    this.bootstrapPromise = new Promise((res, rej) => {
      resolve = res
      reject = rej
    })

    this.isLoading = true
    this.countries   = akasha.get('library.countries') || []
    this.lastChecked = renderDate(new Date(), rfc3339)

    try {
      let res = await this.client.library.shopjs({
        hasCountries:   !!this.countries && this.countries.length != 0,
        storeId:        this.commerce.storeId,
        lastChecked:    renderDate(this.lastChecked || '2000-01-01', rfc3339),
      })

      runInAction(() => {
        this.countries = res.countries || this.countries
        this.order.currency = res.currency
        this.order.shippingRates = res.shippingRates.geoRates
        this.order.taxRates = res.taxRates.geoRates

        this.save()
        this.isLoading = false
      })

      resolve()
    } catch(e) {
      runInAction(() => {
        this.isLoading = false
      })

      reject(e)
    }
  }

  @computed
  get countryOptions() {
    let countries = this.countries.slice().sort((a, b) => {
      if (a.code.toUpperCase() == 'US') {
        return -1
      } else if (b.code.toUpperCase() == 'US') {
        return 1
      }

      if (a.name < b.name) { return -1 }
      if (a.name > b.name) { return 1 }
      return 0
    })

    let options = {}

    for (let k in countries) {
      let country = countries[k]
      options[country.code.toUpperCase()] = country.name
    }

    return options
  }

  @computed
  get stateOptions() {
    let options = {}
    let countries = this.countries

    for (let k in countries) {
      let country = countries[k]
      let cCode = country.code.toUpperCase()

      let c = options[cCode]
      if (!c) {
        c = options[cCode] = {}
      }

      let subdivisions = country.subdivisions.slice().sort((a, b) => {
        if (a.name < b.name) { return -1 }
        if (a.name > b.name) { return 1 }
        return 0
      })

      for (let k2 in subdivisions) {
        let subdivision = subdivisions[k2]

        c[subdivision.code.toUpperCase()] = subdivision.name
      }
    }

    return options
  }


  @action
  setCoupon(code?: string): Promise<ICoupon | undefined> {
    return this.commerce.setCoupon(code)
  }

  @action
  setAddress(k: string, v: any) {
    this.commerce.order.shippingAddress[k] = v
  }

  @computed get address(): IAddress {
    return this.commerce.order.shippingAddress
  }

  @action
  setPayment(k: string, v: any) {
    this._payment.account[k] = v
  }

  @computed get payment() {
    return this._payment.account
  }

  @action
  setOrder(k: string, v: any) {
    return this.commerce.order[k] = v
  }

  @computed get order() {
    return this.commerce.order
  }

  @action
  setUser(k: string, v: any) {
    this.commerce.user[k] = v
  }

  @computed get user() {
    return this.commerce.user
  }

  @action
  async checkout(): Promise<any> {
    if (this.isLoading) {
      return
    }

    this.isLoading = true

    try {
      let o = await this.commerce.checkout(this._payment)

      this.isLoading = false

      Order.clear()

      return o
    }
    catch (e) {
      this.isLoading = false

      throw e
    }
  }

  @action
  async setItem(id: string, quantity: number) {
    if (quantity) {
      this.track('Viewed Checkout Step', {step: 1})
    }

    await this.commerce.set(id, quantity)

    if (quantity) {
      this.track('Completed Checkout Step', {step: 1})
    }
  }

  @action
  async addItem(id: string, quantity: number) {
    if (quantity) {
      this.track('Viewed Checkout Step', {step: 1})
    }

    let item = await this.commerce.get(id)

    if (item && item.quantity) {
      quantity += item.quantity
    }

    await this.commerce.set(id, quantity)

    if (quantity) {
      this.track('Completed Checkout Step', {step: 1})
    }
  }

  @action
  track(event: string, opts: any) {
    if (this.commerce.analytics) {
      this.commerce.analytics.track(event, opts)
    }
  }

  @computed
  get count(): number {
    return this.order.items.reduce((a,b) => a + b.quantity, 0)
  }
}
