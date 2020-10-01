import raf from 'raf';
import React, { useMemo } from 'react';
import classnames from 'classnames';
import { MUIText, } from '@hanzo/react';
import { useMidstream } from '../hooks';
import { isRequired, } from '@hanzo/middleware';
import { Grid, InputAdornment, Typography, TextField, } from '@material-ui/core';
import LockIcon from '@material-ui/icons/Lock';
import usePaymentInputs from 'react-payment-inputs/es/usePaymentInputs';
import images from 'react-payment-inputs/images';
import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles((theme) => ({
    form: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
}));
const PaymentForm = ({ width, height, payment, setPayment, setFormAwait, checkout, back, next, termsUrl, isActive, isLoading, paymentIcon, paymentTitle, }) => {
    const classes = useStyles();
    const { meta, getCardImageProps, getCardNumberProps, getExpiryDateProps, getCVCProps, } = usePaymentInputs();
    const { erroredInputs, touchedInputs } = meta;
    const { setName, setNumber, setCvc, setMonth, setYear, setTerms, err, run, } = useMidstream({
        name: [isRequired],
        number: [isRequired],
        cvc: [isRequired],
        month: [isRequired],
        year: [isRequired],
    }, {
        dst: (k, v) => {
            if (k == 'terms') {
                return;
            }
            setPayment(k, v);
        },
    });
    let { ...cardNumberProps } = getCardNumberProps({
        onBlur: (e) => {
            setNumber(e.target.value);
        },
        onChange: (e) => {
            setNumber(e.target.value);
        },
    });
    let cardNumberPropsRef = cardNumberProps.ref;
    delete cardNumberProps.ref;
    let { ...cvcProps } = getCVCProps({
        onBlur: (e) => {
            setCvc(e.target.value);
        },
        onChange: (e) => {
            setCvc(e.target.value);
        },
    });
    let cvcPropsRef = cvcProps.ref;
    delete cvcProps.ref;
    let { ...expiryDateProps } = getExpiryDateProps({
        onBlur: (e) => {
            var _a;
            let v = (_a = e.target.value) !== null && _a !== void 0 ? _a : '';
            let [month, year] = v.replace(/\s+/g, '').split('/');
            setMonth(`${parseInt(month, 10)}`);
            setYear(`20${year}`);
        },
        onChange: (e) => {
            var _a;
            let v = (_a = e.target.value) !== null && _a !== void 0 ? _a : '';
            let [month, year] = v.replace(/\s+/g, '').split('/');
            setMonth(`${parseInt(month, 10)}`);
            setYear(`20${year}`);
        },
    });
    let expiryDatePropsRef = expiryDateProps.ref;
    delete expiryDateProps.ref;
    const submit = useMemo(() => async () => {
        let ret = await run();
        if (ret instanceof Error) {
            console.log('payment form error', ret);
            throw ret;
        }
    }, []);
    if (isActive) {
        raf(() => {
            setFormAwait(submit);
        });
    }
    return (React.createElement("div", { className: 'payment' },
        React.createElement(Grid, { container: true },
            React.createElement(Grid, { item: true, xs: 12, className: 'payment-header' },
                React.createElement(Grid, { container: true, spacing: 1, alignItems: 'center' },
                    React.createElement(Grid, { item: true, className: 'payment-icon' }, paymentIcon || React.createElement(LockIcon, { style: { fontSize: '2rem' } })),
                    React.createElement(Grid, { item: true, className: 'payment-title' }, paymentTitle || (React.createElement(Typography, { variant: 'h6' }, "Payment Information")))))),
        React.createElement(Grid, { container: true, className: classnames(classes.form, 'payment-body'), spacing: 3 },
            React.createElement(Grid, { item: true, xs: 12, className: 'payment-card-name' },
                React.createElement(MUIText, { fullWidth: true, label: 'Name on Card', variant: undefined, size: 'medium', value: payment.name, setValue: setName, error: err.name })),
            React.createElement(Grid, { item: true, xs: 12, className: 'payment-card-numbers' },
                React.createElement(TextField, Object.assign({}, cardNumberProps, { inputRef: cardNumberPropsRef, fullWidth: true, label: 'Number', placeholder: '0000 0000 0000 0000', size: 'medium', error: touchedInputs.cardNumber && erroredInputs.cardNumber || err.number, helperText: touchedInputs.cardNumber && erroredInputs.cardNumber || err.number && err.number.message, InputProps: {
                        startAdornment: (React.createElement(InputAdornment, { position: 'start' },
                            React.createElement("svg", Object.assign({}, getCardImageProps({ images }))))),
                    } }))),
            React.createElement(Grid, { item: true, xs: 6, className: 'payment-card-expiry' },
                React.createElement(TextField, Object.assign({}, expiryDateProps, { inputRef: expiryDatePropsRef, fullWidth: true, label: 'Expiry Date', placeholder: 'MM/YY', size: 'medium', error: touchedInputs.expiryDate && erroredInputs.expiryDate || err.month || err.year, helperText: touchedInputs.expiryDate && erroredInputs.expiryDate || err.month && err.month.message || err.year && err.year.message }))),
            React.createElement(Grid, { item: true, xs: 6, className: 'payment-card-cvc' },
                React.createElement(TextField, Object.assign({}, cvcProps, { inputRef: cvcPropsRef, fullWidth: true, label: 'CVC', placeholder: '123', size: 'medium', error: touchedInputs.cvc && erroredInputs.cvc || err.cvc, helperText: touchedInputs.cvc && erroredInputs.cvc || err.cvc && err.cvc.message }))))));
};
export default PaymentForm;
