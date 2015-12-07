model.export =
  'shippingAddress.line1':
    type: 'input'
    middleware:[
      isRequired
    ]

  'shippingAddress.line2':
    type: 'input'

  'shippingAddress.city':
    type: 'input'
    middleware: [
      isRequired
    ]

  'shippingAddress.state':
    type: 'state-select'
    middleware: [
      isRequired
    ]

  'shippingAddress.postalCode':
    type: 'input'
    middleware: [
      isPostalRequired
    ]

  'shippingAddress.country':
    type: 'input-select'
    middleware: [
      isRequired
    ]
