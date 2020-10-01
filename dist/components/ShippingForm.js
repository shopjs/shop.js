import raf from 'raf';
import React, { useMemo } from 'react';
import classnames from 'classnames';
import { MUIText, } from '@hanzo/react';
import LocalShippingIcon from '@material-ui/icons/LocalShipping';
import { useMidstream } from '../hooks';
import { isRequired, isStateRequiredForCountry, } from '@hanzo/middleware';
import { Grid, Typography, } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles((theme) => ({
    form: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    buttons: {
        '& button': {
            marginRight: theme.spacing(2),
        },
    },
}));
const ShippingForm = ({ width, height, setAddress, setUser, setPayment, setFormAwait, user, order, countryOptions, stateOptions, isActive, isLoading, shippingIcon, shippingTitle, nativeSelects, }) => {
    const classes = useStyles();
    const addressMS = useMidstream({
        line1: [isRequired],
        line2: [],
        city: [isRequired],
        postalCode: [isRequired],
        state: [
            isStateRequiredForCountry(() => stateOptions, () => order.shippingAddress.country),
        ],
        country: [isRequired]
    }, {
        dst: setAddress,
    });
    const { setLine1, setLine2, setCity, setPostalCode, setState, setCountry, } = addressMS;
    const addressErr = addressMS.err;
    const addressRun = addressMS.runAll;
    const submit = useMemo(() => async () => {
        let ret = await addressRun();
        if (ret instanceof Error) {
            console.log('shipping form error', ret);
            throw ret;
        }
    }, []);
    if (isActive) {
        raf(() => {
            setFormAwait(submit);
        });
    }
    return (React.createElement("div", { className: 'shipping' },
        React.createElement(Grid, { container: true },
            React.createElement(Grid, { item: true, xs: 12, className: 'shipping-header' },
                React.createElement(Grid, { container: true, spacing: 1, alignItems: 'center' },
                    React.createElement(Grid, { item: true, className: 'shipping-icon' }, shippingIcon || React.createElement(LocalShippingIcon, { style: { fontSize: '2rem' } })),
                    React.createElement(Grid, { item: true, className: 'shipping-title' }, shippingTitle || (React.createElement(Typography, { variant: 'h6' }, "Shipping Information")))))),
        React.createElement(Grid, { container: true, className: classnames(classes.form, 'shipping-body'), spacing: 3 },
            React.createElement(Grid, { item: true, xs: 12, sm: 8, className: 'shipping-line1' },
                React.createElement(MUIText, { fullWidth: true, label: 'Address', variant: undefined, size: 'medium', value: order.shippingAddress.line1, setValue: setLine1, error: addressErr.line1 })),
            React.createElement(Grid, { item: true, xs: 12, sm: 4, className: 'shipping-line2' },
                React.createElement(MUIText, { fullWidth: true, label: 'Suite', variant: undefined, size: 'medium', value: order.shippingAddress.line2, setValue: setLine2, error: addressErr.line2 })),
            React.createElement(Grid, { item: true, xs: 12, sm: 6, className: 'shipping-country' },
                React.createElement(MUIText, { fullWidth: true, select: true, options: countryOptions, placeholder: 'Select a Country', label: 'Country', variant: undefined, size: 'medium', value: order.shippingAddress.country, setValue: setCountry, error: addressErr.country, SelectProps: { native: !!nativeSelects } })),
            React.createElement(Grid, { item: true, xs: 12, sm: 6, className: 'shipping-state' },
                React.createElement(MUIText, { fullWidth: true, select: true, options: stateOptions[order.shippingAddress.country], label: 'State', placeholder: 'Select a State', variant: undefined, size: 'medium', value: order.shippingAddress.state, setValue: setState, error: addressErr.state, SelectProps: { native: !!nativeSelects } })),
            React.createElement(Grid, { item: true, xs: 12, sm: 7, className: 'shipping-city' },
                React.createElement(MUIText, { fullWidth: true, label: 'City', variant: undefined, size: 'medium', value: order.shippingAddress.city, setValue: setCity, error: addressErr.city })),
            React.createElement(Grid, { item: true, xs: 12, sm: 5, className: 'shipping-postal-code' },
                React.createElement(MUIText, { fullWidth: true, label: 'Postal Code', variant: undefined, size: 'medium', value: order.shippingAddress.postalCode, setValue: setPostalCode, error: addressErr.postalCode })))));
};
export default ShippingForm;
