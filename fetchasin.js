const puppeteer = require('puppeteer');
const processInfo = require('./processinfo');

const userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';

const puppeteerArgs = {
  args: ['--no-sandbox', '--disable-setuid-sandbox']
};

async function fetchASIN(asin) {
  const browser = await puppeteer.launch(puppeteerArgs);
  const page = await browser.newPage();
  console.log(asin);
  const path = `https://www.amazon.com/dp/${asin}`;
  await page.setViewport({ width: 1680, height: 895 });
  console.log('viewport');
  await page.setUserAgent(userAgent);
  console.log('useragent');
  await page.goto(path);
  console.log('goto', path);
  const content = await page.content();
  console.log('content received');
  const parsed = processInfo(content);
  console.log('content parsed');
  browser.close();
  return Object.assign({ asin, path, timeNow: Date().toString() }, parsed);

  // fs.writeFile(`./${asin}.html`, content, function(err) {
  //   if(err) {return console.log(err);}
  //   console.log("The file was saved!");
  // });
  // await page.screenshot({path: `${asin}.png`, fullPage: true});
}

module.exports = fetchASIN;
