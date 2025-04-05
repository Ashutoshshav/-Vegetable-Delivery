const express = require("express")

const { handleDeliverySchedule, handleSubmitOrder, handleDeleteOrder } = require("../Controllers/OrderControllers")

const router = express.Router()

//router.get("/deliveryDate", handleDeliveryDate)
router.get("/deliverySchedules", handleDeliverySchedule)
router.post("/submitOrder", handleSubmitOrder)
router.get("/deleteOrder", handleDeleteOrder)

module.exports = router
