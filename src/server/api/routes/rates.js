const apiUtil = require('../utils/apiUtil')
// todo: document /api/rate

module.exports = (app) => {
  app.post('/api/rate', (req, res) => {
    // Request should be sent in format:
    // { coin1: 'btc*', coin2: 'eth*', amount: 20 } (* => case insensitive)
    let coin1 = req.body.coin1.length === 3 ? req.body.coin1 : undefined
    let coin2 = req.body.coin2.length === 3 ? req.body.coin2 : undefined
    let amount = Number.isNaN(req.body.amount) === false
      ? +req.body.amount
      : undefined

    // Validate request parameters
    if (!coin1 || !coin2 || !amount) return res.status(400).end()

    // Get rates (only returns rates from exchanges compatible with given coin pair)
    apiUtil.getRates(coin1, coin2, amount).then((rates) => {
      res.send(rates)
    })
  })
}
