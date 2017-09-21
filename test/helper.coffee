chai = require 'chai'
chai.should()
chai.use require 'chai-as-promised'

require 'postmortem/register'

Nightmare = require 'nightmare'

before ->
  browser = Nightmare
    show: process.env.VERBOSE is 'true'
    # switches:
    #   'proxy-server':              'http://localhost:4010'
    #   'ignore-certificate-errors': true

    executionTimeout: 10000 # 10s timeout

  yield browser.goto 'http://localhost:3333/'
  global.browser = browser

after ->
  yield browser.end()

# chai = require 'chai'
# chai.should()
# chai.use require 'chai-as-promised'

before ->

  # add a dummy analytics thing
  yield browser.evaluate ->
    analytics:
      track: ()->
        global.analyticsArgs = arguments

  global.endpoint = 'https://api.hanzo.io'
  global.key = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJiaXQiOjQ1MDM2MTcwNzU2NzUxNzIsImp0aSI6InlJVFF2NTZwWXBVIiwic3ViIjoiRXFUR294cDV1MyJ9.TM_aCV2SCSLbRVMgezSCLr0UvkcXhpupCfDWC8bvkzaMuqGv6N-g4DnTNtUJNk_70nO6gA0seCpEvuMSkerSsw'
