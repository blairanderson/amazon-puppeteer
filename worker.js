require('dotenv').config();
const async = require('async');
const { fetchASIN } = require('./fetchasin.js');
const { asinCache } = require('./cacher.js');
const { sampleSize } = require('lodash');
const request = require('request-json');

var client = request.createClient(
  'https://vdb:9999999@vendordb.herokuapp.com/'
);

client.get('api/cleanups.json', cleanupsList);

function finalFinal(err, result) {
  console.log('final-err', err);
  console.log('final-result', result);
  process.exit();
}

function cleanupsList(err, res, body) {
  var asinsToProcess = sampleSize(body.asins.slice(0, 50), 2);
  console.log('asinsToProcess', asinsToProcess);

  async.whilst(
    function() {
      return asinsToProcess.length > 0;
    },
    function(callback) {
      fetchAndSend(asinsToProcess.shift(), callback);
    },
    finalFinal
  );
}

function fetchAndSend(asin, callback) {
  console.log('fetchAndSend', asin);

  fetch(asin, function(error, data) {
    if (error) {
      console.log('fetch-error', error);
      callback(error, null);
    } else {
      console.log('fetch-success', data);
      client.patch(
        `api/cleanups/${asin}.json`,
        { id: asin, asin: asin, data: data },
        function(err, res, body) {
          console.log('patch-err', err);
          console.log('patch-success', res.statusCode);
          callback(err, body);
        }
      );
    }
  });
}

function fetch(asin, callback) {
  asinCache(asin, function(data) {
    if (data != null) {
      callback(null, data);
    } else {
      fetchASIN(asin)
        .then(function(data) {
          callback(null, data);
        })
        .catch(callback);
    }
  });
}
