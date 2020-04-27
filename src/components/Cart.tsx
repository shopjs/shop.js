import React from 'react'
import { observer } from 'mobx-react'
import classnames from 'classnames'

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

import ShoppingCartIcon from '@material-ui/icons/ShoppingCart'

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

    '& > *': {
      fontWeight: 800,
    },
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
  locked,
  cartIcon,
  cartTitle,
}): JSX.Element => {
  const classes = useStyles()

  return (
    <Box p={[2, 3, 4]} className='cart'>
      <Grid container>
        <Grid item xs={12} className='cart-header'>
          <Grid container spacing={1} alignItems='center'>
            <Grid item className='cart-icon'>
              { cartIcon || <ShoppingCartIcon style={{fontSize: '2rem'}}/> }
            </Grid>
            <Grid item className='cart-title'>
              { !!(order.items && order.items.length && order.items.length > 0)
                  ? cartTitle || (
                    <Typography variant='h6'>
                      Your Items
                    </Typography>
                  )
                  : <Typography variant='h6'>
                      Your Cart Is Empty.
                    </Typography>
               }
            </Grid>
          </Grid>
        </Grid>
        {
          !!(order.items && order.items.length && order.items.length > 0)
            && <Grid item xs={12}>
              <div className={classnames(classes.items, 'cart-items')}>
                { order.items.map((item) => {
                    return (
                      <Grid container alignItems='center' key={item.name} className='cart-item'>
                        <Grid item xs={12} sm={8} className='cart-item-name'>
                          <Typography variant='body1'>
                            { item.name }
                          </Typography>
                          <Typography variant='body2'>
                            { item.description }
                          </Typography>
                          <br/>
                        </Grid>
                        <Grid item xs={8} sm={2} className={classnames(classes.right, 'cart-item-price')}>
                          <Typography variant='body1'>
                            { renderUICurrencyFromJSON(order.currency, item.price) }&nbsp;x
                          </Typography>
                        </Grid>
                        <Grid item xs={4} sm={2} className={classnames(classes.right, 'cart-item-quantity')}>
                          <MUIText
                            select
                            disabled={ item.locked || locked}
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
        }

        { !!(order.items && order.items.length && order.items.length > 0)
          && <>
            <Grid item xs={12} className={classnames(classes.coupon, 'cart-coupon')}>
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
                      disabled={locked}
                    />
                  </Grid>
                  <Grid item xs={4} sm={2} md={3}>
                    <Button
                      className={classes.couponButton}
                      fullWidth
                      disableElevation
                      size='medium'
                      variant='contained'
                      disabled={locked}
                    >
                      Apply
                    </Button>
                  </Grid>
                </Grid>
              </div>
            </Grid>

            <Grid item xs={12} className='cart-summary'>
              <div>
                <Grid container className={classnames(classes.lineSpacing, 'cart-summary-subtotal')}>
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
                    <Grid container className={classnames(classes.lineSpacing, 'cart-summary-discount')}>
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

                <Grid container className={classnames(classes.lineSpacing, 'cart-summary-shipping')}>
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

                <Grid container className='cart-summary-tax'>
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

                <Grid container className={classnames(classes.total, 'cart-summary-total')}>
                  <Grid item xs={8} sm={9} className={classes.right}>
                    <Typography variant='body1'>
                      Total
                    </Typography>
                  </Grid>
                  <Grid item xs className={classes.right}>
                    <Typography variant='body1'>
                      { renderUICurrencyFromJSON(order.currency, order.total) }
                    </Typography>
                  </Grid>
                </Grid>
              </div>
            </Grid>
          </>
        }
      </Grid>
    </Box>
  )
}

export default observer(Cart)
