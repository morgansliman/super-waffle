# super-waffle
[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

### Index
- [API Documentation](https://github.com/morgansliman/super-waffle#api-documentation)
- [Picture explaining this ridiculous repo name](https://github.com/morgansliman/super-waffle#super-waffle)

## API Documentation

For any of the api calls if there is a problem the error message will be returned as the following JSON:
```json
{ "error": [error_message] }
```

```javascript
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

![super waffle](github-has-spoken.png)