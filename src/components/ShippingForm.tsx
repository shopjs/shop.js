import React from 'react'
import classnames from 'classnames'

import {
  MUIText,
} from '@hanzo/react'

import { useTheme } from '@material-ui/core/styles'

import { useMidstream } from '../hooks'

import {
  isEmail,
  isRequired,
  isStateRequiredForCountry,
} from '@hanzo/middleware'

import {
  Box,
  Button,
  Grid,
  Typography,
} from '@material-ui/core'

import { makeStyles } from '@material-ui/core/styles'
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
}))

const ShippingForm = ({
  width,
  height,
  setAddress,
  setUser,
  setPayment,
  user,
  order,
  countryOptions,
  stateOptions,
  next,
  isLoading,
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

  const addressMS = useMidstream({
    line1: [isRequired],
    line2: [],
    city: [isRequired],
    postalCode: [isRequired],
    state: [
      isStateRequiredForCountry(
        () => stateOptions,
        () => order.shippingAddress.country,
      ),
    ],
    country: [isRequired]
  }, {
    dst: setAddress,
  })

  const {
    setLine1,
    setLine2,
    setCity,
    setPostalCode,
    setState,
    setCountry,
  } = addressMS

  const addressErr = addressMS.err
  const addressRun = addressMS.runAll

  const submit = async () => {
    try {
      let ret = await userRun()

      if (ret instanceof Error) {
        return
      }

      ret = await addressRun()

      if (ret instanceof Error) {
        return
      }

      next()
    } catch (e) {
      console.log('shipping form error', e)
    }
  }

  return (
    <Box p={[2, 3, 4]} className='shipping'>
      <Grid container>
        <Grid item xs={12} className='shipping-header'>
          <Typography variant='h5'>
            Shipping Information
          </Typography>
        </Grid>
      </Grid>

      <Grid container className={classnames(classes.form, 'shipping-body')} spacing={3}>
        <Grid item xs={12} sm={6} className='shipping-name'>
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
        <Grid item xs={12} sm={6} className='shipping-email'>
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

        <Grid item xs={12} sm={8} className='shipping-line1'>
          <MUIText
            fullWidth
            label='Address'
            variant={undefined}
            size='medium'
            value={order.shippingAddress.line1}
            setValue={setLine1}
            error={addressErr.line1}
          />
        </Grid>
        <Grid item xs={12} sm={4} className='shipping-line2'>
          <MUIText
            fullWidth
            label='Suite'
            variant={undefined}
            size='medium'
            value={order.shippingAddress.line2}
            setValue={setLine2}
            error={addressErr.line2}
          />
        </Grid>

        <Grid item xs={12} sm={6} className='shipping-country'>
          <MUIText
            fullWidth
            select
            options={countryOptions}
            placeholder='Select a Country'
            label='Country'
            variant={undefined}
            size='medium'
            value={order.shippingAddress.country}
            setValue={setCountry}
            error={addressErr.country}
          />
        </Grid>
        <Grid item xs={12} sm={6} className='shipping-state'>
          <MUIText
            fullWidth
            select
            options={stateOptions[order.shippingAddress.country]}
            label='State'
            placeholder='Select a State'
            variant={undefined}
            size='medium'
            value={order.shippingAddress.state}
            setValue={setState}
            error={addressErr.state}
          />
        </Grid>

        <Grid item xs={12} sm={7} className='shipping-city'>
          <MUIText
            fullWidth
            label='City'
            variant={undefined}
            size='medium'
            value={order.shippingAddress.city}
            setValue={setCity}
            error={addressErr.city}
          />
        </Grid>
        <Grid item xs={12} sm={5} className='shipping-postal-code'>
          <MUIText
            fullWidth
            label='Postal Code'
            variant={undefined}
            size='medium'
            value={order.shippingAddress.postalCode}
            setValue={setPostalCode}
            error={addressErr.postalCode}
          />
        </Grid>

        <Grid item xs={12}>
          <div className={classnames(classes.buttons, 'shipping-buttons')}>
            <Button
              variant='contained'
              color='primary'
              size='large'
              onClick={submit}
              disabled={isLoading}
            >
              Continue
            </Button>
          </div>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ShippingForm
