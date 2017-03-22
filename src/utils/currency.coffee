import currencies from '../data/currencies'
currencySeparator = '.'
digitsOnlyRe = new RegExp('[^\\d.-]', 'g')

currencySigns = currencies.data

isZeroDecimal = (code)->
  if code == 'bif' || code == 'clp' || code == 'djf' || code == 'gnf' || code == 'jpy' || code == 'kmf' || code == 'krw' || code == 'mga' || code == 'pyg' || code == 'rwf' || code == 'vnd' || code == 'vuv' || code == 'xaf' || code == 'xof' || code == 'xpf'
    return true
  return false

export default {
  renderUpdatedUICurrency: (code, uiCurrency)->
    currentCurrencySign = currencySigns[code]

    return Util.renderUICurrencyFromJSON Util.renderJSONCurrencyFromUI(uiCurrency)

  renderUICurrencyFromJSON: (code, jsonCurrency)->
    if isNaN jsonCurrency
      jsonCurrency = 0

    currentCurrencySign = currencySigns[code]

    jsonCurrency = '' + jsonCurrency
    # jsonCurrency is not cents
    if isZeroDecimal code
      return currentCurrencySign + jsonCurrency

    # jsonCurrency is cents
    while jsonCurrency.length < 3
      jsonCurrency = '0' + jsonCurrency

    return currentCurrencySign + jsonCurrency.substr(0, jsonCurrency.length - 2) + '.' + jsonCurrency.substr(-2)

  renderJSONCurrencyFromUI: (code, uiCurrency) ->
    currentCurrencySign = currencySigns[code]

    if isZeroDecimal code
      return parseInt(('' + uiCurrency).replace(digitsOnlyRe, '').replace(currencySeparator, ''), 10)

    # uiCurrency is a whole unit of currency
    parts = uiCurrency.split currencySeparator
    if parts.length > 1
      parts[1] = parts[1].substr(0, 2)
      while parts[1].length < 2
        parts[1] += '0'
    else
      parts[1] = '00'
    return parseInt(parseFloat(parts[0].replace(digitsOnlyRe, '')) * 100 + parseFloat(parts[1].replace(digitsOnlyRe, '')), 10)
}
