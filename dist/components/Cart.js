import React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { MUIText, } from '@hanzo/react';
import { renderUICurrencyFromJSON, } from '@hanzo/utils';
import { Button, Grid, Link, } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
const useStyles = makeStyles((theme) => ({
    right: {
        textAlign: 'right',
    },
    bold: {
        fontWeight: 700,
    },
    coupon: {
        paddingBottom: theme.spacing(2),
    },
    lineSpacing: {
        paddingBottom: theme.spacing(1),
    },
    total: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        '& > *': {
            fontWeight: 800,
        },
    },
    couponInput: {
        '& .MuiInputBase-root': {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderRight: 0,
        },
    },
    couponButton: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        border: '1px solid',
        borderColor: 'rgba(0, 0, 0, 0.23)',
        paddingTop: 7,
        paddingBottom: 7,
    },
    cartItems: {
        paddingTop: theme.spacing(2),
    },
    cartItem: {
        paddingBottom: theme.spacing(2),
    },
    cartItemPrice: {
        transform: 'translate(0, 4px)',
    },
    cartItemImg: {
        width: 120,
        maxWidth: '33%',
    },
    cartImg: {
        width: '100%',
    },
    cartDescription: {
        '& *': {
            margin: 0,
        },
    },
    summaryNumber: {
        width: 120,
        maxWidth: '40%',
    },
    checkoutButton: {
        marginTop: theme.spacing(2),
    },
}));
import { Box, Typography, } from '@material-ui/core';
const quantityOpts = {};
for (let i = 0; i < 100; i++) {
    quantityOpts[i] = i;
}
const Cart = ({ order, setCoupon, setItem, locked, cartIcon, cartTitle, showDescription, showTotals, cartCheckoutUrl, nativeSelects, }) => {
    const classes = useStyles();
    const hasCountry = !!order.shippingAddress.country;
    const hasState = !!order.shippingAddress.state;
    const hasShipping = !!order.shipping;
    const hasTax = !!order.tax;
    const canCalculate = (hasCountry && hasState) || hasTax || hasShipping;
    return (React.createElement(Box, { p: [2, 3, 4], className: 'cart', onMouseDown: (event) => {
            event.stopPropagation();
        } },
        React.createElement(Grid, { container: true },
            React.createElement(Grid, { item: true, xs: 12, className: 'cart-header' },
                React.createElement(Grid, { container: true, spacing: 1, alignItems: 'center' },
                    React.createElement(Grid, { item: true, className: 'cart-icon' }, cartIcon || React.createElement(ShoppingCartIcon, { style: { fontSize: '2rem' } })),
                    React.createElement(Grid, { item: true, className: 'cart-title' }, !!(order.items && order.items.length && order.items.length > 0)
                        ? cartTitle || (React.createElement(Typography, { variant: 'h6', className: 'cart-your-items-title' }, "Your Items"))
                        : React.createElement(Typography, { variant: 'h6', className: 'cart-is-empty-title' }, "Your Cart Is Empty.")))),
            !!(order.items && order.items.length && order.items.length > 0)
                && React.createElement(Grid, { item: true, xs: 12 },
                    React.createElement("div", { className: classnames(classes.cartItems, 'cart-items') }, order.items.map((item) => {
                        return (React.createElement(Grid, { container: true, alignItems: 'center', key: item.name, className: classnames('cart-item', classes.cartItem) }, item.imageURL
                            ? (React.createElement(React.Fragment, null,
                                React.createElement(Grid, { container: true, spacing: 2 },
                                    React.createElement(Grid, { item: true, className: classnames('cart-item-image', classes.cartItemImg) },
                                        React.createElement("img", { src: item.imageURL, alt: item.name, className: classes.cartImg })),
                                    React.createElement(Grid, { item: true, xs: true, className: 'cart-item-text' },
                                        React.createElement(Typography, { className: 'cart-item-name', variant: 'body1' },
                                            React.createElement("strong", null, item.name)),
                                        showDescription !== false && React.createElement(Typography, { className: classnames('cart-item-description', classes.cartDescription), variant: 'body2', dangerouslySetInnerHTML: { __html: item.description } }),
                                        React.createElement("br", null))),
                                React.createElement(Grid, { container: true, spacing: 2 },
                                    React.createElement(Grid, { item: true, xs: true, className: 'cart-item-spacer' }),
                                    React.createElement(Grid, { item: true, className: classnames(classes.cartItemPrice, classes.right, 'cart-item-price') },
                                        React.createElement(Typography, { variant: 'body1' },
                                            renderUICurrencyFromJSON(order.currency, item.price),
                                            "\u00A0x")),
                                    React.createElement(Grid, { item: true, className: classnames(classes.right, 'cart-item-quantity') },
                                        React.createElement(MUIText, { select: true, disabled: item.locked || locked, options: quantityOpts, value: item.quantity, setValue: (quantity) => {
                                                setItem(item.id, parseInt(quantity, 10));
                                            }, SelectProps: { native: !!nativeSelects } }))),
                                React.createElement("br", null))) : (React.createElement(React.Fragment, null,
                            React.createElement(Grid, { container: true, spacing: 2 },
                                React.createElement(Grid, { item: true, xs: 12, sm: 8, className: 'cart-item-name' },
                                    React.createElement(Typography, { variant: 'body1' }, item.name),
                                    React.createElement(Typography, { variant: 'body2' }, item.description),
                                    React.createElement("br", null)),
                                React.createElement(Grid, { item: true, xs: 8, sm: 2, className: classnames(classes.right, 'cart-item-price') },
                                    React.createElement(Typography, { variant: 'body1' },
                                        renderUICurrencyFromJSON(order.currency, item.price),
                                        "\u00A0x")),
                                React.createElement(Grid, { item: true, xs: 4, sm: 2, className: classnames(classes.right, 'cart-item-quantity') },
                                    React.createElement(MUIText, { select: true, disabled: item.locked || locked, options: quantityOpts, value: item.quantity, setValue: (quantity) => {
                                            setItem(item.id, parseInt(quantity, 10));
                                        } }))),
                            React.createElement("br", null)))));
                    }))),
            !!(order.items && order.items.length && order.items.length > 0)
                && React.createElement(React.Fragment, null,
                    React.createElement(Grid, { item: true, xs: 12, className: classnames(classes.coupon, 'cart-coupon') },
                        React.createElement("div", null,
                            React.createElement(Grid, { container: true },
                                React.createElement(Grid, { item: true, xs: 8, sm: 10, md: 9 },
                                    React.createElement(MUIText, { className: classes.couponInput, fullWidth: true, disableAutoChange: true, variant: 'outlined', size: 'small', placeholder: 'Coupon Code', defaultValue: order.couponCodes[0], setValue: (code) => setCoupon(code), disabled: locked })),
                                React.createElement(Grid, { item: true, xs: 4, sm: 2, md: 3 },
                                    React.createElement(Button, { className: classes.couponButton, fullWidth: true, disableElevation: true, size: 'medium', variant: 'contained', disabled: locked }, "Apply"))))),
                    React.createElement(Grid, { item: true, xs: 12, className: 'cart-summary' },
                        React.createElement("div", null,
                            !canCalculate && (React.createElement(Grid, { container: true, className: classnames(classes.lineSpacing, 'cart-summary-calculation-message') },
                                React.createElement(Grid, { item: true, xs: 12, className: classes.right },
                                    React.createElement(Typography, { variant: 'body2' }, "Shipping and tax will be calculated during checkout.")))),
                            (canCalculate || order.discount > 0) && (React.createElement(Grid, { container: true, className: classnames(classes.lineSpacing, 'cart-summary-subtotal') },
                                React.createElement(Grid, { item: true, xs: true, className: classes.right },
                                    React.createElement(Typography, { variant: 'body1' }, "Subtotal")),
                                React.createElement(Grid, { item: true, className: classnames(classes.right, classes.summaryNumber) },
                                    React.createElement(Typography, { variant: 'body1' }, renderUICurrencyFromJSON(order.currency, order.subtotal))))),
                            order.discount > 0 && (React.createElement(Grid, { container: true, className: classnames(classes.lineSpacing, 'cart-summary-discount') },
                                React.createElement(Grid, { item: true, xs: true, className: classes.right },
                                    React.createElement(Typography, { variant: 'body1' }, "You Saved")),
                                React.createElement(Grid, { item: true, className: classnames(classes.right, classes.summaryNumber) },
                                    React.createElement(Typography, { variant: 'body1' }, renderUICurrencyFromJSON(order.currency, order.discount))))),
                            showTotals !== false && (React.createElement(React.Fragment, null,
                                canCalculate && (React.createElement(React.Fragment, null,
                                    React.createElement(Grid, { container: true, className: classnames(classes.lineSpacing, 'cart-summary-shipping') },
                                        React.createElement(Grid, { item: true, xs: true, className: classes.right },
                                            React.createElement(Typography, { variant: 'body1' }, "Shipping")),
                                        React.createElement(Grid, { item: true, className: classnames(classes.right, classes.summaryNumber) },
                                            React.createElement(Typography, { variant: 'body1' }, order.shipping ? renderUICurrencyFromJSON(order.currency, order.shipping) : 'Free'))),
                                    React.createElement(Grid, { container: true, className: 'cart-summary-tax' },
                                        React.createElement(Grid, { item: true, xs: true, className: classes.right },
                                            React.createElement(Typography, { variant: 'body1' }, "Tax")),
                                        React.createElement(Grid, { item: true, className: classnames(classes.right, classes.summaryNumber) },
                                            React.createElement(Typography, { variant: 'body1' }, renderUICurrencyFromJSON(order.currency, order.tax)))))),
                                React.createElement(Grid, { container: true, className: classnames(classes.total, 'cart-summary-total'), alignItems: 'center' },
                                    React.createElement(Grid, { item: true, xs: true, className: classes.right },
                                        React.createElement(Typography, { variant: 'body1' }, "Total")),
                                    React.createElement(Grid, { item: true, className: classnames(classes.right, classes.summaryNumber) },
                                        React.createElement(Typography, { variant: 'h6' },
                                            React.createElement("strong", null, renderUICurrencyFromJSON(order.currency, order.total))))))),
                            cartCheckoutUrl && (React.createElement(Grid, { container: true, className: classnames(classes.checkoutButton, 'cart-summary-checkout-button') },
                                React.createElement(Grid, { item: true, xs: true },
                                    React.createElement(Link, { href: cartCheckoutUrl },
                                        React.createElement(Button, { variant: 'contained', size: 'large', color: 'primary', fullWidth: true }, "Checkout")))))))))));
};
export default observer(Cart);
