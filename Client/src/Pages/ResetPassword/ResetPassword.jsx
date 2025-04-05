import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { z } from 'zod';

// Zod schema for validation
const schema = z.object({
    email: z.string().email("Enter a valid Email"),
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[\W_]/, "Password must contain at least one special character"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

function ResetPassword(props) {
    const navigate = useNavigate();
    const [data, setData] = useState({
        email: "",
        OTP: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [msg, setMsg] = useState("");
    const [showInput, setShowInput] = useState(0)
    const [errorMsg, setErrorMsg] = useState({});

    let setInput = (e) => {
        const { name, value } = e.target;
        setData({
            ...data,
            [name]: value,
        });
    
        try {
            schema.parse({ ...data, [name]: value });
            setErrorMsg({});
        } catch (err) {
            const fieldErrors = {};
            err.errors.forEach((error) => {
                fieldErrors[error.path[0]] = error.message;
            });
            setErrorMsg(fieldErrors);
        }
    };    

    let sendOTP = async () => {
        try {
            const response = await axios
                .post("/api/user/forgetpassword", data)

                if(response.data.message) {
                    setMsg(response.data.message);
                    setShowInput(1)
                }
        } catch (err) {
            console.log(err)
        }
    };

    let verifyOTP = async () => {
        try {
            const response = await axios
                .post("/api/user/checkOTP", data)

            if(response.data.message) {
                setMsg("OTP Verified");
                setShowInput(2)
            }
        } catch (err) {
            console.log(err)
        }
    };

    let resetPassword = async () => {
        if (data.newPassword !== data.confirmPassword) {
            setMsg("Passwords do not match");
            return;
        }
        try {
            const response = await axios
                .post("/api/user/resetpassowrd", data)

            if(response.data.message) {
                setMsg("Password reset Successfully");
                navigate("/login");
            }
        } catch (err) {
            console.log(err)
        }
    };
    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-100'>
            <div className='bg-white shadow-lg rounded-lg p-8 max-w-sm w-full'>
                <h2 className='text-2xl font-bold text-center text-gray-800 mb-6'>
                    Reset Password
                </h2>

                <p className='text-center text-green-500 font-medium mb-4'>{msg}</p>
                {/* {errorMsg && <p className="text-center text-red-500 font-medium mb-4">{errorMsg}</p>} */}
                <div className='flex flex-col'>
                    {
                        showInput == 0 ?  
                            <div>
                                <div className='mb-4'>
                                    <label
                                        className='block text-gray-700 text-sm font-medium mb-1'
                                        htmlFor='email'>
                                        Email
                                    </label>
                                    <input
                                        className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 ${errorMsg.email ? "border-red-500" : "border-gray-300"}`}
                                        type='email'
                                        id='email'
                                        placeholder='Enter Email'
                                        name='email'
                                        value={data.email}
                                        onChange={setInput}
                                    />
                                    {errorMsg.email && <p className="text-red-500 text-xs italic">{errorMsg.email}</p>}
                                </div>

                                <button
                                    className='w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 mt-2'
                                    type='button'
                                    onClick={sendOTP}>
                                    Send OTP
                                </button>
                            </div> : ""
                    }
                    {
                        showInput == 1 ? 
                                <div className='mb-1'>
                                    <label
                                        className='block text-gray-700 text-sm font-bold mb-2'
                                        htmlFor='OTP'>
                                        Enter OTP
                                    </label>
                                    <input
                                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                                        id='OTP'
                                        type='OTP'
                                        placeholder='Enter OTP'
                                        onChange={setInput}
                                        name='OTP'
                                        value={data.OTP}
                                    />
                                    <button
                                        className='w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 mt-2'
                                        type='submit'
                                        onClick={verifyOTP}>
                                        Verify OTP
                                    </button>
                                </div> : ""
                    }
                    {
                        showInput == 2 ? 
                            <div>
                                <div className='mb-4'>
                                    <label
                                        className='block text-gray-700 text-sm font-medium mb-1'
                                        htmlFor='newPassword'>
                                        New Password
                                    </label>
                                    <input
                                        className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 ${errorMsg.password ? "border-red-500" : "border-gray-300"}`}
                                        id='newPassword'
                                        type='password'
                                        placeholder='Enter New Password'
                                        onChange={setInput}
                                        name='newPassword'
                                        value={data.newPassword}
                                    />
                                    {errorMsg.newPassword && <p className="text-red-500 text-xs italic">{errorMsg.newPassword}</p>}
                                </div>
                                <div className='mb-4'>
                                    <label
                                        className='block text-gray-700 text-sm font-medium mb-1'
                                        htmlFor='confirmPassword'>
                                        Confirm Password
                                    </label>
                                    <input
                                        className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 ${errorMsg.password ? "border-red-500" : "border-gray-300"}`}
                                        id='confirmPassword'
                                        type='password'
                                        placeholder='Enter Confirm Password'
                                        onChange={setInput}
                                        name='confirmPassword'
                                        value={data.confirmPassword}
                                    />
                                    {errorMsg.confirmPassword && <p className="text-red-500 text-xs italic">{errorMsg.confirmPassword}</p>}
                                </div>
                                <button
                                    className='w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 mt-2'
                                    type='submit'
                                    onClick={resetPassword}>
                                    Reset Password
                                </button>
                            </div> : ""
                    }
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;