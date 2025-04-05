import React, { useEffect, useState } from 'react';
import axios from 'axios';

function OrderSchedule({ onChangeSchedule }) {
    let token = localStorage.getItem("token");
    const [deliveryDate, setDeliveryDate] = useState("DD-MON-YYYY")
    const [clickedScheduleId, setClickedScheduleId] = useState(null);

    let fetchDeliveryDate = async () => {
        try {
            let response = await axios.get("/api/order/deliverySchedules", {
                headers: {
                    Authorization: `${token}`,
                },
            })
            // console.log(response.data.deliveryTimes)
            setDeliveryDate(response.data)
        } catch (err) {
            console.log(err)
        }
    }

    let setSchedule = async (id) => {
        await onChangeSchedule(id)
    }

    useEffect(() => {
        fetchDeliveryDate()
    }, [])
    return (
        <div className="mt-5">
            <h2 className="sm:w-96 sm:rounded-r-lg w-full text-center font-medium text-white text-xl py-2" style={{ backgroundColor: "#045ab1" }}>
                Schedule Your Order
            </h2>
            <br />
            <div className="w-60 inline-block flex-col border-2 rounded-lg shadow-md my-3 mx-2 px-4 py-1 bg-white">
                <p className="font-semibold text-gray-700 text-xl text-center">Delivery Date</p>
                <p className="font-semibold text-blue-600 text-lg text-center">
                    {deliveryDate.deliveryDate}
                </p>
            </div>

            <div className="text-base grid justify-around grid-cols-[repeat(auto-fill,_minmax(320px,_1fr))]">
                {deliveryDate.deliveryTimes &&
                    deliveryDate.deliveryTimes.map((item) => (
                        <div
                            className={`flex-col border-2 rounded-lg shadow-md my-3 mx-2 px-4 py-1 cursor-pointer 
                        ${clickedScheduleId === item.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
                            key={item.id}
                            onClick={() => { setClickedScheduleId(item.id); setSchedule(item.id) }}
                        >
                            <p className="font-semibold text-gray-700 text-xl text-center">Delivery Schedule</p>
                            <p className="font-semibold text-blue-600 text-lg text-center">
                                Between {item.startTime} to {item.endTime}
                            </p>
                        </div>
                    ))
                }
            </div>
        </div>

    );
}

export default OrderSchedule;