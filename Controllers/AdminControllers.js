const { connectDB, sql } = require("../Utils/Connection")
let { setTokenForAdmin, getAdminByToken } = require("../Services/UserAuthentication")

const moment = require('moment-timezone')

async function handleAdminLogin(req, res) {
    let { email, password } = req.body;
    let Email = email
    let Password = password
    const Last_login = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
    console.log(Last_login)

    // console.log(Email, Password)
    try {
        const pool = await connectDB()

        let result = await pool.request()
            .input('Email', sql.VarChar, Email)
            .query(`SELECT * FROM Admin_Master WHERE Email = @Email`)

        if (result.recordset.length === 0) {
            return res.send("Admin not Exist")
        }

        // console.log(result)
        let admin = result.recordset[0];
        console.log(admin)
        if (admin.Admin_id) {
            // console.log(admin.Admin_id)
            if (admin.Password == Password) {
                let setLast_login = await pool.request()
                    .input('Email', sql.VarChar, Email)
                    .input('Last_login', sql.DateTimeOffset, Last_login)
                    .query('UPDATE Admin_Master SET Last_login = @Last_login WHERE Email = @Email')
                let token = setTokenForAdmin(admin)
                // console.log(token + "ADMINTOKEN")
                return res.json({ token: token })
            } else {
                return res.send("Password is Wrong")
            }
        }
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    handleAdminLogin,
}
