#!/usr/bin/env node

const prog = require('caporal');
const colors = require('colors');
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
            const points = response.records.map(
                (p) => {
                    return [ p.time, p.close ];
                }
            );
            const close = points[points.length - 1];
            const low = Math.floor(Math.min.apply(null, points.map(p => p[1])));
            const high = Math.ceil(Math.max.apply(null, points.map(p => p[1])));
            const canvasWidth = (process.stdout.columns * 2) - 10;
            const canvasHeight = canvasWidth * 0.45;
            const slice = high - low;
            const stepY = canvasHeight / slice;
            const c = new Canvas(canvasWidth, canvasHeight);

            points.forEach((p, idx) => {
                c.set(
                    (idx * canvasWidth / points.length),
                    (high - p[1]) * stepY
                );
            });

            if (close[1] >= response.previousClose) {
                console.log(colors.green(c.frame()));
            } else {
                console.log(colors.red(c.frame()));
            }
        });
    });

prog.parse(process.argv);
