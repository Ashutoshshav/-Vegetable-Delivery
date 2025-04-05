import React, { useState, useEffect } from "react";
import Logo from "../../assets/Logo.png";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

function Navbar(props) {
    const navigate = useNavigate();
    let openCart = async () => {
        navigate("/Customer");
    }

    const [showIcon, setShowIcon] = useState(true)
    
    useEffect(() => {
        let token = localStorage.getItem("token");
        if (token) {
            setShowIcon(false)
        }
    })

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    let handleLogout = async () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to Logout",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Logout!"
          }).then(async (result) => {
            if (result.isConfirmed) {
              await Swal.fire({
                title: "Logout!",
                text: "You have Successfully Logged Out.",
                icon: "success",
                timer: 2000,
              });
              localStorage.removeItem("token");
              navigate("/"); 
              window.location.reload();
            }
          });
    }
    return (
        <nav className="bg-gray-200 shadow-md w-full border-b border-blue-200">
            <div className="max-w-full mx-auto sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/">
                            <img src={Logo} alt="Rozana Basket Logo" className="h-24" />
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 items-center justify-center">
                        <input className="border rounded-lg px-4 py-2 w-2/3 md:w-1/2 lg:w-1/3 focus:outline-none" type="search" placeholder="Search"/>
                    </div>

                    {/* Login and Cart Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {
                            showIcon ? 
                            <div className="flex gap-3">
                                <Link to="/Login">
                                    <button className="bg-green-500 text-white font-bold px-5 py-3 rounded-lg hover:bg-green-600 active:bg-green-700">Login</button>
                                </Link>
                                <Link to="/Signup">
                                    <button className="bg-blue-500 text-white font-bold px-5 py-3 rounded-lg hover:bg-blue-600 active:bg-blue-700">
                                        Signup
                                    </button>
                                </Link>
                            </div> : 
                            <div className="flex gap-3">
                                <Link to="/Invoice">
                                    <button className="bg-green-500 text-white font-bold px-5 py-3 rounded-lg hover:bg-green-600 active:bg-green-700">
                                        Invoice
                                    </button>
                                </Link>
                                <button className="text-white font-bold block px-5 py-3 rounded-lg text-base bg-red-500 hover:bg-red-700" onClick={handleLogout}>Logout</button>
                            </div>
                        }
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-200 focus:outline-none"
                            onClick={toggleMobileMenu}>
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <input className="w-full border rounded-lg px-4 py-2 md:w-1/2 lg:w-1/3 focus:outline-none"
                            type="search" placeholder="Search" />
                        {
                            showIcon ? 
                                <div>
                                    <Link to="/Login"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-200">
                                        Login
                                    </Link>
                                    <Link to="/Signup"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-500 hover:bg-blue-700">
                                        Signup
                                    </Link>
                                </div> : 
                                <div>
                                    <Link to="/Invoice"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-200">
                                        Invoice
                                    </Link>
                                    <button className="w-full text-left text-white block px-3 py-2 rounded-md text-base font-medium bg-red-500 hover:bg-red-700" onClick={handleLogout}>Logout</button>
                                </div>
                        }
                    </div>
                </div>
            )}
        </nav>
        // <div className="bg-gray-200 flex items-center justify-between h-20 border-b border-blue-200">
        //     <Link to='/'>
        //         <img className="h-28 mx-4" src={Logo} alt="Logo" />
        //         {/* <h1 className="text-xl flex flex-col px-2 py-4">
        //             <span className="text-center">Rozana</span>
        //             <span className="text-center">Basket</span>
        //         </h1> */}
        //     </Link>
        //     <div className="bg-white px-4 text-xl rounded-xl flex justify-center items-center">
        //         <input
        //             className="p-3"
        //             type="text"
        //             placeholder="Search"
        //             style={{
        //                 outline: "none"
        //             }}
        //         />
        //         <i className="fa-solid fa-magnifying-glass"></i>
        //     </div>
        //     <div className="flex justify-center items-center text-2xl">
        //         <Link to='/Login'>
        //             <button className="p-3 bg-green-500 text-white rounded-xl mx-4">Login</button>
        //         </Link>
        //         <Link to='/Signup'>
        //             <button className="p-3 bg-blue-400 text-white rounded-xl mx-4" onClick={openCart}>
        //                 Cart<i className="fa-solid fa-cart-shopping"></i>
        //             </button>
        //         </Link>
        //     </div>
        // </div>
    );
}

export default Navbar;
