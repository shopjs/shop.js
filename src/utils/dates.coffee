import moment from 'moment'

export renderDate = (date, format) ->
  moment(date).format format
