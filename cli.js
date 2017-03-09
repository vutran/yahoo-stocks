#!/usr/bin/env node

const prog = require('caporal');
const pkg = require('./package');
const yf = require('./index');

prog
    .version(pkg.version)
    .command('lookup', 'Lookup a symbol')
    .argument('<symbol>', 'The stock symbol')
    .action((args, options, logger) => {
        yf.lookup(args.symbol).then((response) => {
            logger.info(response);
        });
    });

prog.parse(process.argv);
