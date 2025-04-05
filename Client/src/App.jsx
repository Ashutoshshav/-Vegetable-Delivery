import React, { useState, useContext } from 'react';
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Customer from './Pages/Customer/Customer';
import Invoice from './Pages/Invoice/Invoice';
import SellerKPI from './Pages/SellerKPI/SellerKPI';
import Login from './Pages/Login/Login';
import Navbar from './Components/Navbar/Navbar';
import Home from './Pages/Home/Home';
import ButtomNav from './Components/ButtomNav/ButtomNav';
import ImageSlider from './Components/ImageSlider/ImageSlider';
import CustomerContextProvider from './Contexts/CustomerContext/CustomerContextProvider';
import Signup from './Pages/Signup/Signup';
import AdminLogin from './Pages/AdminLogin.jsx/AdminLogin';
import AdminNav from './Components/AdminNav/AdminNav';
import AllItems from './Pages/AllItems/AllItems';
import AddNewAdmin from './Pages/AddNewAdmin/AddNewAdmin';
import ResetPassword from './Pages/ResetPassword/ResetPassword';
import PlacedOrder from './Pages/PlacedOrder/PlacedOrder';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <CustomerContextProvider>
      <BrowserRouter>
        {isAdmin ? <AdminNav /> : <Navbar />}
        <ButtomNav/>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/Invoice' element={<Invoice/>} />
          <Route path='/Signup' element={<Signup/>}/>
          <Route path='/Login' element={<Login/>} />
          <Route path='/ResetPassword' element={<ResetPassword />} />
          <Route path='/AdminLogin' element={<AdminLogin setIsAdmin={setIsAdmin}/>} />
          <Route path='/SellerKPI' element={<SellerKPI setIsAdmin={setIsAdmin}/>} />
          <Route path='/AllItems' element={<AllItems setIsAdmin={setIsAdmin}/>} />
          <Route path='/AddAdmin' element={<AddNewAdmin setIsAdmin={setIsAdmin}/>}/>
          <Route path='/PlacedOrder' element={<PlacedOrder setIsAdmin={setIsAdmin}/>}/>
        </Routes>
      </BrowserRouter>
    </CustomerContextProvider>
  )
}

export default App
