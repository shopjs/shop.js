describe 'Shop.js', ->
  it 'should instantiate', ->
    yield browser.evaluate ->
      new Crowdstart.Shop()
