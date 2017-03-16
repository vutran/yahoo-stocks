# yahoo-stocks

> Fetch stock data from Yahoo! Finance

## Install

```
$ npm install --save yahoo-stocks
```

## Usage

```
import { lookup, history } from 'yahoo-stocks';

lookup('AAPL').then(response => {
    console.log(response);
});

history('AAPL').then(response => {
    console.log(response);
});
```

## API

### lookup(symbol)

Returns a `Promise` that resolves the data for the symbol.

#### symbol

Type: `String`

The stock symbol.

### history(symbol, [options])

Returns a `Promise` that resolves the price history for the symbol.

#### symbol

Type: `String`

The stock symbol.

#### options

Type: `Object`

A dictionary of customizable options

- `interval` - Set the interval for the price changes (Currently available options: `5d`)

## License

MIT © [Vu Tran](https://github.com/vutran/)
