
var Shop = require('shop.js');

Shop.use({
  Controls: {
    Error: '<div class="bootstrap classes" if="{ errorMessage}">{ errorMessage }</div>'
  }
});

var m = Shop.start(require('./settings'));

window.m = m;

$('.buy-button').on('click', (event) => {
  if(!Shop.getItem('droney'))
    Shop.setItem('droney', 1);
});
