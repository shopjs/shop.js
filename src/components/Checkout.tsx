import React, { useEffect, useMemo, useState } from 'react'
import classnames from 'classnames'

import {
  Box,
  Button,
  Container,
  Grid,
  Grow,
  Link,
  Paper,
  Typography,
} from '@material-ui/core'

import {
  red,
} from '@material-ui/core/colors'

import { makeStyles } from '@material-ui/core/styles'

import PersonIcon from '@material-ui/icons/Person'

import {
  isEmail,
  isRequired,
} from '@hanzo/middleware'

import {
  MUICheckbox,
  MUIText,
} from '@hanzo/react'

import { useMidstream } from '../hooks'

import Cart from './Cart'

import PaymentForm from './PaymentForm'
import ShippingForm from './ShippingForm'
import ThankYou from './ThankYou'

import Steps from './Steps'

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
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column-reverse',
    },
  },
}))

import { AutoSizer } from 'react-virtualized'

const agreed = (v) => {
  if (!v) {
    throw new Error('Agree to our terms and conditions.')
  }

  return v
}

const Checkout = ({
  forms,
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
  termsUrl,
  track,
  stepLabels,
  contactIcon,
  contactTitle,
  shippingIcon,
  shippingTitle,
  paymentIcon,
  paymentTitle,
  cartIcon,
  cartTitle,
}): JSX.Element => {
  const classes = useStyles()

  const splitName = (v) => {
    let [firstName, lastName] = v.split(/\s+/)
    setUser('firstName', firstName)
    setUser('lastName', lastName)

    return v
  }

  const setPaymentName = (v) => {
    setPayment('name', v)

    return v
  }

  const [error, setError] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [formAwait, _setFormAwait] = useState(null)

  const userMS = useMidstream({
    email: [isRequired, isEmail],
    name: [isRequired, splitName, setPaymentName],
  }, {
    dst: setUser,
  })

  const {
    setEmail,
    setName,
  } = userMS

  const userErr = userMS.err
  const userRun = userMS.runAll

  const termsMS = useMidstream({
    terms: [agreed],
  }, {
    dst: (k, v) => {
      if (k == 'terms') {
        return
      }
    },
  })

  const {
    setTerms,
    err,
    src,
  } = termsMS

  const termsRun = termsMS.run

  useEffect(() => {
    track('Viewed Checkout Step', {step: 2})
  }, [])

  const setFormAwait = useMemo(() => (x) => {
    if (x != formAwait) {
      console.log('setFA', x)
      _setFormAwait(() => x)
    }
  }, [])

  const handleNext = async () => {
    const fn: any = formAwait

    if (fn) {
      try {
        await fn()
      } catch (e) {
        console.log('checkout form error', e)
        return
      }
    }

    if (activeStep === 0) {
      let ret = await userRun()

      if (ret instanceof Error) {
        console.log('contact form error', ret)
        return
      }
    }

    setActiveStep((prevActiveStep) => {
      if (prevActiveStep === 0) {
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

  const handleSubmit = async () => {
    try {
      let ret = await termsRun()

      if (ret instanceof Error) {
        return
      }

      await checkout()

      setFormAwait(null)
      handleNext()
    } catch (e) {
      console.log('payment form error', e)

      setError(e.message)
    }
  }

  let Forms: [any, any]

  if (!forms || !forms.length) {
    Forms = [ShippingForm, PaymentForm]
  } else if (forms.length == 1){
    Forms = [forms[0], PaymentForm]
  } else {
    Forms = [forms[0], forms[1]]
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
                    <Steps activeStep={activeStep} steps={stepLabels}/>
                  </Grid>
                </Grid>
                <Grid container spacing={3} className={classnames(classes.checkoutGrid, 'checkout-layout')}>
                  <Grid item xs={12} md={6}
                    className={ classnames(classes.formGrid, 'checkout-forms') }
                  >
                    {
                      Forms.map((Form, i) => (
                        <Grow
                          in={ activeStep === i }
                          key={ Form }
                        >
                          <div
                            style={{
                              height: activeStep === i ? 'inherit' : 0
                            }}
                            className='checkout-form'
                          >
                            <Box p={[2, 3, 4]}>
                              <Grid container spacing={3}>
                                { activeStep == 0 && (
                                  <>
                                    <Grid item xs={12} className='contact-header'>
                                      <Grid container spacing={1} alignItems='center'>
                                        <Grid item className='contact-icon'>
                                          { contactIcon || <PersonIcon style={{fontSize: '2rem'}}/> }
                                        </Grid>
                                        <Grid item className='contact-title'>
                                          { contactTitle || (
                                            <Typography variant='h6'>
                                              Contact Details
                                            </Typography>
                                          )}
                                        </Grid>
                                      </Grid>
                                    </Grid>

                                    <Grid item xs={12} sm={6} className='contact-name'>
                                      <MUIText
                                        fullWidth
                                        label='Name'
                                        variant={undefined}
                                        size='medium'
                                        value={user.name}
                                        setValue={setName}
                                        error={userErr.name}
                                      />
                                    </Grid>
                                    <Grid item xs={12} sm={6} className='contact-email'>
                                      <MUIText
                                        fullWidth
                                        label='Email'
                                        variant={undefined}
                                        size='medium'
                                        value={user.email}
                                        setValue={setEmail}
                                        error={userErr.email}
                                      />
                                    </Grid>
                                  </>
                                )}

                                <Grid item xs={12}>
                                  <Form
                                    isActive={activeStep === i}
                                    shippingIcon={shippingIcon}
                                    shippingTitle={shippingTitle}
                                    paymentIcon={paymentIcon}
                                    paymentTitle={paymentTitle}
                                    width={halfWidth}
                                    height={height}
                                    order={order}
                                    payment={payment}
                                    user={user}
                                    setUser={setUser}
                                    setAddress={setAddress}
                                    setPayment={setPayment}
                                    setFormAwait={setFormAwait}
                                    countryOptions={countryOptions}
                                    stateOptions={stateOptions}
                                    isLoading={isLoading}
                                    termsUrl={termsUrl}
                                  />
                                </Grid>

                                { activeStep == 1 && (
                                  <Grid item xs={12} className='checkout-terms'>
                                    <MUICheckbox
                                      label={<Link href={termsUrl} target='_blank'>Please agree to our terms and conditions.</Link>}
                                      placeholder='123'
                                      size='medium'
                                      value={src.terms}
                                      error={err.terms}
                                      setValue={setTerms}
                                    />
                                  </Grid>
                                )}

                                <Grid item xs={12} className='checkout-buttons'>
                                  { activeStep == 0 && (
                                    <div className={classnames(classes.buttons, 'checkout-buttons')}>
                                      <Button
                                        variant='contained'
                                        color='primary'
                                        size='large'
                                        onClick={handleNext}
                                        disabled={isLoading}
                                      >
                                        Continue
                                      </Button>
                                      {
                                        error && (
                                          <div className={classnames(classes.error, 'checkout-errors')}>
                                            { error }
                                          </div>
                                        )
                                      }
                                    </div>
                                  )}
                                  { activeStep == 1 && (
                                    <div className={classnames(classes.buttons, 'checkout-buttons')}>
                                      <Button
                                        variant='contained'
                                        color='primary'
                                        size='large'
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                      >
                                        Complete
                                      </Button>
                                      <Button
                                        size='large'
                                        onClick={handleBack}
                                        disabled={isLoading}
                                      >
                                        Back
                                      </Button>
                                      {
                                        error && (
                                          <div className={classnames(classes.error, 'checkout-errors')}>
                                            { error }
                                          </div>
                                        )
                                      }
                                    </div>
                                  )}
                                </Grid>
                              </Grid>
                            </Box>
                          </div>
                        </Grow>
                      ))
                    }
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
                        cartIcon={cartIcon}
                        cartTitle={cartTitle}
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
