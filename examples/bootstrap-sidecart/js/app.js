
var Shop = require('shop.js');

Shop.use({
  Controls: {
    Error: '<div class="bootstrap classes" if="{ errorMessage}">{ errorMessage }</div>'
  }
});

var m = Shop.start(require('./settings'));

window.m = m;

$('.buy-button').on('click', function(event) {
  if(!Shop.getItem('droney'))
    Shop.setItem('droney', 1);
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
