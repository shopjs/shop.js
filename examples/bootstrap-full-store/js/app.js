//
// Shop.js Full Store Example
//

//
// Pull in Shop.js module CommonJS module
//
const Shop = require('shop.js');

//
// Start execution when all scripts are loaded.  We have to wait for all scripts because there are jquery plugins that need to be
// loaded as part of Shop.js
//
$(window).load(() => {
  //
  // Shop.use supports overwriting of the internal templates.
  // This is commonly done with the error template for the low level form controls to support various frameworks.
  // The below example is for Bootstrop.
  //
  Shop.use({
    Controls: {
      Error: '<div class="text-danger" if="{ errorMessage }">{ errorMessage }</div>'
    }
  });

  //
  // Shop.start starts the rendering engine with the passed in options and returns a reference to the Shop.js global
  // event mediator object.
  //
  const m = Shop.start(require('./settings'));

  //
  // The 'submit-success' event is sent when the user successfully submits a payment and it is successfully charged.
  //
  m.on('submit-success', () => {
    //
    // Show the thank you message after a user successfully checks out. Hide the checkout form since checkout submit
    // was a success.
    //
    $('.thanks.hidden').removeClass('hidden');
    $('.co-body').addClass('hidden');
  });

  //
  // Shop.isEmpty returns true if there are no items in the cart currently.
  // This code redirects the user to the index if the cart is empty on /checkout/index.html
  //
  if (window.location.pathname === '/checkout/') {
    if (Shop.isEmpty()) {
      window.location = '/';
    }
  }

  //
  // When the user clicks the .checkout-btn, redirect the user to the checkout page.
  //
  $checkoutButton.on('click', event => {
    window.location = 'checkout';
  })
});
