const now = require('performance-now');

function start() {
  const start = now();
  return {
    done: function() {
      const end = now();
      return ((end - start) / 1000).toFixed(3);
    }
  };
}

function ignoreFavicon(req, res, next) {
  if (req.originalUrl === '/favicon.ico') {
    res.status(204).json({});
  } else {
    next();
  }
}

module.exports = {
  ignoreFavicon,
  start
};
