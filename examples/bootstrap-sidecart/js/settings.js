module.exports = {
  key: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJiaXQiOjQ1MDM2MTcwNzU2NzUxNzIsImp0aSI6Imw3bDRMcUszTWFNIiwic3ViIjoiRXFUR294cDV1MyJ9.Xeg07zuDt6NjyuGl8rl2XRGph-bwulZhyYwBXthGjTpxCIh3Sj8XkBsthliOvifKCiUoi46lQWTahiUan0xZNw',
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
