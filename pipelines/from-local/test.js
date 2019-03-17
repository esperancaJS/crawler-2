const puppeteer = require('puppeteer');

const getCountries = require('../../spiders-serverless/spiders/getCountries');
const browserConfig = require('./shared/browser-config.json');

(async () => {

    const countries = await getCountries(browserConfig, puppeteer);

    console.log(countries.length);

    return;

})();