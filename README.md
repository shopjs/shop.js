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

---
##Containers and Controls##
Containers are Custom HTML tags that define a section of dynamic content.
Controls are very simple composeable widgets that provide ui inputs and outputs
for users.  Containers can contain other containers or controls.

## Special Variables ##

### data ###
A reference to the global data [referrential tree](https://github.com/zeekay/referential)
that's passed into the Shop.start function can be referenced from most
containers by using the 'data' variable.

The exceptions to this rule are lineitem and order which are used internally by
the looping containers lineitems and orders respectively.  The 'data' in these containers refer
to the specific item that's currently being looped over.  For example a lineitems container loops over order.items, a lineitem container's
'data' variable refers to the specific item being looped over.

### parent-data ###

Both lineitem and order both have a 'parent-data' variable that refer to their
immediate parents's for composeability reasons, namely to get fields like
'currency' relatively the parent order for rendering items.

### parent ###
The 'parent' variable references the parent container of the current container.
It is useful for using data fields or invoking services of a parent container.
Be aware that the root container has no parent set.

###### All Containers Read-Only Data Fields ######
Read-only data fields should not be modified.

| Field | Type | Notes |
| --- | --- | --- |
| order.currency | string | 3 character ISO 4217 code |

###### All Containers Services ######

| Service | Signature | Description |
| --- | --- | --- |
| renderCurrency | (code&nbsp;string,&nbsp;cents&nbsp;number)&nbsp;&#8209;>&nbsp;string |  **code** is a currency's ISO 4217 code, **cents** is the currency in cents (or lowest unit in the case of zero decimal currencies like JPY), returns a localized value with currency symbol |
| renderDate | (date time,&nbsp;format string)&nbsp;&#8209;>&nbsp;string | refer to moment(...).format(...) documentation [here](http://momentjs.com/docs/#/parsing/string-format/)

### cart ###
The cart container renders cart items and handles the processing of promotional codes.

###### Data Fields ######
| Field | Type | Notes |
| --- | --- | --- |
| order.promoCode | string | promotional code (coupon) |

###### Read-only Data Fields ######
| Field | Type | Notes |
| --- | --- | --- |
| promoMessage | string | current status of the promotional code |
| applying | string | true when applyPromoCode is processing, false otherwise |

###### Services ######
| Service | Signature | Description |
| --- | --- | --- |
| isEmpty | ()&nbsp;&#8209;>&nbsp;bool | returns if order.items.length == 0 |
| applyPromoCode | ()&nbsp;&#8209;>&nbsp; | submits promo code for discount adjustment, issues ApplyPromoCode, ApplyPromoCodeSuccessful, and ApplyPromoCodeFailed |

###### Events ######
| Event | Condition |
| --- | --- |
| ApplyPromoCode | fired when applyPromoCode() is called |
| ApplyPromoCodeSuccess | fired when applyPromoCode() gets a successful result |
| ApplyPromoCodeFailed | fired when applyPromoCode() gets a failed result,
promoMessage is set to the error in this case |

###### Child Containers ######
lineitems

### checkout ###
The checkout container validates the customers shipping and billing information and handles
submitting the customer's card to complete the checkout step.

###### Data Fields ######
| Field | Type | Notes |
| --- | --- | --- |
| user.email | string | required, must be an email |
| user.name | string | required, splits on first space to populate user.firstName and user.lastName |
| user.firstName | string | derived from user.name  |
| user.lastName | string | derived from user.name  |
| order.shippingAddress.line1 | string | required, street address |
| order.shippingAddress.line2 | string | apartment number, suit number, PO box etc. |
| order.shippingAddress.city | string | required, city |
| order.shippingAddress.isPostalRequired | string | required only if postal
codes are required for the user's country |
| order.shippingAddress.country | string | required, ISO 3166-1 alpha-2 country
codes |
| payment.account.number | string | required, valid credit card number |
| payment.account.expiry | string | required, valid expiration number in either
MM/YYYY or MM/YY|
| payment.account.cvc | string | required, valid card security code number |
| terms | bool | required, whether or not the user agrees to
the terms |

###### Read-only Data Fields ######
| Field | Type | Notes |
| --- | --- | --- |
| errorMessage | string | error from the last attempted checkout submit if there
was one |
| loading | bool | true when checkout submit is processing, false otherwise
| checkedOut | bool | true when checkout submit is successful |

###### Services ######
| Service | Signature | Description |
| --- | --- | --- |
| submit | ()&nbsp;&#8209;>&nbsp; | submit a charge request with the customer's
information |

###### Events ######
| Event | Condition |
| --- | --- |
| Submit | fired when submit() is called |
| SubmitSuccess | fired when submit() gets a successful result |
| SuccessFailed | fired when submit() gets a failed result,
errorMessage is set to the error in this case |

### checkout-shippingaddress ###
The checkout-shippingaddress container handles just the parts of checkout related to the
customer's shipping address.  This is useful when doing a multi-page checkout
flow with checkout-shipping on the first page and checkout on the second page.
Shipping data will propagate from checkout-shipping to checkout.

###### Data Fields ######
| Field | Type | Notes |
| --- | --- | --- |
| user.email | string | required, must be an email |
| user.name | string | required, splits on first space to populate user.firstName and user.lastName |
| user.firstName | string | derived from user.name  |
| user.lastName | string | derived from user.name  |
| order.shippingAddress.line1 | string | required, street address |
| order.shippingAddress.line2 | string | apartment number, suit number, PO box etc. |
| order.shippingAddress.city | string | required, city |
| order.shippingAddress.isPostalRequired | string | required only if postal
codes are required for the user's country |
| order.shippingAddress.country | string | required, ISO 3166-1 alpha-2 country
codes |

###### Read-only Data Fields ######
n/a

###### Services ######
| Service | Signature | Description |
| --- | --- | --- |
| submit | ()&nbsp;&#8209;>&nbsp; | submit a user's shipping information
information |

### lineitems ###
The lineitems container loops over and displays an order's or cart's line items (usually the order.items field).
The lineitems must be used inside of either a cart or orders container.
Internally, a lineitems container simply wraps a lineitem container in a loop.

###### Data Fields ######
n/a

###### Read-only Fields ######
n/a

###### Services ######
n/a

---

## Controls ##

---

## Event Reference ##
These constants can be accessed via Shop.Events.<EventName> or the string value can be used instead


| EventName | String Value | Payload | Description |
| --- | --- | --- | --- |
| Ready | ready | n/a |fired when containers are done initializing |
| SetData | set-data | ReferrentialTree | fired when data is loaded into containers |
| TryUpdateItem | try-update-item | string | fired when setItem is called with the id specified |
| UpdateItem | update-item | Item | fired when setItem is complete |
| UpdateItems | update-items | Item[] | fired when setItem is complete with all items |
| Change | change | string, any | fired when any data field changes with the string name and original value |
| ChangeSuccess | change-success | string, any | fired when any data field change finishes with the string name and new value |
| ChangeFailed | change-failed | string, any |  fired when any data field change fails with the string name and original value |
| Submit | submit | n/a | fired when a checkout container issues a checkout command to the backend |
| SubmitShippingAddress | submit-shipping-address | n/a | fired when a checkout-shippingaddress container submits |
| SubmitSuccess | submit-success | n/a | fired on a successful checkout |
| SubmitFailed | submit-failed | Error | fired on an unsuccessful checkout |
| ApplyPromoCode | apply-promocode | string | fired when a cart container submits its promo code |
| ApplyPromoCodeSuccess | apply-promocode-success | string | fired when a promo code is applicable |
| ApplyPromoCodeFailed | apply-promocode-failed | Error | fired when a promo code is not applicable |
| Login | login | n/a | fired when a login container submits login credentials |
| LoginSuccess | login-success | AccessToken | fired when login is successful with accessToken |
| LoginFailed | login-failed | Error | fired when login is unsuccessful |
| Register | register | n/a | fired when a register container submits registration data |
| RegisterSuccess | register-success | RegistrationResponse | fired when a registration is successful |
| RegisterFailed | register-failed | Error | fired when a registration is unsuccessful |
| ProfileLoad | profile-load | n/a | fired when profile is initialized |  |
| ProfileLoadSuccess |profile-load-success | User | fired when profile is successfully loaded |
| ProfileLoadFailed | profile-load-failed | Error | fired when profile is unsuccessfully loaded |
| ProfileUpdate | profile-update | n/a | fired when profile is submitted |
| ProfileUpdateSuccess | profile-update-success | User | fired on successful profile update   |
| ProfileUpdateFailed | profile-update-failed | Error | fired on unsuccessful profile update |
| ShippingAddressUpdate | shipping-address-update | n/a | fired when an order container's shipping address is updated |
| ShippingAddressUpdateSuccess | shipping-address-update-success | Order | fired on successful order shipping address update|
| ShippingAddressUpdateFailed | shipping-address-update-failed | Error | fired on unsuccessful order shipping address update |
