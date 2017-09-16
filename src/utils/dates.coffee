import moment from 'moment-timezone'
import { getLanguage } from './language'

export rfc3339  = 'YYYY-MM-DDTHH:mm:ssZ'
export mmddyyyy = 'M-DD-YYYY'
export yyyymmdd = 'YYYY-MM-DD'
export ddmmyyyy = 'D-MM-YYYY'

export renderDate = (date, format) ->
  if !format?
    if getLanguage() == 'en-US'
      format = mmddyyyy
    else
      format = ddmmyyyy

  moment(date).format format
