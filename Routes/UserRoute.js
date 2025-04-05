const express = require("express")

const { handleUserSignup, handleUserLogin, handleForgetPassword, handleCheckOTP, resetPassword } = require('../Controllers/UserControllers')

const router = express.Router()

router.post("/signup", handleUserSignup)
router.post("/login", handleUserLogin)
router.post("/forgetpassword", handleForgetPassword)
router.post("/checkOTP", handleCheckOTP)
router.post("/resetpassowrd", resetPassword)

module.exports = router
