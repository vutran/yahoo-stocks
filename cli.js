#!/usr/bin/env node

const prog = require('caporal');
const pkg = require('./package');
const babar = require('babar');
const yf = require('./index');

prog
    .version(pkg.version)
    .command('lookup', 'Lookup a symbol')
    .argument('<symbol>', 'The stock symbol')
    .action((args, options, logger) => {
        yf.lookup(args.symbol).then((response) => {
            logger.info(response);
        });
    })

    .command('history', 'See history of a symbol')
    .argument('<symbol>', 'The stock symbol')
    .action((args, options, logger) => {
        yf.history(args.symbol).then((response) => {
            logger.info(response);
            const points = response.map(
                (p) => {
                    return [ p.time, p.close ];
                }
            );
            const high = Math.max.apply(null, points.map(p => p[1]));
            console.log('\n');
            console.log(
                babar(points, {
                    caption: args.symbol,
                    maxY: Math.ceil(high),
                })
            );
        });
    });

prog.parse(process.argv);
