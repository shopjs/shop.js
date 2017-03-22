import moment from 'moment'

export default (date, format)->
  return moment(date).format format
