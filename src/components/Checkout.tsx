import React from 'react'

import {
  Grid
} from '@material-ui/core'

import ContactForm from './ContactForm'

import { AutoSizer } from 'react-virtualized'

const Checkout = (): JSX.Element => {
  return (
    <AutoSizer>
      {({ width, height }) => (
        <Grid container>
          <Grid item>
            <ContactForm
              width={width}
              height={height}
            />
          </Grid>
        </Grid>
      )}
    </AutoSizer>
  )
}

export default Checkout
