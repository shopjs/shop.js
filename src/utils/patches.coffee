import Promise from 'broken'
import {raf}   from 'es-raf'

# Shims/Polyfills
window.Promise               ?= Promise
window.requestAnimationFrame ?= raf
window.cancelAnimationFrame  ?= raf.cancel

agent = navigator.userAgent
reg = /MSIE\s?(\d+)(?:\.(\d+))?/i
matches = agent.match(reg)
if matches?
  ieMajor = matches[1]
  ieMinor = matches[2]

export default {
  ieVersion:
    major: ieMajor
    minor: ieMinor
}
