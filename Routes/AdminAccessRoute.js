const express = require("express")

const { handleAddNewItem, handleGetAllItem, handleSetDisableButton, hanbleSetDailyItemPrice, handleAdminSignup } = require("../Controllers/AdminAccessControllers")

const router = express.Router()

router.post("/addnewitem", handleAddNewItem)
router.post("/itemdisable", handleSetDisableButton)
router.post("/addnewadmin", handleAdminSignup)
router.get("/allitems", handleGetAllItem)
router.post("/updateprice", hanbleSetDailyItemPrice)

module.exports = router
