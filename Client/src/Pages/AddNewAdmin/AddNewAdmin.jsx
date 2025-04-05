import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { z } from 'zod';

const schema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters"),

    mobileno: z.string()
        .regex(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit Indian number"),

    email: z.string()
        .email("Email must be a valid email address"),

    address: z.string()
        .min(1, "Address is required")
        .max(255, "Address must be less than 255 characters"),

    gstno: z.string()
        .optional(),

    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[\W_]/, "Password must contain at least one special character"),
});

function AddNewAdmin({ setIsAdmin }) {
    // let token = localStorage.getItem("token");
    const token = sessionStorage.getItem('token');
    const navigate = useNavigate();
    const [data, setData] = useState({
        name: "",
        mobileno: "",
        email: "",
        address: "",
        role: "",
        password: "",
    });
    
    const [errorMsg, setErrorMsg] = useState({});
    
    useEffect(() => {
        setIsAdmin(true);
    }, [])
    // Handle input changes
    let handleChange = (e) => {
        let { name, value } = e.target;
        setData({ ...data, [name]: value });

        try {
            schema.pick({ [name]: true }).parse({ [name]: value }); // Validate the single field
            setErrorMsg((prevErrors) => ({
                ...prevErrors,
                [name]: "", // Clear error message for valid field
            }));
        } catch (err) {
            setErrorMsg((prevErrors) => ({
                ...prevErrors,
                [name]: err.errors[0].message, // Set error message if validation fails
            }));
        }
    };

    // Handle form submission
    let handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let validation = schema.safeParse(data);

            if (!validation.success) {
                // Format errors and set them in state
                const errorMessages = validation.error.errors.reduce((acc, err) => {
                    acc[err.path[0]] = err.message;
                    return acc;
                }, {});
                console.log(errorMessages);
                setErrorMsg(errorMessages);
            } else {
                console.log("Form submitted successfully", validation.data);

                // Axios call to backend
                const response = await axios.post("/api/adminaccess/addnewadmin", data, {
                    headers: {
                        Authorization: `${token}`,
                    },
                });
                setErrorMsg({ error: response.data });
                if (response.data == "Signup Successfully") {
                    console.log(response.data);
                    navigate("/SellerKPI")
                    setErrorMsg({ success: response.data.message || "Signup successful!" });
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-100'>
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full">
                <h1 className='text-2xl font-bold text-center text-gray-800 mb-6'>Admin Signup</h1>

                {/* Show general error or success message */}
                {errorMsg.error ? (<p className="text-center text-red-500 font-medium mb-4">{errorMsg.error}</p>) : ""}

                {/* Show individual field error messages */}
                <form>
                    <div className='flex flex-col'>
                        <div className="mb-1">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Name</label>
                            {errorMsg.name && <p className="text-red-500 text-xs italic">{errorMsg.name}</p>}
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                type="text"
                                id='name'
                                placeholder='Enter Name'
                                name='name'
                                value={data.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-1">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mobileno">Mobile No</label>
                            {errorMsg.mobileno && <p className="text-red-500 text-xs italic">{errorMsg.mobileno}</p>}
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                type="text"
                                id='mobileno'
                                placeholder='Enter Mobile No'
                                name='mobileno'
                                value={data.mobileno}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-1">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                            {errorMsg.email && <p className="text-red-500 text-xs italic">{errorMsg.email}</p>}
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                type="email"
                                id='email'
                                placeholder='Enter Email'
                                name='email'
                                value={data.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-1">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">Address</label>
                            {errorMsg.address && <p className="text-red-500 text-xs italic">{errorMsg.address}</p>}
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                type="text"
                                id='address'
                                placeholder='Enter Address'
                                name='address'
                                value={data.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-1">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">Role</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                type="text"
                                id='role'
                                placeholder='Enter His Role'
                                name='role'
                                value={data.role}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-1">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                            {errorMsg.password && <p className="text-red-500 text-xs italic">{errorMsg.password}</p>}
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                type="password"
                                id='password'
                                placeholder='Enter Password'
                                name='password'
                                value={data.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
                            onClick={handleSubmit}
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddNewAdmin;