const AWS = require('aws-sdk');
var fs = require('fs');
const { chunk } = require('../utils');

const lambda = new AWS.Lambda({region: 'us-east-1', apiVersion: '2015-03-31'});

(async () => {

    const countries = await new Promise((resolve, reject) => {
        fs.readFile('./../data-dump/countries.json', 'utf8', (err, buffer) => {
            if (err) reject(err);
            else resolve(JSON.parse(buffer));
        });
    });

    const countryBatches = chunk(countries, 5);

    countryBatches.splice(countryBatches.length -2 ).reduce((p, batch, i) => {

        console.log(`Loop! ${i}`);

        return p.then(() => new Promise(async (resolve, reject) => {

            await new Promise(t => setTimeout(t, 1000));
            console.log(`Processing ${i} - ${batch.length}`);

            const batchCities = await Promise.all(batch.map(async (country, i) => {

                const citiesInCountry = await new Promise((resolve, reject) => {
                    lambda.invoke({
                        FunctionName: 'hostelworld-spiders-3-dev-cities',
                        Payload: JSON.stringify({
                            country: country.name
                        })
                    }, function (err, data) {
                        if (err) reject({err}); // an error occurred
                        else resolve(JSON.parse(data.Payload).cities);           // successful response
                    });
                });
        
                return citiesInCountry;
            }));

            fs.writeFile(`./../data-dump/cities/cities-batch-${i}.json`, JSON.stringify(batchCities, null, 4), 'utf8', () => {});

            resolve();

        }));
    }, Promise.resolve());
})();