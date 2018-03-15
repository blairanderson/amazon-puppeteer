require('dotenv').config();
const express = require('express');
const app = express();
const { fetchASIN } = require('./fetchasin.js');
const { fetchQuery } = require('./fetchquery.js');
const start = require('./utils').start;
const expiration = 60 * 60 * 24;
const rd = require('redis').createClient;
const redis = process.env.REDIS_URL
  ? rd(process.env.REDIS_URL)
  : rd(6379, 'localhost');

app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname + '/public'));
app.use(require('./utils').ignoreFavicon);

app.get('/', function(req, res) {
  res.status(200).json({
    routes: [
      '/s?keywords=something&asin=BOOFOO1234&api_key=poopoo',
      '/:asin?api_key=poopoo'
    ]
  });
});

app.use('/img', express.static('tmp'));
app.use(
  require('express-middleware-apikey')(process.env.PUPP_API_KEY.split(','))
);
app.get('/s', queryCache, queryController);
app.get('/:asin', asinCache, asinController);
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function asinCache(req, res, next) {
  if (process.env.CACHE === 'true' || process.env.CACHE === true) {
    console.log('cache');
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
  } else {
    console.log('no-cache');
    next();
  }
}

function queryCache(req, res, next) {
  return next();
  // if (process.env.CACHE === 'true' || process.env.CACHE === true) {
  //   const { asin } = req.params;
  //   const timer = start();
  //   redis.get(asin, function(err, data) {
  //     if (err) throw err;
  //
  //     if (data != null) {
  //       console.log('cache-hit', asin);
  //       res.json(Object.assign({ time: timer.done() }, JSON.parse(data)));
  //     } else {
  //       console.log('cache-miss', asin);
  //       next();
  //     }
  //   });
  // } else {
  //   next();
  // }
}

// const { request } = require('curlrequest');

function succcr(data) {
  console.log(JSON.stringify(data, null, 4));
}
function errrrno(error) {
  console.log(error.stack.split('\n'));
}
// fetchASIN('B008E338FY').then(succcr).catch(errrrno);

function asinController(req, res) {
  const timer = start();
  const { asin } = req.params;
  if (asin.match(new RegExp('([A-Z0-9]{10})'))) {
    fetchASIN(asin)
      .then(function(data) {
        // seconds * minutes * hours
        if (!data.error) {
          redis.setex(asin, expiration, JSON.stringify(data));
        }
        res.json(Object.assign({ time: timer.done() }, data));
      })
      .catch(function(error) {
        timer.done();
        console.log('NOT FOUND', error.stack.split('\n'));
        notFound(req, res, 'Caught in fetch', error.stack.split('\n'));
      });
  } else {
    timer.done();
    notFound(
      req,
      res,
      'did not pass regex',
      'are you sure this passes ([A-Z0-9]{10})'
    );
  }
}

function queryController(req, res) {
  const timer = start();
  const { keywords, asin } = req.query;
  const valid =
    keywords.split(' ').length > 1 && asin.match(new RegExp('([A-Z0-9]{10})'));

  if (valid) {
    fetchQuery(keywords, asin)
      .then(function(data) {
        // seconds * minutes * hours
        const exp = 60 * 60 * 3; // 6 hours
        if (!data.error) {
          redis.setex(keywords, exp, JSON.stringify(data));
        }
        res.json(Object.assign({ time: timer.done() }, data));
      })
      .catch(function(error) {
        timer.done();
        console.log('NOT FOUND', JSON.stringify(error));
        notFound(req, res, 'Caught in fetch', error);
      });
  } else {
    timer.done();
    notFound(
      req,
      res,
      'Query must include keywords AND asin.',
      'Are you sure this passes ([A-Z0-9]{10})'
    );
  }
}

function notFound(req, res, message, error) {
  res.status(404).json({
    message,
    error
  });
}
