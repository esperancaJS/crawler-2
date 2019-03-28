var fs = require('fs');
const { chunk } = require('../utils');

(async () => {

    const previousHostelDetails = await new Promise((resolve, reject) => {
        fs.readFile('./../data-dump/all-hostel-details.json', 'utf8', (err, buffer) => {
            if (err) reject(err);
            else resolve(JSON.parse(buffer));
        });
    });

    const OneMonthRooms = previousHostelDetails.reduce((acc, hostel, i) => {
        if (hostel.roomsIn1Month !== 'none available') {
            const rooms = hostel.roomsIn1Month.map(room => ({
                ...hostel.hostel,
                ...room,
            }));

            return [
                ...acc,
                ...rooms
            ];
        } else {
            return [
                ...acc
            ];
        }
    }, []);

    fs.writeFile(`./../data-dump/CSV/InOneMonthRooms.json`, JSON.stringify(OneMonthRooms, null, 4), 'utf8', () => {});

    const SixMonthRooms = previousHostelDetails.reduce((acc, hostel, i) => {
        if (hostel.roomsIn6Months !== 'none available') {
            const rooms = hostel.roomsIn6Months.map(room => ({
                ...hostel.hostel,
                ...room,
            }));

            return [
                ...acc,
                ...rooms
            ];
        } else {
            return [
                ...acc
            ];
        }
    }, []);

    fs.writeFile(`./../data-dump/CSV/InSixMonthRooms.json`, JSON.stringify(SixMonthRooms, null, 4), 'utf8', () => {});

    const HostelsAverage = previousHostelDetails.map((hostel, i) => {

        const inOneMonthBedStats = (hostel.roomsIn1Month === 'none available') ? {
            inOneMonthBedPriceAvg: null,
            inOneMonthBedSleepsTotal: null,
            inOneMonthBedPayableNowAvg: null,
            inOneMonthBedPayableNowPerPrice: null,
            inOneMonthRoomPriceAvg: null,
            inOneMonthRoomSleepsTotal: null,
            inOneMonthRoomPayableNowAvg: null,
            inOneMonthRoomPayableNowPerPrice: null,
        } : (() => {
            return {
                inOneMonthBeds: hostel.roomsIn1Month.filter(room => room.roomOrBed === 'Bed').length,
                inOneMonthBedPriceAvg: hostel.roomsIn1Month
                    .filter(room => room.roomOrBed === 'Bed')
                    .reduce((acc, room, i, rooms) => {
                        return acc + room.price/rooms.length
                    }, 0),
                inOneMonthBedSleepsTotal: hostel.roomsIn1Month
                    .filter(room => room.roomOrBed === 'Bed')
                    .reduce((acc, room, i, rooms) => {
                        return acc + room.sleeps
                    }, 0),
                inOneMonthBedPayableNowAvg: hostel.roomsIn1Month
                    .filter(room => room.roomOrBed === 'Bed')
                    .reduce((acc, room, i, rooms) => {
                        return acc + room.payableNow/rooms.length
                    }, 0),
                inOneMonthBedPayableNowPerPrice: ((a) => a ? a.payableNowPerPrice : 0)
                    (hostel.roomsIn1Month.find(room => room.roomOrBed === 'Bed')),
                inOneMonthRooms: hostel.roomsIn1Month.filter(room => room.roomOrBed === 'Room').length,
                inOneMonthRoomPriceAvg: hostel.roomsIn1Month
                    .filter(room => room.roomOrBed === 'Room')
                    .reduce((acc, room, i, rooms) => {
                        return acc + room.price/rooms.length
                    }, 0),
                inOneMonthRoomSleepsTotal: hostel.roomsIn1Month
                    .filter(room => room.roomOrBed === 'Room')
                    .reduce((acc, room, i, rooms) => {
                        return acc + room.sleeps
                    }, 0),
                inOneMonthRoomPayableNowAvg: hostel.roomsIn1Month
                    .filter(room => room.roomOrBed === 'Room')
                    .reduce((acc, room, i, rooms) => {
                        return acc + room.payableNow/rooms.length
                    }, 0),
                inOneMonthRoomPayableNowPerPrice: ((a) => a ? a.payableNowPerPrice : 0)
                    (hostel.roomsIn1Month.find(room => room.roomOrBed === 'Room')),
            }
        })()

        const inSixMonthRoomStats = (hostel.roomsIn6Months === 'none available') ? {
            inSixMonthsBedPriceAvg: null,
            inSixMonthsBedSleepsTotal: null,
            inSixMonthsBedPayableNowAvg: null,
            inSixMonthsBedPayableNowPerPrice: null,
            inSixMonthsRoomPriceAvg: null,
            inSixMonthsRoomSleepsTotal: null,
            inSixMonthsRoomPayableNowAvg: null,
            inSixMonthsRoomPayableNowPerPrice: null,
        } : (() => {
            return {
                inSixMonthsBeds: hostel.roomsIn6Months.filter(room => room.roomOrBed === 'Bed').length,
                inSixMonthsBedPriceAvg: hostel.roomsIn6Months
                    .filter(room => room.roomOrBed === 'Bed')
                    .reduce((acc, room, i, rooms) => {
                        return acc + room.price/rooms.length
                    }, 0),
                inSixMonthsBedSleepsTotal: hostel.roomsIn6Months
                    .filter(room => room.roomOrBed === 'Bed')
                    .reduce((acc, room, i, rooms) => {
                        return acc + room.sleeps
                    }, 0),
                inSixMonthsBedPayableNowAvg: hostel.roomsIn6Months
                    .filter(room => room.roomOrBed === 'Bed')
                    .reduce((acc, room, i, rooms) => {
                        return acc + room.payableNow/rooms.length
                    }, 0),
                inSixMonthsBedPayableNowPerPrice: ((a) => a ? a.payableNowPerPrice : 0)
                    (hostel.roomsIn6Months.find(room => room.roomOrBed === 'Bed')),
                inSixMonthsRooms: hostel.roomsIn6Months.filter(room => room.roomOrBed === 'Room').length,
                inSixMonthsRoomPriceAvg: hostel.roomsIn6Months
                    .filter(room => room.roomOrBed === 'Room')
                    .reduce((acc, room, i, rooms) => {
                        return acc + room.price/rooms.length
                    }, 0),
                inSixMonthsRoomSleepsTotal: hostel.roomsIn6Months
                    .filter(room => room.roomOrBed === 'Room')
                    .reduce((acc, room, i, rooms) => {
                        return acc + room.sleeps
                    }, 0),
                inSixMonthsRoomPayableNowAvg: hostel.roomsIn6Months
                    .filter(room => room.roomOrBed === 'Room')
                    .reduce((acc, room, i, rooms) => {
                        return acc + room.payableNow/rooms.length
                    }, 0),
                inSixMonthsRoomPayableNowPerPrice: ((a) => a ? a.payableNowPerPrice : 0)
                    (hostel.roomsIn6Months.find(room => room.roomOrBed === 'Room')),
            }
        })()

        return {
                ...hostel.hostel,
                ...inOneMonthBedStats,
                ...inSixMonthRoomStats
        };
    });

    fs.writeFile(`./../data-dump/CSV/HostelsAverages.json`, JSON.stringify(HostelsAverage, null, 4), 'utf8', () => {});

    console.log({
        OneMonthRooms: OneMonthRooms.length,
        SixMonthRooms: SixMonthRooms.length,
        HostelsAverages: HostelsAverage.length
    });

})();