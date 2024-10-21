const { connectDB, sql } = require("../Utils/Connection")

async function insertProductInCart(Cust_ID, SKUID, SKUName, Qty, Order_sts, InvoiceGenerated) {
    try {
        const pool = await connectDB()
        console.log(Cust_ID, SKUID, Qty, Order_sts)
        const result = await pool.request()
            .input('Cust_ID', sql.Int, Cust_ID)
            .input('SKUID', sql.Int, SKUID)
            .input('SKUName', sql.VarChar, SKUName)
            .input('Qty', sql.Int, Qty)
            .input('Order_sts', sql.Int, Order_sts)
            .input('InvoiceGenerated', sql.Int, InvoiceGenerated)
            .query('INSERT INTO Order_Data (Cust_ID, SKUID, SKUName, Qty, Order_sts, InvoiceGenerated) VALUES (@Cust_ID, @SKUID, @SKUName, @Qty, @Order_sts, @InvoiceGenerated)')

        console.log(SKUID + " inserted in Cart")
        return result;
    } catch(e) {
        console.log(e);
    }
}

async function getProductOfCart(Cust_ID) {
    try {
        const pool = await connectDB()

        const result = await pool.request().query(`SELECT * FROM Cart WHERE Cust_ID = ${Cust_ID}`)
        //console.log(result.recordset);
        
        return result.recordset;
    } catch(e) {
        console.log(e)
    }
}

module.exports = {
    insertProductInCart,
    getProductOfCart,
}
