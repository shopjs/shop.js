import El    from 'el.js'

import Events from '../events'
import html   from '../../templates/containers/thankyou'

class ThankYouForm extends El.Form
  tag:  'thankyou'
  html: html

  orderAddress: ''

  init: ->
    super

    @mediator Events.SubmitSuccess, (order) ->
      @orderAddress = order?.wallet?.accounts?[0]?.address

  getOrderId: ->
    return @data.get('order.id') ? ''

  # crypto
  isMetamaskInstalled: ->
    return typeof web3 != 'undefined'

  payWithMetamask: ->
    @mediator.trigger PayWithMetamask

    if !@isMetamaskInstalled()
      @mediator.trigger PayWithMetamaskFailed, new Error('Metamask not installed')
      return

    if @getCurrency() != 'eth'
      @mediator.trigger PayWithMetamaskFailed, new Error('Metamask only supports ETH transactions')
      return

    userAddress = web3.eth.accounts[0]
    web3.eth.sendTransaction
      to:   @getOrderAddress()
      from: userAddress,
      value: web3.toWei @getAmount(), 'gwei'
    , (err, transactionHash) ->
      if err
        @mediator.trigger PayWithMetamaskFailed, err
        return

      @mediator.trigger PayWithMetamaskSuccess, transactionHash

  getCurrency: ->
    return @data.get('order.currency').toLowerCase()

  getOrderAddress: ->
    return @orderAddress

  getAmount: ->
    return @data.get 'order.total'

ThankYouForm.register()

export default ThankYouForm
