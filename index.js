const https = require('https');
const moment = require('moment');

const RANGES = ['1h', '1d', '5d', '1mo', '1y', 'max'];

const get = (url) => new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
        let data = '';
        res.on('data', (d) => {
            data += d;
        });
        res.on('end', () => {
            resolve(data);
        });
    });
    req.on('error', (e) => {
        reject(e);
    });
});

const getJson = (url) => new Promise((resolve, reject) => {
    get(url)
        .then((resp) => JSON.parse(resp))
        .then(resolve)
        .catch(reject);
});

const lookup = (symbol) => new Promise((resolve, reject) => {
    Promise.all([
            getJson(`https://autoc.finance.yahoo.com/autoc?query=${symbol}&region=1&lang=en`),
            getJson(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?&modules=summaryProfile,financialData`),
        ])
        .then((responses) => {
            if (!responses[0].ResultSet.Result.length) {
                reject(true);
                return;
            }
            const financialData = responses[1].quoteSummary.result[0].financialData;
            resolve({
                symbol,
                name: responses[0].ResultSet.Result[0].name,
                exchange: responses[0].ResultSet.Result[0].exchDisp,
                currentPrice: financialData.currentPrice.raw,
                highPrice: financialData.targetHighPrice.raw,
                lowPrice: financialData.targetLowPrice.raw,
                meanPrice: financialData.targetMeanPrice.raw,
                medianPrice: financialData.targetMedianPrice.raw,
            });
        })
        .catch(reject);
});

const history = (symbol, options) => new Promise((resolve, reject) => {
    let interval = '1m';
    let start = moment().utc().hour(14).minute(30).second(0).millisecond(0).subtract(1, 'day');
    let end = start.clone().hour(21).minute(0).second(0).millisecond(0);

    if (options) {
        interval = options.interval || interval;
        start = options.start ? moment(options.start) : start;
        end = options.end ? moment(options.end) : end;

        if (options.interval === '5d') {
            interval = '5m';
            start.subtract(6, 'day');
            end.set(start);
        }
    }

    getJson(`https://query2.finance.yahoo.com/v7/finance/chart/${symbol}?period2=${end.unix()}&period1=${start.unix()}&interval=${interval}&indicators=quote&includeTimestamps=true&includePrePost=true&events=div%7Csplit%7Cearn`)
        .then((response) => {
            const quote = response.chart.result[0].indicators.quote[0];
            const meta = response.chart.result[0].meta;
            const h = response.chart.result[0].timestamp.map((time, idx) => {
                return {
                    time,
                    close: quote.close[idx],
                    open: quote.open[idx],
                    high: quote.high[idx],
                    low: quote.low[idx],
                    volume: quote.volume[idx],
                };
            });
            resolve({
                previousClose: meta.previousClose,
                records: h,
            });
        })
        .catch(reject);
});

module.exports = {
    lookup,
    history,
};
