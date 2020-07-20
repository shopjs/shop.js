import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Box, Button, Container, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Grid, Grow, Link, Paper, Typography, useMediaQuery, } from '@material-ui/core';
import { red, } from '@material-ui/core/colors';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import PersonIcon from '@material-ui/icons/Person';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { isEmail, isRequired, } from '@hanzo/middleware';
import { MUICheckbox, MUIText, } from '@hanzo/react';
import { renderUICurrencyFromJSON, } from '@hanzo/utils';
import { useMidstream } from '../hooks';
import Cart from './Cart';
import PaymentForm from './PaymentForm';
import ShippingForm from './ShippingForm';
import ThankYou from './ThankYou';
import Steps from './Steps';
const useStyles = makeStyles((theme) => ({
    notFirstPage: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    formGrid: {
        position: 'relative',
    },
    buttons: {
        '& button': {
            marginRight: theme.spacing(2),
        },
    },
    error: {
        color: red[500],
        paddingTop: theme.spacing(1),
    },
    checkoutGrid: {
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column-reverse',
        },
    },
    compactCart: {
        [theme.breakpoints.down('sm')]: {
            '& .cart-your-items-title': {
                display: 'none',
            },
            '& .cart-icon': {
                display: 'none',
            },
            '& .cart': {
                padding: 0,
            },
            '& .cart-items': {
                paddingTop: 0,
            },
        },
    },
}));
import { AutoSizer } from 'react-virtualized';
const agreed = (v) => {
    if (!v) {
        throw new Error('Agree to our terms and conditions.');
    }
    return v;
};
const Checkout = ({ forms, address, setAddress, order, setOrder, payment, setPayment, user, setUser, setCoupon, checkout, setItem, countryOptions, stateOptions, isLoading, termsUrl, track, stepLabels, contactIcon, contactTitle, shippingIcon, shippingTitle, paymentIcon, paymentTitle, cartIcon, cartTitle, showDescription, showTotals, cartCheckoutUrl, nativeSelects, }) => {
    const theme = useTheme();
    const isBelowSM = useMediaQuery(theme.breakpoints.down('sm'));
    const classes = useStyles();
    const splitName = (v) => {
        let [firstName, lastName] = v.split(/\s+/);
        setUser('firstName', firstName);
        setUser('lastName', lastName);
        return v;
    };
    const setPaymentName = (v) => {
        setPayment('name', v);
        return v;
    };
    const [error, setError] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const [formAwait, _setFormAwait] = useState(null);
    const userMS = useMidstream({
        email: [isRequired, isEmail],
        name: [isRequired, splitName, setPaymentName],
    }, {
        dst: setUser,
    });
    const { setEmail, setName, } = userMS;
    const userErr = userMS.err;
    const userRun = userMS.runAll;
    const termsMS = useMidstream({
        terms: [agreed],
    }, {
        dst: (k, v) => {
            if (k == 'terms') {
                return;
            }
        },
    });
    const { setTerms, err, src, } = termsMS;
    const termsRun = termsMS.run;
    useEffect(() => {
        track('Viewed Checkout Step', { step: 2 });
    }, []);
    const setFormAwait = useMemo(() => (x) => {
        if (x != formAwait) {
            _setFormAwait(() => x);
        }
    }, []);
    const handleNext = async () => {
        const fn = formAwait;
        if (fn) {
            try {
                await fn();
            }
            catch (e) {
                console.log('checkout form error', e);
                return;
            }
        }
        if (activeStep === 0) {
            let ret = await userRun();
            if (ret instanceof Error) {
                console.log('contact form error', ret);
                return;
            }
        }
        setActiveStep((prevActiveStep) => {
            if (prevActiveStep === 0) {
                track('Completed Checkout Step', { step: 2 });
                track('Viewed Checkout Step', { step: 3 });
            }
            return prevActiveStep + 1;
        });
    };
    const handleBack = () => {
        setActiveStep((prevActiveStep) => {
            return prevActiveStep - 1;
        });
    };
    const handleReset = () => {
        setActiveStep(0);
    };
    const handleSubmit = async () => {
        try {
            const fn = formAwait;
            if (fn) {
                try {
                    await fn();
                }
                catch (e) {
                    console.log('checkout form error', e);
                    return;
                }
            }
            let ret = await termsRun();
            if (ret instanceof Error) {
                return;
            }
            await checkout();
            setFormAwait(null);
            track('Completed Checkout Step', { step: 3 });
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
        catch (e) {
            console.log('payment form error', e);
            setError(e.message);
        }
    };
    let Forms;
    if (!forms || !forms.length) {
        Forms = [ShippingForm, PaymentForm];
    }
    else if (forms.length == 1) {
        Forms = [forms[0], PaymentForm];
    }
    else {
        Forms = [forms[0], forms[1]];
    }
    const disabled = !(order.items && order.items.length && order.items.length > 0);
    return (React.createElement(Container, { maxWidth: 'md', style: { width: '100%' }, onMouseDown: (event) => {
            event.stopPropagation();
        } },
        React.createElement(AutoSizer, { disableHeight: true }, ({ width, height }) => {
            const halfWidth = Math.floor(width / 2);
            return (React.createElement("div", { style: { width: halfWidth * 2 }, className: 'checkout' },
                React.createElement(Grid, { container: true, spacing: 3 },
                    React.createElement(Grid, { item: true, xs: 12, className: 'checkout-steps' },
                        React.createElement(Steps, { activeStep: activeStep, steps: stepLabels }))),
                React.createElement(Grid, { container: true, spacing: 3, className: classnames(classes.checkoutGrid, 'checkout-layout') },
                    React.createElement(Grid, { item: true, xs: 12, md: 6, className: classnames(classes.formGrid, 'checkout-forms') },
                        Forms.map((Form, i) => (React.createElement(Grow, { in: activeStep === i, key: Form },
                            React.createElement("div", { style: {
                                    height: activeStep === i ? 'inherit' : 0
                                }, className: 'checkout-form' },
                                React.createElement(Box, { p: [2, 3, 4] },
                                    React.createElement(Grid, { container: true, spacing: 3 },
                                        activeStep == 0 && (React.createElement(React.Fragment, null,
                                            React.createElement(Grid, { item: true, xs: 12, className: 'contact-header' },
                                                React.createElement(Grid, { container: true, spacing: 1, alignItems: 'center' },
                                                    React.createElement(Grid, { item: true, className: 'contact-icon' }, contactIcon || React.createElement(PersonIcon, { style: { fontSize: '2rem' } })),
                                                    React.createElement(Grid, { item: true, className: 'contact-title' }, contactTitle || (React.createElement(Typography, { variant: 'h6' }, "Contact Details"))))),
                                            React.createElement(Grid, { item: true, xs: 12, sm: 6, className: 'contact-name' },
                                                React.createElement(MUIText, { fullWidth: true, label: 'Name', variant: undefined, size: 'medium', value: user.name, setValue: setName, error: userErr.name })),
                                            React.createElement(Grid, { item: true, xs: 12, sm: 6, className: 'contact-email' },
                                                React.createElement(MUIText, { fullWidth: true, label: 'Email', variant: undefined, size: 'medium', value: user.email, setValue: setEmail, error: userErr.email })))),
                                        React.createElement(Grid, { item: true, xs: 12 },
                                            React.createElement(Form, { isActive: activeStep === i, shippingIcon: shippingIcon, shippingTitle: shippingTitle, paymentIcon: paymentIcon, paymentTitle: paymentTitle, width: halfWidth, height: height, order: order, payment: payment, user: user, setUser: setUser, setAddress: setAddress, setPayment: setPayment, setFormAwait: setFormAwait, countryOptions: countryOptions, stateOptions: stateOptions, isLoading: isLoading, termsUrl: termsUrl, nativeSelects: nativeSelects })),
                                        activeStep == 1 && (React.createElement(Grid, { item: true, xs: 12, className: 'checkout-terms' },
                                            React.createElement(MUICheckbox, { label: React.createElement(Link, { href: termsUrl, target: '_blank' }, "Please agree to our terms and conditions."), placeholder: '123', size: 'medium', value: src.terms, error: err.terms, setValue: setTerms }))),
                                        React.createElement(Grid, { item: true, xs: 12, className: 'checkout-buttons' },
                                            activeStep == 0 && (React.createElement("div", { className: classnames(classes.buttons, 'checkout-buttons') },
                                                React.createElement(Button, { variant: 'contained', color: 'primary', size: 'large', onClick: handleNext, disabled: isLoading || disabled }, "Continue"),
                                                error && (React.createElement("div", { className: classnames(classes.error, 'checkout-errors') }, error)))),
                                            activeStep == 1 && (React.createElement("div", { className: classnames(classes.buttons, 'checkout-buttons') },
                                                React.createElement(Button, { variant: 'contained', color: 'primary', size: 'large', onClick: handleSubmit, disabled: isLoading || disabled }, "Complete"),
                                                React.createElement(Button, { size: 'large', onClick: handleBack, disabled: isLoading || disabled }, "Back"),
                                                error && (React.createElement("div", { className: classnames(classes.error, 'checkout-errors') }, error))))))))))),
                        React.createElement(Grow, { in: activeStep == 2 },
                            React.createElement("div", { style: {
                                    height: activeStep == 2 ? 'inherit' : 0,
                                }, className: 'checkout-form' }, activeStep == 2 && (React.createElement(ThankYou, { width: halfWidth, height: height, order: order }))))),
                    React.createElement(Grid, { item: true, xs: 12, md: 6, className: 'checkout-cart' }, isBelowSM ? (React.createElement(ExpansionPanel, null,
                        React.createElement(ExpansionPanelSummary, { expandIcon: React.createElement(ExpandMoreIcon, null), "aria-controls": 'cart-items-content', id: 'cart-items-header' },
                            React.createElement(Grid, { container: true, alignItems: 'center', spacing: 2 },
                                React.createElement(Grid, { item: true, xs: true },
                                    React.createElement(Typography, { variant: 'body1', className: 'cart-show-more-summary-text' }, "Show Order")),
                                React.createElement(Grid, { item: true },
                                    React.createElement(Typography, { variant: 'h6', className: 'cart-show-more-summary-price' },
                                        React.createElement("strong", null, renderUICurrencyFromJSON(order.currency, order.total)))))),
                        React.createElement(ExpansionPanelDetails, { className: classes.compactCart },
                            React.createElement(Cart, { cartIcon: cartIcon, cartTitle: cartTitle, order: order, setCoupon: setCoupon, setItem: setItem, locked: isLoading || activeStep === 2, showDescription: showDescription, showTotals: showTotals, cartCheckoutUrl: undefined, nativeSelects: nativeSelects })))) : (React.createElement(Paper, null,
                        React.createElement(Cart, { cartIcon: cartIcon, cartTitle: cartTitle, order: order, setCoupon: setCoupon, setItem: setItem, locked: isLoading || activeStep === 2, showDescription: showDescription, showTotals: showTotals, cartCheckoutUrl: undefined, nativeSelects: nativeSelects })))))));
        })));
};
export default observer(Checkout);
