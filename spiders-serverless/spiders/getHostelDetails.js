const { cleanTmpBrowserData } = require('../utils');

module.exports = (async (hostel, browserConfig, puppeteer) => {

    const browser = await puppeteer.launch(browserConfig);
    const page = await browser.newPage();

    // https://www.hostelworld.com/hosteldetails.php/Tirana-Backpacker-Hostel/Tirana/13269?dateFrom=2019-06-01&dateTo=2019-06-02&number_of_guests=1&sc_pos=1
    await page.goto(`${hostel.url}?dateFrom=2019-10-01&dateTo=2019-10-03&number_of_guests=1&sc_pos=1`);

    await new Promise(t => setTimeout(t, 500));

    const roomsIn1Month = await getRooms(page);

    await page.goto(`${hostel.url}?dateFrom=2019-05-01&dateTo=2019-05-03&number_of_guests=1&sc_pos=1`);

    await new Promise(t => setTimeout(t, 500));

    const roomsIn6Months = await getRooms(page);

    page.click('[data-open="reviews-overlay"]');

    await new Promise(t => setTimeout(t, 500));

    const reviewCount = await page.$eval('.counter',
        el => parseInt(el.innerText.replace(/[^0-9]/g, ''))
    );

    const lastWeekReviewCount = await (await page.$$('.property-review-list >div'))
        .reduce(async (acc, node, i) => {

            const acc2 = await acc;

            const dateText = await node.$eval(
                '.date span', (el) => el.innerText
            );

            const isLessThanAWeekOld =
                new Date() - new Date(dateText) <
                86400000 * 7;

            return acc2 + (isLessThanAWeekOld ? 1 : 0);

        }, 0);

    const score = (await page.$('.score') !== null) ?
        await page.$eval('.score', el => el.innerText) :
        null;

    const soldOut = (await page.$('.not-available-message-warning') !== null);

    // not-available-message-warning

    // await page.screenshot({ path: `t.png`, fullPage: true });

    // find chrome user data dir (puppeteer_dev_profile-XXXXX) to delete it after it had been used
    const crapDir = await cleanTmpBrowserData(browser);
    // console.log(crapDir);

    return {
        hostel: {
            ...hostel,
            score,
            reviewCount,
            lastWeekReviewCount
        },
        roomsIn1Month,
        roomsIn6Months,
        // crapDir
    };
});

const getRooms = async (page) => (await page.$('.not-available-message-warning') !== null) ?
    'none available' :
    await(await page.$$('.room-tr')).reduce(async (acc, node, i) => {
        const acc2 = await acc;

        await new Promise(t => setTimeout(t, 10));

        const sleeps = parseInt(
            await node.$$eval('.text-dark-gray.text-small', els =>
                els
                    .find(n => n.innerText.includes('Sleeps'))
                    .innerText.replace(/[^0-9]/g, '')
            )
        );

        const price = parseInt(
            await node.$eval(
                '.rate-type-price', el => el.innerText.replace(/[^0-9]/g, '')
            )
        );

        const $elemHandler = await node.$('select');
        const isDisabled = await node.$eval('select', el => el.disabled);
        const values = [...(await $elemHandler.getProperties()).values()];
        const hasFirstOption = await values[1].asElement() !== null;

        let dropdownInferences = {
            roomOrBed: null,
            payableNow: null,
            payableNowPerPrice: null
        };
        if (!isDisabled && hasFirstOption) {

            // add a class to each select so we can select it from `page`
            await node.$eval(
                'select',
                (el, i) => el.className += ` yep-${i}`,
                i // this was hard to figure out
            );
    
            const values = [...(await $elemHandler.getProperties()).values()];
    
            const firstDropDownValue = await (await values[1].asElement().getProperty("value")).jsonValue();
            const firstDropDownText = await (await values[1].asElement().getProperty("text")).jsonValue();
    
            dropdownInferences.roomOrBed = firstDropDownText
                .replace(/[0-9]/g, '')
                .replace(/\s/g, '');
    
            await page.select(`.yep-${i}`, firstDropDownValue);
    
            dropdownInferences.payableNow = parseInt(
                await page.$$eval('.table.table-room-selection td', els =>
                    els.
                        find(el => el.innerHTML.includes('Payable Now'))
                        .innerHTML
                        .replace(/[^0-9]/g, '')
                )
            );

            dropdownInferences.payableNowPerPrice = (dropdownInferences.payableNow / price)
 
            const nullDropDownValue = await (await values[0].asElement().getProperty("value")).jsonValue();
            await page.select(`.yep-${i}`, nullDropDownValue);
        }

        // console.log(sleeps, isDisabled, hasFirstOption, payableNow, roomOrBed);

        return [
            ...acc2,
            {
                price,
                sleeps,

                payableNowPerPrice: dropdownInferences.payableNowPerPrice,
                payableNow: dropdownInferences.payableNow,
                roomOrBed: dropdownInferences.roomOrBed
            }
        ];
    }, []);