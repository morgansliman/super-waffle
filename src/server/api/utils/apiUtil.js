const request = require('request-promise-native')

// BTC-e API handler
const BTCE = {
  pairs: [], // will store valid pairs from BTCE /info endpoint
  updated: null, // last time BTCE.pairs was updated
  _refreshValidPairs: () => { // returns Promise
    return request({
      url: 'https://btc-e.com/api/3/info',
      json: true
    }).then((data) => {
      if (data.error) throw new Error(data.error)
      let pairs = []
      for (let pair in data.pairs) {
        if (data.pairs[pair].hidden === 0) pairs.push(pair)
      }
      BTCE.pairs = pairs
      BTCE.updated = Date.now()
    })
  },
  _getQueryString: async (coin1, coin2, amount) => {
    // judgement call: 2 min timeout for refreshing valid pairs
    if (BTCE.pairs.length === 0 || (Date.now() - BTCE.updated > 120000)) {
      await BTCE._refreshValidPairs()
    }
    // necessary step because of BTC-e API structure
    // example: accepts 'eth_btc' but not 'btc_eth'
    let coinPair = `${coin1.toLowerCase()}_${coin2.toLowerCase()}`
    let pairCoin = `${coin2.toLowerCase()}_${coin1.toLowerCase()}`

    // weed out the bad pair(s)
    if (BTCE.pairs.includes(coinPair) === false) coinPair = null
    if (BTCE.pairs.includes(pairCoin) === false) pairCoin = null
    if (coinPair === null && pairCoin === null) return null

    // finally, construct/return query string
    return `https://btc-e.com/api/3/ticker/${coinPair || pairCoin}`
  },
  getRate: async (coin1, coin2, amount) => {
    let query = await BTCE._getQueryString(coin1, coin2, amount)
    if (query === null) return null
    // else...
    return request({
      url: query,
      json: true
    }).then((data) => {
      if (data.error) throw new Error(data.error)
      // only key should be the coinPair
      let keys = Object.keys(data)
      return 1 / +data[keys[0]].low // because btc-e is backwards and we're only converting from btc
    })
  }
}

// Poloniex API handler
const POLONIEX = {
  _getCoinPair: (coin1, coin2) => {
    // necessary step because of Poloniex API structure
    // example: accepts 'btc_eth' but not 'eth_btc'
    let coinPair = `${coin1.toLowerCase()}_${coin2.toLowerCase()}`
    let pairCoin = `${coin2.toLowerCase()}_${coin1.toLowerCase()}`

    // weed out the bad pair(s)
    if (BTCE.pairs.includes(coinPair) === false) coinPair = null
    if (BTCE.pairs.includes(pairCoin) === false) pairCoin = null
    if (coinPair === null && pairCoin === null) return null

    // finally, construct/return query string
    return `https://btc-e.com/api/3/ticker/${coinPair || pairCoin}`
  },
  getRate: async (coin1, coin2, amount) => {
    let query = await POLONIEX._getCoinPair(coin1, coin2, amount)
    if (query === null) return null
    // else...
    return request({
      url: query,
      json: true
    }).then((data) => {
      if (data.error) throw new Error(data.error)
      // only key should be the coinPair
      let keys = Object.keys(data)
      return 1 / +data[keys[0]].low // because btc-e is backwards and we're only converting from btc
    })
  }
}

async function getRates (coin1, coin2, amount) {
  let rates = {
    'BTC-e': await BTCE.getRate(coin1, coin2, amount)
  }

  // filter out all incompatible exchanges (null value)
  for (let rate in rates) {
    if (rates[rate] === null) delete rates[rate]
  }

  return rates
}

module.exports = {
  getRates: getRates
}
