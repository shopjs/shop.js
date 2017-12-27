import El    from 'el.js'

import Events from '../events'
import html   from '../../templates/containers/thankyou'

import {
  isCrypto
} from 'shop.js-util/src/currency'

class ThankYouForm extends El.Form
  tag:  'thankyou'
  html: html

  # special test mode to assist in designing with the widget
  # test: false
  # testCrypto: false

  errorMessage: ''
  loading:      false
  checkedOut:   false

  orderAddress: ''

  init: ->
    super

    if @testCrypto
      @test = true

  isCrypto: ->
    return isCrypto @getCurrency()

  getOrderNumber: ->
    return "1234" if @test
    return @data.get('order.number') ? ''

  getOrderId: ->
    return "abcd" if @test
    return @data.get('order.id') ? ''

  # crypto
  isMetamaskInstalled: ->
    return typeof web3 != 'undefined'

  payWithMetamask: ->
    return if @loading

    @mediator.trigger Events.PayWithMetamask

    @errorMessage = ''
    El.scheduleUpdate()

    if !@isMetamaskInstalled()
      @mediator.trigger Events.PayWithMetamaskFailed, new Error('Metamask not installed')
      @errorMessage = 'Metamask not installed'
      return

    if @getCurrency() != 'eth'
      @mediator.trigger Events.PayWithMetamaskFailed, new Error('Metamask only supports ETH transactions')
      @errorMessage = 'Metamask only supports ETH transactions'
      return

    @loading = true
    userAddress = web3.eth.accounts[0]

    try
      web3.eth.sendTransaction
        to:   @getAddress()
        from: userAddress,
        value: web3.toWei @getAmount(), 'gwei'
      , (err, transactionHash) =>
        @loading = false
        @checkedOut = true

        El.scheduleUpdate()

        if err
          @mediator.trigger Events.PayWithMetamaskFailed, err
          @errorMessage = err
          return

        @mediator.trigger Events.PayWithMetamaskSuccess, transactionHash
    catch err
      @loading = false

      El.scheduleUpdate()

      if @test
        @mediator.trigger Events.PayWithMetamaskFailed, new Error('Error: <thankyou> is in test mode')
        @errorMessage = 'Error: <thankyou> is in test mode'
      else
        @mediator.trigger Events.PayWithMetamaskFailed, new Error('Invalid address')
        @errorMessage = 'Invalid address'

  getCurrency: ->
    return 'eth' if @testCrypto
    return 'usd' if @test
    return @data.get('order.currency').toLowerCase()

  getAddress: ->
    return 'address123' if @test
    return @data.get 'order.wallet.accounts.0.address'

  getAmount: ->
    return 1000 if @test
    return @data.get 'order.total'

  getQRCode: ->
    currency = @getCurrency()
    switch currency
      when 'eth'
        return 'ethereum:' + @getAddress() + '?value=' + @data.get('order.total') / 1e9
      when 'btc'
        return 'bitcoin:' + @getAddress() + '?amount=' + @data.get('order.total') / 1e9
    return 'unknown'

ThankYouForm.register()

export default ThankYouForm
