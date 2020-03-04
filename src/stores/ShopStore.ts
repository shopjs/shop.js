import {
  action,
  computed,
  observable,
} from 'mobx'

import {
  Commerce,
  IAddress,
  IClient,
  ICoupon,
  IPayment,
} from 'commerce.js'

export default class ShopStore {
  @observable
  step: number = 0

  @observable
  commerce: Commerce

  @observable
  payment: IPayment = {
    account: {
      number: '',
      cvc: '',
      month: '',
      year: '',
    },
  }

  constructor(
    client: IClient,
    raw: any,
    order = {
      currency: 'usd',
    },
  ) {
    Object.assign(this, raw)

    this.commerce = new Commerce(client, order)
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
    this.payment[k] = v
  }

  @computed get order() {
    return this.commerce.order
  }

  @action
  setOrder(k: string, v: any) {
    return this.commerce.order[k] = v
  }

  @action
  setUser(k: string, v: any) {
    this.commerce.user[k] = v
  }

  @computed get user() {
    return this.commerce.user
  }

  @action
  checkout() {
    this.commerce.checkout(this.payment)
  }

  @action
  setItem(id: string, quantity: number) {
    this.commerce.set(id, quantity)
  }
}
