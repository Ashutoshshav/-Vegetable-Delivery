const express = require("express")

const { handleInvoiceManagement, handleSetCustInvoice, handleGenerateInvoicePDF, handleSendInvoiceMail } = require("../Controllers/InvoiceControllers")

const router = express.Router()

router.get("/generation", handleInvoiceManagement)
router.get("/generated", handleSetCustInvoice)
router.get("/generateInvoice", handleGenerateInvoicePDF)
router.get("/sendinvoice", handleSendInvoiceMail)

module.exports = router
