#!/usr/bin/env node
const findEarliestSunrise = require('./lib/find-earliest-sunrise');
require('dotenv').config();

const API_URL = process.env.API_URL;
if (!API_URL) {
  console.error('Please, define an API URL!');
  process.exit(1);
}
const MAX_CONCURRENT_FETCH = process.env.MAX_CONCURRENT_FETCH || 5;
const NUMBER_OF_POINTS = process.env.NUMBER_OF_POINTS || 100;
findEarliestSunrise({
  apiURL: API_URL,
  maxConcurrentFetch: MAX_CONCURRENT_FETCH,
  numberOfPoints: NUMBER_OF_POINTS,
});
