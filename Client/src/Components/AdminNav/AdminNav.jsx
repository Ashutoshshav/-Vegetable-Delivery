import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import Logo from "../../assets/Logo.png";
import Swal from "sweetalert2";
import AddNewItem from "../AddNewItem/AddNewItem";

function AdminNav(props) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    
    const toggleNavbar = () => setIsOpen(!isOpen);
    const closeNavbar = () => setIsOpen(false);
    
    const openPopup = () => {
        setIsPopupOpen(true);
        closeNavbar(); // Close navbar when opening the popup
    };
    const closePopup = () => setIsPopupOpen(false);

    const handleItemAdded = () => {
        console.log("Item added");
    };

    let handleLogout = async () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to Logout",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Logout!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                await Swal.fire({
                    title: "Logged Out!",
                    text: "You have Successfully Logged Out.",
                    icon: "success",
                    timer: 2000,
                });
                sessionStorage.removeItem('token');
                navigate("/AdminLogin");
                window.location.reload();
            }
        });
    };

    return (
        <div className="mb-16">
            {/* Top Navigation Bar */}
            <div className="fixed top-0 z-20 flex items-center justify-between bg-gray-200 p-4 h-16 w-full">
                <div className="flex items-center">
                    <Link to="/SellerKPI" onClick={closeNavbar}>
                        <img src={Logo} alt="Rozana Basket Logo" className="h-24" />
                    </Link>
                </div>
                {/* Toggle Button */}
                <button onClick={toggleNavbar}
                    className="text-blue-500 text-xl py-2 px-4 rounded-full">
                    <i className={`fas ${isOpen ? "fa-times" : "fa-bars"}`}></i>
                </button>
            </div>

            {/* Side Navbar */}
            <nav
                className={`z-10 fixed top-0 right-0 w-64 rounded-b-md mt-16 bg-white text-white transform transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"
            }`}>
                <ul className="flex flex-col p-4 space-y-3">
                    <li>
                        <Link to="/SellerKPI" onClick={closeNavbar}>
                            <button className="w-full flex items-center text-left text-blue-500 px-4 py-3 rounded-lg hover:bg-gray-200 active:bg-gray-300">
                                <i className="fas fa-home mr-2"></i> <span>Home</span>
                            </button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/PlacedOrder" onClick={closeNavbar}>
                            <button className="w-full flex items-center text-left text-blue-500 px-4 py-3 rounded-lg hover:bg-gray-200 active:bg-gray-300">
                            <i className="fa-solid fa-cart-flatbed mr-2"></i> <span>Orders</span>
                            </button>
                        </Link>
                    </li>
                    <li>
                        <button
                            className="w-full text-left text-blue-500 px-4 py-3 rounded-lg hover:bg-gray-200 active:bg-gray-300 flex items-center"
                            onClick={openPopup}
                        >
                            <i className="fas fa-plus mr-2"></i> Add Item
                        </button>
                    </li>
                    <li>
                        <Link to="/AllItems" onClick={closeNavbar}>
                            <button className="w-full text-left text-blue-500 px-4 py-3 rounded-lg hover:bg-gray-200 active:bg-gray-300 flex items-center">
                                <i className="fas fa-list mr-2"></i> All Items
                            </button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/AddAdmin" onClick={closeNavbar}>
                            <button className="w-full text-left text-blue-500 px-4 py-3 rounded-lg hover:bg-gray-200 active:bg-gray-300 flex items-center">
                                <i className="fas fa-user-plus mr-2"></i> Add New Admin
                            </button>
                        </Link>
                    </li>
                    <li>
                        <button
                            className="w-full text-left text-red-500 px-4 py-3 rounded-lg hover:bg-gray-200 active:bg-gray-300 flex items-center"
                            onClick={handleLogout}
                        >
                            <i className="fas fa-sign-out-alt mr-2"></i> Logout
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Popup for Adding New Item */}
            {isPopupOpen && (
                <AddNewItem closeModal={closePopup} onItemAdded={handleItemAdded} />
            )}
        </div>
    );
}

export default AdminNav;
