CrowdControl = require 'crowdcontrol'
riot = require 'riot'
m = require '../mediator'
Events = require '../events'
store = require 'store'

module.exports = class CheckoutForm extends CrowdControl.Views.Form
  tag:  'checkout'
  html: '''
    <form onsubmit={submit}>
      <yield/>
    </form>
  '''

  errorMessage: null
  loading: false
  checkedOut: false

  configs: require './config'

  _submit: (event)->
    if @loading || @checkedOut
      return

    @loading = true
    m.trigger Events.Submit, @tag

    @errorMessage = null

    @update()
    @cart.checkout().then((pRef)=>
      pRef.p.catch (err)=>
        window?.Raven?.captureException(err)

        hasErrored = true
        @loading = false
        console.log "checkout submit Error: #{err}"
        @errorMessage = 'Unable to complete your transaction. Please try again later.'

        m.trigger Events.SubmitFailed, @tag
        @update()

      hasErrored = false
      setTimeout =>
        if !hasErrored
          @loading = false
          store.clear()

          @checkedOut = true
          m.trigger Events.SubmitSuccess, @tag
          @update()
      , 200

    ).catch (err)=>
      @loading = false
      console.log "authorize submit Error: #{err}"

      if err.type == 'authorization-error'
        @errorMessage = err.message
      else
        window?.Raven?.captureException(err)
        @errorMessage = 'Unable to complete your transaction. Please try again later.'

      m.trigger Events.SubmitFailed, @tag
      @update()
