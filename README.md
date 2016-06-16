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
##Containers##

###### All Containers Read-Only Data Fields ######

| Field | Type | Notes |
| --- | --- | --- |
| order.currency | string | 3 character ISO 4217 code |

###### All Containers Services ######

| Service | Signature | Description |
| --- | --- | --- |
| renderCurrency | (code&nbsp;string,&nbsp;cents&nbsp;number)&nbsp;&#8209;>&nbsp;string |  **code** is a currency's ISO 4217 code, **cents** is the currency in cents (or lowest unit in the case of zero decimal currencies like JPY), returns a localized value with currency symbol |
| renderDate | (date time,&nbsp;format string)&nbsp;&#8209;>&nbsp;string | refer to moment(...).format(...) documentation [here](http://momentjs.com/docs/#/parsing/string-format/)


### cart ###
Cart renders cart items and promotional code.

###### Data Fields ######
| Field | Type | Notes |
| --- | --- | --- |
| order.promoCode | string | promotional code (coupon) |
| order.items | lineitem[] | |

###### Services ######
| Service | Signature | Description |
| --- | --- | --- |
| isEmpty | ()&nbsp;&#8209;>&nbsp;bool | returns if order.items.length == 0 |
| applyPromoCode | ()&nbsp;&#8209;>&nbsp; | issues Events.

###### 

### checkout ###

###### Data Fields ######
| Field | Type | Notes |
| --- | --- | --- |
| user.email | string | required, must be an email |
| user.name | string | required, splits on first space to populate user.firstName and user.lastName |
| user.firstName | string | derived from user.name  |
| user.lastName | string | derived from user.name  |
| order.shippingAddress.line1 | string | required, street address |
| order.shippingAddress.line2 | string | Apartment Number, Suit Number, PO Box etc. |

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
| ApplyPromoCode | apply-promocode | string | fired when a cart containter submits its promo code |
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
