const express = require("express");

const { connectDB, sql } = require("../Utils/Connection")

async function handleGetAllProduct(req, res) {
    try {
        const pool = await connectDB()
        const result = await pool.request().query("SELECT * FROM SKU_Master WHERE disabledItem = 0")

        console.log(result.recordset)
        res.status(200).send(result.recordset)
    } catch(e) {
        console.log(e)
    }
}

module.exports = {
    handleGetAllProduct,
}
