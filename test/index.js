require('dotenv').config();
const fetchASIN = require('../fetchasin.js');
const equal = require('deep-equal')
const { diff, addedDiff, deletedDiff, detailedDiff, updatedDiff } = require("deep-object-diff");
const waterfall = require('async-waterfall');
const TEST = ['B01BGZSZH2', 'B003IW9CVA'];

waterfall(
  TEST.map(function(asin) {
    return function(done) {
      // same execution for each item, call the next one when done
      testAsin(asin, done);
    };
  })
);

function testAsin(asin, done) {
  let expectation = require(`./fixture/${asin}.js`);
  fetchASIN(asin)
    .then(function(data) {
      if (equal(data,expectation)) {
        console.log('correct!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
      } else {
        console.error('WRONG');
        console.log(JSON.stringify(data, null, 4))
        console.log(JSON.stringify(detailedDiff(data, expectation)));
      }
      done();
    })
    .catch(function(error) {
      console.log('NOT FOUND', JSON.stringify(error));
      done(error);
    });
}
