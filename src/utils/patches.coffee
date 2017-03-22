import raf from 'es-raf'

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
window.requestAnimationFrame ?= raf
window.cancelAnimationFrame ?= raf.cancel

export default {
  ieVersion:
    major: ieMajor
    minor: ieMinor
}
