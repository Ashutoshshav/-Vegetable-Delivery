const express = require("express")

const { handleAddNewItem, handleGetAllItem, handleSetDisableButton, hanbleSetDailyItemPrice, handleAdminSignup, handleGetTodayOrderDetails } = require("../Controllers/AdminAccessControllers")

const router = express.Router()

router.post("/addnewitem", handleAddNewItem)
router.post("/itemdisable", handleSetDisableButton)
router.post("/addnewadmin", handleAdminSignup)
router.get("/allitems", handleGetAllItem)
router.post("/updateprice", hanbleSetDailyItemPrice)
router.post("/orderdetail", handleGetTodayOrderDetails)

module.exports = router
