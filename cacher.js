const rd = require('redis').createClient;
const redis = process.env.REDIS_URL
  ? rd(process.env.REDIS_URL)
  : rd(6379, 'localhost');

function asinCache(asin, callback) {
  if (process.env.CACHE === 'true' || process.env.CACHE === true) {
    console.log('cache');
    redis.get(asin, function(err, data) {
      if (err) throw err;

      if (data != null) {
        console.log('cache-hit', asin);
        callback(JSON.parse(data));
      } else {
        console.log('cache-miss', asin);
        callback(null);
      }
    });
  } else {
    console.log('no-cache');
    callback(null);
  }
}

module.exports = { asinCache };
