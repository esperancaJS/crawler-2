var fs = require('fs');
const { chunk } = require('../utils');

(async () => {

    const previousHostelDetails = await new Promise((resolve, reject) => {
        fs.readFile('./../data-dump/all-hostel-details.json', 'utf8', (err, buffer) => {
            if (err) reject(err);
            else resolve(JSON.parse(buffer));
        });
    });

    const newHostelDetails = await new Promise((resolve, reject) => {
        fs.readdir('./../data-dump/hostel-details', async (err, filenames) => {
            if (err) reject(err);
            else {
                resolve(await filenames.reduce(async (acc, filename, i) => {
                    const acc2 = await acc;

                    const batchHostelDetails = await new Promise((res, rej) => {
                        fs.readFile(`./../data-dump/hostel-details/${filename}`, 'utf8', (err, buffer) => {
                            if (err) rej(err);
                            else res(JSON.parse(buffer));
                        });
                    })

                    return [
                        ...acc2,
                        ...batchHostelDetails
                    ];
                }, []));
            }
        });
    });

    const filteredNewHostelDetails = newHostelDetails
        .filter(h => h !== null)
        .filter(h => h.roomsIn1Month.length !== 0 || h.roomsIn6Months.length !== 0);

    const newWithoutOld = filteredNewHostelDetails.filter(h =>
        previousHostelDetails.findIndex(h2 => h.hostel.url === h2.hostel.url) === -1
    )

    const nullHostels = newHostelDetails.filter(h => h === null );
    const empyRoomHostels = newHostelDetails.filter(h => h && (
        h.roomsIn1Month.length === 0 ||
        h.roomsIn6Months.length === 0
    ));

    const allHostelDetails = [
        ...previousHostelDetails,
        ...newWithoutOld
    ]

    fs.writeFile(`./../data-dump/all-hostel-details.json`, JSON.stringify(allHostelDetails, null, 4), 'utf8', () => {});

    const d = new Date();
    const backupName = `${allHostelDetails.length}-${d.getHours()}h${d.getMinutes()}m-${d.getDate()}-${d.getMonth()}-${d.getFullYear()}`;
    
    fs.writeFile(`./../data-dump/${backupName}.json`, JSON.stringify(allHostelDetails, null, 4), 'utf8', () => {});

    console.log({
        new: newHostelDetails.length,
        newWithoutOld: newWithoutOld.length,
        previous: previousHostelDetails.length,
        all: allHostelDetails.length,
        filtered: filteredNewHostelDetails.length,
        null: nullHostels.length,
        roomless: empyRoomHostels.length,
        repeatedHostels: 0
    });

})();