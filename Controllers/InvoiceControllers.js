const { connectDB, sql } = require("../Utils/Connection");
const { generateDeliverySchedule } = require("../Services/OrderSchedule");

const cron = require("node-cron");
const moment = require("moment-timezone");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const nodemailer = require("nodemailer");
const pdf = require("html-pdf");

async function handleGenerateInvoice() {
    await handleInvoiceManagement();
    console.log("invoice generated");
}

async function sendEmailWithInvoice(Cust_ID, emailAddress) {
    // Generate PDF Invoice
    const pdfBuffer = await generateInvoicePDF(Cust_ID);

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: "gmail", // or your preferred email service
        auth: {
            user: process.env.INVOICE_EMAIL, // your email address
            pass: process.env.INVOICE_PASS, // your email password or app password
        },
    });

    // Email options
    const mailOptions = {
        from: process.env.INVOICE_EMAIL, // sender address
        to: emailAddress, // recipient address
        subject: "Your Invoice", // subject line
        text: process.env.INVOICE_MSG, // plain text body
        attachments: [
            {
                filename: "invoice.pdf",
                content: pdfBuffer,
                contentType: "application/pdf",
            },
        ],
    };

    // Send email
    await transporter.sendMail(mailOptions);
}

async function handleSendInvoiceMail(req, res) {
    const Cust_ID = req.user.id;
    const email = req.user.email;
    const ml_smtp_user = process.env.INVOICE_EMAIL;
    const ml_smtp_password = process.env.INVOICE_PASS;
    const ml_smtp_msg = process.env.INVOICE_MSG;

    try {
        const pool = await connectDB();

        // Awaiting email sending
        await sendEmailWithInvoice(Cust_ID, email);

        // Store email details in the database
        await pool
            .request()
            .input("Cust_ID", sql.Int, Cust_ID)
            .input("ml_smtp_user", sql.VarChar, ml_smtp_user)
            .input("ml_smtp_password", sql.VarChar, ml_smtp_password)
            .input("email", sql.VarChar, email)
            .input("ml_smtp_msg", sql.VarChar, ml_smtp_msg).query(`
                INSERT INTO Email_ID_details 
                (ml_cust_id, ml_smtp_user, ml_smtp_password, ml_to, ml_smtp_msg) 
                VALUES (@Cust_ID, @ml_smtp_user, @ml_smtp_password, @email, @ml_smtp_msg)
            `);

        res.status(200).send("Invoice sent successfully.");
    } catch (err) {
        console.error("Error sending invoice email:", err);
        res.status(500).send("Internal Server Error");
    }
}

async function handleInvoiceManagement() {
    try {
        const pool = await connectDB();
        let selectSKU_Pricingdaywise = await pool
            .request()
            .query("SELECT * FROM SKU_Pricingdaywise");

        selectSKU_Pricingdaywise = selectSKU_Pricingdaywise.recordsets[0];
        // console.log(selectSKU_Pricingdaywise)

        const currentISTDate = moment.tz("Asia/Kolkata");
        // console.log(currentISTDate);
        let previousDay = currentISTDate.clone().subtract(1, "day");
        let formattedDate = previousDay.format("YYYY-MM-DD");
        // console.log(formattedDate);

        let selectCust_ID = await pool
            .request()
            .input("formattedDate", sql.Date, formattedDate)
            .query(
                "SELECT * FROM Order_Data WHERE OrderDate = @formattedDate AND ((InvoiceGenerated = 0 OR InvoiceGenerated IS NULL) AND (OrderDeleted = 0 OR OrderDeleted IS NULL))"
            );

        let orderData = selectCust_ID.recordset;
        // console.log(orderData);

        for (const element of orderData) {
            let Cust_ID = element.Cust_ID;
            // console.log(Cust_ID + " Cust_ID");

            let fetchCat_ID = await pool
                .request()
                .input("Cust_ID", sql.Int, Cust_ID)
                .query(
                    "SELECT ISNULL(Cat_ID, 1) AS Cat_ID FROM CustMaster WHERE Cust_ID = @Cust_ID"
                );

            // Check if fetchCat_ID returned any results
            if (fetchCat_ID.recordsets[0] && fetchCat_ID.recordsets[0].length > 0) {
                let Cat_ID = fetchCat_ID.recordsets[0][0].Cat_ID;
                // console.log(Cat_ID + " cat");

                let setCat_ID = await pool
                    .request()
                    .input("Cust_ID", sql.Int, Cust_ID)
                    .input("Cat_ID", sql.Int, Cat_ID)
                    .input('formattedDate', sql.Date, formattedDate)
                    .query(
                        "UPDATE Order_Data SET CustCat_ID = @Cat_ID WHERE Cust_ID = @Cust_ID AND OrderDate = @formattedDate"
                    );

                let getMul_Fact = await pool
                    .request()
                    .input("Cat_ID", sql.Int, Cat_ID)
                    .query("SELECT Mul_Fact FROM Category_ID WHERE Cat_ID = @Cat_ID");

                if (getMul_Fact.recordset.length > 0) {
                    let Mul_Fact = getMul_Fact.recordset[0].Mul_Fact;

                    for (const skuElement of selectSKU_Pricingdaywise) {
                        let SKUID = skuElement.SKUID;
                        let Purchase_Amount = skuElement.Purchase_Amount * Mul_Fact;

                        await pool
                            .request()
                            .input("Cust_ID", sql.Int, Cust_ID)
                            .input("SKUID", sql.Int, SKUID)
                            .input("formattedDate", sql.Date, formattedDate)
                            .input("Purchase_Amount", sql.Float, Purchase_Amount)
                            .query(
                                "UPDATE Order_Data SET Rate = @Purchase_Amount WHERE Cust_ID = @Cust_ID AND SKUID = @SKUID AND OrderDate = @formattedDate AND Order_sts = 1"
                            );

                        await pool
                            .request()
                            .input("Cust_ID", sql.Int, Cust_ID)
                            .input("SKUID", sql.Int, SKUID)
                            .input("formattedDate", sql.Date, formattedDate)
                            .input("Purchase_Amount", sql.Float, Purchase_Amount)
                            .query(
                                "UPDATE Order_Data SET Amount = Rate * Qty WHERE Cust_ID = @Cust_ID AND SKUID = @SKUID AND OrderDate = @formattedDate AND Order_sts = 1"
                            );
                    }
                } else {
                    console.log(`No Mul_Fact found for Cat_ID ${Cat_ID}`);
                }
            } else {
                console.log(`No Cust_ID found for Cust_ID ${Cust_ID}`);
            }
        }

        return selectSKU_Pricingdaywise;
    } catch (err) {
        console.log(err);
    }
}

async function handleSetCustInvoice(req, res) {
    let Cust_ID = req.user.id;
    let Email = req.user.email;
    // console.log(Cust_ID)
    // console.log(Email)
    await handleInvoiceManagement();
    const currentISTDate = moment.tz("Asia/Kolkata");
    // console.log(currentISTDate);
    let previousDay = currentISTDate.clone().subtract(1, "day");
    const formattedDate = previousDay.format("YYYY-MM-DD");
    // console.log(result)
    // console.log(formattedDate);

    try {
        const pool = await connectDB();
        let getTotalAmount = await pool
            .request()
            .input("Cust_ID", sql.Int, Cust_ID)
            .input("formattedDate", sql.Date, formattedDate)
            .query(
                "SELECT SUM(Amount) AS Total_Amount, DeliverySlot, OrderDate FROM Order_Data WHERE Cust_ID = @Cust_ID AND OrderDate = @formattedDate AND Order_sts = 1 GROUP BY DeliverySlot, OrderDate"
            );

        if (getTotalAmount.recordset.length === 0) {
            return res.send({ error: "No orders found for the specified date." });
        }

        let Total_Amount = getTotalAmount.recordset[0].Total_Amount;
        let DeliverySlot = getTotalAmount.recordset[0].DeliverySlot;
        let OrderDate = getTotalAmount.recordset[0].OrderDate;

        const newdate = new Date(OrderDate);

        // Extract the date parts
        const year = newdate.getFullYear();
        const month = String(newdate.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
        const day = String(newdate.getDate()).padStart(2, "0");

        OrderDate = `${year}-${month}-${day}`;
        // console.log(OrderDate); // Output: "2024-10-04"
        // console.log(Total_Amount)
        // console.log(DeliverySlot)
        // console.log(OrderDate)

        let getSchedule = generateDeliverySchedule().deliveryTimes;
        // console.log(getSchedule)

        const DeliverySchedule = getSchedule.find((obj) => obj.id === DeliverySlot);
        // console.log(DeliverySchedule)

        let startTime = DeliverySchedule.startTime;
        let endTime = DeliverySchedule.endTime;
        // console.log(startTime)
        // console.log(endTime)
        let custInvoicedOrder = await pool
            .request()
            .input("Cust_ID", sql.Int, Cust_ID)
            .input("formattedDate", sql.Date, formattedDate)
            .query(
                "SELECT * FROM Order_Data WHERE Cust_ID = @Cust_ID AND OrderDate = @formattedDate AND Order_sts = 1"
            );

        // let setOrder_sts = await pool.request()
        //     .input('Cust_ID', sql.Int, Cust_ID)
        //     .input('formattedDate', sql.Date, formattedDate)
        //     .query('UPDATE Order_Data SET Order_sts = 2 WHERE Cust_ID = @Cust_ID AND OrderDate = @formattedDate AND Order_sts = 1');

        const currentDateTime = moment()
            .tz("Asia/Kolkata")
            .format("YYYY-MM-DD HH:mm:ss");

        let CustCat_ID = custInvoicedOrder.recordset[0].CustCat_ID;
        custInvoicedOrder = custInvoicedOrder.recordset;
        // console.log(custInvoicedOrder)
        // console.log(CustCat_ID)

        let setInvoiceNumber = await pool
            .request()
            .input("currentDateTime", sql.DateTimeOffset, currentDateTime)
            .input("Cust_ID", sql.Int, Cust_ID)
            .input("CustCat_ID", sql.Int, CustCat_ID)
            .input("Total_Amount", sql.Float, Total_Amount).query(`
                INSERT INTO Invoice_data (InvDtime, InvNo, CustID, CustCat_ID, Amount)
                SELECT @currentDateTime, 
                    ISNULL(MAX(InvNo), 0) + 1, 
                    @Cust_ID, 
                    @CustCat_ID, 
                    @Total_Amount
                FROM Invoice_data
                WHERE NOT EXISTS (
                    SELECT 1 
                    FROM Invoice_data 
                    WHERE CONVERT(DATE, InvDtime) = CONVERT(DATE, @currentDateTime) 
                    AND CustID = @Cust_ID
                );
            `);

        let setInvoiceGenerated = await pool
            .request()
            .input("Cust_ID", sql.Int, Cust_ID)
            .query(
                "UPDATE Order_Data SET InvoiceGenerated = 1 WHERE Cust_ID = @Cust_ID AND OrderDate = (SELECT MAX(OrderDate) FROM Order_Data WHERE Cust_ID = @Cust_ID AND Order_sts = 1) AND Order_sts = 1;"
            );

        res.send({
            OrderDate,
            startTime,
            endTime,
            custInvoicedOrder,
            Total_Amount,
        });
    } catch (err) {
        console.log(err);
    }
}

async function handleGenerateInvoicePDF(req, res) {
    let Cust_ID = req.user.id;

    try {
        // Call the function to generate PDF
        const pdfBuffer = await generateInvoicePDF(Cust_ID);

        // Set response headers for PDF
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=invoice.pdf"); // Use 'inline' if you want to display in browser

        // Send the generated PDF buffer to the client
        res.end(pdfBuffer);
    } catch (error) {
        console.error("Error generating invoice PDF:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function generateInvoicePDF(Cust_ID) {
    // Fetch invoice details from the database (same as before)
    try {
        const currentISTDate = moment.tz("Asia/Kolkata");
        let previousDay = currentISTDate.clone().subtract(1, "day");
        const formattedDate = previousDay.format("YYYY-MM-DD");
        const pool = await connectDB();
        const getInvoice = await pool
            .request()
            .input("Cust_ID", sql.Int, Cust_ID)
            .query(
                "SELECT TOP 1 InvNo, InvDtime FROM Invoice_data WHERE CustID = @Cust_ID ORDER BY InvNo DESC;"
            );

        const invoiceNumber = getInvoice.recordset[0].InvNo;
        const date = getInvoice.recordset[0].InvDtime;

        // Fetch customer details
        const getCustName = await pool
            .request()
            .input("Cust_ID", sql.Int, Cust_ID)
            .query("SELECT Name_of_Cust, MobNo, Email, Address, GSTNo FROM CustMaster WHERE Cust_ID = @Cust_ID");
        const customerName = getCustName.recordset[0].Name_of_Cust;
        const customerMobNo = getCustName.recordset[0].MobNo;
        const customerEmail = getCustName.recordset[0].Email;
        const customerAddress = getCustName.recordset[0].Address;
        const customerGSTNo = getCustName.recordset[0].GSTNo;

        // Fetch customer order items
        const custInvoicedOrder = await pool
            .request()
            .input("Cust_ID", sql.Int, Cust_ID)
            .input("formattedDate", sql.Date, formattedDate)
            .query(
                "SELECT * FROM Order_Data WHERE Cust_ID = @Cust_ID AND OrderDate = @formattedDate AND Order_sts = 1"
            );
        const items = custInvoicedOrder.recordset;
        // console.log(items)
        // console.log(custInvoicedOrder)
        // Calculate total amount from items
        const totalAmount = items.reduce((sum, item) => sum + item.Amount, 0);
        const deliveryCharge = 0;

        // Generate HTML content
        const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invoice</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        h1 { text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #dddddd; padding: 8px; text-align: center; }
                        th { background-color: #f2f2f2; }
                        span { font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div style="display: flex; justify-content: space-between;  align-items: center; margin-top: 10px;">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyrVuwWrVeeX3tC7QbphbkG-ib56Ak5RS5Bg&s" alt="Company Logo" style="max-width: 180px; margin-right: 15px;" />
                        <div style="display: inline-block; align-items: center; justify-content: center; margin-left: 300px;">
                            <p style="margin: 0; text-align: right;">Invoice Number: ${invoiceNumber}</p>
                            <p style="margin: 0; text-align: right;">Customer Name: ${customerName}</p>
                            <p style="margin: 0; text-align: right; width: 250px;">Date: ${date}</p>
                            <h3 style="margin: 0; text-align: right;">Net Payable: ${(totalAmount + deliveryCharge).toFixed(2)}</h3>
                        </div>
                    </div>
                    <hr />
                    <table style="width: 100%; border: 0;">
                        <tr style="border: 0;">
                            <td style="width: 50%; vertical-align: top; border: 0; text-align: left margin: 0;">
                                <h3 style="margin: 0; text-align: left; margin: 2px;">Billing Address</h3>
                                <h4 style="margin: 0; text-align: left;">Gurgaon</h4>
                                <p style="margin: 0; text-align: left;">1510/46/31 Khasra no. 7727/271/1 Surat Nagar, (Daultabad Chungi) Dhanwapur road,
                                Gurugram - Haryana (India) 122006 Ph.: +91-124-2469990</p>
                            </td>
                            <td style="width: 50%; vertical-align: top; border: 0; text-align: right margin: 0;">
                                <h3 style="margin: 0; text-align: right; margin: 2px;">Shipping Address</h3>
                                <p style="margin: 0; text-align: right;"><span>Name: </span> ${customerName}</p>
                                <p style="margin: 0; text-align: right;"><span>Mob No: </span> ${customerMobNo}</p>
                                <p style="margin: 0; text-align: right;"><span>Address: </span> ${customerAddress}</p>
                                <p style="margin: 0; text-align: right;"><span>GST No.: </span> ${customerGSTNo}</p>
                            </td>
                        </tr>
                    </table>

                    <table>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Item Name</th>
                                <th>Qty</th>
                                <th>Rate</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items
                .map(
                    (item, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${item.SKUName}</td>
                                    <td>${item.Qty}</td>
                                    <td>${item.Rate.toFixed(2)}</td>
                                    <td>${item.Amount.toFixed(2)}</td>
                                </tr>`
                )
                .join("")}
                                <tr>
                                    <td colspan="4" style="text-align: left; font-weight: bold;">Total</td>
                                    <td>${totalAmount.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colspan="4" style="text-align: left; font-weight: bold;">Delivery Charge: </td>
                                    <td>${deliveryCharge.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colspan="4" style="text-align: left; font-weight: bold;">Net Payable:</td>
                                    <td>${(totalAmount + deliveryCharge).toFixed(2)}</td>
                                </tr>
                        </tbody>
                    </table

                    <p>Thank you for Shopping!</p>
                </body>
        </html>
        `;

        // PDF options
        const options = { format: "A4" };

        // Create the PDF
        return new Promise((resolve, reject) => {
            pdf.create(htmlContent, options).toBuffer((err, buffer) => {
                if (err) return reject(err);
                resolve(buffer);
            });
        });
    } catch (error) {
        console.error("Error fetching invoice details:", error);
        throw new Error("Internal Server Error"); // Throw an error to be handled by the caller
    }
}

function scheduleInvoice() {
    cron.schedule(
        "00 6 * * *",
        () => {
            handleGenerateInvoice();
        },
        {
            scheduled: true,
            timezone: "Asia/Kolkata",
        }
    );
}

module.exports = {
    scheduleInvoice,
    handleInvoiceManagement,
    handleSetCustInvoice,
    handleGenerateInvoicePDF,
    handleSendInvoiceMail,
};
