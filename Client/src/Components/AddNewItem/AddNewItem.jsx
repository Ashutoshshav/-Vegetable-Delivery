import React, { useState } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import { Link, useNavigate } from "react-router-dom";

function AddNewItem({ closeModal, onItemAdded }) {
    const navigate = useNavigate();
    const [SKUName, setSKUName] = useState("");
    const [Picture, setPicture] = useState("");
    const [Price, setPrice] = useState("");
    // let token = localStorage.getItem("token");
    const token = sessionStorage.getItem('token');
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response = await axios.post("/api/adminaccess/addnewitem", {
                SKUName,
                Picture,
                Price,
            }, {
                headers: {
                    Authorization: `${token}`,
                },
            });
            if(response.status === 200) {
                onItemAdded(); 
                closeModal(); 
                navigate("/AllItems")
                window.location.reload();
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Item Added Successfully",
                    showConfirmButton: false,
                    timer: 2000,
                    customClass: {
                        popup: 'p-6 bg-gray-100 rounded-lg shadow-xl',     // Popup styling
                        title: 'text-xl font-semibold text-gray-700',      // Title styling
                        htmlContainer: 'text-sm text-gray-600',            // Text inside the popup
                        confirmButton: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700' // Confirm button styling
                    }
                });
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">Add New Item</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">SKU Name:</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-md"
                            value={SKUName}
                            onChange={(e) => setSKUName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Picture URL:</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-md"
                            value={Picture}
                            onChange={(e) => setPicture(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Price:</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-md"
                            value={Price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-between space-x-4">
                        <button
                            type="submit"
                            className="bg-blue-500 w-1/2 text-white px-4 py-2 rounded-md hover:bg-blue-500"
                        >
                            Add Item
                        </button>
                        <button
                            type="button"
                            className="bg-red-500 w-1/2 text-white px-4 py-2 rounded-md hover:bg-red-500"
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddNewItem;