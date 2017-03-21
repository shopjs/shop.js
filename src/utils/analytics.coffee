export default {
  track: (event, data) ->
    if window?.analytics?
      try
        window.analytics.track(event, data)
      catch err
        console.error(err)
}
