'use strict';
const puppeteer = require('puppeteer');

const browserConfig = require('./browser-config.json');
const getCountries = require('./spiders/getCountries');
const getCities = require('./spiders/getCities');
const getHostelDetails = require('./spiders/getHostelDetails');

module.exports.index = async (event, context) => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/opt/headless_shell',
    args: ['--no-sandbox', '--disable-gpu', '--single-process'],
  });

  const page = await browser.newPage();
  await page.goto('https://www.hostelworld.com/hostels');

  const openAllAccordions = async () => {
    await page.$$eval('.accordion-navigation:not(.active)',
      nodes => nodes.forEach(node =>
        node.querySelector('a').click()
      )
    );
  }

  // ran twice because the first time the first one is closed
  await openAllAccordions();
  await openAllAccordions();

  const countries = await page.$$eval('[id^="hwta-country"]',
    nodes =>
      nodes.map(
        node => ({
          name: node.innerText,
          url: node.getAttribute('href')
        })
      )
  );

  return {
    message: `Got ${countries.length} countries`,
    // statusCode: 200,
    // body: image,
    // headers: {
    //   'Content-Type': 'image/png',
    // },
    // isBase64Encoded: true
  };
};

module.exports.countries = async (event, context) => {

  const countries = await getCountries(browserConfig, puppeteer);

  return {
    message: `Got ${countries.length} countries`,
    countries: countries
  };

};

module.exports.cities = async (event, context) => {

  const cities = await getCities(event.country, browserConfig, puppeteer);

  return {
    message: `Got ${cities.length} cities`,
    cities: cities
  };

};

module.exports.hostelDetails = async (event, context) => {

  const hostelDetails = await getHostelDetails(event.hostel, browserConfig, puppeteer);

  return {
    // message: `Got ${cities.length} cities`,
    hostel: event.hostel,
    hostelDetails
  };

};
