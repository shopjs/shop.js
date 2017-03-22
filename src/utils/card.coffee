defaultFormat = /(\d{1,4})/g

cards = [
  type:      'amex'
  pattern:   /^3[47]/
  format:    /(\d{1,4})(\d{1,6})?(\d{1,5})?/
  length:    [15]
  cvcLength: [4]
  luhn:      true
,
  type:      'dankort'
  pattern:   /^5019/
  format:    defaultFormat
  length:    [16]
  cvcLength: [3]
  luhn:      true
,
  type:      'dinersclub'
  pattern:   /^(36|38|30[0-5])/
  format:    /(\d{1,4})(\d{1,6})?(\d{1,4})?/
  length:    [14]
  cvcLength: [3]
  luhn:      true
,
  type:      'discover'
  pattern:   /^(6011|65|64[4-9]|622)/
  format:    defaultFormat
  length:    [16]
  cvcLength: [3]
  luhn:      true
,
  type:      'jcb'
  pattern:   /^35/
  format:    defaultFormat
  length:    [16]
  cvcLength: [3]
  luhn:      true
,
  type:      'laser'
  pattern:   /^(6706|6771|6709)/
  format:    defaultFormat
  length:    [16..19]
  cvcLength: [3]
  luhn:      true
,
  type:      'maestro'
  pattern:   /^(5018|5020|5038|6304|6703|6708|6759|676[1-3])/
  format:    defaultFormat
  length:    [12..19]
  cvcLength: [3]
  luhn:      true
,
  type:      'mastercard'
  pattern:   /^(5[1-5]|677189)|^(222[1-9]|2[3-6]\d{2}|27[0-1]\d|2720)/
  format:    defaultFormat
  length:    [16]
  cvcLength: [3]
  luhn:      true
,
  type:      'unionpay'
  pattern:   /^62/
  format:    defaultFormat
  length:    [16..19]
  cvcLength: [3]
  luhn:      false
,
  type:      'visaelectron'
  pattern:   /^4(026|17500|405|508|844|91[37])/
  format:    defaultFormat
  length:    [16]
  cvcLength: [3]
  luhn:      true
,
  type:      'elo'
  pattern:   /^(4011|438935|45(1416|76|7393)|50(4175|6699|67|90[4-7])|63(6297|6368))/
  format:    defaultFormat
  length:    [16]
  cvcLength: [3]
  luhn:      true
,
  type:      'visa'
  pattern:   /^4/
  format:    defaultFormat
  length:    [13, 16, 19]
  cvcLength: [3]
  luhn:      true
]

export luhnCheck = (num) ->
  odd = true
  sum = 0

  digits = (num + '').split('').reverse()

  for digit in digits
    digit = parseInt(digit, 10)
    digit *= 2 if (odd = !odd)
    digit -= 9 if digit > 9
    sum += digit

  sum % 10 == 0

export cardFromNumber = (num) ->
  num = (num + '').replace(/\D/g, '')
  return card for card in cards when card.pattern.test(num)

export cardType = (num) ->
  return null unless num
  cardFromNumber(num)?.type or null

export restrictNumeric = (e) ->
  # Key event is for a browser shortcut
  return true if e.metaKey or e.ctrlKey

  # If keycode is a space
  return e.preventDefault() if e.which is 32

  # If keycode is a special char (WebKit)
  return true if e.which is 0

  # If char is a special char (Firefox)
  return true if e.which < 33

  input = String.fromCharCode(e.which)

  # Char is a number or a space
  e.preventDefault() if !/[\d\s]/.test(input)
