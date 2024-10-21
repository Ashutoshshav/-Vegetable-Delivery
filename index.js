const express = require("express");
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
require('iisnode-env').config();

const app = express();
const config = require("./Utils/Connection");
const { handleVerifyUser } = require("./Middlewares/UserTokenVerify");
const { handleVerifyAdmin } = require("./Middlewares/AdminTokenVerify")

const productRoute = require("./Routes/ProductRoute");
const cartRoute = require("./Routes/CartRoute");
const orderRoute = require("./Routes/OrderRoute");
const userRoute = require("./Routes/UserRoute");
const invoiceRoute = require("./Routes/InvoiceRoute")
const sellerKPIRoute = require("./Routes/SellerKPIRoute")
const adminRoute = require("./Routes/AdminRoute")
const adminAccess = require("./Routes/AdminAccessRoute")
const { scheduleInvoice } = require("./Controllers/InvoiceControllers");

const port = process.env.PORT || 3000;

// Middleware configurations
app.use(cors({
    origin: ["http://192.168.0.252:3000", "http://localhost:3000", "http://localhost:5173"], // Allowed origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    credentials: true // Allow credentials if needed
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public/dist folder
app.use(express.static(path.join(__dirname, 'public', 'dist')));

// API routes
app.use("/api/user/", userRoute);
app.use("/api/admin/", adminRoute);
app.use("/api/invoice", handleVerifyUser, invoiceRoute)
app.use("/api/cart/", handleVerifyUser, cartRoute);
app.use("/api/order/", handleVerifyUser, orderRoute);
app.use("/api/seller/", handleVerifyAdmin, sellerKPIRoute);
app.use("/api/adminaccess/", handleVerifyAdmin, adminAccess);
app.use("/", productRoute);

// Catch-all handler for any requests that don’t match an API route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dist', 'index.html'));
});

// Schedule invoices
scheduleInvoice();

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log("Server is running on " + port);
});

// Uncomment and implement the database connection if needed
// async function connection() {
//     try {
//         let pool = await sql.connect(config);
//         console.log("DB connected");
//     } catch (e) {
//         console.log(e);
//     }
// }

// connection();
