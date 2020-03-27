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
    raw: any,
  ) {
    Object.assign(this, raw)

    this.client = client

    this.commerce = new Commerce(client, {}, [], [], analytics)

    if (!this.order.currency) {
      this.order.currency = 'usd'
    }

    this.load()
  }

  save() {
    akasha.set('library.lastChecked', this.lastChecked)
    akasha.set('library.countries',   this.countries)
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
        hasCountries:       !!this.countries && this.countries.length != 0,
        lastChecked:        renderDate(this.lastChecked || '2000-01-01', rfc3339),
      })

      runInAction(() => {
        this.countries = res.countries || this.countries

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
  track(event: string, opts: any) {
    if (this.commerce.analytics) {
      this.commerce.analytics.track(event, opts)
    }
  }
}
