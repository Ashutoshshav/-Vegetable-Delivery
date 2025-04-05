import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AllItems({ setIsAdmin }) {
    // let token = localStorage.getItem("token");
    const token = sessionStorage.getItem('token');
    let [items, setItems] = useState([]);
    let [price, setPrice] = useState([]);

    // Fetch all items
    let fetchAllItems = async () => {
        try {
            setIsAdmin(true);
            let response = await axios.get("/api/adminaccess/allitems", {
                headers: {
                    Authorization: `${token}`,
                },
            });
            let data = response.data;
            setItems(data.allItems);
            setPrice(data.itemPrice);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchAllItems();
    }, []);

    // Handle toggle button click
    const handleToggle = async (id, currentState) => {
        const newState = currentState === 1 ? 0 : 1; // Toggle between 1 and 0

        try {
            await axios.post(`/api/adminaccess/itemdisable`, {
                SKUID: id,
                disabledItem: newState,
            }, {
                headers: {
                    Authorization: `${token}`,
                },
            });

            // Update the item state after successful update
            setItems(items.map(item =>
                item.SKUID === id ? { ...item, disabledItem: newState } : item
            ));
        } catch (err) {
            console.log('Error updating toggle state:', err);
        }
    };

    // Handle price input change
    const handleInputChange = (e, skuid) => {
        const newValue = e.target.value;

        // Update the price state by finding the corresponding SKUID and changing its Purchase_Amount
        const updatedPrice = price.map((product) =>
            product.SKUID === skuid ? { ...product, Purchase_Amount: newValue } : product
        );

        setPrice(updatedPrice); // Set the updated price state
    };

    // Handle API call to update price when input loses focus or a button is clicked
    const updatePrice = async (skuid, newPrice, SKU_Name) => {
        try {
            await axios.post(`/api/adminaccess/updateprice`, {
                SKUID: skuid,
                Purchase_Amount: newPrice,
                SKU_Name: SKU_Name,
            }, {
                headers: {
                    Authorization: `${token}`,
                },
            });

            console.log(`Updated SKUID ${skuid} with new price: ${newPrice}`);
        } catch (err) {
            console.log('Error updating price:', err);
        }
    };

    return (
        <div>
            <h1 className='sm:w-96 sm:rounded-r-lg w-full text-center font-medium text-white text-xl inline-block py-2 my-2' style={{ backgroundColor: "#045ab1" }}>All Items</h1>
            <div className="overflow-x-auto mt-2">
                <table className="min-w-full border border-gray-200">
                    <thead>
                        <tr className="text-white" style={{ backgroundColor: "#045ab1" }}>
                            <th className="py-2 px-4 border">SKU ID</th>
                            <th className="py-2 px-4 border">Item Name</th>
                            <th className="py-2 px-4 border">Disable</th>
                            <th className="py-2 px-4 border">Price</th>
                            <th className="py-2 px-4 border">Unit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items && items.map((item) => (
                            <tr key={item.SKUID}>
                                <td className="py-2 px-4 border">{item.SKUID}</td>
                                <td className="py-2 px-4 border">{item.SKUName}</td>
                                <td className="py-2 px-4 border text-center">
                                    <button
                                        className={`w-16 h-8 rounded-full p-1 focus:outline-none transition duration-300 ease-in-out ${item.disabledItem ? 'bg-red-500' : 'bg-green-500'}`}
                                        onClick={() => handleToggle(item.SKUID, item.disabledItem)}
                                    >
                                        <div
                                            className={`w-6 h-6 bg-white rounded-full shadow-md transform transition duration-300 ease-in-out ${item.disabledItem ? 'translate-x-8' : 'translate-x-0'}`}
                                        ></div>
                                    </button>
                                </td>
                                <td className="py-2 px-4 border text-center">
                                    {price.map((product) => product.SKUID === item.SKUID && (
                                        <input
                                            type="text"
                                            key={product.SKUID}
                                            className='inline-block text-center rounded-md py-1 px-2 w-20 hover:border-0'
                                            value={product.Purchase_Amount}
                                            onChange={(e) => handleInputChange(e, product.SKUID)} // Handle input change
                                            onBlur={() => updatePrice(product.SKUID, product.Purchase_Amount, product.SKU_Name)} // Update price on input blur (lose focus)
                                        />
                                    ))}
                                </td>
                                <td className="py-2 px-4 border">{item.Unit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AllItems;
