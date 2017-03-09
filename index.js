const https = require('https');
const cheerio = require('cheerio');

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

const history = (symbol) => new Promise((resolve, reject) => {
    getJson(`https://query2.finance.yahoo.com/v7/finance/chart/${symbol}?interval=1h&indicators=quote&includeTimestamps=true&includePrePost=true&events=div%7Csplit%7Cearn`)
        .then((response) => {
            const h = response.chart.result[0].timestamp.map((time, idx) => {
                return {
                    time,
                    close: response.chart.result[0].indicators.quote[0].close[idx],
                    open: response.chart.result[0].indicators.quote[0].open[idx],
                    high: response.chart.result[0].indicators.quote[0].high[idx],
                    low: response.chart.result[0].indicators.quote[0].low[idx],
                    volume: response.chart.result[0].indicators.quote[0].volume[idx],
                };
            });
           resolve(h);
        })
        .catch(reject);
});

module.exports = {
    lookup,
    history,
};
