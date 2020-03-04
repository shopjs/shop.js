import React from 'react'

import { useTheme } from '@material-ui/core/styles'

import {
  Box,
  Typography,
} from '@material-ui/core'

const ShippingForm = ({
  width,
  height,
}): JSX.Element => {
  return (
    <Box p={[2, 3, 4]}>
      <Typography variant='h5'>
        Shipping Information
      </Typography>
    </Box>
  )
}

export default ShippingForm
