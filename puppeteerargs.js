let args = ['--no-sandbox', '--disable-setuid-sandbox'];
// if (process.env.PROXYSERVER) {
//   // `--proxy-server=${process.env.PROXYAUTH}@${process.env.PROXYSERVER}`
//   args.push(
//     ``
//   );
// }

// https://github.com/GoogleChrome/puppeteer/issues/418#issuecomment-323582270
// curl -U 12345:12345 -x proxy.crawlera.com:8010 http://httpbin.org/ip

module.exports = {
  log: (...args) => {
    if (process.env.LOG) {
      console.log(...args);
    }
  },
  host:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : 'https://puppeteertest.herokuapp.com',
  puppeteerArgs: {
    ignoreHTTPSErrors: true,
    args: args,
    slowMo: 250 // slow down by 250ms
  },
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
};
