import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

function PlacedOrder({ setIsAdmin }) {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');
    let [data, setData] = useState({
        placedOrders: [],
        skuTotals: [],
    })
    let [date, setDate] = useState(moment().toDate())


    let fetchPlacedOrder = async () => {
        try {
            setIsAdmin(true)
            let response = await axios.post("/api/adminaccess/orderdetail", { selectedDateFromAdmin: moment(date).format('YYYY-MM-DD') }, {
                headers: {
                    Authorization: `${token}`,
                },
            })
            console.log(response.data)
            setData(response.data)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        if (!token) {
            navigate("/AdminLogin")
        } else {
            fetchPlacedOrder()
        }
    }, [date])

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-4">Placed Orders</h1>

            {/* Date Picker */}
            <div className="flex justify-center mb-6">
                <DatePicker
                    selected={date}
                    onChange={(date) => setDate(moment(date).format('YYYY-MM-DD'))}
                    className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 shadow focus:outline-none focus:border-blue-500"
                    placeholderText="Select a date"
                />
            </div>

            {/* Order Cards Grid */}
            {data.placedOrders.length > 0 ? (
                <>
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                        {data.placedOrders.map(order => (
                            <div key={order.OrderID} className="order-card border border-gray-200 rounded-lg p-6 shadow hover:shadow-lg transition-shadow bg-white">
                                <h3 className="text-lg font-semibold text-blue-600 mb-2">Order ID: {order.OrderID}</h3>
                                <p className="text-gray-600">Customer ID: <span className="font-medium">{order.Cust_ID}</span></p>
                                <p className="text-gray-600">Order Date: <span className="font-medium">{moment(order.OrderDtime).format("Do, MMM, YYYY, HH:mm:ss A")}</span></p>
                                <p className="text-gray-600">Delivery Slot: <span className="font-medium">{order.DeliverySlot}</span></p>

                                <p className="mt-3 font-semibold">Items:</p>
                                <ul className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-200 bg-gray-50 p-2">
                                    {order.SKUID.split(', ').map((sku, index) => (
                                        <li key={index} className="flex flex-col md:flex-row justify-between py-2 text-gray-700">
                                            <p><span className="font-medium">ID:</span> <span className="font-bold text-base">{sku}</span></p>
                                            <p><span className="font-medium">Name:</span> <span className="font-bold text-base">{order.SKUName.split(', ')[index]}</span></p>
                                            <p><span className="font-medium">Qty:</span> <span className="font-bold text-base">{order.Quantities.split(', ')[index]}</span></p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* SKU Totals Section */}
                    <div className="order-card border border-gray-200 rounded-lg p-6 shadow hover:shadow-lg transition-shadow bg-gray-100">
                        <h2 className="text-xl font-bold text-center text-blue-600 mb-4">SKU Totals</h2>
                        <div className="grid grid-cols-3 gap-4 font-medium text-center text-gray-700">
                            <div>SKU ID</div>
                            <div>SKU Name</div>
                            <div>Total Quantity</div>
                        </div>
                        <div className="mt-2 divide-y divide-gray-300">
                            {data.skuTotals.map(order => (
                                <div key={order.SKUID} className="grid grid-cols-3 gap-4 py-2 text-center">
                                    <p className="text-gray-800">{order.SKUID}</p>
                                    <p className="text-gray-800">{order.SKUName}</p>
                                    <p className="text-gray-800">{order.TotalQuantity}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <p className="text-center text-gray-500 mt-6">No orders found for this date.</p>
            )}
        </div>
    );
}

export default PlacedOrder;