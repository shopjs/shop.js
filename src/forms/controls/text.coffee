Input = require './input'

module.exports = class Text extends Input
  tag:  'text-input'
  '''
    <input id="{ input.name }" name="{ input.name }" type="text" onchange="{ change }" onblur="{ change }" value="{ input.ref(input.name) }" placeholder="{ placeholder }"></input>
  '''

Text.register()
