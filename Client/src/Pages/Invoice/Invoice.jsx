import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

function Invoice(props) {
    const navigate = useNavigate();
    let token = localStorage.getItem("token");

    const [deliveryDetails, setDeliveryDetails] = useState({
        OrderDate: '',
        startTime: '',
        endTime: '',
        custInvoicedOrder: [],
        Total_Amount: 0,
        error: "",
    })
    const [errorMsg, setErrorMsg] = useState("");
    let [tableShow, setTableShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);

    let fetchDeliveryDetails = async () => {
        try {
            let response = await axios.get("/api/invoice/generated", {
                headers: {
                    Authorization: `${token}`,
                },
            })
            if (response.data.error == "No orders found for the specified date.") {
                setErrorMsg("Invoice will generate soon")
                Swal.fire({
                    title: 'You have not Placed any Order Yesterday',
                    customClass: {
                        popup: 'p-6 bg-white rounded-lg shadow-xl',   // Popup styling
                        title: 'text-xl font-semibold text-gray-700', // Title styling
                    }
                });
            } else if (response.data.OrderDate) {
                setTableShow(true)
                console.log(response.data)
                // console.log(response.data.custInvoicedOrder)
                setDeliveryDetails(response.data)
            } else {
                Swal.fire({
                    title: 'Invoice will be generated soon',
                    customClass: {
                        popup: 'p-6 bg-white rounded-lg shadow-xl',   // Popup styling
                        title: 'text-xl font-semibold text-gray-700', // Title styling
                    }
                });
            }
        } catch (err) {
            console.log(err)
        }
    }

    const downloadInvoice = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/invoice/generateInvoice', {
                responseType: 'blob', // Important to get the PDF as a binary file (blob)
                headers: {
                    Authorization: `${token}`,
                },
            },);

            const fileURL = window.URL.createObjectURL(new Blob([response.data]));
            const fileLink = document.createElement('a');
            fileLink.href = fileURL;
            fileLink.setAttribute('download', 'invoice.pdf'); // File name
            document.body.appendChild(fileLink);
            fileLink.click(); // Trigger the download
        } catch (err) {
            console.error('Error downloading the PDF:', err);
        } finally {
            setLoading(false);
        }
    }

    let mailInvoice = async () => {
        setLoading2(true)
        try {
            let response = await axios.get("/api/invoice/sendinvoice", {
                headers: {
                    Authorization: `${token}`,
                },
            })

            if (response.status === 200) {
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Invoice Sended Successfully",
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
            console.log(err)
        } finally {
            setLoading2(false); // Reset loading state to false after the operation
        }
    }

    useEffect(() => {
        if (!token) {
            navigate("/Login")
        } else {
            fetchDeliveryDetails()
        }
    }, [token])

    return (
        <div>
            <div>
                <h1 className="text-3xl text-center font-medium my-3">Invoicing - Form</h1>
                <h2 className="sm:w-96 sm:rounded-r-lg w-full text-center font-medium text-white text-xl inline-block py-2" style={{ backgroundColor: "#045ab1" }}>
                    Delivery Order Schedule
                </h2>

                <div className="text-base flex flex-wrap">
                    <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                        <p className="font-semibold text-xl">Order Date</p>
                        <p className="font-semibold text-blue-500 text-xl pl-10">
                            {deliveryDetails.OrderDate || "NA"}
                        </p>
                    </div>
                    <div className="inline-block flex-col border-2 rounded-lg my-3 mx-2 px-3">
                        <p className="font-semibold text-xl">Delivery Schedule</p>
                        <p className="font-semibold text-blue-500 text-xl pl-10">
                            Between {deliveryDetails.startTime || "NA"} To {deliveryDetails.endTime || "NA"}
                        </p>
                    </div>
                </div>
            </div>

            {
                tableShow ?
                    <div>
                        <div className="mt-7">
                            <h2 className="sm:w-96 sm:rounded-r-lg w-full text-center font-medium text-white text-xl inline-block py-2" style={{ backgroundColor: "#045ab1" }}>
                                Item Cart and Qty Rate Entry
                            </h2>

                            <div className="overflow-x-auto mt-2">
                                <table className="min-w-full border border-gray-200">
                                    <thead>
                                        <tr className="text-white" style={{ backgroundColor: "#045ab1" }}>
                                            <th className="py-2 px-4 border">SNo.</th>
                                            <th className="py-2 px-4 border">Item Name</th>
                                            <th className="py-2 px-4 border">Qty</th>
                                            {/* <th className="py-2 px-4 border">Unit</th> */}
                                            <th className="py-2 px-4 border">Rate</th>
                                            <th className="py-2 px-4 border">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deliveryDetails.custInvoicedOrder && deliveryDetails.custInvoicedOrder.map((item, index) => (
                                            <tr key={item.SKUID}>
                                                <td className="py-2 px-4 border">{index + 1}</td>
                                                <td className="py-2 px-4 border">{item.SKUName}</td>
                                                <td className="py-2 px-4 border">{item.Qty}</td>
                                                <td className="py-2 px-4 border">{Math.ceil(item.Rate)}</td>
                                                <td className="py-2 px-4 border">{Math.ceil(item.Amount)}</td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td className="py-2 px-4 text-center font-semibold text-xl" colSpan={5}><span className="font-bold">Total Amount  :  </span>{Math.ceil(deliveryDetails.Total_Amount)}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 px-4 text-center text-xl font-normal" colSpan={5}><span>Transport  :  </span>{300}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 px-4 text-center font-semibold text-2xl" colSpan={5}><span>Net Payable Amount  :  </span>{deliveryDetails.Total_Amount + 300}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="sm:flex text-base gap-3 justify-center">
                            <button
                                className={`sm:w-auto w-full py-2 px-20 font-semibold text-lg rounded-3xl text-white my-3 transition-all duration-300 ${loading2 ? 'bg-blue-600' : 'bg-[#045ab1]'
                                    }`}
                                onClick={mailInvoice}
                                disabled={loading2} // Disable button while loading
                            >
                                {loading2 ? (
                                    <>
                                        <svg
                                            className="w-5 h-5 animate-spin inline-block mr-2"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <circle cx="12" cy="12" r="10" strokeWidth="4" />
                                        </svg>
                                        Mailing...
                                    </>
                                ) : (
                                    'Mail Invoice'
                                )}
                            </button>
                            <button
                                className={`sm:w-auto w-full py-2 px-20 font-semibold text-lg rounded-3xl text-white my-3 transition-all duration-300 ${loading ? 'bg-blue-600' : 'bg-[#045ab1]'
                                    }`}
                                onClick={downloadInvoice}
                                disabled={loading} // Disable button while loading
                            >
                                {loading ? (
                                    <>
                                        <svg
                                            className="w-5 h-5 animate-spin inline-block mr-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <circle cx="12" cy="12" r="10" strokeWidth="4" />
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    'Send Invoice'
                                )}
                            </button>
                        </div>
                    </div> :
                    <></>
            }
        </div>
    );
}

export default Invoice;
