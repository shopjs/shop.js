import React from 'react'

import {
  Grid,
} from '@material-ui/core'

import Cart from './Cart'
import ShippingForm from './ShippingForm'
import Steps from './Steps'

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
}): JSX.Element => {
  return (
    <AutoSizer>
      {
        ({ width, height }) => {
          const halfWidth = Math.floor(width / 2)

          return (
            <div style={{ width: halfWidth * 2 }}>
              <Grid container>
                <Grid item xs={12}>
                  <Steps/>
                </Grid>
                <Grid item xs={12} md={6}>
                  <ShippingForm
                    width={halfWidth}
                    height={height}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Cart
                    width={halfWidth}
                    height={height}
                    order={order}
                    setCoupon={setCoupon}
                    setItem={setItem}
                  />
                </Grid>
              </Grid>
            </div>
          )
        }
      }
    </AutoSizer>
  )
}

export default Checkout
