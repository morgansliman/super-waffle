const apiUtil = require('../utils/apiUtil')

module.exports = (app) => {
  // private endpoint for front end use
  app.post('/api/rate', (req, res) => {
    // soft check for proper request parameters
    let coin1 = req.body.coin1.length <= 4 ? req.body.coin1 : undefined
    let coin2 = req.body.coin2.length <= 4 ? req.body.coin2 : undefined
    let amount = Number.isNaN(req.body.amount) === false
      ? +req.body.amount
      : undefined

    // Validate request parameters
    if (!coin1 || !coin2 || !amount) return res.status(400).end()

    // Get rates (only returns rates from exchanges compatible with given coin pair)
    apiUtil.getRates(coin1, coin2, amount).then((rates) => {
      res.json(rates)
    }).catch((err) => {
      console.log(err)
      throw err
    })
  })

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials')
    res.header('Access-Control-Allow-Credentials', 'true')
    next()
  })

  // Request should be sent in format:
  // { coin1: 'btc*', coin2: 'eth*', amount: 20 } (* => case insensitive)
  app.post('/api/v1/rate', (req, res) => {
    // soft check for proper request parameters
    let coin1 = req.body.coin1.length <= 4 ? req.body.coin1 : undefined
    let coin2 = req.body.coin2.length <= 4 ? req.body.coin2 : undefined
    let amount = Number.isNaN(req.body.amount) === false
      ? +req.body.amount
      : undefined

    // Validate request parameters
    if (!coin1 || !coin2 || !amount) return res.status(400).json({ error: 'Missing required parameter' })
    else if (coin1.toLowerCase() === coin2.toLowerCase()) return res.status(400).json({ error: 'Same coin conversion not allowed' })
    else if (+amount <= 0) return res.status(400).json({ error: 'Amount must be greater than zero' })

    // Get rates (only returns rates from exchanges compatible with given coin pair)
    apiUtil.getRates(coin1, coin2, amount).then((rates) => {
      let results = {}
      for (let key in rates) {
        let val = rates[key]
        results[key] = {
          rate: val,
          convertedAmount: +val * +amount
        }
      }
      res.json(results)
    }).catch((err) => {
      console.log(err)
      throw err
    })
  })
}
