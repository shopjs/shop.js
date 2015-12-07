emailRe = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

model.export =
  isRequired: (value)->
    value = value?.trim?()
    return value if value && value != ''

    throw new Error 'Required'

  isEmail: (value)->
    value = value?.trim?()
    return value if emailRe.test value

    throw new Error 'Enter a valid email'

  splitName: (value)->
    i = value.indexOf ' '
    @firstName = value.slice 0, i
    @lastName = value.slice i+1
    return value

