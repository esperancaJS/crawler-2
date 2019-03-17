var fs = require('fs');

const getHostelsFromLocation = require('../spiders/getHostelsFromLocation');

(async () => {

    const cities = await new Promise((resolve, reject) => {
        fs.readFile('data-dump/all-cities.json', 'utf8', (err, buffer) => {
            if (err) reject(err);
            else resolve(JSON.parse(buffer));
        });
    });

    const previousHostels = await new Promise((resolve, reject) => {
        fs.readFile('data-dump/all-hostels.json', 'utf8', (err, buffer) => {
            if (err) reject(err);
            else resolve(JSON.parse(buffer));
        });
    });

    const startTime = new Date();

    const hostels = await [...cities].reduce(async (acc, city, i) => {

        const acc2 = await acc;

        const elapsedTime = parseInt((new Date() - startTime)/1000);

        const alreadyHasLocation = acc2.findIndex((hostel) => hostel.city === city.name) !== -1;

        const hostelsInLocation = alreadyHasLocation ?
            [] :
            await getHostelsFromLocation(city.name, city.country);

        if (!alreadyHasLocation) {
            console.log(
                `${elapsedTime}s - ${acc2.length} hostels - ${i}/${cities.length} cities - ${city.name} - ${hostelsInLocation.length}`
            );
        }

        fs.writeFile('data-dump/all-hostels.json', JSON.stringify(acc2, null, 4), 'utf8', () => {});

        return [
            ...acc2,
            ...hostelsInLocation
        ];
    }, previousHostels || []);

    // console.log({
    //     countries: countries.length,
    //     cities: cities.length
    // });

    // fs.writeFile('data-dump/all-cities.json', JSON.stringify(cities, null, 4), 'utf8', () => {});

})();