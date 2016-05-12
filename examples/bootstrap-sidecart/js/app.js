
const Shop = require('shop.js');

$(window).load(() => {
  Shop.use({
    Controls: {
      Error: '<div class="bootstrap classes" if="{ errorMessage }">{ errorMessage }</div>'
    }
  });

  const m = Shop.start(require('./settings'));

  m.on('ready', () => {
    $('.loading').removeClass('loading');
  });

  m.on('submit-success', () => {
    $('.thanks.hidden').removeClass('hidden');
  });

  window.m = m;

  // redirect user to index if cart is empty on /checkout/index.html
  if (window.location.pathname === '/checkout/') {
    if (Shop.isEmpty()) {
      window.location = '/';
    }
  }

  // /index.html
  $('.buy-button').on('click', function(event) {
    if(!Shop.getItem('droney-2.0'))
      Shop.setItem('droney-2.0', 1);
    // show cart
    $('.side-cart').removeClass('hidden');
    // disable checkout button
    $(this).attr('disabled', true);
  });

  // this button will only be viewable after .buy-button has been clicked.
  $('#back').on('click', event => {
    $('.side-cart').addClass('hidden');
    $('.buy-button').attr('disabled', false);
  });

  $('.checkout-btn').on('click', event => {
    window.location = 'checkout';
  })
});
