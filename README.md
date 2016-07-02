# Shop.js  [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![NPM version][npm-image]][npm-url]  [![Gitter chat][gitter-image]][gitter-url]
A shopping framework for JavaScript built using the Container Pattern on top of (riotjs) http://riotjs.com

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

<<<<<<< HEAD
# bootstrapping
## app.js
`js/app.js`
## settings
```js
module.exports = {
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
};
```
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
`data.(get/set)()`
accesses
`order`


## interesting:
`input="{ inputs['order.promoCode'] }` in `<text-control />`

`class="promo-message"` is a good example case of using `if="{}"`
=======
---

## Shop.js Reference ##

---

## Examples ##

---

##Containers and Controls##
Containers are Custom HTML tags that define a section of embeddable dynamic content.
Controls are very simple composeable widgets that provide ui inputs and outputs
for users.  Containers can contain other containers or controls.

Containers also expose data fields from the global data
[referrential tree](https://github.com/zeekay/referential) passed into
Shop.start and services.  Data fields are accessed using the 'data' special
variable (see below) and services which are accessed by their name.  Services
are either functions or read-only fields.

For example a submit() service can be invoked by calling 'submit()' directly or
binding an event 'onclick="submit"' for invokation by user when they interact
with an element on the page.

## Special Variables ##

### data ###
A reference to the global data referrential tree.
that's passed into the Shop.start function can be referenced from most
containers by using the 'data' variable.

The exceptions to this rule are lineitem and order which are used internally by
the looping containers lineitems and orders respectively.  The 'data' in these containers refer
to the specific item that's currently being looped over.  For example a lineitems container loops over order.items, a lineitem container's
'data' variable refers to the specific item being looped over.

### parent-data ###

Both lineitem and order both have a 'parent-data' variable that refer to their
immediate parents's for composeability reasons, namely to get fields like
'currency' relatively from the parent order or user.

### parent ###
The 'parent' variable references the parent container of the current container.
It is useful for using data fields or invoking services of a parent container.
Be aware that the root container has no parent set.

### Services Available to All Containers ###

| Name | Type | Description |
| --- | --- | --- |
| renderCurrency |(code&nbsp;string,&nbsp;cents&nbsp;number)&nbsp;&#8209;>&nbsp;string |  **code** is a currency's ISO 4217 code (typically set to data.get('order.currency')), **cents** is the currency in cents (or lowest unit in the case of zero decimal currencies like JPY), returns a localized value with currency symbol |
| renderDate | (date time,&nbsp;format string)&nbsp;&#8209;>&nbsp;string | refer to moment(...).format(...) documentation [here](http://momentjs.com/docs/#/parsing/string-format/)

---
##Containers##

### cart ###
The cart container renders cart items and handles the processing of promotional codes.

###### Data Fields ######
| Name | Type | Description |
| --- | --- | --- |
| order.promoCode | string | promotional code (coupon) |

###### Services ######
| Name | Type | Description |
| --- | --- | --- |
| applying | string | true when applyPromoCode is processing, false otherwise |
| applyPromoCode | ()&nbsp;&#8209;>&nbsp; | submits promo code for discount adjustment, issues ApplyPromoCode, ApplyPromoCodeSuccessful, and ApplyPromoCodeFailed |
| isEmpty | ()&nbsp;&#8209;>&nbsp;bool | returns if order.items.length == 0 |
| promoMessage | string | current status of the promotional code |

###### Events ######
| Name | Description |
| --- | --- |
| ApplyPromoCode | fired when applyPromoCode() is called |
| ApplyPromoCodeFailed | fired when applyPromoCode() gets a failed result, promoMessage is set to the error in this case |
| ApplyPromoCodeSuccess | fired when applyPromoCode() gets a successful result |

### checkout ###
The checkout container validates the customers shipping and billing information and handles
submitting the customer's card to complete the checkout step.

###### Data Fields ######
| Name | Type | Description |
| --- | --- | --- |
| user.email | string | required, must be an email |
| user.name | string | required, splits on first space to populate user.firstName and user.lastName |
| user.firstName | string | derived from user.name  |
| user.lastName | string | derived from user.name  |
| order.shippingAddress.line1 | string | required, street address |
| order.shippingAddress.line2 | string | apartment number, suit number, PO box etc. |
| order.shippingAddress.city | string | required, city |
| order.shippingAddress.isPostalRequired | string | required only if postal codes are required for the user's country |
| order.shippingAddress.country | string | required, ISO 3166-1 alpha-2 country codes |
| payment.account.number | string | required, valid credit card number |
| payment.account.expiry | string | required, valid expiration number in either MM/YYYY or MM/YY|
| payment.account.cvc | string | required, valid card security code number |
| terms | bool | required, whether or not the user agrees to the terms |

###### Services ######
| Name | Type | Description |
| --- | --- | --- |
| checkedOut | bool | true when checkout submit is successful |
| errorMessage | string | error from the last attempted checkout submit if there was one |
| loading | bool | true when checkout submit is processing, false otherwise |
| submit | ()&nbsp;&#8209;>&nbsp; | submit a charge request with the customer's information |

###### Events ######
| Name | Description |
| --- | --- |
| Submit | fired when submit() is called |
| SuccessFailed | fired when submit() gets a failed result, errorMessage is setto the error-category in this case |
| SubmitSuccess | fired when submit() gets a successful result |

### checkout-shippingaddress ###
The checkout-shippingaddress container handles just the parts of checkout related to the
customer's shipping address.  This is useful when doing a multi-page checkout
flow with checkout-shipping on the first page and checkout on the second page.
Shipping data will propagate from checkout-shipping to checkout.

###### Data Fields ######
| Name | Type | Description|
| --- | --- | --- |
| user.email | string | required, must be an email |
| user.name | string | required, splits on first space to populate user.firstName and user.lastName |
| user.firstName | string | derived from user.name  |
| user.lastName | string | derived from user.name  |
| order.shippingAddress.line1 | string | required, street address |
| order.shippingAddress.line2 | string | apartment number, suit number, PO box etc. |
| order.shippingAddress.city | string | required, city |
| order.shippingAddress.isPostalRequired | string | required only if postal codes are required for the user's country |
| order.shippingAddress.country | string | required, ISO 3166-1 alpha-2 country codes |

###### Services ######
| Name | Type | Description |
| --- | --- | --- |
| submit | ()&nbsp;&#8209;>&nbsp; | submit a user's shipping information information |

###### Events ######
n/a

### lineitems ###
The lineitems container loops over and displays an order's or cart's line items (usually the order.items field).
The lineitems must be used inside of either a cart or orders container.
Internally, a lineitems container simply wraps a lineitem container in a loop.

Template data inside of a lineitems container's HTML tags are passed onto
each lineitem container and will be transcluded in lineitem.

It is best to use this container inside another container instead of at the top
level so it can be rendered along side other order information.

###### Data Fields ######
n/a

###### Services ######
n/a

### lineitem ###
The lineitem container exposes an item and records quantity data. It is not used
directly in most cases. It should be used implicitly as part of the lineitems
container instead. When using lineitem containers directly, parentData (via parent-data
attribute, e.g. <lineitem parent-data="{ data.get('order') }" /> ) must be set to the order data.

###### Data Fields ######
| Name | Type | Description |
| --- | --- | --- |
| quantity | integer | required, number of a particular item |

###### Services ######
n/a

###### Events ######
n/a

---

## Controls ##

### checkbox-control ###
The checkbox control creates and binds a checkbox.

###### Attributes ######

| Name | Description |
| --- | --- |
| lookup | data field to bind to e.g. <checkbox-control lookup="{ terms }"/> |

###### Variants ######

| Name | Description |
| --- | --- |
| terms | lookup = terms |

### select-control ###
The select control creates and binds a platform-agnostic select based on
[selectize.js](http://selectize.github.io/selectize.js/).  It is simplist to base custom styling
on the skins available here.

###### Attributes ######

| Name | Description |
| --- | --- |
| lookup | data field to bind to e.g. <select-control lookup="{ order.shippingaddress.country }"/> |
| placeholder | input's placeholder text |
| read-only | set to anything to make the select readOnly |
| selectOptions | a map of values to names to render as the select options |

###### Variants ######
| Name | Description |
| --- | --- |
| quantity | lookup = quantity, options are a list of numbers from 0 to 99, use in lineitem |
| shippingaddress-country | lookup = order.shippingaddress-country, options are a list of countries |

### text-control ###
The text control creates and binds a text-input.

###### Attributes ######

| Name | Description |
| --- | --- |
| auto-complete | on to enable input auto-complete or off to disable it |
| lookup | data field to bind to e.g. <text-control lookup="{ user.name }"/> |
| placeholder | input's placeholder text |
| type | input's type |

###### Variants ######

| Name | Description |
| --- | --- |
| card-number | lookup = payment.account.number, formats as card number |
| card-expiry | lookup = payment.account.expiry, formats as a date |
| card-cvc | lookup = payment.account.cvc, formats as a CVC |
| promocode | lookup = order.promoCode |
| shippingaddress-line1 | lookup = order.shippingAddress.line1 |
| shippingaddress-line2 | lookup = order.shippingAddress.line2 |
| shippingaddress-city | lookup = order.shippingAddress.city |
| shippingaddress-postalcode | lookup = order.shippingAddress.postalCode |
| shippingaddress-state | lookup = order.shippingAddress.state |
| user-name | lookup = user.email |

---

## Event Reference ##
These constants can be accessed via Shop.Events.<EventName> or the string value can be used instead


| Name | String Value | Payload | Description |
| --- | --- | --- | --- |
| ApplyPromoCode | apply-promocode | string | fired when a cart container submits its promo code |
| ApplyPromoCodeFailed | apply-promocode-failed | Error | fired when a promo code is not applicable |
| ApplyPromoCodeSuccess | apply-promocode-success | string | fired when a promo code is applicable |
| Change | change | string, any | fired when any data field changes with the string name and original value |
| ChangeFailed | change-failed | string, any |  fired when any data field change fails with the string name and original value |
| ChangeSuccess | change-success | string, any | fired when any data field change finishes with the string name and new value |
| Login | login | n/a | fired when a login container submits login credentials |
| LoginFailed | login-failed | Error | fired when login is unsuccessful |
| LoginSuccess | login-success | AccessToken | fired when login is successful with accessToken |
| ProfileLoad | profile-load | n/a | fired when profile is initialized |  |
| ProfileLoadFailed | profile-load-failed | Error | fired when profile is unsuccessfully loaded |
| ProfileLoadSuccess |profile-load-success | User | fired when profile is successfully loaded |
| ProfileUpdate | profile-update | n/a | fired when profile is submitted |
| ProfileUpdateFailed | profile-update-failed | Error | fired on unsuccessful profile update |
| ProfileUpdateSuccess | profile-update-success | User | fired on successful profile update   |
| Ready | ready | n/a |fired when containers are done initializing |
| Register | register | n/a | fired when a register container submits registration data |
| RegisterFailed | register-failed | Error | fired when a registration is unsuccessful |
| RegisterSuccess | register-success | RegistrationResponse | fired when a registration is successful |
| SetData | set-data | ReferrentialTree | fired when data is loaded into containers |
| ShippingAddressUpdateFailed | shipping-address-update-failed | Error | fired on unsuccessful order shipping address update |
| ShippingAddressUpdate | shipping-address-update | n/a | fired when an order container's shipping address is updated |
| ShippingAddressUpdateSuccess | shipping-address-update-success | Order | fired on successful order shipping address update|
| Submit | submit | n/a | fired when a checkout container issues a checkout command to the backend |
| SubmitFailed | submit-failed | Error | fired on an unsuccessful checkout |
| SubmitShippingAddress | submit-shipping-address | n/a | fired when a checkout-shippingaddress container submits |
| SubmitSuccess | submit-success | n/a | fired on a successful checkout |
| TryUpdateItem | try-update-item | string | fired when setItem is called with the id specified |
| UpdateItem | update-item | Item | fired when setItem is complete |
| UpdateItems | update-items | Item[] | fired when setItem is complete with all items |

>>>>>>> master
