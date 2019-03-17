const puppeteer = require('puppeteer');
const browserConfig = require('./shared/browser-config.json');

const getHostelDetails = require('../../spiders-serverless/spiders/getHostelDetails');

(async () => {

    const hostel = {
        "name": "Tirana Backpacker Hostel",
        "url": "https://www.hostelworld.com/hosteldetails.php/Apartments-Zagora/Pula/17109",
        "city": "Tirana",
        "country": "Albania"
    }

    const hostelDetails = await getHostelDetails(hostel, browserConfig, puppeteer);

    console.log(JSON.stringify(hostelDetails, null, 4));

})();