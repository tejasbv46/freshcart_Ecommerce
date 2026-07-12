import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-gray-50/50 flex flex-column justify-between">
              <div>
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Routes>
                </main>
              </div>

              {/* Styled Modern Footer */}
              <footer className="bg-white border-t border-gray-100 mt-16 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                  <p className="text-sm font-semibold text-gray-800">FreshCart Premium E-Commerce</p>
                  <p className="text-xs text-gray-400 mt-1">© 2026 FreshCart Inc. All rights reserved. Secure transactions powered by SSL.</p>
                </div>
              </footer>
            </div>
          </Router>
        </ToastProvider>
      </CartProvider>
    </UserProvider>
  );
}

export default App;
