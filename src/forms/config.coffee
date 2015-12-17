{
  isRequired,
  isEmail,
  splitName,
  isPostalRequired,
  requiresStripe,
  expiration,
  cardNumber,
  cvc,
  isEcardGiftRequired,
  agreeToTerms,
} = require './middleware'

module.exports =
  'user.email':       [ isRequired, isEmail ]
  'user.name':        [ isRequired, splitName ]
  'user.password':    null

  'order.shippingAddress.line1':      [ isRequired ]
  'order.shippingAddress.line2':      null
  'order.shippingAddress.city':       [ isRequired ]
  'order.shippingAddress.state':      [ isRequired ]
  'order.shippingAddress.postalCode': [ isPostalRequired ]
  'order.shippingAddress.country':    [ isRequired ]

  'order.gift':           null
  'order.giftType':       null
  'order.giftEmail':      [ isEcardGiftRequired, isEmail ]
  'order.giftMessage':    null
  'order.promoCode':      null

  'payment.account.number':   [ requiresStripe, cardNumber]
  'payment.account.expiry':   [ requiresStripe, expiration ]
  'payment.account.cvc':      [ requiresStripe, cvc ]

  'terms':                    [ agreeToTerms ]

