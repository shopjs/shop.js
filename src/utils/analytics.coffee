module.exports =
  track: (event, data) ->
    if window.analytics?
      window.analytics.track(event, data)
