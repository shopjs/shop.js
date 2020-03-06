import React from 'react'
import { observer } from 'mobx-react'

import {
  MUIText,
} from '@hanzo/react'

import {
  renderUICurrencyFromJSON,
} from '@hanzo/utils'

import {
  Button,
  Grid,
} from '@material-ui/core'

import { makeStyles } from '@material-ui/core/styles'
const useStyles = makeStyles((theme) => ({
  right: {
    textAlign: 'right',
  },
  bold: {
    fontWeight: 700,
  },
  items: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  coupon: {
    paddingBottom: theme.spacing(2),
  },
  lineSpacing: {
    paddingBottom: theme.spacing(1),
  },
  total: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  couponInput: {
    '& .MuiInputBase-root': {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderRight: 0,
    },
  },
  couponButton: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    border: '1px solid',
    borderColor: 'rgba(0, 0, 0, 0.23)',
    paddingTop: 7,
    paddingBottom: 7,
  },
}))

import {
  Box,
  Typography,
} from '@material-ui/core'

const quantityOpts = {}

for (let i = 0; i < 10; i++) {
  quantityOpts[i] = i
}

const Cart = ({
  width,
  height,
  order,
  setCoupon,
  setItem,
}): JSX.Element => {
  const classes = useStyles()

  return (
    <Box p={[2, 3, 4]}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant='h5'>
            Your Items
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <div className={classes.items}>
            {
              order.items.map((item) => {
                return (
                  <Grid container alignItems='center' key={item.name}>
                    <Grid item xs={12} sm={7}>
                      <Typography variant='body1'>
                        { item.name }
                      </Typography>
                      <Typography variant='body2'>
                        { item.description }
                      </Typography>
                      <br/>
                    </Grid>
                    <Grid item xs={8} sm={2} className={classes.right}>
                      <Typography variant='body1'>
                        { renderUICurrencyFromJSON(order.currency, item.price) } x
                      </Typography>
                    </Grid>
                    <Grid item xs={4} sm={3} className={classes.right}>
                      <MUIText
                        select
                        disabled={ item.locked }
                        options={quantityOpts}
                        value={ item.quantity }
                        setValue={ (quantity) => {
                          setItem(item.id, parseInt(quantity, 10))
                        }}
                      />
                    </Grid>
                  </Grid>
                )
              })
            }
          </div>
        </Grid>

        <Grid item xs={12} className={classes.coupon}>
          <div>
            <Grid container>
              <Grid item xs={8} sm={10} md={9}>
                <MUIText
                  className={classes.couponInput}
                  fullWidth
                  disableAutoChange
                  variant='outlined'
                  size='small'
                  placeholder='Coupon Code'
                  defaultValue={ order.couponCodes[0] }
                  setValue={ (code) => setCoupon(code) }
                />
              </Grid>
              <Grid item xs={4} sm={2} md={3}>
                <Button
                  className={classes.couponButton}
                  fullWidth
                  disableElevation
                  size='medium'
                  variant='contained'
                >
                  Apply
                </Button>
              </Grid>
            </Grid>
          </div>
        </Grid>

        <Grid item xs={12}>
          <div>
            <Grid container className={classes.lineSpacing}>
              <Grid item xs={8} sm={9} className={classes.right}>
                <Typography variant='body1'>
                  Subtotal
                </Typography>
              </Grid>
              <Grid item xs className={classes.right}>
                <Typography variant='body1'>
                  { renderUICurrencyFromJSON(order.currency, order.subtotal) }
                </Typography>
              </Grid>
            </Grid>

            {
              order.discount > 0 && (
                <Grid container className={classes.lineSpacing}>
                  <Grid item xs={8} sm={9} className={classes.right}>
                    <Typography variant='body1'>
                      You Saved
                    </Typography>
                  </Grid>
                  <Grid item xs className={classes.right}>
                    <Typography variant='body1'>
                      { renderUICurrencyFromJSON(order.currency, order.discount) }
                    </Typography>
                  </Grid>
                </Grid>
              )
            }

            <Grid container className={classes.lineSpacing}>
              <Grid item xs={8} sm={9} className={classes.right}>
                <Typography variant='body1'>
                  Shipping
                </Typography>
              </Grid>
              <Grid item xs className={classes.right}>
                <Typography variant='body1'>
                  { order.shipping ? renderUICurrencyFromJSON(order.currency, order.shipping) : 'Free' }
                </Typography>
              </Grid>
            </Grid>

            <Grid container>
              <Grid item xs={8} sm={9} className={classes.right}>
                <Typography variant='body1'>
                  Tax
                </Typography>
              </Grid>
              <Grid item xs className={classes.right}>
                <Typography variant='body1'>
                  { renderUICurrencyFromJSON(order.currency, order.tax) }
                </Typography>
              </Grid>
            </Grid>

            <Grid container className={classes.total}>
              <Grid item xs={8} sm={9} className={classes.right}>
                <Typography variant='h6'>
                  Total
                </Typography>
              </Grid>
              <Grid item xs className={classes.right}>
                <Typography variant='h6'>
                  { renderUICurrencyFromJSON(order.currency, order.total) }
                </Typography>
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
    </Box>
  )
}

export default observer(Cart)
