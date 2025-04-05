const { connectDB, sql } = require("../Utils/Connection")

const moment = require('moment-timezone')

async function handleAddNewItem(req, res) {
    let { SKUName, Picture, Price } = req.body;
    let currentDate = moment.tz('Asia/Kolkata').format('YYYY-MM-DD');
    let Purchase_Amount = Price
    console.log(SKUName, Picture, Purchase_Amount)
    let disabledItem = 0;
    try {
        const pool = await connectDB()

        let setInvoiceNumber = await pool.request()
            .input('SKUName', sql.VarChar, SKUName)
            .input('Picture', sql.VarChar, Picture)
            .input('disabledItem', sql.Int, disabledItem)
            .query(`
                    INSERT INTO SKU_Master (SKUID, SKUName, Picture, disabledItem)
                    OUTPUT INSERTED.SKUID
                    SELECT
                    ISNULL(MAX(SKUID), 0) + 1, 
                    @SKUName, 
                    @Picture,
                    @disabledItem
                    FROM SKU_Master
            `);

        let SKUID = setInvoiceNumber.recordset[0].SKUID
        console.log(SKUID + "   SKUID")

        let setItemPrice = await pool.request()
        .input('SKUID', sql.Int, SKUID)
        .input('Purchase_Amount', sql.Int, Purchase_Amount)
        .input('SKUName', sql.VarChar, SKUName)
        .input('currentDate', sql.Date, currentDate)
        .query(`INSERT INTO SKU_Pricingdaywise (SKUID, Purchase_Amount, Date, SKU_Name) VALUES (@SKUID, @Purchase_Amount, @currentDate, @SKUName)`);

        return res.status(200).send(SKUName + " Added")
    } catch (err) {
        console.log(err)
    }
}

async function handleGetAllItem(req, res) {
    try {
        const pool = await connectDB()
        const result = await pool.request().query("SELECT * FROM SKU_Master")

        const getItemsPrice = await pool.request()
            .query('SELECT t.SKUID, t.Purchase_Amount, t.SKU_Name, t.Date FROM SKU_Pricingdaywise t INNER JOIN (SELECT SKUID, MAX(Date) AS latest_purchase_date FROM SKU_Pricingdaywise GROUP BY SKUID) latest_purchase ON t.SKUID = latest_purchase.SKUID AND t.Date = latest_purchase.latest_purchase_date;')

        let allItems = result.recordset
        let itemPrice = getItemsPrice.recordset

        // console.log(allItems)
        // console.log(itemPrice)

        res.status(200).json({ allItems, itemPrice })
    } catch (e) {
        console.log(e)
    }
}

async function handleSetDisableButton(req, res) {
    let { SKUID, disabledItem } = req.body
    try {
        const pool = await connectDB()

        const setItemDisable = await pool.request()
            .input('SKUID', sql.Int, SKUID)
            .input('disabledItem', sql.Int, disabledItem)
            .query('UPDATE SKU_Master SET disabledItem = @disabledItem WHERE SKUID = @SKUID')

        return res.status(200).send(SKUID + disabledItem + "setItemDisable")
    } catch (err) {
        console.log(err)
    }
}

async function hanbleSetDailyItemPrice(req, res) {
    const { SKUID, SKU_Name, Purchase_Amount } = req.body;

    console.log(SKUID, SKU_Name, Purchase_Amount)
    // Validate input
    if (!SKUID || isNaN(Purchase_Amount)) {
        return res.status(400).json({ error: 'Invalid input: SKUID must be present and Purchase_Amount must be a valid number.' });
    }

    // Get current date in 'YYYY-MM-DD' format for India Standard Time (IST)
    const currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');

    try {
        const pool = await connectDB();

        // Perform the database operation
        await pool.request()
            .input('SKUID', sql.Int, SKUID)
            .input('SKU_Name', sql.VarChar, SKU_Name)
            .input('Purchase_Amount', sql.Decimal(10, 2), Purchase_Amount) // Assuming Purchase_Amount is a decimal with precision
            .input('Date', sql.Date, currentDate) // Add the current date as input
            .query(`
                MERGE INTO SKU_Pricingdaywise AS target
                USING (SELECT @SKUID AS SKUID, @Date AS Date, @SKU_Name AS SKU_Name) AS source
                ON target.SKUID = source.SKUID AND target.Date = source.Date
                WHEN MATCHED THEN
                    UPDATE SET 
                        target.Purchase_Amount = @Purchase_Amount
                WHEN NOT MATCHED THEN
                    INSERT (SKUID, Purchase_Amount, Date, SKU_Name)
                    VALUES (@SKUID, @Purchase_Amount, @Date, @SKU_Name);
            `);

        // Send response after the operation is complete
        res.status(200).json({ message: "Price updated successfully" });
    } catch (err) {
        console.error('Database error:', err); // Log the actual error
        res.status(500).json({ error: "An error occurred while updating the price" });
    }
}

async function handleAdminSignup(req, res) {
    let { name, email, mobileno, address, role, password } = req.body;
    // console.log(name, email, mobileno, role, password)
    let Name = name
    let Email = email
    let Role = role
    let Password = password
    let MobNo = mobileno

    // console.log(req.admin)
    try {
        const pool = await connectDB()

        let fetchAdmin = await pool.request()
        .input('Email', sql.VarChar, Email) 
        .input('MobNo', sql.VarChar, MobNo)  
        .query(`SELECT * FROM Admin_Master WHERE Email = @Email OR MobNo = @MobNo`);

        console.log(fetchAdmin.recordset.length);

        if(fetchAdmin.recordset.length === 0) {
            let setInvoiceNumber = await pool.request()
                .input('Name', sql.VarChar, Name)
                .input('Email', sql.VarChar, Email)
                .input('MobNo', sql.VarChar, MobNo)
                .input('Role', sql.VarChar, Role)
                .input('Password', sql.VarChar, Password)
                .query(`
                    INSERT INTO Admin_Master ( Name, Admin_id, Email, MobNo, Role, Password )
                    SELECT @Name, 
                        ISNULL(MAX(Admin_id), 0) + 1, 
                        @Email, 
                        @MobNo,
                        @Role, 
                        @Password
                    FROM Admin_Master
                    WHERE NOT EXISTS (
                        SELECT 1 
                        FROM Admin_Master 
                        WHERE Email = @Email AND MobNo = @MobNo
                    );
                `);

            return res.status(200).send("Signup Successfully")
        } else {
            return res.send("Admin already exist please Login")
        }
    } catch(err) {
        console.log(err)
        return res.status(400).send("Not Signup")
    }
}

async function handleGetTodayOrderDetails(req, res) {
    let { selectedDateFromAdmin } = req.body;
    try {
        const pool = await connectDB();

        // Query for individual order details
        const orderDetailsResult = await pool.request()
            .input('SelectedDate', sql.Date, selectedDateFromAdmin)
            .query(`
                SELECT 
                    OrderID,
                    Cust_ID,
                    OrderDate,
                    OrderDtime,
                    DeliverySlot,
                    STRING_AGG(SKUID, ', ') AS SKUID,
                    STRING_AGG(SKUName, ', ') AS SKUName,
                    STRING_AGG(CAST(Qty AS VARCHAR), ', ') AS Quantities
                FROM 
                    Order_Data
                WHERE 
                    OrderDate = @SelectedDate
                    AND Order_sts = 1
                    AND (OrderDeleted = 0 OR OrderDeleted IS NULL)
                GROUP BY 
                    OrderID, Cust_ID, OrderDate, OrderDtime, DeliverySlot
                ORDER BY 
                    OrderID;
            `);

        // Query for total quantity per SKU
        const skuTotalsResult = await pool.request()
            .input('SelectedDate', sql.Date, selectedDateFromAdmin)
            .query(`
                SELECT 
                    SKUID,
                    SKUName,
                    SUM(Qty) AS TotalQuantity
                FROM 
                    Order_Data
                WHERE 
                    OrderDate = @SelectedDate
                    AND Order_sts = 1
                    AND (OrderDeleted = 0 OR OrderDeleted IS NULL)
                GROUP BY 
                    SKUID, SKUName
                ORDER BY 
                    SKUID;
            `);

        // Combine results
        const placedOrders = orderDetailsResult.recordset;
        const skuTotals = skuTotalsResult.recordset;

        console.log("Order Details:", placedOrders);
        console.log("SKU Totals:", skuTotals);

        res.send({
            placedOrders,
            skuTotals
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while fetching order details.");
    }
}

// async function hanbleSetDailyItemPrice(req, res) {
//     let { SKUID, Purchase_Amount } = req.body;
//     let currentDate = moment.tz('Asia/Kolkata').format('YYYY-MM-DD');

//     try {
//         const pool = await connectDB();

//         // Using for...of loop to handle async/await properly
//         for (const element of Purchase_Amount) {
//             let SKUID = element.SKUID;
//             let SKU_Name = element.SKU_Name;
//             let Purchase_Amount = element.Purchase_Amount;
//             let Date = currentDate;

//             await pool.request()
//                 .input('SKUID', sql.Int, SKUID)
//                 .input('Purchase_Amount', sql.Int, Purchase_Amount)
//                 .input('SKU_Name', sql.VarChar, SKU_Name)
//                 .input('Date', sql.Date, Date)
//                 .query(`
//                     MERGE INTO SKU_Pricingdaywise AS target
//                     USING (SELECT @SKUID AS SKUID, @Date AS Date) AS source
//                     ON target.SKUID = source.SKUID AND target.Date = source.Date
//                     WHEN MATCHED THEN
//                         UPDATE SET 
//                             target.Purchase_Amount = @Purchase_Amount, 
//                             target.SKU_Name = @SKU_Name
//                     WHEN NOT MATCHED THEN
//                         INSERT (SKUID, Purchase_Amount, Date, SKU_Name)
//                         VALUES (@SKUID, @Purchase_Amount, @Date, @SKU_Name);
//                 `);
//         }

//         // Send response after all updates are complete
//         res.status(200).send({ message: "Prices updated successfully" });
//     } catch (err) {
//         console.log(err);
//         // Send error response if any error occurs
//         res.status(500).send({ error: "An error occurred while updating prices" });
//     }
// }

module.exports = {
    handleAddNewItem,
    handleGetAllItem,
    handleSetDisableButton,
    hanbleSetDailyItemPrice,
    handleAdminSignup,
    handleGetTodayOrderDetails,
}
