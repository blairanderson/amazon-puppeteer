require('dotenv').config();
const async = require('async');
const { fetchASIN } = require('./fetchasin.js');
const { asinCache } = require('./cacher.js');
const { sampleSize, delay } = require('lodash');
const request = require('request-json');

// 1. get the CURRENT LIST of ASINs to update
// 2. chop it down
//

var client = request.createClient('https://vendordb.herokuapp.com/');
// heroku config:set VDB_NAME='vdb'
// heroku config:set VDB_PASS='9999999'
client.setBasicAuth(process.env.VDB_NAME, process.env.VDB_PASS);
client.get('api/cleanups.json', cleanupsList);

function cleanupsList(err, res, body) {
  // heroku config:set ASINS_TO_PROCESS=2
  var asinsToProcess = sampleSize(
    body.asins.slice(0, 50),
    parseInt(process.env.ASINS_TO_PROCESS)
  );

  console.log('asinsToProcess', asinsToProcess);

  async.whilst(
    function() {
      return asinsToProcess.length > 0;
    },
    function(callback) {
      delay(fetchAndSend, 3000, asinsToProcess.shift(), callback);
    },
    finalFinal
  );
}

function finalFinal(err, result) {
  console.log('final-err', err);
  console.log('final-result', result);
  process.exit();
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
