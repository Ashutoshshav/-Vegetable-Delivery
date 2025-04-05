import React, { useEffect, useState } from "react";
import axios from 'axios';

function Customer({ schedule }) {
    let token = localStorage.getItem("token");
    const [data, setData] = useState(null)
    const Cust_ID = 1

    let fetchCartQty = async () => {
        try {
            let response = await axios.get("/api/cart/productQty", {
                headers: {
                  Authorization: `${token}`,
                },
              })
            
            // console.log(response.data.data)
            let Datas = response.data.data;
            
            // for (let Data of Datas) {
                //     setCount(Data.SKUID, Data.Qty)
                // }
                
                setData(Datas)
                // console.log(Datas)
            } catch (e) {
                console.log(e)
            }
        }
        useEffect(() => {
            fetchCartQty()
        }, [])
        
        let handleSubmitOrder = async () => {
            try {
                console.log(data)
                console.log(schedule)
                let response = await axios.post("/api/order/submitOrder", {data, schedule }, {
                    headers: {
                      Authorization: `${token}`,
                    },
                })
            } catch(err) {
                console.log(err)
            }
        }
    return (
        <div className="">
            <h1 className="text-3xl text-center font-medium my-3">Customer's Order Form</h1>

            <div className="mt-7">
                <h2 className="sm:w-96 w-full text-center font-medium text-white text-xl inline-block py-1" style={{ backgroundColor: "#045ab1" }}>
                    Item Cart and Qty Selection
                </h2>
                <div className="overflow-x-auto mt-2">
                    <table className="min-w-full border border-gray-200">
                        <thead>
                            <tr className="text-white" style={{ backgroundColor: "#045ab1" }}>
                                <th className="py-2 px-4 border">SNo.</th>
                                <th className="py-2 px-4 border">Item Name</th>
                                <th className="py-2 px-4 border">Qty</th>
                                <th className="py-2 px-4 border">Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data &&
                                data.map((item, count = 1) => {
                                    return (
                                        <tr key={item.SKUID}>
                                            <td className="py-2 px-4 border">{count += 1}</td>
                                            <td className="py-2 px-4 border">{item.SKUName}</td>
                                            <td className="py-2 px-4 border">{item.Qty}</td>
                                            <td className="py-2 px-4 border">Kg.</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
                {/* <div className="w-full text-base grid items-center justify-center grid-cols-[repeat(auto-fill,_minmax(290px,_1fr))]">
                    <div className="flex border-2 rounded-lg m-3 items-center h-32" style={{ border: "#045ab1 1px solid" }}>
                        <div className="w-1/3 m-1">
                            <img
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdLYLrpcL-2TKZDY0eljDthboDPMytCCRgVg&s"
                                alt=""
                            />
                        </div>
                        <div className="w-2/3 text-center">
                            <p className="font-semibold text-xl">Item Name</p>
                            <p className="text-lg">Qty ---- kg</p>
                        </div>
                    </div>
                    <div className="flex border-2 rounded-lg m-3 items-center h-32" style={{ border: "#045ab1 1px solid" }}>
                        <div className="w-1/3 m-1">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdLYLrpcL-2TKZDY0eljDthboDPMytCCRgVg&s" alt="" />
                        </div>
                        <div className="w-2/3 text-center">
                            <p className="font-semibold text-xl">Item Name</p>
                            <p className="text-lg">Qty ---- kg</p>
                        </div>
                    </div>
                    <div className="flex border-2 rounded-lg m-3 items-center h-32" style={{ border: "#045ab1 1px solid" }}>
                        <div className="w-1/3 m-1">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdLYLrpcL-2TKZDY0eljDthboDPMytCCRgVg&s" alt="" />
                        </div>
                        <div className="w-2/3 text-center">
                            <p className="font-semibold text-xl">Item Name</p>
                            <p className="text-lg">Qty ---- kg</p>
                        </div>
                    </div>
                    <div className="flex border-2 rounded-lg m-3 items-center h-32" style={{ border: "#045ab1 1px solid" }}>
                        <div className="w-1/3 m-1">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdLYLrpcL-2TKZDY0eljDthboDPMytCCRgVg&s" alt="" />
                        </div>
                        <div className="w-2/3 text-center">
                            <p className="font-semibold text-xl">Item Name</p>
                            <p className="text-lg">Qty ---- kg</p>
                        </div>
                    </div>
                    <div className="flex border-2 rounded-lg m-3 items-center h-32" style={{ border: "#045ab1 1px solid" }}>
                        <div className="w-1/3 m-1">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdLYLrpcL-2TKZDY0eljDthboDPMytCCRgVg&s" alt="" />
                        </div>
                        <div className="w-2/3 text-center">
                            <p className="font-semibold text-xl">Item Name</p>
                            <p className="text-lg">Qty ---- kg</p>
                        </div>
                    </div>
                    <div className="flex border-2 rounded-lg m-3 items-center h-32" style={{ border: "#045ab1 1px solid" }}>
                        <div className="w-1/3 m-1">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdLYLrpcL-2TKZDY0eljDthboDPMytCCRgVg&s" alt="" />
                        </div>
                        <div className="w-2/3 text-center">
                            <p className="font-semibold text-xl">Item Name</p>
                            <p className="text-lg">Qty ---- kg</p>
                        </div>
                    </div>
                    <div className="flex border-2 rounded-lg m-3 items-center h-32" style={{ border: "#045ab1 1px solid" }}>
                        <div className="w-1/3 m-1">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdLYLrpcL-2TKZDY0eljDthboDPMytCCRgVg&s" alt="" />
                        </div>
                        <div className="w-2/3 text-center">
                            <p className="font-semibold text-xl">Item Name</p>
                            <p className="text-lg">Qty ---- kg</p>
                        </div>
                    </div>
                </div> */}
                <div className="sm:flex text-base justify-center">
                    <button className="sm:w-auto w-full py-2 px-20 font-semibold text-lg rounded-3xl text-white m-3" style={{ backgroundColor: "#045ab1" }}>Edit</button>
                    <button className="sm:w-auto w-full py-2 px-20 font-semibold text-lg rounded-3xl text-white m-3" style={{ backgroundColor: "#045ab1" }} onClick={handleSubmitOrder}>Save</button>
                </div>
            </div>
        </div>
    );
}

export default Customer;
