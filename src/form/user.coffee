model.export =
  email:
    type: 'input'
    middleware: [
      isRequired
      isEmail
    ]

  password:
    type: 'password'
    middleware: [
      isPassword
    ]

  name:
    type: 'input'
    middleware: [
      isRequire
      splitName
    ]
