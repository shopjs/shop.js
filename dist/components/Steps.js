import React from 'react';
import classnames from 'classnames';
import { Step, StepLabel, Stepper, } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
    },
    stepper: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    backButton: {
        marginRight: theme.spacing(1),
    },
    instructions: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
}));
const getSteps = () => {
    return ['Your Info', 'Payment Info', 'Confirm Order'];
};
const HorizontalLabelPositionBelowStepper = ({ activeStep, steps, }) => {
    const classes = useStyles();
    if (!steps || !steps.length) {
        steps = getSteps();
    }
    else if (steps.length < 3) {
        steps = getSteps();
    }
    return (React.createElement("div", { className: classnames(classes.root, 'steps') },
        React.createElement(Stepper, { activeStep: activeStep, alternativeLabel: true, className: classes.stepper }, steps.map(label => (React.createElement(Step, { key: label, className: 'step' },
            React.createElement(StepLabel, null, label)))))));
};
export default HorizontalLabelPositionBelowStepper;
