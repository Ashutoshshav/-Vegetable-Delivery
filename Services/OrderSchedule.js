function generateDeliveryDate() {
    try {
        const today = new Date();
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + 1);

        const day = String(nextDay.getDate()).padStart(2, '0');
        const month = String(nextDay.getMonth() + 1).padStart(2, '0');
        const year = nextDay.getFullYear();

        // Return formatted as dd-mm-yyyy
        return `${day}-${month}-${year}`
    } catch(err) {
        console.log(err)
    }
}

function generateDeliverySchedule() {
    try {
        const deliveryTimes = [
            {
              "id": 1,
              "startTime": "08:00 AM",
              "endTime": "11:00 PM",
            },
            {
              "id": 2,
              "startTime": "11:00 PM",
              "endTime": "02:00 PM",
            },
            {
              "id": 3,
              "startTime": "02:00 PM",
              "endTime": "05:00 PM",
            },
            {
              "id": 4,
              "startTime": "05:00 PM",
              "endTime": "08:00 PM",
            }
        ];

        let deliveryDate = generateDeliveryDate()
        // console.log(deliveryDate)

        console.log({deliveryTimes, deliveryDate})
        return {deliveryTimes, deliveryDate}
    } catch(err) {
        console.log(err)
    }
}

module.exports = {
    generateDeliveryDate,
    generateDeliverySchedule,
}
