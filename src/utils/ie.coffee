export default do ->
  agent = navigator.userAgent
  reg = /MSIE\s?(\d+)(?:\.(\d+))?/i
  matches = agent.match(reg)
  if matches?
    major: matches[1]
    minor: matches[2]

