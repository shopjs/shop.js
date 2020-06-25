import React from 'react'
import ReactDOM from 'react-dom'

export default ({
  order,
}) => {
  return (
    <div>{ order.items.reduce((a,b) => a + b, 0) }</div>
  )
}
