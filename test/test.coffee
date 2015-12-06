describe 'Shopping.js', ->
  it 'should instantiate', ->
    yield browser.evaluate ->
      new Crowdstart.Shopping()
