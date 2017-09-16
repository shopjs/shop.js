import El from 'el.js'

import Events  from '../events'
import html from '../../templates/widgets/checkout-modal'
import m       from '../mediator'

class CheckoutModal extends El.View
  tag:  'checkout-modal'
  html: html

  names: null
  step: 0

  id: ''
  opened: false

  init: ->
    @names = ['Payment Info', 'Shipping Info', 'Done'] if !@names

    super

    m.on Events.CheckoutOpen, (id)=>
      if !id || id == @id
        @toggle true
        Shop.analytics.track 'Viewed Checkout Step', step: 1
        Shop.analytics.track 'Completed Checkout Step', step: 1
        Shop.analytics.track 'Viewed Checkout Step', step: 2

    m.on Events.CheckoutClose, (id)=>
      if !id || id == @id
        @toggle false

    m.on Events.SubmitCard, (id)=>
      @step = 1
      El.scheduleUpdate()
      Shop.analytics.track 'Completed Checkout Step', step: 2
      Shop.analytics.track 'Viewed Checkout Step', step: 3

    m.on Events.SubmitSuccess, (id)=>
      @step = 2
      El.scheduleUpdate()
      Shop.analytics.track 'Completed Checkout Step', step: 3


  open: ()->
    @toggle true

  close: ()->
    @toggle false
    if @step == 2
      window.location.reload()
      @scheduleUpdate()

  back: ()->
    if @step == 0 || @step == 2
      return @close()

    @step--
    @scheduleUpdate()

  toggle: (opened)->
    if opened == true || opened == false
      @opened = opened
    else
      @opened = !@opened

    $container = $(@root).find('.checkout-container')
    if @opened
      $container.css 'top', $(window).scrollTop()
      m.trigger Events.CheckoutOpened
    else
      $container.css 'top', -2000
      m.trigger Events.CheckoutClosed

    @scheduleUpdate()

CheckoutModal.register()

export default CheckoutModal
