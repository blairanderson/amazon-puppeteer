const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const { puppeteerArgs, userAgent, host, log } = require("./puppeteerargs.js");
const expiration = 60 * 60 * 24;
const rd = require("redis").createClient;
const redis = process.env.REDIS_URL
  ? rd(process.env.REDIS_URL)
  : rd(6379, "localhost");
const parse = require("amazon-html-to-json").parse;

async function fetchASIN(asin) {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    args: [
      "--proxy-server=proxy.crawlera.com:8010",
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    "Proxy-Authorization":
      "Basic " +
      Buffer.from(`${process.env.CRAWLERA_APIKEY}:`).toString("base64")
  });

  page.on("console", (...args) => console.log("PAGE LOG:", ...args));
  let screenshot = false;
  let images = false;
  console.log(asin);

  const path = `https://www.amazon.com/dp/${asin}`;
  const newData = { asin, path, timeNow: Date().toString() };
  await page.setViewport({ width: 1680, height: 895 });
  log("viewport");
  await page.setUserAgent(userAgent);
  log("useragent", userAgent);

  try {
    console.log("path", path);
    var start = +new Date();
    var resp = await page.goto(path, {
      timeout: 0,
      waitUntil: "domcontentloaded"
    });
    newData["status"] = resp.status();
    var end = +new Date();
    console.log("start-end-diff", (end - start) / 1000);
    log("goto", path);
    if (!resp.ok) {
      browser.close();
      return { status: resp.status(), error: `ASIN NOT OK. ${resp.status()}` };
    }

    if (!resp.ok()) {
      browser.close();
      return { status: resp.status(), error: `ASIN NOT OK. ${resp.status()}` };
    }
  } catch (error) {
    log("page.goto ERROR", JSON.stringify(error));
    browser.close();
    return { error: error.toString(), stack: error.stack.split("\n") };
  }

  if (process.env.SCREENSHOT === "true" || process.env.SCREENSHOT === true) {
    try {
      log("screenshot");
      await page.screenshot({ path: `tmp/${asin}.png`, fullPage: true });
      newData["screenshot"] = `${host}/img/${asin}.png`;
      log("screenshot:", newData["screenshot"]);
    } catch (error) {
      log("screenshot error");
      browser.close();
      return { error: error.toString(), stack: error.stack.split("\n") };
    }
  }

  function fetchImages() {
    return new Promise((resolve, reject) => {
      if (window.P) {
        P.when("ImageBlockATF").execute(function(dat) {
          if (dat) {
            resolve(dat);
          } else {
            reject("nope");
          }
        });
      } else {
        reject("nope");
      }
    });
  }

  try {
    images = await page.evaluate(fetchImages);
  } catch (e) {
    console.log(e);
  }

  try {
    const content = await page.content();
    log("content downloaded");
    log("parsing started", Date().toString());
    const $ = cheerio.load(content);
    const parsed = parse($, images);
    log("content parsed", Date().toString());
    browser.close();
    const parsedData = Object.assign(newData, parsed);
    redis.setex(asin, expiration, JSON.stringify(parsedData));
    return parsedData;
  } catch (error) {
    browser.close();
    console.log("ERR", error.toString(), error.stack);
    return { error: error.toString(), stack: error.stack.split("\n") };
  }
}

module.exports = { fetchASIN };
