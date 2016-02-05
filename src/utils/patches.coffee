agent = navigator.userAgent
reg = /MSIE\s?(\d+)(?:\.(\d+))?/i
matches = agent.match(reg)
if matches?
  ieMajor = matches[1]
  ieMinor = matches[2]

# monkey patch general things

#Shims/Polyfills
window.Promise ?= require 'broken'

#requestAnimationFrame
raf = require 'raf'
window.requestAnimationFrame ?= raf
window.cancelAnimationFrame ?= raf.cancel

# IE 10 monkey patch because of riot passing the node to its own appendChild.
if ieMajor <= 10
  if Node?
    appendChild = Node.prototype.appendChild
    Node.prototype.appendChild = (element)->
      if element == @
        @parentNode.removeChild element
        @_tag.originalParentElement.appendChild @
        return
      appendChild.call @, element

module.exports =
  ieVersion:
    major: ieMajor
    minor: ieMinor
