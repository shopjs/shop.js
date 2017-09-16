describe 'Shop.start', ->
  it "...", ->
    m = yield browser.evaluate ->
      return Shop.start
        key:        key
        endpoint:   endpoint

    m.should.not.be.null

