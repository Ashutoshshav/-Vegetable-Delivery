const { connectDB, sql } = require("../Utils/Connection");

let jwt = require('jsonwebtoken')
require('dotenv').config();
const otpGenerator = require("otp-generator");

// Using a Map to store OTPs
const otpStore = new Map();

function setToken(user) {
    if(user) {
        let token = jwt.sign(
            {
                id: user.Cust_ID,
                email: user.Email,
                mob: user.MobNo,
            },
            process.env.SECRET_KEY
        )
        
        return token;
    } else {
        return "user is not coming in setToken"
    }
}

function getUser(token) {
    if(!token) {
        return "token not getting in getToken"
    } else {
        try {
            let user = jwt.verify(token, process.env.SECRET_KEY)
            return user;
        } catch(err) {
            console.log(err + " getToken")
        }
    }
}

function setTokenForAdmin(admin) {
    if(admin) {
        let token = jwt.sign(
            {
                id: admin.Admin_id,
                email: admin.Email,
                mob: admin.MobNo,
            },
            process.env.ADMIN_SECRET_KEY
        )
        
        return token;
    } else {
        return console.log("Admin is not coming in setToken")
    }
}

function getAdminByToken(token) {
    if(!token) {
        return "token not getting in getAdminByToken"
    } else {
        try {
            let admin = jwt.verify(token, process.env.ADMIN_SECRET_KEY)
            return admin;
        } catch(err) {
            console.log(err + " getAdminByToken")
        }
    }
}

function getOTP() {
    let OTP = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
  
    return OTP;
}

function storeOTP(email, OTP) {
    otpStore.set(email, OTP);
    
    // Set a timeout to delete the OTP after 5 minutes (300000 milliseconds)
    setTimeout(() => otpStore.delete(email), 300000);
    // console.log(otpStore);
}

function checkOTP(email, OTP) {
    console.log(email, OTP);
    
    const storedOTP = otpStore.get(email);
  
    if (storedOTP && storedOTP === OTP) {
      otpStore.delete(email);
      return true
    } else {
      return false
    }
  }

module.exports = {
    setToken,
    getUser,
    setTokenForAdmin,
    getAdminByToken,
    getOTP,
    storeOTP,
    checkOTP,
}
