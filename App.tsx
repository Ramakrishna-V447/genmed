
import React, { PropsWithChildren } from 'react';
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
import AdminDashboard from './pages/admin/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout wrapper to hide Navbar/ChatBot on Admin pages
const MainLayout: React.FC<PropsWithChildren> = ({ children }) => (
  <>
    <Navbar />
    <main>
      {children}
    </main>
    <ChatBot />
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 py-8 mt-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} MediGen India. All rights reserved.</p>
        <p className="mt-2 text-xs">
          Disclaimer: This website provides information for educational purposes only. 
          It is not a substitute for professional medical advice, diagnosis, or treatment. 
          Always seek the advice of your physician.
        </p>
      </div>
    </footer>
  </>
);

const AppRoutes = () => {
    return (
        <Routes>
            {/* User Routes */}
            <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
            <Route path="/saved" element={<MainLayout><SavedPage /></MainLayout>} />
            <Route path="/cart" element={<MainLayout><CartPage /></MainLayout>} />
            <Route path="/checkout" element={<MainLayout><CheckoutPage /></MainLayout>} />
            <Route path="/track-order" element={<MainLayout><OrderTrackingPage /></MainLayout>} />
            <Route path="/stores" element={<MainLayout><StoresPage /></MainLayout>} />
            <Route path="/medicine/:id" element={<MainLayout><MedicineDetailPage /></MainLayout>} />
            
            {/* Admin Routes (No MainLayout) */}
            <Route path="/admin" element={<AdminDashboard />} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BookmarkProvider>
          <CartProvider>
            <HashRouter>
              <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
                 <AppRoutes />
              </div>
            </HashRouter>
          </CartProvider>
        </BookmarkProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
