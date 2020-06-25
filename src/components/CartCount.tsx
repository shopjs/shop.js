import React from 'react'
import ReactDOM from 'react-dom'

export default ({
  order,
}) => {
  console.log(order, order.items)
  return (
    <div>{ order.items.reduce((a,b) => a + b.quantity, 0) }</div>
  )
}
