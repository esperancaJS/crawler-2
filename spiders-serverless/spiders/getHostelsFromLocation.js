const puppeteer = require('puppeteer');
var fs = require('fs');

module.exports = (async (location, country) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(`https://www.hostelworld.com/hostels/${location}`);

    let hostels = [];

    const getPageHostels = async () => {
        
        const hostelsInPage = await page.$$eval('div#fabResultsContainer div.fabresult',
            nodes =>
                nodes.map(
                    node => ({
                        name: node.getAttribute('data-name'),
                        url: node.getAttribute('url'),
                    })
                )
        );

        // console.log({
        //     hostels: hostelsInPage.length,
        //     first: hostelsInPage.length && hostelsInPage[0].name
        // });

        hostels = [
            ...hostels,
            ...hostelsInPage
        ]
    
        const nextButton = await page.$('ul.pagination li.pagination-next');
        if (nextButton && await nextButton.boundingBox() !== null)  {
            await nextButton.click('a');
            await page.waitFor(4000); // IMPROVE
            await getPageHostels();
        }
    }

    await getPageHostels();

    // console.log(hostels.length);

    // fs.writeFile('data-dump/hostels.json', JSON.stringify(hostels, null, 4), 'utf8', () => { });

    await browser.close();

    return hostels.map(hostel => ({
        ...hostel,
        city: location,
        country
    }))
});