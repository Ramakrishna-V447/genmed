import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import HomePage from './pages/HomePage';
import MedicineDetailPage from './pages/MedicineDetailPage';
import SavedPage from './pages/SavedPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import StoresPage from './pages/StoresPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import { AuthProvider } from './context/AuthContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { CartProvider } from './context/CartContext';

const App = () => {
  return (
    <AuthProvider>
      <BookmarkProvider>
        <CartProvider>
          <HashRouter>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
              <Navbar />
              
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/saved" element={<SavedPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/track-order" element={<OrderTrackingPage />} />
                  <Route path="/stores" element={<StoresPage />} />
                  <Route path="/medicine/:id" element={<MedicineDetailPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <ChatBot />

              <footer className="bg-white border-t border-gray-100 py-8 mt-10">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
                  <p>&copy; {new Date().getFullYear()} UpcharGeneric India. All rights reserved.</p>
                  <p className="mt-2 text-xs">
                    Disclaimer: This website provides information for educational purposes only. 
                    It is not a substitute for professional medical advice, diagnosis, or treatment. 
                    Always seek the advice of your physician.
                  </p>
                </div>
              </footer>
            </div>
          </HashRouter>
        </CartProvider>
      </BookmarkProvider>
    </AuthProvider>
  );
};

export default App;