//
// Shop.js Singe Page App Example
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

  m.on('submit-success', () => {
    //
    // Show the thank you message after a user successfully checks out. Hide the checkout form since checkout submit
    // was a success.
    //
    $('.thanks.hidden').removeClass('hidden');
    $('.checkout').addClass('hidden');
  });

  //
  // The .side-cart is the side cart modal
  //
  $sideCart = $('.side-cart');

  //
  // The .checkout is the checkout dialog. .checkout is hidden until
  // the .checkout-button is clicked.
  //
  $checkout = $('.checkout');

  //
  // The .buy-button opens the side cart
  //
  $buyButton = $('.buy-button');

  //
  // The .back-button closes the side cart
  //
  $backButton = $('.back-button');

  //
  // The .checkout-button submits the cart to checkout
  //
  $checkoutButton = $('.checkout-button')

  //
  // The .checkout-back-button exits the checkout and displays normal page content.
  //
  $checkoutBackButton = $('.checkout-back-button');

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
  // When the user clicks the .checkout-button, show checkout dialog
  // and hide other page content.
  //
  $checkoutButton.on('click', event => {
    //
    // Hide the side cart
    //
    $sideCart.addClass('hidden');

    //
    // Show the checkout dialog
    //
    $checkout.removeClass('hidden');

    //
    // Hide other page content when checking out
    //
    $('.hide-when-co').addClass('hidden');

    //
    // Scroll the page to the top of the checkout.
    //
    $('html, body').animate({
      scrollTop: $checkout.offset().top
    }, 200);
  });

  //
  // When the user clicks the .checkout-back-button, remove (hide) the checkout
  // dialog and show the default page content.
  //
  $checkoutBackButton.on('click', event => {
    //
    // Hide the checkout dialog
    //
    $checkout.addClass('hidden');

    //
    // enable the .buy-button
    //
    $buyButton.attr('disabled', false);

    //
    // Show the default page content
    //
    $('.hide-when-co').removeClass('hidden');

    //
    // Scroll the page back to the top.
    //
    $('html, body').animate({
      // 50 is the height of the navbar.
      scrollTop: 50
    }, 200);
  });
});
