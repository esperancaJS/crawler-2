const AWS = require('aws-sdk');
var fs = require('fs');
const { chunk } = require('../utils');

const lambda = new AWS.Lambda({region: 'us-east-1', apiVersion: '2015-03-31'});

(async () => {

    const allHostels = await new Promise((resolve, reject) => {
        fs.readFile('./../data-dump/all-hostels.json', 'utf8', (err, buffer) => {
            if (err) reject(err);
            else resolve(JSON.parse(buffer));
        });
    });

    const previousHostelsDetails = await new Promise((resolve, reject) => {
        fs.readFile('./../data-dump/all-hostel-details.json', 'utf8', (err, buffer) => {
            if (err) reject(err);
            else resolve(JSON.parse(buffer));
        });
    });

    const remainingHostels = allHostels.filter(h =>
        previousHostelsDetails.findIndex(h2 => h.url === h2.hostel.url) === -1
    )

    const remainingHostelsBatches = chunk(remainingHostels, 20);

    console.log(remainingHostels.length);
    // console.log(remainingHostelsBatches[0][0]);

    const startTime = new Date();

    remainingHostelsBatches.reduce((p, batch, i) => {

        return p.then(() => new Promise(async (resolve, reject) => {

            await new Promise(t => setTimeout(t, 100));
            const elapsedTime = parseInt((new Date() - startTime)/1000);
            console.log(`Processing batch ${i} of ${remainingHostelsBatches.length}, ${elapsedTime}s`);

            const batchHostelDetails = await Promise.all(batch.map(async (hostel, i) => {

                const previousHostelDetails = previousHostelsDetails.find(
                    h => h.hostel.url === hostel.url
                );

                // console.log(typeof previousHostelDetails !== 'undefined');
        
                return typeof previousHostelDetails !== 'undefined' ?
                    previousHostelDetails :
                    await new Promise((resolve, reject) => {
                        lambda.invoke({
                            FunctionName: 'hostelworld-spiders-3-dev-hostelDetails',
                            Payload: JSON.stringify({
                                hostel
                            })
                        }, function (err, data) {
                            if (err) {
                                reject({err})
                            }
                            else {
                                if (typeof JSON.parse(data.Payload).hostelDetails === 'undefined') {
                                    console.log(hostel.url)
                                    console.log(JSON.parse(data.Payload))
                                    console.log('---------------')
                                }
                                resolve(JSON.parse(data.Payload).hostelDetails);
                            }
                        });
                    });
            }));

            // console.log(batchHostelDetails);

            fs.writeFile(
                `./../data-dump/hostel-details/hostel-details-batch-${i}.json`,
                JSON.stringify(batchHostelDetails, null, 4), 'utf8', () => {}
            );

            resolve();

        }));
    }, Promise.resolve());
})();