import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";

function SellerKPI({ setIsAdmin }) {
    const navigate = useNavigate();
    // let token = localStorage.getItem("token");
    const token = sessionStorage.getItem('token');
    
    const [sellerKPI, setSellerKPI] = useState({
        financialPerformance:{},
        customerPerformance:{},
        vendorPerformance:{},
        monthStatics:{},
        avgMonthStatics:{},
    })

    if(!token) {
        navigate("/AdminLogin")
    }

    let fetchSellerKPI = async () => {
        try {
            setIsAdmin(true)
            let response = await axios.get("/api/seller/SellerKPI", {
                headers: {
                    Authorization: `${token}`,
                },
            })
            console.log(response.data)
            setSellerKPI(response.data)
        } catch(err) {
            console.log(err)
        }
    }

    useEffect(() => {
        fetchSellerKPI()
    }, [])
    return (
        <div>
            <h1 className="text-3xl text-center font-medium my-3">Seller's KPI's</h1>

            <div>
                <h2 className="sm:w-96 sm:rounded-r-lg w-full text-center font-medium text-white text-xl inline-block py-2" style={{ backgroundColor: "#045ab1" }}>
                    Financial Performance
                </h2>

                <div className="text-base grid grid-cols-[repeat(auto-fill,_minmax(290px,_1fr))]">
                    <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                        <p className="font-normal text-lg">Outstanding-Coustomers</p>
                        <p className="font-semibold text-blue-500 text-2xl text-right">
                            {sellerKPI.financialPerformance.outstandingCustomers}
                        </p>
                    </div>
                    <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                        <p className="font-normal text-lg">Outstanding-Vendors</p>
                        <p className="font-semibold text-blue-500 text-2xl text-right">
                        {sellerKPI.financialPerformance.outstandingVendors}
                        </p>
                    </div>
                    <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                        <p className="font-normal text-lg">Outstanding-Transport</p>
                        <p className="font-semibold text-blue-500 text-2xl text-right">
                            {sellerKPI.financialPerformance.outstandingTransport}
                        </p>
                    </div>
                    <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                        <p className="font-normal text-lg">Surplus-Revenue</p>
                        <p className="font-semibold text-blue-500 text-2xl text-right">
                            {((sellerKPI.financialPerformance.outstandingVendors + sellerKPI.financialPerformance.outstandingTransport) - sellerKPI.financialPerformance.outstandingCustomers) || 0}
                        </p>
                    </div>
                </div>
            </div>
            <div>
                <h2 className="sm:w-96 sm:rounded-r-lg w-full text-center font-medium text-white text-xl inline-block py-2" style={{ backgroundColor: "#045ab1" }}>
                    Customer's Performance
                </h2>

                <div className="text-base grid grid-cols-[repeat(auto-fill,_minmax(290px,_1fr))]">
                    <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                        <p className="font-normal text-lg">Total Coustomers</p>
                        <p className="font-semibold text-blue-500 text-2xl text-right">
                            {sellerKPI.customerPerformance.totalCust}
                        </p>
                    </div>
                    <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                        <p className="font-normal text-lg">Active Coustomers</p>
                        <p className="font-semibold text-blue-500 text-2xl text-right">
                            {sellerKPI.customerPerformance.totalActiveCust}
                        </p>
                    </div>
                    <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                        <p className="font-normal text-lg">inactive Coustomers</p>
                        <p className="font-semibold text-blue-500 text-2xl text-right">
                            {sellerKPI.customerPerformance.totalInactiveCust}
                        </p>
                    </div>
                    <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                        <p className="font-normal text-lg">Active Good Coustomers</p>
                        <p className="font-semibold text-blue-500 text-2xl text-right">
                            {sellerKPI.customerPerformance.totalGoodActiveCust}
                        </p>
                    </div>
                </div>
            </div>
            <div>
                <h2 className="sm:w-96 sm:rounded-r-lg w-full text-center font-medium text-white text-xl inline-block py-2" style={{ backgroundColor: "#045ab1" }}>
                    Vendor's Performance
                </h2>

                <div className="text-base grid grid-cols-[repeat(auto-fill,_minmax(290px,_1fr))]">
                    <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                        <p className="font-normal text-lg">Total Vendors</p>
                        <p className="font-semibold text-blue-500 text-2xl text-right">
                            {sellerKPI.vendorPerformance.totalVendor}
                        </p>
                    </div>
                    <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                        <p className="font-normal text-lg">Active Vendors</p>
                        <p className="font-semibold text-blue-500 text-2xl text-right">
                            {sellerKPI.vendorPerformance.totalActiveVendor}
                        </p>
                    </div>
                    <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                        <p className="font-normal text-lg">inactive Vendors</p>
                        <p className="font-semibold text-blue-500 text-2xl text-right">
                            {sellerKPI.vendorPerformance.totalInactiveVendor}
                        </p>
                    </div>
                    <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                        <p className="font-normal text-lg">Active Good Vendors</p>
                        <p className="font-semibold text-blue-500 text-2xl text-right">
                            {sellerKPI.vendorPerformance.totalGoodActiveVendor}
                        </p>
                    </div>
                </div>
            </div>
            <div>
                <h2 className="sm:w-96 sm:rounded-r-lg w-full text-center font-medium text-white text-xl inline-block py-2" style={{ backgroundColor: "#045ab1" }}>
                    Current Month Statics
                </h2>

                <div className="text-base">
                    <div className='grid grid-cols-[repeat(auto-fill,_minmax(290px,_1fr))]'>
                        <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                            <p className="font-normal text-lg">Total Sale</p>
                            <p className="font-semibold text-blue-500 text-2xl text-right">
                                {(sellerKPI.monthStatics.totalSale || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                            <p className="font-normal text-lg">Total Purchase</p>
                            <p className="font-semibold text-blue-500 text-2xl text-right">
                                {(sellerKPI.monthStatics.totalPurchase || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                            <p className="font-normal text-lg">Total Tranport Cost</p>
                            <p className="font-semibold text-blue-500 text-2xl text-right">
                            {(sellerKPI.monthStatics.totalTransportCost || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                            <p className="font-normal text-lg">Total Profit</p>
                            <p className="font-semibold text-blue-500 text-2xl text-right">
                            { ((sellerKPI.monthStatics.totalSale - (sellerKPI.monthStatics.totalPurchase + sellerKPI.monthStatics.totalTransportCost)) || 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <div className='grid grid-cols-[repeat(auto-fill,_minmax(290px,_1fr))]'>
                        <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                            <p className="font-normal text-lg">Avg. Daily Sale</p>
                            <p className="font-semibold text-blue-500 text-2xl text-right">
                            {(sellerKPI.avgMonthStatics.avgTotalSale || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                            <p className="font-normal text-lg">Avg. Daily Purchase</p>
                            <p className="font-semibold text-blue-500 text-2xl text-right">
                            {(sellerKPI.avgMonthStatics.avgTotalPurchase || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                            <p className="font-normal text-lg">Avg. Daily Trasport Cost</p>
                            <p className="font-semibold text-blue-500 text-2xl text-right">
                            {(sellerKPI.avgMonthStatics.avgTotalTransportCost || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                            <p className="font-normal text-lg">Avg. Daily Profit</p>
                            <p className="font-semibold text-blue-500 text-2xl text-right">
                            { ((sellerKPI.avgMonthStatics.avgTotalSale - (sellerKPI.avgMonthStatics.avgTotalPurchase + sellerKPI.avgMonthStatics.avgTotalTransportCost)) || 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SellerKPI;