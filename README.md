# super-waffle
[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## Index
- [Local Installation Instructions](#installing-locally)
- [API Documentation](#api-documentation)
    - [Market Rates for Coin Pairs](#market-rates-for-coin-pairs)
    - [Coin Price History](#coin-price-history)
- [Picture explaining this ridiculous repo name](#github-has-spoken)

### Installing Locally

First ensure that you have NodeJS and NPM installed:

> `$ node --version`
>
> `$ npm --version`

It's very important that you have Node version >=7.9.0 installed 
as some ES2017 features such as `async/await` will not work in older versions

Steps to run the site locally:
- `git clone https://github.com/morgansliman/super-waffle`
- `npm install`
- That's it! Open any web browser to `localhost`

### API Documentation

For any of the api calls if there is a problem the error message will be returned as the following JSON:
```
{ "error": [error_message] }
```

#### Market Rates for Coin Pairs

```
url: /api/v1/rate
method: POST
data:
    {
        "coin1": [coin]
        "coin2": [coin]
        "amount": [amount]
    }

    [coin] is a coin short name (i.e. "btc")
    [amount] is the number of `coin1` tokens you are converting


Success Output:

    {
        "BTC-e" : {
            "rate": [market_rate],
            "convertedAmount": [converted_amount]
        },
        "Poloniex" : ... ,
        "Bittrex": ...
    }

    [market_rate] is the respective market's lowest asking rate
    [converted_amount] is the amount of `coin2` received if traded at this exchange

    Currently the only supported exchanges are BTC-e, Poloniex, and Bittrex

    If a sent coin pair is not supported by one of the above exchanges,
    API success output will simply not include unsupported exchanges
    Example:
    {
        coin1: 'ltc',
        coin2: 'eth',
        amount: 20
    }
        Success Output:

        {
          "BTC-e": {
            "rate": 4.91717,
            "convertedAmount": 98.34339999999999
          }
        }

    In the event that no markets support the given coin pair,
    an empty object {} will be returned
```

#### Coin Price History

```
url: /api/v1/history/[timeframe]/[coin]
method: GET

    Timeframes supported

    * /history/1day/
    * /history/7day/
    * /history/30day/
    * /history/90day/
    * /history/180day/
    * /history/365day/

    [coin] is a coin short name (i.e. "btc")

    Currently supported coins are:

        BTC, LTC, ETH, DASH

Success Output:

    {
        "BTC": [
            [
                *date in seconds from epoch*,
                *price in USD*
            ],
            [
                ...,
                ...
            ],
            ...
        ]
    }

    Timeframe is optional
    /history/:coin will return all data

    Coin is also optional
    /history/:timeframe will return data for all supported coins from given timeframe
    /history/ will return all data for all supported coins
```

### Github has spoken
![super waffle image](github-has-spoken.png)
