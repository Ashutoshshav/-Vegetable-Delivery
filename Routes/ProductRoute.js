const express = require("express")

const { handleGetAllProduct } = require("../Controllers/ProductControllers")

const router = express.Router()

router.get("/getProduct", handleGetAllProduct)

module.exports = router
