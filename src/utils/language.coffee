export getLocale = ()->
  return window.navigator?.userLanguage ? window.navigator?.languages[0] ? window.navigator?.language

