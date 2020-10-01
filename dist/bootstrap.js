import React from 'react';
import ReactDOM from 'react-dom';
import './poly';
import { useLocalStore, useObserver } from 'mobx-react';
import { Checkout, Cart, CartCount, PaymentForm, ShippingForm } from './components';
import getStore from './stores';
const checkout = (client, opts = {}) => {
    let el = opts.el;
    const ShopJS = () => {
        const shopStore = useLocalStore(() => (getStore(client, { track: (event, opts) => console.log(event, opts) })));
        return useObserver(() => (React.createElement(Checkout, { forms: [PaymentForm, ShippingForm], stepLabels: ['Payment Info', 'Shipping Info', 'Confirm Order'], contactIcon: opts.contactIcon, contactTitle: opts.contactTitle, shippingIcon: opts.shippingIcon, shippingTitle: opts.shippingTitle, paymentIcon: opts.paymentIcon, paymentTitle: opts.paymentTitle, cartIcon: opts.cartIcon, cartTitle: opts.cartTitle, address: shopStore.address, setAddress: (k, v) => shopStore.setAddress(k, v), order: shopStore.order, setOrder: (k, v) => shopStore.setOrder(k, v), payment: shopStore.payment, setPayment: (k, v) => shopStore.setPayment(k, v), user: shopStore.user, setUser: (k, v) => shopStore.setUser(k, v), setCoupon: (c) => shopStore.setCoupon(c), checkout: () => shopStore.checkout(), setItem: (id, quantity) => shopStore.setItem(id, quantity), countryOptions: shopStore.countryOptions, stateOptions: shopStore.stateOptions, isLoading: shopStore.isLoading, track: (event, opts) => shopStore.track(event, opts), termsUrl: opts.termsUrl || '/terms', showDescription: opts.showDescription, showTotals: opts.showTotals, cartCheckoutUrl: opts.cartCheckoutUrl, nativeSelects: opts.nativeSelects })));
    };
    ReactDOM.render(React.createElement(ShopJS, null), el);
};
export default checkout;
export const cart = (client, opts = {}) => {
    let el = opts.el;
    const ShopJSCart = () => {
        const shopStore = useLocalStore(() => (getStore(client, { track: (event, opts) => console.log(event, opts) })));
        return useObserver(() => (React.createElement(Cart, { cartIcon: opts.cartIcon, cartTitle: opts.cartTitle, order: shopStore.order, setCoupon: (c) => shopStore.setCoupon(c), setItem: (id, quantity) => shopStore.setItem(id, quantity), locked: opts.locked, showDescription: opts.showDescription, showTotals: opts.showTotals, cartCheckoutUrl: opts.cartCheckoutUrl, nativeSelects: opts.nativeSelects })));
    };
    ReactDOM.render(React.createElement(ShopJSCart, null), el);
};
export const count = (client, opts = {}) => {
    let el = opts.el;
    const ShopJSCartCount = () => {
        const shopStore = useLocalStore(() => (getStore(client, { track: (event, opts) => console.log(event, opts) })));
        return useObserver(() => (React.createElement(CartCount, { count: shopStore.count })));
    };
    ReactDOM.render(React.createElement(ShopJSCartCount, null), el);
};
export const shopify = function (client, opts = {}) {
    const css = document.createElement('style');
    css.type = 'text/css';
    const styles = `
  .cart-drawer.drawer .cart-items {
    padding: 0 !important;
  }
  .cart-drawer.drawer .cart {
    padding: 0 !important;
  }
  .cart-drawer.drawer .cart-icon {
    display: none;
  }
  .cart-drawer.drawer .cart-your-items-title {
    display: none;
  }
  #your-shopping-cart form.cart,
  #your-shopping-cart main section > .wrapper {
    display: none;
  }
  .shopify-payment-button {
    display: none;
  }
  `;
    css.appendChild(document.createTextNode(styles));
    document.getElementsByTagName('head')[0].appendChild(css);
    // replace side cart element
    const cartEl1 = document.getElementById('CartContainer');
    if (cartEl1) {
        cartEl1.removeAttribute('id');
        const cartEl2 = cartEl1.cloneNode(true);
        cartEl1.parentNode.replaceChild(cartEl2, cartEl1);
        // init side cart
        cart(client, {
            ...opts,
            el: cartEl2,
            showDescription: false,
            nativeSelects: true,
        });
    }
    // replace count element
    const countEl1 = document.getElementById('CartCount');
    if (countEl1) {
        countEl1.removeAttribute('id');
        const countEl2 = countEl1.cloneNode(true);
        countEl1.parentNode.replaceChild(countEl2, countEl1);
        // init count
        count(client, {
            ...opts,
            el: countEl2,
            showDescription: false,
            nativeSelects: true,
        });
    }
    // replace cart with checkout
    const checkoutEl1 = document.querySelector('#your-shopping-cart form.cart, #your-shopping-cart main section > *');
    if (checkoutEl1) {
        checkoutEl1.removeAttribute('id');
        const checkoutEl2 = document.createElement('div');
        checkoutEl2.classList.add('cart');
        checkoutEl1.parentNode.replaceChild(checkoutEl2, checkoutEl1);
        // init checkout
        checkout(client, {
            ...opts,
            el: checkoutEl2,
            showDescription: false,
            nativeSelects: true,
        });
    }
    // add events to cart button
    const buttonEl = document.querySelector('button.addToCart');
    if (buttonEl) {
        const formEl = buttonEl.closest('form');
        formEl.action = '';
        formEl.method = '';
        formEl.addEventListener('submit', (event) => {
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
        buttonEl.addEventListener('click', (event) => {
            const formEl = buttonEl.closest('form');
            let options = ([].slice.call(formEl.querySelectorAll('select.single-option-selector')));
            let slug = '';
            let slugOpts = options.map((d, i) => {
                console.log(`option${i}`, d.classList);
                const classes = [].slice.call(d.classList);
                classes.map((x) => {
                    let res = (/single-option-selector-section-(.*)/g).exec(x);
                    if (res && res[1]) {
                        slug = res[1];
                    }
                });
                return d.value;
            });
            slug = `${slug}-${slugOpts.join('-')}`;
            const quantity = parseInt(document.getElementById('Quantity').value, 10);
            console.log('slug', slug, quantity);
            const s = getStore();
            s.addItem(slug, quantity);
            document.querySelector('.js--drawer-open-right').click();
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
    }
};
