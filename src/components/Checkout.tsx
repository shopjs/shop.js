import React, { useState, useCallback } from 'react'
import classnames from 'classnames'

import {
  Container,
  Grid,
  Grow,
  Paper,
} from '@material-ui/core'

import Cart from './Cart'

import PaymentForm from './PaymentForm'
import ShippingForm from './ShippingForm'
import ThankYou from './ThankYou'

import Steps from './Steps'

import { makeStyles } from '@material-ui/core/styles'
const useStyles = makeStyles((theme) => ({
  notFirstPage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  formGrid: {
    position: 'relative',
  },
}))

import { AutoSizer } from 'react-virtualized'

const Checkout = ({
  address,
  setAddress,
  order,
  setOrder,
  payment,
  setPayment,
  user,
  setUser,
  setCoupon,
  checkout,
  setItem,
  countryOptions,
  stateOptions,
  isLoading,
  track,
}): JSX.Element => {
  const classes = useStyles()
  useCallback(() => {
    track('Viewed Checkout Step', {step: 2})
  }, [])

  const [activeStep, setActiveStep] = useState(0)

  const handleNext = () => {
    setActiveStep((prevActiveStep) => {
      if (prevActiveStep === 1) {
        track('Completed Checkout Step', {step: 2})
        track('Viewed Checkout Step', {step: 3})
      } else if (prevActiveStep === 2) {
        track('Completed Checkout Step', {step: 3})
      }

      return prevActiveStep + 1
    })
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => {

      return prevActiveStep - 1
    })
  }

  const handleReset = () => {
    setActiveStep(0)
  }

  return (
    <Container maxWidth='md'>
      <AutoSizer>
        {
          ({ width, height }) => {
            const halfWidth = Math.floor(width / 2)

            return (
              <div style={{ width: halfWidth * 2 }} className='checkout'>
                <Grid container spacing={3}>
                  <Grid item xs={12} className='checkout-steps'>
                    <Steps activeStep={activeStep}/>
                  </Grid>
                  <Grid item xs={12} md={6}
                    className={ classnames(classes.formGrid, 'checkout-forms') }
                  >
                    <Grow
                      in={ activeStep == 0 }
                    >
                      <div
                        style={{
                          height: activeStep == 0 ? 'inherit' : 0
                        }}
                        className='checkout-form'
                      >
                        { activeStep == 0 && (
                          <ShippingForm
                            width={halfWidth}
                            height={height}
                            order={order}
                            user={user}
                            setUser={setUser}
                            setAddress={setAddress}
                            setPayment={setPayment}
                            countryOptions={countryOptions}
                            stateOptions={stateOptions}
                            next={handleNext}
                            isLoading={isLoading}
                          />
                        )}
                      </div>
                    </Grow>
                    <Grow
                      in={ activeStep == 1 }
                    >
                      <div
                        style={{
                          height: activeStep == 1 ? 'inherit': 0,
                        }}
                        className='checkout-form'
                      >
                        { activeStep == 1 && (
                          <PaymentForm
                            width={halfWidth}
                            height={height}
                            payment={payment}
                            setPayment={setPayment}
                            back={handleBack}
                            next={handleNext}
                            checkout={checkout}
                            isLoading={isLoading}
                          />
                        )}
                      </div>
                    </Grow>
                    <Grow
                      in={ activeStep == 2 }
                    >
                      <div
                        style={{
                          height: activeStep == 2 ? 'inherit': 0,
                        }}
                        className='checkout-form'
                      >
                        { activeStep == 2 && (
                          <ThankYou
                            width={halfWidth}
                            height={height}
                            order={order}
                          />
                        )}
                      </div>
                    </Grow>
                  </Grid>
                  <Grid item xs={12} md={6} className='checkout-cart'>
                    <Paper>
                      <Cart
                        width={halfWidth}
                        height={height}
                        order={order}
                        setCoupon={setCoupon}
                        setItem={setItem}
                        locked={isLoading || activeStep === 2}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </div>
            )
          }
        }
      </AutoSizer>
    </Container>
  )
}

export default Checkout
