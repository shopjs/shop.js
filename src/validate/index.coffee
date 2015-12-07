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
    return @model.exec model.model, model.name

# validate takes a model and a configuration and returns observable values
#   model: an generic dictionary object that you want to generate observable properties from
#   configs: a mapping of model values to a middleware stack eg.
#       field1:
#           type: annotation for field type
#           middleware:[
#               ...
#           ]
#       where middleware is an array of (model, name)-> value
validate = (model, configs)->
  ret = {}

  for name, config of configs
    middleware = []
    do (validations, name, config)->
      for middlewareFn in config.middleware
        do (name, middlwareFn)->
          middlware.push (pair)->
            [model, name] = pair
            return Promise.resolve(pair)
              .then (pair)->
                return middlewareFn.call(obs, pair[0], pair[1])
              .then (v)->
                model[name] = v
                return pair

      middleware.push (pair)->
        [model, name] = pair
        # on success resolve the value in the model
        return promise.new (resolve, reject)->
          resolve model[name]

      exec = (model, name)->
        p = Promise.resolve([model, name])
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

