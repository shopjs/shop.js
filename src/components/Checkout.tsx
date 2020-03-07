import React, { useState } from 'react'

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
}): JSX.Element => {
  const classes = useStyles()

  const [activeStep, setActiveStep] = useState(0)

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
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
              <div style={{ width: halfWidth * 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Steps activeStep={activeStep}/>
                  </Grid>
                  <Grid item xs={12} md={6}
                    className={ classes.formGrid }
                  >
                    <Grow
                      in={ activeStep == 0 }
                    >
                      <div
                        style={{
                          height: activeStep == 0 ? 'inherit' : 0
                        }}
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
                  <Grid item xs={12} md={6}>
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
