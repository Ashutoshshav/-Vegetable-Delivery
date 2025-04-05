import React, { useState, useContext } from 'react';
import { Link, useNavigate } from "react-router-dom";
import CustomerContext from '../../Contexts/CustomerContext/CustomerContext';
import axios from 'axios';
import { z } from 'zod';

// Zod schema for validation
const schema = z.object({
    email: z.string().email("Enter a valid Email"),
    mobileno: z.string()
        .regex(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit Indian number"),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[\W_]/, "Password must contain at least one special character"),
});

function Login() {
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState({});
    const [successMsg, setSuccessMsg] = useState("");
    const [mobLogin, setMobLogin] = useState(false)
    const [data, setData] = useState({
        email: "",
        mobileno: "",
        password: "",
    });

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({
            ...data,
            [name]: value,
        });

        try {
            schema.pick({ [name]: true }).parse({ [name]: value });
            setErrorMsg((prevErrors) => ({
                ...prevErrors,
                [name]: "",
            }));
        } catch (err) {
            setErrorMsg((prevErrors) => ({
                ...prevErrors,
                [name]: err.errors[0].message,
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const validation = schema.safeParse(data);
            console.log(validation);

            const response = await axios.post("/api/user/login", data);

                if (!response.data.token) {
                    if (response.data === "User not Exist") {
                        navigate("/Signup")
                    } else {
                        setErrorMsg({ form: response.data || "Login failed!" });
                        setSuccessMsg("");
                    }
                } else {
                    localStorage.setItem("token", response.data.token);
                    setSuccessMsg("Login successful!");
                    setErrorMsg({});
                    navigate("/");
                }
            
            // if (false) {
            //     const errorMessages = validation.error.errors.reduce((acc, err) => {
            //         acc[err.path[0]] = err.message;
            //         return acc;
            //     }, {});
            //     setErrorMsg(errorMessages);
            //     setSuccessMsg("");
            // } else {
            //     const response = await axios.post("http://192.168.0.252:3000/api/user/login", data);

            //     if (!response.data.token) {
            //         if (response.data === "User not Exist") {
            //             navigate("/Signup")
            //         } else {
            //             setErrorMsg({ form: response.data || "Login failed!" });
            //             setSuccessMsg("");
            //         }
            //     } else {
            //         localStorage.setItem("token", response.data.token);
            //         setSuccessMsg("Login successful!");
            //         setErrorMsg({});
            //         navigate("/");
            //     }
            // }
        } catch (err) {
            console.error(err);
            setErrorMsg({ form: "An unexpected error occurred. Please try again." });
            setSuccessMsg("");
        }
    };

    let handleSetMobLogin = (mobLogin) => {
        setMobLogin(!mobLogin)
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-100'>
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full">
                <h1 className='text-3xl font-bold text-center text-gray-800 mb-6'>Login</h1>
                {successMsg && <p className="text-center text-green-500 font-medium mb-4">{successMsg}</p>}
                {errorMsg.form && <p className="text-center text-red-500 font-medium mb-4">{errorMsg.form}</p>}
                <form>
                    <div className='flex flex-col'>
                        {
                            mobLogin ? 
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="mobileno">Mobile No</label>
                                    <input
                                        className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 ${errorMsg.mobileno ? "border-red-500" : "border-gray-300"}`}
                                        type="text"
                                        id='mobileno'
                                        placeholder='Enter Mobile No'
                                        name='mobileno'
                                        value={data.mobileno}
                                        onChange={handleChange}
                                    />
                                    {errorMsg.mobileno && <p className="text-red-500 text-xs italic">{errorMsg.mobileno}</p>}
                                </div> : 
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="email">Email</label>
                                    <input
                                        className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 ${errorMsg.email ? "border-red-500" : "border-gray-300"}`}
                                        type="email"
                                        id='email'
                                        placeholder='Enter Email'
                                        name='email'
                                        value={data.email}
                                        onChange={handleChange}
                                    />
                                    {errorMsg.email && <p className="text-red-500 text-xs italic">{errorMsg.email}</p>}
                                </div>
                        }

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="password">Password</label>
                            <input
                                className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 ${errorMsg.password ? "border-red-500" : "border-gray-300"}`}
                                type="password"
                                id='password'
                                placeholder='Enter Password'
                                name='password'
                                value={data.password}
                                onChange={handleChange}
                            />
                            {errorMsg.password && <p className="text-red-500 text-xs italic">{errorMsg.password}</p>}
                        </div>
                        <div className='flex justify-between'>
                            <Link className='m-0 w-fit text-green-600 hover:underline hover:text-green-800' onClick={() => handleSetMobLogin(mobLogin)}>{mobLogin ? "Login by Email" : "Login by Mob No"}</Link>
                            <Link className='m-0 w-fit text-green-600 hover:underline hover:text-green-800' to="/ResetPassword">Forget Password</Link>
                        </div>
                        <button
                            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 mt-2"
                            type="submit"
                            onClick={handleSubmit}
                        >
                            Submit
                        </button>
                    </div>
                </form>
                <hr className='my-4' />
                <div>
                    <Link
                        to="/AdminLogin"
                        className="w-full text-blue-800 text-center border-blue-500 border-2 hover:bg-blue-700 hover:text-white py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2 block"
                    >
                        Login As Admin
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
