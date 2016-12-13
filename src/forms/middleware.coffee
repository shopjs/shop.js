Promise = require 'broken'
requestAnimationFrame = require 'raf'
countryUtils = require '../utils/country'
cardUtils = require '../utils/card'

emailRe = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

middleware =
  isRequired: (value) ->
    return value if value && value != ''

    throw new Error 'Required'

  isEmail: (value) ->
    return value unless value

    return value.toLowerCase() if emailRe.test value

    throw new Error 'Enter a valid email'

  isNewPassword: (value) ->
    if !@get 'user.currentPassword'
      throw new Error 'Current password required' if value
      return value

    return middleware.isPassword value

  isPassword: (value) ->
    unless value
      throw new Error 'Required'

    return value if value.length >= 6

    throw new Error 'Password must be atleast 6 characters long'

  matchesPassword: (value)->
    return value if !@get 'user.password'
    return value if value == @get 'user.password'

    throw new Error 'Passwords must match'

  splitName: (value) ->
    return value unless value

    parts     = value.trim().split ' '
    firstName = parts.shift()
    lastName  = parts.join ' '

    @set 'user.firstName', firstName
    @set 'user.lastName',  lastName

    value

  isPostalRequired: (value) ->
    if countryUtils.requiresPostalCode(@get('order.shippingAddress.country') || '') && (!value? || value == '')
      throw new Error "Required for Selected Country"

  isEcardGiftRequired: (value) ->
    return value if (!@get('order.gift') || @get('order.giftType') != 'ecard') || (value && value != '')

    throw new Error 'Required'

  requiresStripe: (value) ->
    throw new Error "Required" if @('order.type') == 'stripe' && (!value? || value == '')
    return value

  requireTerms: (value) ->
    if !value
      throw new Error 'Please read and agree to the terms and conditions.'
    value

  cardNumber: (value) ->
    return value unless value

    if @get('order.type') != 'stripe'
      return value

    card = cardUtils.cardFromNumber value
    throw new Error('Enter a valid card number') unless card

    cardNumber = value.replace(/\D/g, '')
    length = cardNumber.length

    throw new Error('Enter a valid card number') unless /^\d+$/.test(cardNumber)
    throw new Error('Enter a valid card number') unless cardNumber.length in card.length and card.luhn is false or cardUtils.luhnCheck(cardNumber)

    value

  expiration: (value) ->
    return value unless value

    if @('order.type') != 'stripe'
      return value

    digitsOnly = value.replace(/\D/g, '')
    length = digitsOnly.length

    if length != 4
      throw new Error('Enter a valid date')

    date = value.split '/'
    if date.length < 2
      throw new Error('Enter a valid date')

    now = new Date()
    nowYear = now.getFullYear()
    nowMonth = now.getMonth() + 1

    month = (date[0]).trim?()
    year = ('' + nowYear).substr(0, 2) + (date[1]).trim?()

    if parseInt(year, 10) < nowYear
      throw new Error('Your card is expired')
    else if parseInt(year, 10) == nowYear && parseInt(month, 10) < nowMonth
      throw new Error('Your card is expired')

    @set 'payment.account.month', month
    @set 'payment.account.year', year

    value

  cvc: (value) ->
    return value unless value

    if @('order.type') != 'stripe'
      return value

    card = cardUtils.cardFromNumber(@get 'payment.account.number')
    cvc = value.trim()

    throw new Error('Enter a valid cvc') unless /^\d+$/.test(cvc)

    if card and card.type
      # Check against a explicit card type
      throw new Error('Enter a valid cvc') unless cvc.length in card?.cvcLength
    else
      # Check against all types
      throw new Error('Enter a valid cvc') unless cvc.length >= 3 and cvc.length <= 4

    cvc

  agreeToTerms: (value) ->
    if value == true
      return value

    throw new Error 'Agree to the terms and conditions'

module.exports = middleware
