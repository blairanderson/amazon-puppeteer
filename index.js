const fetchASIN = require('./fetchasin.js');
const express = require('express');
const app = express();
const asinRegex = new RegExp('([A-Z0-9]{10})');
const start = require('./utils').start;
const ignoreFavicon = require('./utils').ignoreFavicon;
const rd = require('redis').createClient;
const redis = process.env.REDIS_URL
  ? rd(process.env.REDIS_URL)
  : rd(6379, 'localhost');

app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname + '/public'));
app.use(ignoreFavicon);
app.get('/:asin', cache, asinController);
app.get('/', notFound);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function cache(req, res, next) {
  const { asin } = req.params;
  const timer = start();
  redis.get(asin, function(err, data) {
    if (err) throw err;

    if (data != null) {
      console.log('cache-hit', asin);
      res.json(Object.assign({ time: timer.done() }, JSON.parse(data)));
    } else {
      console.log('cache-miss', asin);
      next();
    }
  });
}

function asinController(req, res) {
  const timer = start();
  const { asin } = req.params;

  if (asin.match(asinRegex)) {
    fetchASIN(asin)
      .then(function(data) {
        redis.setex(asin, 3600, JSON.stringify(data));
        res.json(Object.assign({ time: timer.done() }, data));
      })
      .catch(function(error) {
        timer.done();
        notFound(req, res);
      });
  } else {
    timer.done();
    notFound(req, res);
  }
}

function notFound(req, res) {
  res.status(404).json({
    message: 'expected path is /ASIN1234567',
    error: 'path not found, must include asin'
  });
}
