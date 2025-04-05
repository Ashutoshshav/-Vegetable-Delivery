import React, { useState, useContext } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { z } from 'zod';

const schema = z.object({
    email: z.string().email("Enter a valid Email"),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[\W_]/, "Password must contain at least one special character"),
});

function AdminLogin({ setIsAdmin }) {
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState({});
    const [successMsg, setSuccessMsg] = useState("");
    const [data, setData] = useState({
        email: "",
        password: ""
    });

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({
            ...data,
            [name]: value,
        });

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
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Zod validation
            const validation = schema.safeParse(data);

            if (!validation.success) {
                // Format errors and set them in state
                const errorMessages = validation.error.errors.reduce((acc, err) => {
                    acc[err.path[0]] = err.message;
                    return acc;
                }, {});
                setErrorMsg(errorMessages);
                setSuccessMsg(""); // Clear success message on error
            } else {
                console.log("Form submitted successfully", validation.data);

                // Axios call to backend
                const response = await axios.post("/api/admin/login", data);

                if (response.data.token == null) {
                    if(response.data == "Admin not Exist") {
                        navigate("/AdminLogin")
                    } else {
                        setErrorMsg({ form: response.data || "Login failed!" });
                        setSuccessMsg("");
                    }
                } else {
                    sessionStorage.setItem('token', response.data.token);
                    // localStorage.setItem("token", response.data.token);
                    setSuccessMsg("Login successful!");
                    setErrorMsg({}); // Clear error messages on success
                    setIsAdmin(true);
                    navigate("/SellerKPI")
                    // Optionally, set customer data here with setCustomer(response.data.customer);
                    // if (response.data.customer) {
                    //     setCustomer(response.data.customer);
                    // }
                }
            }
        } catch (err) {
            console.log(err);
            setErrorMsg({ form: "An unexpected error occurred. Please try again." });
            setSuccessMsg("");
        }
    };

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-100'>
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full">
                <h1 className='text-2xl font-bold text-center text-gray-800 mb-6'>Admin Login</h1>
                {successMsg ? (<p className="text-center text-green-500 font-medium mb-4">{successMsg}</p>) : ""}
                {errorMsg.form && (<p className="text-center text-red-500 font-medium mb-4">{errorMsg.form}</p>)}
                <form>
                    <div className='flex flex-col'>
                        <div className="mb-1">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                type="email"
                                id='email'
                                placeholder='Enter Email'
                                name='email'
                                value={data.email}
                                onChange={handleChange}
                            />
                            {errorMsg.email && <p className="text-red-500 text-xs italic">{errorMsg.email}</p>}
                        </div>

                        <div className="mb-1">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                type="password"
                                id='password'
                                placeholder='Enter Password'
                                name='password'
                                value={data.password}
                                onChange={handleChange}
                            />
                            {errorMsg.password && <p className="text-red-500 text-xs italic">{errorMsg.password}</p>}
                        </div>

                        <button
                            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 mt-2"
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

export default AdminLogin;
