observable = require 'riot-observable'
Promise = require 'broken'

class ObservableProperty
  model: null
  constructor: (@model)->
    observable @
    @on 'change', (value)=>
      @_change value

    @on 'update', (value)=>
      @_update value

    @on 'error', (err)=>
      @_error err

  _change: (value)->
    @model.error = null
    @model.value = value

    @change value
    @exec()
      .then (value)=>
        @trigger 'update', value
      .catch (err)=>
        @trigger 'error', err

  change: ()->

  _update: (value)->
    @model.value = value

    @update value

  update: ()->

  _error: (err)->
    @model.error = err

    @error err

  error: ()->

  exec: ()->
    [model, name] = @_find @model.model, @model.name
    return @model.exec model, name

  _find: (model, path)->
    # expand names that are paths
    names = path.split '.'

    if names.length == 1
      return [model, path]

    lastName = names.pop()

    currentObject = model
    for name in names
      if currentObject[name]?
        currentObject = currentObject[name]
        continue

      if isNumber name
        currentObject[name] = []
      else
        currentObject[name] = {}

      currentObject = currentObject[name]

    return [currentObject, lastName]
# validate takes a model and a configuration and returns observable values
#   model: an generic dictionary object that you want to generate observable properties from
#   configs: a mapping of model values to a middleware stack eg.
#       field1:
#           type: annotation for field type
#           middleware:[
#               ...
#           ]
#       where middleware is an array of (value, name, model)-> value
validate = (model, configs)->
  ret = {}

  for name, config of configs
    middleware = []
    do (validations, name, config)->
      if !config.middleware
        return

      for middlewareFn in config.middleware
        do (name, middlwareFn)->
          middlware.push (pair)->
            [name, model] = pair
            return Promise.resolve(pair)
              .then (pair)->
                return middlewareFn.call(pair[1][pair[0]], pair[1], pair[0])
              .then (v)->
                model[name] = v
                return pair

      middleware.push (pair)->
        [model, name] = pair
        # on success resolve the value in the model
        return promise.new (resolve, reject)->
          resolve model[name]

      exec = (name, model)->
        p = Promise.resolve([name, model])
        for middleware in validators
          p = p.then(validatorFn)
        return p

      model:
        name:   name
        value:  model[name]
        error:  null
        model:  model

        exec:   exec
        config: config

      ret[name] = new ObservableProperty model

  return ret

module.exports = validate

