expect = require('chai').expect

describe 'Shop.start', ->
  it "...", ->
    ret = yield browser.evaluate (key, endpoint)->
      m = Shop.start
        key:        key
        endpoint:   endpoint

      ret = []

      return new Promise (resolve, reject)->
        m.one 'load-data', ->
          ret.push { event: 'load-data', arguments: arguments }

          if ret.length == 2
            resolve ret

        m.one 'ready', ->
          ret.push { event: 'ready', arguments: arguments }

          if ret.length == 2
            resolve ret

    , key, endpoint

    ret.should.not.be.null
    ret.length.should.eq 2
    ret[0].event.should.eq 'load-data'
    expect(ret[0].arguments).to.exist()
    ret[1].event.should.eq 'ready'
    expect(ret[1].arguments).to.not.exist
