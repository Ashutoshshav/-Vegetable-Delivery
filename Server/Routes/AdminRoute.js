const express = require("express")

const { handleAdminLogin } = require("../Controllers/AdminControllers")

const router = express.Router()

router.post("/login", handleAdminLogin)

module.exports = router
