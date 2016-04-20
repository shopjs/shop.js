# Shop.js  [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![NPM version][npm-image]][npm-url]  [![Gitter chat][gitter-image]][gitter-url]
Shopping framework for JavaScript.

[crowdstart]: https://crowdstart.com
[shop.js]: https://cdn.rawgit.com/crowdstart/shop.js/v0.0.1/shop.min.js
[travis-url]: https://travis-ci.org/crowdstart/shop.js
[travis-image]: https://img.shields.io/travis/crowdstart/shop.js.svg
[coveralls-url]: https://coveralls.io/r/crowdstart/shop.js/
[coveralls-image]: https://img.shields.io/coveralls/crowdstart/shop.js.svg
[npm-url]: https://www.npmjs.com/package/shop.js
[npm-image]: https://img.shields.io/npm/v/shop.js.svg
[downloads-image]: https://img.shields.io/npm/dm/shop.js.svg
[downloads-url]: http://badge.fury.io/js/shop.js
[gitter-url]: https://gitter.im/crowdstart/chat
[gitter-image]: https://img.shields.io/badge/gitter-join_chat-brightgreen.svg

# bootstrapping
## app.js
`js/app.js`
## settings
```module.exports = {
  key: 'api key',
  endpoint: 'api endpoint',
  taxRates: [
    {
      taxRate: 0.1337,
      state:   'ca',
      country: 'us'
    }
  ],
  referralProgram: {
    name:    'Yet Another Referral',
    triggers: [0], // WHAT IS THIS
    actions: [
      {
        type:     'Credit' // options here?
        currency: 'points', // and here?
        amount:   1
      }
    ]
  }
};```
# shop.js docs
## containers
`shop.js` uses a container pattern. Specifically you will be dealing with the `<cart>` container.

### description:
*describe container theory here.*
### `<cart>`
specific containers available to `<cart />`:

stuff

`<lineitems />`

`<text-control />`
### other features/attributes/etc
here.


## interesting:
`input="{ inputs['order.promoCode'] }` in `<text-control />`

`class="promo-message"` is a good example case of using `if="{}"`
