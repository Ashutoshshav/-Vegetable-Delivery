const { connectDB, sql } = require("../Utils/Connection");
let { setToken, getUser, getOTP, storeOTP, checkOTP } = require("../Services/UserAuthentication")
let { handleSendEmail } = require("../Services/SendEmail")

async function handleUserSignup(req, res) {
    let { Cust_ID, name, mobileno, email, address, gstno, password } = req.body;
    let Name_of_Cust = name
    let MobNo = mobileno
    let Email = email
    let Address = address
    let GSTNo = gstno
    let Password = password
    let Cat_ID = 1;
    console.log(Name_of_Cust, MobNo, Email, Address, GSTNo, Password)
    try {
        const pool = await connectDB()

        const fetchUser = await pool.request()
            .input('Email', sql.VarChar, Email)
            .input('MobNo', sql.VarChar, MobNo)
            .query(`SELECT * FROM CustMaster WHERE Email = @Email OR MobNo = @MobNo`);

        // Log the fetched user
        console.log(fetchUser.recordset.length);

        if (fetchUser.recordset.length === 0) {
            let result = await pool.request()
                .query(`SELECT MAX(Cust_ID) AS Last_Cust FROM CustMaster`)

            let Last_Cust = result.recordset[0].Last_Cust
            console.log(Last_Cust)
            Cust_ID = Last_Cust + 1

            const result2 = await pool.request()
                .input('Cust_ID', sql.Int, Cust_ID)
                .input('Name_of_Cust', sql.VarChar, Name_of_Cust)
                .input('MobNo', sql.VarChar, MobNo)
                .input('Email', sql.VarChar, Email)
                .input('Address', sql.VarChar, Address)
                .input('GSTNo', sql.VarChar, GSTNo)
                .input('Password', sql.VarChar, Password)
                .input('Cat_ID', sql.Int, Cat_ID)
                .query(`INSERT INTO CustMaster (Cust_ID, Name_of_Cust, MobNo, Email, Address, GSTNo, Password, Cat_ID) VALUES (@Cust_ID, @Name_of_Cust, @MobNo, @Email, @Address, @GSTNo, @Password, @Cat_ID)`)

            // console.log(result)
            return res.status(200).send("Signup Successfully")
        } else {
            return res.send("User already exist please Login")
        }
    } catch (err) {
        console.log(err)
        res.status(400).send("Not Signup")
    }
}

async function handleUserLogin(req, res) {
    let { mobileno, email, password } = req.body;
    let Email = email
    let Password = password
    let MobNo = mobileno
    // console.log(Email, MobNo)
    try {
        const pool = await connectDB()

        let result = await pool.request()
            .input('Email', sql.VarChar, Email)
            .input('MobNo', sql.VarChar, MobNo)
            .query(`SELECT * FROM CustMaster WHERE Email = @Email OR MobNo = @MobNo`)

        if (result.recordset.length === 0) {
            return res.send("User not Exist")
        }

        // console.log(result.recordset[0].Password)
        let user = result.recordset[0];
        console.log(user)
        if (user.Cust_ID) {
            if (user.Password == Password) {
                let token = setToken(user)
                // console.log(token)
                return res.json({ token: token })
            } else {
                return res.send("Password is Wrong")
            }
        }
    } catch (err) {
        console.log(err)
    }
}

async function handleForgetPassword(req, res) {
    const { email } = req.body;

    if (email) {
        try {
            const pool = await connectDB()

            let result = await pool.request()
                .input('email', sql.VarChar, email)
                .query(`SELECT * FROM CustMaster WHERE Email = @email`)

            if (result.recordset.length === 0) {
                return res.send({message: "User doesn't not Exist"})
            } else {
                let OTP = getOTP();
                console.log(OTP);

                await handleSendEmail(email, "Your OTP", `OTP ${OTP}`).then((info) => {
                    // console.log("Message sent:", info.messageId);
                    storeOTP(email, OTP);
                    res.send({message: "OTP Sended"});
                }).catch((err) => {
                    console.log(err);
                })
            }
        } catch (err) {
            console.log(err);
        }
    } else {
        console.log("email is not getting");
        res.send({message: "email is not getting"})
    }
}

async function handleCheckOTP(req, res) {
    const { email, OTP } = req.body;

    const verified = checkOTP(email, OTP)
    console.log(verified);
    if (verified) {
        res.send({message: "OTP verified successfully"})
    } else {
        res.send({message: 'Invalid or expired OTP'});
    }
}

async function resetPassword(req, res) {
    const { email, newPassword, confirmPassword } = req.body;

    try {
        const pool = await connectDB()
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query(`SELECT * FROM CustMaster WHERE Email = @email`)

        if (result.recordset.length === 0) {
            return res.send({message: "User doesn't Exist"})
        } else {
            if (newPassword == confirmPassword) {
                let setPassword = await pool.request()
                    .input('email', sql.VarChar, email)
                    .input('confirmPassword', sql.VarChar, confirmPassword)
                    .query('UPDATE CustMaster SET Password = @confirmPassword WHERE Email = @email')
                res.send({message: "Password Reset Successfully"});
            } else {
                res.status(400).send({message: "New Password and Confirm Password is not same"});
            }
        }
    } catch (err) {
        console.log(err);
    }
}

async function handleLoginAll(req, res) {
    let { email, password } = req.body;
    let Email = email
    let Password = password

    // console.log(Email, Password)
    try {
        const pool = await connectDB()

        let result = await pool.request()
            .input('Email', sql.VarChar, Email)
            .query(`SELECT * FROM CustMaster WHERE Email = @Email`)

        if (result.recordset.length === 0) {
            return res.send("User not Exist")
        }

        // console.log(result.recordset[0].Password)
        let user = result.recordset[0];
        console.log(user)
        if (user.Cust_ID) {
            if (user.Password == Password) {
                let token = setToken(user)
                // console.log(token)
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
    handleUserSignup,
    handleUserLogin,
    handleForgetPassword,
    handleCheckOTP,
    resetPassword,
}
