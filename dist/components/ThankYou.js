import React from 'react';
import { Box, Grid, Typography, } from '@material-ui/core';
const ThankYou = ({ width, height, order, }) => {
    return (React.createElement(Box, { p: [2, 3, 4], className: 'thank-you' },
        React.createElement(Grid, { container: true },
            React.createElement(Grid, { item: true, xs: 12 },
                React.createElement(Typography, { variant: 'h5' }, "Thank you for you purchase."),
                React.createElement("br", null),
                React.createElement(Typography, { variant: 'body1' },
                    "Your order confirmation number is ",
                    React.createElement("strong", null, order.number),
                    "."),
                React.createElement("br", null),
                React.createElement(Typography, { variant: 'body1' }, "You will also receive an email confirmation as well shipping related updates.")))));
};
export default ThankYou;
