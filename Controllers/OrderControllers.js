const { connectDB, sql } = require("../Utils/Connection");
const { generateDeliveryDate, generateDeliverySchedule } = require("../Services/OrderSchedule")

const moment = require('moment-timezone')

async function handleDeliverySchedule(req, res) {
    try {
        const deliverySchedule = generateDeliverySchedule()

        // console.log(deliverySchedule)

        res.status(200).send(deliverySchedule)
    } catch (err) {
        console.log(err)
    }
}

async function handleSubmitOrder(req, res) {
    let Cust_ID = req.user.id
    // console.log(Cust_ID)
    let { count, selectedSchedule } = req.body;
    
    let currentISTDate = moment.tz('Asia/Kolkata').format('YYYY-MM-DD');
    // console.log(currentISTDate)
    try {
        const pool = await connectDB()
        const getLastOrderID = await pool.request()
            .query(`SELECT MAX(OrderID) AS Last_OrderID FROM Order_Data`);

        let lastOrderID = getLastOrderID.recordset[0].Last_OrderID
        // console.log(lastOrderID)
        const result = await pool.request()
            .input('Cust_ID', sql.Int, Cust_ID)
            .input('OrderDate', sql.Date, currentISTDate)
            .query(`SELECT MAX(OrderID) AS Last_Order FROM Order_Data WHERE Cust_ID = @Cust_ID AND OrderDate = @OrderDate`);

        let Last_Order = result.recordset[0].Last_Order || 0
        // console.log(Last_Order)

        let OrderDate = moment.tz('Asia/Kolkata').format('YYYY-MM-DD');
        // console.log(OrderDate)

        let DeliverySlot = selectedSchedule

        let OrderID
        let OrderDeleted = 0;
        let OrderDtime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
        // console.log(OrderID)
        // console.log(OrderDtime)
        if(Last_Order > 0) {
            OrderID = Last_Order

            let LastEditOrderDtime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

            // console.log(LastEditOrderDtime + "LastEditOrderDtime")

            for (const item of count) {
                let { SKUID } = item;
                await pool.request()
                    .input('OrderID', sql.Int, OrderID)
                    .input('OrderDtime', sql.DateTimeOffset, OrderDtime)
                    .input('LastEditOrderDtime', sql.DateTimeOffset, LastEditOrderDtime)
                    .input('OrderDate', sql.Date, OrderDate)  
                    .input('DeliverySlot', sql.Int, DeliverySlot)  
                    .input('Order_sts', sql.Int, 1)
                    .input('Cust_ID', sql.Int, Cust_ID)
                    .input('SKUID', sql.Int, SKUID)
                    .input('OrderDeleted', sql.Int, OrderDeleted)
                    .query(`UPDATE Order_Data SET OrderID = @OrderID, OrderDtime = @OrderDtime, LastEditOrderDtime = @LastEditOrderDtime, OrderDate = @OrderDate, DeliverySlot = @DeliverySlot, Order_sts = @Order_sts, OrderDeleted = @OrderDeleted WHERE Cust_ID = @Cust_ID AND SKUID = @SKUID`)
            }
        } else {
            OrderID = lastOrderID += 1
            let currentDateTime = new Date();
            let currentDateTimeIST = new Date(currentDateTime.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    
            // console.log(Cust_ID)
            // console.log(count)
    
            for (const item of count) {
                let { SKUID } = item;
                await pool.request()
                    .input('OrderID', sql.Int, OrderID)
                    .input('OrderDtime', sql.DateTimeOffset, OrderDtime)
                    .input('OrderDate', sql.Date, OrderDate)  
                    .input('DeliverySlot', sql.Int, DeliverySlot)  
                    .input('Order_sts', sql.Int, 1)
                    .input('Cust_ID', sql.Int, Cust_ID)
                    .input('SKUID', sql.Int, SKUID)
                    .input('OrderDeleted', sql.Int, OrderDeleted)
                    .query(`UPDATE Order_Data SET OrderID = @OrderID, OrderDtime = @OrderDtime, OrderDate = @OrderDate, DeliverySlot = @DeliverySlot, Order_sts = @Order_sts, OrderDeleted = @OrderDeleted WHERE Cust_ID = @Cust_ID AND SKUID = @SKUID`)
            }
        }

        // for(const item of count) {
        //     let { SKUID, Qty } = item;
        //     await pool.request()
        //     .input('OrderID', sql.Int, OrderID)
        //     .input('OrderDtime', sql.DateTime, OrderDtime)
        //     .input('OrderDate', sql.Date, OrderDate)
        //     .input('Cust_ID', sql.Int, Cust_ID)
        //     .input('SKUID', sql.Int, SKUID)
        //     .input('Qty', sql.Int, Qty)
        //     .input('DeliverySlot', sql.Int, DeliverySlot)
        //     .query(`INSERT INTO Order_Data (OrderID, OrderDtime, OrderDate, Cust_ID, SKUID, Qty, DeliverySlot) VALUES (@OrderID, @OrderDtime, @OrderDate, @Cust_ID, @SKUID, @Qty, @DeliverySlot)`)

        // }
        setDeliverySlot(Cust_ID, OrderID, DeliverySlot)
        res.status(200).send("Order Saved Successfully")
    } catch (err) {
        console.log(err)
    }
}

async function handleDeleteOrder(req, res) {
    let Cust_ID = req.user.id

    try {
        let OrderDate = moment.tz('Asia/Kolkata').format('YYYY-MM-DD');
        let OrderDeleted = 1;
        // console.log(OrderDate + " OrderDate")
        const pool = await connectDB()
        // console.log("handleDeleteOrder")
        let setOrderDeleted = await pool.request()
                    .input('OrderDate', sql.Date, OrderDate)  
                    .input('Cust_ID', sql.Int, Cust_ID)
                    .input('OrderDeleted', sql.Int, OrderDeleted)
                    .query(`UPDATE Order_Data SET OrderDeleted = 1  WHERE Cust_ID = @Cust_ID AND OrderDate = @OrderDate`)

        return res.status(200).send("Order Deleted")
    } catch(err) {
        console.log(err)
    }
}

async function setDeliverySlot(Cust_ID, Order_ID, Delivery_Slot) {
    let Delivery_Date = generateDeliveryDate()
    let [day, month, year] = Delivery_Date.split("-");

    Delivery_Date = `${year}-${month}-${day}`
    // console.log(Delivery_Date, Cust_ID, Order_ID, Delivery_Slot)

    const pool = await connectDB()

    await pool.request()
        .input('Cust_ID', sql.Int, Cust_ID)
        .input('Order_ID', sql.Int, Order_ID)
        .input('Delivery_Date', sql.Date, Delivery_Date)
        .input('Delivery_Slot', sql.Int, Delivery_Slot)
        .query(`INSERT INTO Delivery_slot (Cust_ID, Order_ID, Delivery_Date, Delivery_Slot) VALUES (@Cust_ID, @Order_ID, @Delivery_Date, @Delivery_Slot)`)
}

module.exports = {
    handleDeliverySchedule,
    handleSubmitOrder,
    handleDeleteOrder,
}
