expect = require('chai').expect

describe 'Shop.js', ->
  it 'should start and load all data', ->
    console.log 'This test needs internet access.'

    ret = yield browser.evaluate (key, endpoint)->
      ret = []

      m = Shop.getMediator()

      p = new Promise (resolve, reject)->
        m.one 'started', (data)->
          ret.push
            event:  'started'
            data:   clone(data.get())

          if ret.length == 4
            resolve ret

        m.one 'geo-ready', (geo)->
          ret.push
            event:  'geo-ready'
            geo:    geo
            data:   clone(Shop.data.get())

          if ret.length == 4
            resolve ret

        m.one 'ready', ->
          ret.push { event: 'ready' }

          if ret.length == 4
            resolve ret

        m.one 'async-ready', (constants)->
          ret.push
            event:      'async-ready'
            constants:  constants
            data:       clone(Shop.data.get())

          if ret.length == 4
            resolve ret

      Shop.start
        key:        key
        endpoint:   endpoint

      return p

    , key, endpoint

    # console.log 'returned', ret

    # Default data
    ret.should.not.be.null
    ret.length.should.eq 4
    ret[0].event.should.eq 'started'
    expect(ret[0].data).to.exist

    data = ret[0].data
    data.key.should.eq key
    data.endpoint.should.eq endpoint

    # Populated after AsyncReady
    expect(data.taxRates).to.not.exist
    expect(data.shippingRates).to.not.exist
    data.countries.should.deep.eq []

    # Other default
    data.terms.should.eq false
    expect(data.user).to.not.exist
    expect(data.payment).to.deep.eq {}

    order = data.order
    order.type.should.eq 'stripe'
    order.referrerId.should.eq 'queryRef'

    # Geo is disabled in Electron
    ret[1].event.should.eq 'geo-ready'
    ret[1].geo.status.should.eq 'disabled'

    # Ready to accept commands
    ret[2].event.should.eq 'ready'

    # Loaded data from server
    ret[3].event.should.eq 'async-ready'

    data = ret[3].data

    # Populated after AsyncReady
    expect(data.taxRates).to.exist
    expect(data.shippingRates).to.exist
    data.countries.length.should.eq 247

  it 'should initialize the checkout modal', ->
    console.log 'This test needs internet access and is synchronous'

    ret = yield browser.evaluate (key, endpoint)->
      ret = []

      m = Shop.getMediator()
      data = Shop.getData()

      Shop.addItem 'red-shirt', 1

      return new Promise (resolve, reject)->
        m.one 'checkout-open', ->
          $userName = $('input[name="user.name"]')
            .val 'FirstName LastName'
          $userEmail = $('input[name="user.email"]')
            .val 'email@email.com'

          # this should be automatic
          # $paymentAccountName = $('#payment.account.name')
          #   .val 'FirstName LastName'
          $paymentAccountNumber = $('input[name="number"]')
            .val '4242 4242 4242 4242'
          $paymentAccountExpiry = $('input[name="expiry"]')
            .val '04 / 24'
          $paymentAccountCVC = $('input[name="cvc"]')
            .val '424'

          fireEvent($userName[0], 'change')
          fireEvent($userEmail[0], 'change')
          # fireEvent($paymentAccountName[0], 'change')
          fireEvent($paymentAccountNumber[0], 'change')
          fireEvent($paymentAccountExpiry[0], 'change')
          fireEvent($paymentAccountCVC[0], 'change')

          Shop.El.scheduleUpdate()

          setTimeout ->
            $('checkout-card .checkout-next').click()
          , 1000

        m.one 'submit-card', ->
          $shippingAddressCountry = $('[name="order.shippingAddress.country"]')
            .val 'US'
          fireEvent($shippingAddressCountry[0], 'change')

          # Address needs to be changed after country is
          setTimeout ->
            $shippingAddressLine1 = $('[name="order.shippingAddress.line1"]')
              .val '405 Southwest Blvd'
            $shippingAddressLine2 = $('[name="order.shippingAddress.line2"]')
              .val '[name="200'
            $shippingAddressCity = $('[name="order.shippingAddress.city"]')
              .val 'Kansas City'
            $shippingAddressState = $('[name="order.shippingAddress.state"]')
              .val 'MO'
            $shippingAddressPostalCode = $('[name="order.shippingAddress.postalCode"]')
              .val '64108'
            $terms = $('[name="terms"]')
              .prop 'checked', true

            fireEvent($shippingAddressLine1[0], 'change')
            fireEvent($shippingAddressLine2[0], 'change')
            fireEvent($shippingAddressCity[0], 'change')
            fireEvent($shippingAddressState[0], 'change')
            fireEvent($shippingAddressPostalCode[0], 'change')
            fireEvent($terms[0], 'change')
          , 500

          setTimeout ->
            $('checkout .checkout-next').click()
          , 1500

        m.one 'submit-success', ()->
          resolve true

        # start
        m.trigger 'checkout-open'

    ret.should.be.true

