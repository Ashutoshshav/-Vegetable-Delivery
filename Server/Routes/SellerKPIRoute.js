const express = require("express")

const { getSellerKPI } = require("../Controllers/SellerKPIControllers")

const router = express.Router()

router.get("/SellerKPI", getSellerKPI)

module.exports = router
