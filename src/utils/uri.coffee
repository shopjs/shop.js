import store        from 'akasha'

# Dictionarify the query string for easy look up,
# cache it too
queries = null
export getQueries = ->
  if queries
    return queries

  search = /([^&=]+)=?([^&]*)/g
  q = window.location.href.split('?')[1]
  qs = {}
  if q?
    while (match = search.exec(q))
      k = match[1]
      try
        k = decodeURIComponent k
      v = match[2]
      try
        v = decodeURIComponent v
      catch err
      qs[k] = v

  queries = qs

# Fetch referrer if one is specifies in the query or
# fetch it from the localstorage
export getReferrer = (hashReferrer = false) ->
  ref = null

  if getQueries().referrer?
    ref = getQueries().referrer
  else
    ref = store.get 'referrer'

  if hashReferrer
    r = window.location.hash.replace('#','')
    if r != ''
      referrer = r
    else
      referrer = ref
  else
    referrer = ref

# Fetch Mailchimp ids
export getMCIds = () ->
  [getQueries().mc_eid, getQueries().mc_cid]


