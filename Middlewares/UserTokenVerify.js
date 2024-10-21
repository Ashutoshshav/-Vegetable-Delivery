let { getUser } = require("../Services/UserAuthentication")

async function handleVerifyUser(req, res, next) {
    let token = req.headers['authorization'];

    if(!token) {
        return res.status(400).send("Please Login")
    }

    console.log(token)
    
    let user = getUser(token)
    
    if(!user) {
        return res.status(400).send("Please Login")
    } 

    req.user = user

    next()
}

module.exports = {
    handleVerifyUser,
}
