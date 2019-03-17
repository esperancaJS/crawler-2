var fs = require('fs');

const getCountries = require('../spiders/getCountries');
const getCities = require('../spiders/getCities');

(async () => {

    const countries = await getCountries();

    const startTime = new Date();

    const cities = await countries.reduce(async (acc, country, i) => {

        const acc2 = await acc;

        const elapsedTime = parseInt((new Date() - startTime)/1000);

        const citiesInCountry = await getCities(country.name);

        console.log(
            `${elapsedTime}s - ${i}/${countries.length} - ${country.name} - ${citiesInCountry.length}`
        );

        fs.writeFile('data-dump/all-cities.json', JSON.stringify(acc2, null, 4), 'utf8', () => {});

        return [
            ...acc2,
            ...citiesInCountry
        ];
    }, []);

    console.log({
        countries: countries.length,
        cities: cities.length
    });

    // fs.writeFile('data-dump/all-cities.json', JSON.stringify(cities, null, 4), 'utf8', () => {});

})();