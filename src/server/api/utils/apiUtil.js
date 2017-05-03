const request = require('request-promise-native')

// BTC-e API handler
const BTCE = {
  pairs: [], // will store valid pairs from BTCE /info endpoint
  updated: null, // last time BTCE.pairs was updated
  _refreshValidPairs: () => { // returns Promise
    return request({
      url: 'https://btc-e.com/api/3/info',
      json: true
    }).catch((err) => {
      throw err
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

    // btc-e seems to be the outlier..
    // so I'm hard coding this for now
    if (/dash/i.test(coin1)) coin1 = 'dsh'
    if (/dash/i.test(coin2)) coin2 = 'dsh'

    // necessary step because of BTC-e API structure
    // example: accepts 'eth_btc' but not 'btc_eth'
    let coinPair = `${coin1.toLowerCase()}_${coin2.toLowerCase()}`
    let pairCoin = `${coin2.toLowerCase()}_${coin1.toLowerCase()}`

    // weed out the bad pair(s)
    if (BTCE.pairs.includes(coinPair) === false) coinPair = null
    if (BTCE.pairs.includes(pairCoin) === false) pairCoin = null
    if (coinPair === null && pairCoin === null) return [null]

    // finally, construct/return query string ( index 0 ) and indicator for which pair was valid ( index 1 )
    return [`https://btc-e.com/api/3/ticker/${coinPair || pairCoin}`, (coinPair ? 0 : 1)]
  },
  getRate: async (coin1, coin2, amount) => {
    let [query, rateMath] = await BTCE._getQueryString(coin1, coin2, amount)
    if (query === null) return null
    // else...
    return request({
      url: query,
      json: true
    }).catch((err) => {
      throw err
    }).then((data) => {
      if (data.error) throw new Error(data.error)
      // only key should be the coinPair
      let keys = Object.keys(data)
      // convert the rate into one that can easily be multiplied by `amount`
      return rateMath ? (1 / +data[keys[0]].sell) : data[keys[0]].sell
    })
  }
}

// Poloniex API handler
const POLONIEX = {
  getRate: async (coin1, coin2, amount) => {
    return request({
      url: 'https://poloniex.com/public?command=returnTicker',
      json: true
    }).catch((err) => {
      throw err
    }).then((data) => {
      if (data.error) throw new Error(data.error)

      // necessary step because of Poloniex API structure
      // example: accepts 'ETH_BTC' but not 'BTC_ETH'
      let coinPair = `${coin1.toUpperCase()}_${coin2.toUpperCase()}`
      let pairCoin = `${coin2.toUpperCase()}_${coin1.toUpperCase()}`

      if (data.hasOwnProperty(coinPair) && +data[coinPair].isFrozen === 0) return (1 / +data[coinPair].lowestAsk)
      if (data.hasOwnProperty(pairCoin) && +data[pairCoin].isFrozen === 0) return data[pairCoin].lowestAsk
      return null
    })
  }
}

// Bittrex API handler
const BITTREX = {
  getRate: async (coin1, coin2, amount) => {
    return request({
      url: 'https://bittrex.com/api/v1.1/public/getmarketsummaries',
      json: true
    }).catch((err) => {
      throw err
    }).then((data) => {
      if (data.success === false) throw new Error(data.message)

      // necessary step because of Bittrex API structure
      // example: accepts 'BTC-ETH' but not 'ETH-BTC'
      let coinPair = `${coin1.toUpperCase()}-${coin2.toUpperCase()}`
      let pairCoin = `${coin2.toUpperCase()}-${coin1.toUpperCase()}`

      // https://jsperf.com/for-vs-foreach/75
      for (let i = 0; i < data.result.length; i++) {
        let mktName = data.result[i].MarketName
        if (mktName === coinPair) return 1 / +data.result[i].Ask
        if (mktName === pairCoin) return data.result[i].Ask
      }
      return null
    })
  }
}

async function getRates (coin1, coin2, amount) {
  let rates = {
    'BTC-e': await BTCE.getRate(coin1, coin2, amount),
    'Poloniex': await POLONIEX.getRate(coin1, coin2, amount),
    'Bittrex': await BITTREX.getRate(coin1, coin2, amount)
  }

  // filter out all incompatible exchanges (null value)
  for (let rate in rates) {
    if (rates[rate] === null) delete rates[rate]
  }

  return rates
}

async function getHistory (timeframe) {
  async function btc () {
    return request({
      url: `http://www.coincap.io/history/${timeframe ? timeframe + '/' : ''}BTC`,
      json: true
    }).catch((err) => {
      throw err
    }).then((data) => {
      return data.price
    })
  }

  async function eth () {
    return request({
      url: `http://www.coincap.io/history/${timeframe ? timeframe + '/' : ''}ETH`,
      json: true
    }).catch((err) => {
      throw err
    }).then((data) => {
      return data.price
    })
  }

  async function ltc () {
    return request({
      url: `http://www.coincap.io/history/${timeframe ? timeframe + '/' : ''}LTC`,
      json: true
    }).catch((err) => {
      throw err
    }).then((data) => {
      return data.price
    })
  }

  async function dash () {
    return request({
      url: `http://www.coincap.io/history/${timeframe ? timeframe + '/' : ''}DASH`,
      json: true
    }).catch((err) => {
      throw err
    }).then((data) => {
      return data.price
    })
  }
  return {
    'BTC': await btc(),
    'ETH': await eth(),
    'LTC': await ltc(),
    'DASH': await dash()
  }
}

module.exports = {
  getRates: getRates,
  getHistory: getHistory
}
