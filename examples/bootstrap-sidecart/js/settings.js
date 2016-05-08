module.exports = {
  key: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJiaXQiOjQ1MDM2MTcwNzU2NzUxNzIsImp0aSI6IjlVTlh6MUoyZlE0Iiwic3ViIjoiRXFUR294cDV1MyJ9.N1QaJPj098JsaOuDU_fBKeChem3VDn-ggWy9V0QulOZ6R2ySIOxs79I_ajQtm9QJ842QR3hZDFl78vhXJqOeVw',
  endpoint: 'https://api.staging.crowdstart.com',
  taxRates: [
    {
      taxRate: 0.0875,
      city: 'san francisco',
      state:    'ca',
      country: 'us'
    },
    {
      taxRate: 0.075,
      state:   'ca',
      country: 'us'
    }
  ],
  referralProgram: {
    name:     'Such Referral',
    triggers: [0],
    actions: [
      {
        type:     'Credit',
        currency: 'points',
        amount:   1
      }
    ]
  }
};
