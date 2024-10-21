const { connectDB, sql } = require("../Utils/Connection");
const {
    insertProductInCart,
    getProductOfCart,
} = require("../Services/CartManagement");
const moment = require("moment-timezone");

async function handleCartAdd(req, res) {
    let { SKUID, SKUName, Qty } = req.body;
    let Cust_ID = req.user.id;
    // console.log(Cust_ID);
    // console.log(req.user);
    try {
        //console.log(Cust_ID, SKUID, Qty)
        const pool = await connectDB();

        let newQty = await pool
            .request()
            .input("Cust_ID", sql.Int, Cust_ID)
            .input("SKUID", sql.Int, SKUID)
            .query(
                "SELECT Qty FROM Order_Data WHERE Cust_ID = @Cust_ID AND SKUID = @SKUID AND ((InvoiceGenerated = 0 OR InvoiceGenerated IS NULL) AND (OrderDeleted = 0 OR OrderDeleted IS NULL))"
            );

        // console.log(newQty)
        if (newQty.recordset.length === 0) {
            await insertProductInCart(Cust_ID, SKUID, SKUName, Qty + 1, 0, 0);
            let result = await pool
                .request()
                .input("Cust_ID", sql.Int, Cust_ID)
                .input("SKUID", sql.Int, SKUID)
                .query(
                    "SELECT Qty FROM Order_Data WHERE Cust_ID = @Cust_ID AND SKUID = @SKUID AND ((InvoiceGenerated = 0 OR InvoiceGenerated IS NULL) AND (OrderDeleted = 0 OR OrderDeleted IS NULL))"
                );
            //console.log(result.recordset[0].Qty);

            let qty = result.recordset[0].Qty;
            return res.status(200).send({ qty });
        } else {
            currQty = newQty.recordset[0].Qty;
            currQty += 1;
            //console.log(currQty)
            await pool
                .request()
                .input("Cust_ID", sql.Int, Cust_ID)
                .input("SKUID", sql.Int, SKUID)
                .input("Qty", sql.Int, currQty)
                .query(
                    "UPDATE Order_Data SET Qty = @Qty WHERE Cust_ID = @Cust_ID AND SKUID = @SKUID AND ((InvoiceGenerated = 0 OR InvoiceGenerated IS NULL) AND (OrderDeleted = 0 OR OrderDeleted IS NULL))"
                );

            let result = await pool
                .request()
                .input("Cust_ID", sql.Int, Cust_ID)
                .input("SKUID", sql.Int, SKUID)
                .query(
                    "SELECT Qty FROM Order_Data WHERE Cust_ID = @Cust_ID AND SKUID = @SKUID AND ((InvoiceGenerated = 0 OR InvoiceGenerated IS NULL) AND (OrderDeleted = 0 OR OrderDeleted IS NULL))"
                );

            // let qty = console.log(result.recordset[0].Qty);
            //console.log(result.recordset);
            return res.status(200).send({ qty });
        }
        //let result = await getProductOfCart(Cust_ID)
    } catch (e) {
        console.log(e);
    }
}

async function handleCartRemove(req, res) {
    let { SKUID, SKUName, Qty } = req.body;
    //console.log(Cust_ID, SKUID, SKU_Name, Qty)
    let Cust_ID = req.user.id;
    // console.log(Cust_ID)
    // console.log(req.user)
    try {
        const pool = await connectDB();

        let result = await pool
            .request()
            .input("Cust_ID", sql.Int, Cust_ID)
            .input("SKUID", sql.Int, SKUID).query(`
            SELECT Qty 
            FROM Order_Data 
            WHERE Cust_ID = @Cust_ID 
            AND SKUID = @SKUID 
            AND ((InvoiceGenerated = 0 OR InvoiceGenerated IS NULL) AND (OrderDeleted = 0 OR OrderDeleted IS NULL))
        `);

        //console.log(newQty)

        if (result.recordset.length === 0) {
            // let result = await pool.request().query(`SELECT Qty FROM Cart WHERE Cust_ID = ${Cust_ID} AND SKUID = ${SKUID}`)
            // //console.log(result.recordset[0].Qty);

            // result = result.recordset[0].Qty;
            // return res.status(200).send(result);
            return res.status(200).send(false);
        }

        let currQty = result.recordset[0].Qty;

        if (currQty <= 1) {
            await pool
                .request()
                .input("Cust_ID", sql.Int, Cust_ID)
                .input("SKUID", sql.Int, SKUID).query(`
        DELETE FROM Order_Data 
        WHERE Cust_ID = @Cust_ID 
        AND SKUID = @SKUID 
        AND ((InvoiceGenerated = 0 OR InvoiceGenerated IS NULL) AND (OrderDeleted = 0 OR OrderDeleted IS NULL))
    `);
            return res.status(200).send(false);
        } else {
            currQty -= 1;
            await pool
                .request()
                .input("currQty", sql.Int, currQty) // Assuming currQty is an integer
                .input("Cust_ID", sql.Int, Cust_ID)
                .input("SKUID", sql.Int, SKUID).query(`
        UPDATE Order_Data 
        SET Qty = @currQty 
        WHERE Cust_ID = @Cust_ID 
        AND SKUID = @SKUID 
        AND ((InvoiceGenerated = 0 OR InvoiceGenerated IS NULL) AND (OrderDeleted = 0 OR OrderDeleted IS NULL))
    `);

            let result = await pool
                .request()
                .input("Cust_ID", sql.Int, Cust_ID)
                .input("SKUID", sql.Int, SKUID).query(`
        SELECT Qty 
        FROM Order_Data 
        WHERE Cust_ID = @Cust_ID 
        AND SKUID = @SKUID 
        AND ((InvoiceGenerated = 0 OR InvoiceGenerated IS NULL) AND (OrderDeleted = 0 OR OrderDeleted IS NULL))
    `);

            //console.log(result.recordset[0].Qty);

            let qty = result.recordset[0].Qty;
            return res.status(200).send({ qty });
        }
    } catch (e) {
        console.log(e);
    }
}

async function handleProductQty(req, res) {
    let Cust_ID = req.user.id;
    // console.log(Cust_ID);
    // console.log(req.user);

    try {
        const pool = await connectDB();

        // Check if there are any orders where the invoice is not generated yet
        let result = await pool.request().input("Cust_ID", sql.Int, Cust_ID).query(`
                SELECT SKUID, SKUName, Qty 
                FROM Order_Data 
                WHERE Cust_ID = @Cust_ID 
                AND ((InvoiceGenerated = 0 OR InvoiceGenerated IS NULL) AND (OrderDeleted = 0 OR OrderDeleted IS NULL))
            `);

        let data = result.recordset;
        // console.log(data);
        if (data.length > 0) {
            // If there are orders where the invoice is not generated, show the existing quantity
            res.status(200).send({ data });
        } else {
            // If all invoices are generated, allow the user to enter a new entry
            res.status(200).send({ data });
        }
    } catch (e) {
        console.log(e);
        res
            .status(500)
            .send({
                error: "An error occurred while fetching the product quantity.",
            });
    }
}

// async function handleProductQty(req, res) {
//     let Cust_ID = req.user.id
//     console.log(Cust_ID)
//     console.log(req.user)
//     try {
//         const pool = await connectDB()

//         let result = await pool.request()
//             .input('Cust_ID', sql.Int, Cust_ID)
//             .query(`SELECT SKUID, SKUName, Qty FROM Order_Data WHERE Cust_ID = @Cust_ID`)

//         console.log(result.recordset)
//         let data = result.recordset;
//         res.status(200).send({ data })
//     } catch (e) {
//         console.log(e)
//     }
// }

// async function handleCartRemove(req, res) {
//     try {
//         let { Cust_ID, SKUID, SKU_Name, Qty } = req.body;
//         //console.log(Cust_ID, SKUID, SKU_Name, Qty)
//         const pool = await connectDB()

//         let result = await pool.request().query(`SELECT Qty FROM Cart WHERE Cust_ID = ${Cust_ID} AND SKUID = ${SKUID}`)

//         //console.log(newQty)

//         if (result.recordset.length === 0) {
//             // let result = await pool.request().query(`SELECT Qty FROM Cart WHERE Cust_ID = ${Cust_ID} AND SKUID = ${SKUID}`)
//             // //console.log(result.recordset[0].Qty);

//             // result = result.recordset[0].Qty;
//             // return res.status(200).send(result);
//             return res.status(200).send(false);
//         }

//         let currQty = result.recordset[0].Qty;

//         if (currQty <= 1) {
//             await pool.request()
//             .query(`DELETE FROM Cart WHERE Cust_ID = ${Cust_ID} AND SKUID = ${SKUID}`);
//             return res.status(200).send(false);
//         } else {
//             currQty -= 1;
//             await pool.request()
//                 .query(`UPDATE Cart SET Qty = ${currQty} WHERE Cust_ID = ${Cust_ID} AND SKUID = ${SKUID}`);

//             let result = await pool.request().query(`SELECT Qty FROM Cart WHERE Cust_ID = ${Cust_ID} AND SKUID = ${SKUID}`)
//             //console.log(result.recordset[0].Qty);

//             let qty = result.recordset[0].Qty;
//             return res.status(200).send({qty});
//         }
//     } catch (e) {
//         console.log(e)
//     }
// }

// async function handleCartAdd(req, res) {
//     try {
//         let { Cust_ID, SKUID, SKU_Name, Qty } = req.body;
//         //console.log(Cust_ID, SKUID, SKU_Name, Qty)
//         const pool = await connectDB()

//         let newQty = await pool.request().query(`SELECT Qty FROM Cart WHERE Cust_ID = ${Cust_ID} AND SKUID = ${SKUID}`)

//         console.log(newQty)
//         if(newQty.recordset.length == 0) {
//             await insertProductInCart(Cust_ID, SKUID, SKU_Name, Qty + 1)
//             let result = await pool.request().query(`SELECT Qty FROM Cart WHERE Cust_ID = ${Cust_ID} AND SKUID = ${SKUID}`)
//             //console.log(result.recordset[0].Qty);

//             let qty = result.recordset[0].Qty;
//             return res.status(200).send({qty});
//         } else {
//             currQty = newQty.recordset[0].Qty;
//             currQty += 1;
//             //console.log(currQty)
//             await pool.request().query(`UPDATE Cart SET Qty = ${currQty} WHERE Cust_ID = ${Cust_ID} AND SKUID = ${SKUID}`)

//             let result = await pool.request().query(`SELECT Qty FROM Cart WHERE Cust_ID = ${Cust_ID} AND SKUID = ${SKUID}`)
//             let qty = console.log(result.recordset[0].Qty);
//             //console.log(result.recordset);
//             return res.status(200).send({qty});
//         }
//         //let result = await getProductOfCart(Cust_ID)
//     } catch (e) {
//         console.log(e)
//     }
// }

module.exports = {
    handleCartAdd,
    handleProductQty,
    handleCartRemove,
};
