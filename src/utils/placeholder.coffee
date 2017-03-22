# contains parts of Input Placeholder Polyfill
# MIT Licensed
# Created by Christopher Rolfe

#
# When the input value is the same as the placeholder clear it
#
hidePlaceholderOnFocus = (event) ->
  target = if event.currentTarget then event.currentTarget else event.srcElement

  if  target.value == target.getAttribute 'placeholder'
    target.value = ''

#
# When the input has an empty value put the placeholder back in
#
unfocusOnAnElement = (event) ->
  target = if event.currentTarget then event.currentTarget else event.srcElement

  if target.value == ''
    target.value = target.getAttribute 'placeholder'

exports = ()->

if !document.createElement("input").placeholder?
  exports = (input)->
    #jquery case
    input = input[0] ? input

    if input._placeholdered?
      return

    Object.defineProperty input, '_placeholdered',
      value: true
      writable: true

    # Loop over them
    # If they don't have a preset value
    if !input.value
      input.value = input.getAttribute 'placeholder'

    # Attach event listeners for click and blur
    # Click so that we can clear the placeholder if we need to
    # Blur to re-add it if needed
    if input.addEventListener
      input.addEventListener 'click', hidePlaceholderOnFocus, false
      input.addEventListener 'blur', unfocusOnAnElement, false
    else if input.attachEvent
      input.attachEvent 'onclick', hidePlaceholderOnFocus
      input.attachEvent 'onblur', unfocusOnAnElement

export default exports
