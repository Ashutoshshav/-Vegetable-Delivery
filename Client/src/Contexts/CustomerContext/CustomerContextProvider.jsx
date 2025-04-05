import React, { useState } from "react";
import CustomerContext from "./CustomerContext";

const CustomerContextProvider = ({children}) => {
    const [Customer, setCustomer] = useState(null)
    return (
        <CustomerContext.Provider value={{Customer, setCustomer}}>
            {children}
        </CustomerContext.Provider>
    )
}

export default CustomerContextProvider
