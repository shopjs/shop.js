//
// Shop.js Side Cart Example
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
  // The 'ready' event is sent when Shop.js has finished its first rendering and all the dynamic content is loaded
  //
  m.on('ready', () => {
    //
    // Remove the content loading class to hide the loading spinner and show the dynamic content.
    //
    $('.loading').removeClass('loading');
  });

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
  // The .buy-button is on index.html and opens the side cart
  //
  $buyButton = $('.buy-button');

  //
  // .back-button is on the index.html and closes the side cart
  //
  $backButton = $('.back-button');

  //
  // The .side-cart is on index.html
  //
  $sideCart = $('.side-cart');

  //
  // The .checkoutbtn is on index.html and submits the cart to checkout
  //
  $checkoutButton = $('.checkout-button')

  //
  // When the user clicks the .buy-button, add a Droney 2.0 to the user's cart, and then show the
  // side cart.
  //
  $buyButton.on('click', (event) => {
    //
    // If there is no Droney item of any type in the cart, add it 1.
    //
    if(!Shop.getItem('droney-2.0'))
      Shop.setItem('droney-2.0', 1);

    //
    // Show the side cart
    //
    $sideCart.removeClass('hidden');

    //
    // Disable the .buy-button
    //
    $buyButton.attr('disabled', true);
  });

  //
  // When the user clicks .back-button, close the side cart
  //
  $backButton.on('click', event => {
    //
    // Hide the side cart
    //
    $sideCart.addClass('hidden');

    //
    // Enable the .buy-button
    //
    $buyButton.attr('disabled', false);
  });

  //
  // When the user clicks the .checkout-btn, redirect the user to the checkout page.
  //
  $checkoutButton.on('click', event => {
    window.location = 'checkout';
  })
});
