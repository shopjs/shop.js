[isRequired, isEmail, splitName] = require './middleware'

model.export =
  email:
    type: 'input'
    middleware: [
      isRequired
      isEmail
    ]

  password:
    type: 'password'

  name:
    type: 'input'
    middleware: [
      isRequire
      splitName
    ]
