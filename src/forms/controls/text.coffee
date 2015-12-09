Control = require './control'

module.exports = class Text extends Control
  tag:  'text-control'
  html: '''
    <input id="{ input.name }" name="{ input.name }" type="text" onchange="{ change }" onblur="{ change }" value="{ input.ref(input.name) }" placeholder="{ placeholder }"></input>
  '''
