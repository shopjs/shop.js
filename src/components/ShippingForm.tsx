import raf from 'raf'
import React, { useMemo } from 'react'
import classnames from 'classnames'

import {
  MUIText,
} from '@hanzo/react'

import { useTheme } from '@material-ui/core/styles'

import LocalShippingIcon from '@material-ui/icons/LocalShipping'

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
  setFormAwait,
  user,
  order,
  countryOptions,
  stateOptions,
  isActive,
  isLoading,
  shippingIcon,
  shippingTitle,
  nativeSelects,
}): JSX.Element => {
  const classes = useStyles()

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

  const submit = useMemo(() => async () => {
    let ret = await addressRun()

    if (ret instanceof Error) {
      console.log('shipping form error', ret)
      throw ret
    }
  }, [])

  if (isActive) {
    raf(() => {
      setFormAwait(submit)
    })
  }

  return (
    <div className='shipping'>
      <Grid container>
        <Grid item xs={12} className='shipping-header'>
          <Grid container spacing={1} alignItems='center'>
            <Grid item className='shipping-icon'>
              { shippingIcon || <LocalShippingIcon style={{fontSize: '2rem'}}/> }
            </Grid>
            <Grid item className='shipping-title'>
              { shippingTitle || (
                <Typography variant='h6'>
                  Shipping Information
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid container className={classnames(classes.form, 'shipping-body')} spacing={3}>
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
            SelectProps={{ native: !!nativeSelects }}
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
            SelectProps={{ native: !!nativeSelects }}
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
      </Grid>
    </div>
  )
}

export default ShippingForm
