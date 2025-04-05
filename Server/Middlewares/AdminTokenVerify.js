let { getAdminByToken } = require("../Services/UserAuthentication")

async function handleVerifyAdmin(req, res, next) {
    let token = req.headers['authorization'];

    if(!token) {
        return res.status(400).send("Please Admin Login")
    }

    console.log(token)
    
    let admin = getAdminByToken(token)
    
    if(!admin) {
        return res.status(400).send("Please Admin Login")
    } 

    req.admin = admin

    next()
}

module.exports = {
    handleVerifyAdmin,
}
