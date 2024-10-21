const { connectDB, sql } = require("../Utils/Connection")

const moment = require('moment-timezone')

async function getSellerKPI(req, res) {
    try {
        const pool = await connectDB()

        let getTotalCustPayment = await pool.request()
            .query('SELECT COUNT(*) AS Total_CustPayment_No FROM Payment')

        // console.log(getTotalCustPayment.recordset[0].Total_CustPayment_No)

        let getTotalVendorPayment = await pool.request()
            .query('SELECT COUNT(*) AS Total_VendorPayment_No FROM Purchase_History WHERE Payment_sts = 1')

        let getTotalTransporterPayment = await pool.request()
            .query('SELECT COUNT(*) AS Total_TransporterPayment_No FROM Transport_Master WHERE Payment_sts = 1')

        // console.log(getTotalVendorPayment.recordset[0].Total_VendorPayment_No)

        let getActiveCustomer = await pool.request()
            .query('SELECT COUNT(*) AS Total_ActiveCust_No FROM CustMaster WHERE Active_STS = 1')

        // console.log(getActiveCustomer)

        let getInactiveCustomer = await pool.request()
            .query('SELECT COUNT(*) AS Total_InactiveCust_No FROM CustMaster WHERE Active_STS = 0')

        // console.log(getInactiveCustomer.recordset[0].Total_InactiveCust_No)
        let getAllCustomer = await pool.request()
            .query('SELECT COUNT(*) AS Total_Cust_No FROM CustMaster')
        // console.log(getAllCustomer.recordset[0].Total_Cust_No)

        let getGoodActiveCust = await pool.request()
            .query('SELECT COUNT(*) AS GoodActiveCust FROM CustMaster WHERE Active_STS = 1 AND (Cat_ID = 4 OR Cat_ID = 5)')

        let getAllVendor = await pool.request()
            .query('SELECT COUNT(DISTINCT Vendor_Id) AS Total_Vendor_No FROM Purchase_History;')

        // console.log(getAllVendor)
        // console.log(getGoodActiveCust.recordset[0].GoodActiveCust)

        let getActiveVendor = await pool.request()
            .query('SELECT COUNT(DISTINCT Vendor_Id) AS Total_ActiveVendor_No FROM Purchase_History WHERE Active_STS = 1')

        // console.log(getActiveVendor.recordset[0].Total_ActiveVendor_No)

        let getInactiveVendor = await pool.request()
            .query('SELECT COUNT(DISTINCT Vendor_Id) AS Total_InactiveVendor_No FROM Purchase_History WHERE Active_STS = 0')

        // console.log(getInactiveVendor.recordset[0].Total_InactiveVendor_No)

        let getGoodActiveVendor = await pool.request()
            .query('SELECT COUNT(DISTINCT Vendor_Id) AS GoodActiveVendor FROM Purchase_History WHERE Active_STS = 1 AND (Cat_ID = 4 OR Cat_ID = 5)')

        // console.log(getGoodActiveVendor.recordset[0].GoodActiveVendor)

        let getTotalSale = await pool.request()
            .query('SELECT SUM(Amount) AS TotalSale FROM Invoice_data WHERE DATEPART(MONTH, DATEADD(MINUTE, 330, InvDtime)) = DATEPART(MONTH, GETDATE()) AND DATEPART(YEAR, DATEADD(MINUTE, 330, InvDtime)) = DATEPART(YEAR, GETDATE());')

        // console.log(getTotalSale.recordset[0].TotalSale)

        let getTotalPurchase = await pool.request()
            .query('SELECT SUM(Purchase_Amt) AS TotalPurchase FROM Purchase_History WHERE MONTH(Date) = MONTH(GETDATE())AND YEAR(Date) = YEAR(GETDATE());')

        // console.log(getTotalPurchase.recordset[0].TotalPurchase)

        let getTotalTransport = await pool.request()
            .query('SELECT SUM(Payment_Amt) AS TotalTransport FROM Transport_Master WHERE MONTH(Date) = MONTH(GETDATE())AND YEAR(Date) = YEAR(GETDATE());')

        // console.log(getTotalTransport.recordset[0].TotalTransport)

        const timezone = 'Asia/Kolkata';

        const currentDate = moment.tz(timezone);

        const currentDay = currentDate.date();
        // console.log(currentDay)
        let sendSellerKPIData = {
            financialPerformance: {
                outstandingCustomers: getTotalCustPayment.recordset[0].Total_CustPayment_No,
                outstandingVendors: getTotalVendorPayment.recordset[0].Total_VendorPayment_No,
                outstandingTransport: getTotalTransporterPayment.recordset[0].Total_TransporterPayment_No,
            },
            customerPerformance: {
                totalCust: getAllCustomer.recordset[0].Total_Cust_No,
                totalActiveCust: getActiveCustomer.recordset[0].Total_ActiveCust_No,
                totalInactiveCust: getInactiveCustomer.recordset[0].Total_InactiveCust_No,
                totalGoodActiveCust: getGoodActiveCust.recordset[0].GoodActiveCust,
            },
            vendorPerformance: {
                totalVendor: getAllVendor.recordset[0].Total_Vendor_No,
                totalActiveVendor: getActiveVendor.recordset[0].Total_ActiveVendor_No,
                totalInactiveVendor: getInactiveVendor.recordset[0].Total_InactiveVendor_No,
                totalGoodActiveVendor: getGoodActiveVendor.recordset[0].GoodActiveVendor,
            },
            monthStatics: {
                totalSale: getTotalSale.recordset[0].TotalSale,
                totalPurchase: getTotalPurchase.recordset[0].TotalPurchase,
                totalTransportCost: getTotalTransport.recordset[0].TotalTransport,
            },
            avgMonthStatics: {
                avgTotalSale: getTotalSale.recordset[0].TotalSale / currentDay,
                avgTotalPurchase: getTotalPurchase.recordset[0].TotalPurchase / currentDay,
                avgTotalTransportCost: getTotalTransport.recordset[0].TotalTransport / currentDay,
            }
        }

        res.send(sendSellerKPIData)
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    getSellerKPI,
}
