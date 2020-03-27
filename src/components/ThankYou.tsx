import React from 'react'

import {
  Box,
  Grid,
  Typography,
} from '@material-ui/core'

const ThankYou = ({
  width,
  height,
  order,
}): JSX.Element => {
  return (
    <Box p={[2, 3, 4]} className='thank-you'>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant='h5'>
            Thank you for you purchase.
          </Typography>
          <br />
          <Typography variant='body1'>
            Your order confirmation number is { <strong>{order.number}</strong> }.
          </Typography>
          <br />
          <Typography variant='body1'>
            You will also receive an email confirmation as well shipping related updates.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ThankYou
