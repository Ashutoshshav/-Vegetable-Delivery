const express = require("express")

const { handleCartAdd, handleProductQty, handleCartRemove } = require("../Controllers/CartControllers")

const router = express.Router()

router.post("/insert", handleCartAdd)
router.post("/remove", handleCartRemove)
router.get("/productQty", handleProductQty)

module.exports = router
