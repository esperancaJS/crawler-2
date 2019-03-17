module.exports = (async (country, browserConfig, puppeteer) => {
    const browser = await puppeteer.launch(browserConfig);
    const page = await browser.newPage();

    await page.goto(`https://www.hostelworld.com/hostels/${country}`);

    const mainLocations = await page.$$eval('.cityresults_details >h2 >a',
        nodes =>
            nodes.map(
                node => ({
                    name: node.innerText,
                    url: node.getAttribute('href'),
                })
            )
    );

    const otherLocations = await page.$$eval('.otherlocations >ul li a',
        nodes =>
            nodes.map(
                node => ({
                    name: node.innerText,
                    url: node.getAttribute('href'),
                })
            )
    );

    const locations = [
        ...mainLocations,
        ...otherLocations
    ].filter((loc, i, arr) => // remove duplicates
        arr.findIndex((loc2, i2) => loc2.name === loc.name) === i
    ).map(loc => ({
        ...loc,
        country
    }))

    // await browser.close();

    return locations;
});