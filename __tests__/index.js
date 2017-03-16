// this test suite requires an active internet connection
// to fetch data from the yahoo finance API

import m from '../';

describe('yahoo-stocks', () => {
    it('should lookup a symbol', async () => {
        const response = await m.lookup('AAPL');
        expect(response.symbol).toBe('AAPL');
        expect(response.name).toBe('Apple Inc.');
    });

    it('should fail to lookup a symbol', async () => {
        try {
            await m.lookup('THIS_OBVIOUSLY_DOES_NOT_EXIST');
        } catch (err) {
            expect(err).toEqual(expect.anything());
        }
    });

    it('should lookup a symbol\'s history', async () => {
        const response = await m.history('AAPL');
        expect(response.previousClose).toBeTruthy();
        expect(response.records).toBeTruthy();
        expect(response.records.length).toBeGreaterThan(0);
    });

    it('should lookup a symbol\'s history (5 day history)', async () => {
        const response = await m.history('AAPL', { interval: '5d' });
        expect(response.previousClose).toBeTruthy();
        expect(response.records).toBeTruthy();
        expect(response.records.length).toBeGreaterThan(0);
    });

    it('should fail to lookup a symbol\'s history', async () => {
        try {
            const response = await m.history('THIS_OBVIOUSLY_DOES_NOT_EXIST');
        } catch (err) {
            expect(err).toEqual(expect.anything());
        }
    });
});
