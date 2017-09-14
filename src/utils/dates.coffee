import moment from 'moment-timezone'

export rfc3339 = 'YYYY-MM-DDTHH:mm:ssZ'

export renderDate = (date, format) ->
  moment(date).format format
