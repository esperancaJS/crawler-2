const AWS = require('aws-sdk');

const lambda = new AWS.Lambda({ region: 'us-east-1', apiVersion: '2015-03-31' });

const fs = require('fs');

(async () => {

    const t = await Promise.all([...new Array(1)].map(async (item) => new Promise(function (resolve, reject) {
        lambda.invoke({
            FunctionName: 'hostelworld-spiders-3-dev-hostelDetails',
            Payload: JSON.stringify({
                hostel: {
                    "name": "Tirana Backpacker Hostel",
                    "url": "https://www.hostelworld.com/hosteldetails.php/Flintstones-Backpackers/Lusaka/64410",
                    "city": "Tirana",
                    "country": "Albania"
                }
            })
        }, function (err, data) {
            if (err) reject({ err }); // an error occurred
            else resolve(JSON.parse(data.Payload));           // successful response
        });
    })));

    console.log(JSON.stringify(t, null, 4));

})();