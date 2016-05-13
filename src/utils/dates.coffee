moment = require 'moment'

module.exports = (date, format)->
  return moment(date).format format
