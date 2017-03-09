#!/usr/bin/env node

const prog = require('caporal');
const pkg = require('./package');
const Canvas = require('drawille');
const line = require('bresenham');
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
            const points = response.map(
                (p) => {
                    return [ p.time, p.close ];
                }
            );
            const low = Math.floor(Math.min.apply(null, points.map(p => p[1])));
            const high = Math.ceil(Math.max.apply(null, points.map(p => p[1])));
            const canvasWidth = 180;
            const canvasHeight = 80;
            const slice = high - low;
            const stepY = canvasHeight / slice;
            const c = new Canvas(canvasWidth, canvasHeight);

            points.forEach((p, idx) => {
                c.set(
                    (idx * canvasWidth / points.length),
                    (high - p[1]) * stepY
                );
            });
            console.log(c.frame());
        });
    });

prog.parse(process.argv);
