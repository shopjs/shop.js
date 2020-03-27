import React, {
  useState,
} from 'react'
import classnames from 'classnames'

import {
  Step,
  StepLabel,
  Stepper,
} from '@material-ui/core'

import { makeStyles } from '@material-ui/core/styles'

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
}))

const getSteps = () => {
  return ['Shipping Info', 'Payment Info', 'Confirm Order']
}

const HorizontalLabelPositionBelowStepper = ({
  activeStep,
}) => {
  const classes = useStyles()
  const steps = getSteps()

  return (
    <div className={classnames(classes.root, 'steps')}>
      <Stepper activeStep={activeStep} alternativeLabel className={classes.stepper}>
        {steps.map(label => (
          <Step key={label} className='step'>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  )
}

export default HorizontalLabelPositionBelowStepper
