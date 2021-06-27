#!/usr/bin/env node
const parse = require('date-fns/parse');
const { findEarliestSunrise } = require('./lib/find-earliest-sunrise');
const { program } = require('commander');
program.version('1.0.0');

program
  .option('-r, --concurrent-requests <number>', 'Maximum number of parallel tasks execution. Default value is 5.')
  .option('-p, --points <number>', '# of random points (coordinates) to check. Default value is 100.')
  .option('-d, --date <date>', 'The day for the sunrise/sunset information you want to request in YYYY-MM-DD format. Default value is today.');
program.parse(process.argv);

const options = program.opts();

require('dotenv').config();
const API_URL = process.env.API_URL;
if (!API_URL) {
  console.error('Please, define an API URL!');
  process.exit(1);
}
const MAX_CONCURRENT_FETCH = +(options.concurrentRequests || process.env.MAX_CONCURRENT_FETCH || 5);
const NUMBER_OF_POINTS = +(options.points || process.env.NUMBER_OF_POINTS || 100);

if (options.date) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (
    !dateRegex.test(options.date) ||
    parse(options.date, 'yyyy-MM-dd', new Date()).toString() === 'Invalid Date'
  ) {
    console.error('Error: Incorrect format for "date" argument. Please, use YYYY-MM-DD format');
    process.exit(1);
  }
}

findEarliestSunrise({
  apiURL: API_URL,
  maxConcurrentFetch: MAX_CONCURRENT_FETCH,
  numberOfPoints: NUMBER_OF_POINTS,
  date: options.date,
});
