const request = require('request-promise-native')
// todo: document /api/rate

// Will store valid pairs from BTCE /info endpoint
const BTCE = {
  pairs:              [],
  updated:            null,
  _refreshValidPairs: () => { // returns Promise
    return request({
      url:  'https://btc-e.com/api/3/info',
      json: true
    }).then((data) => {
      if (data.error) throw new Error(data.error)
      let pairs = []
      for (let pair in data.pairs) {
        if (data.pairs[pair].hidden === 0) pairs.push(pair)
      }
      BTCE.pairs   = pairs
      BTCE.updated = Date.now()
    })
  },
  _getQueryString:    async (coin1, coin2, amount) => {
    // judgement call: 2 min timeout for refreshing valid pairs
    if (BTCE.pairs.length === 0 || (Date.now() - BTCE.updated > 120000)) {
      await BTCE._refreshValidPairs()
    }
    // necessary step because of BTC-e API structure
    // example: accepts 'eth_btc' but not 'btc_eth'
    let coin_pair = `${coin1.toLowerCase()}_${coin2.toLowerCase()}`
    let pair_coin = `${coin2.toLowerCase()}_${coin1.toLowerCase()}`

    // weed out the bad pair(s)
    if (BTCE.pairs.includes(coin_pair) === false) coin_pair = null
    if (BTCE.pairs.includes(pair_coin) === false) pair_coin = null
    if (coin_pair === null && pair_coin === null) return null

    // finally, construct/return query string
    return `https://btc-e.com/api/3/ticker/${coin_pair || pair_coin}`
  },
  getRate:            async (coin1, coin2, amount) => {
    let query = await BTCE._getQueryString(coin1, coin2, amount)
    if (query === null) return null
    // else...
    return request({
      url:  query,
      json: true
    }).then((data) => {
      if (data.error) throw new Error(data.error)
      // only key should be the coin_pair
      let keys = Object.keys(data)
      return 1 / +data[keys[0]].low // because btc-e is backwards and we're only converting from btc
    })
  }
}

// todo: attribute rates to respective exchange
async function getRates(coin1, coin2, amount) {
  let btceRate = BTCE.getRate(coin1, coin2, amount)
  // let poloniexRate
  // let bittnexRate

  // filter out all incompatible exchanges (null value)
  return [await btceRate].filter(el => el)
}

module.exports = (app) => {
  app.post('/api/rate', (req, res) => {
    // Request should be sent in format:
    // { coin1: 'btc*', coin2: 'eth*', amount: 20 } (* => case insensitive)
    let coin1  = req.body.coin1.length === 3 ? req.body.coin1 : undefined
    let coin2  = req.body.coin2.length === 3 ? req.body.coin2 : undefined
    let amount = Number.isNaN(req.body.amount) === false
      ? +req.body.amount
      : undefined

    // Validate request parameters
    if (!coin1 || !coin2 || !amount) return res.status(400).end()

    // Get rates (only returns rates from exchanges compatible with given coin pair)
    getRates(coin1, coin2, amount).then((rates) => {
      res.send(rates)
    })
  })
}