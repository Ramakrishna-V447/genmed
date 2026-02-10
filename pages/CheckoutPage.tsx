import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, CreditCard, CheckCircle2, Home, Building, Truck, Loader2, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Address } from '../types';

const CheckoutPage: React.FC = () => {
  const { cartTotal, items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [addressType, setAddressType] = useState<'home' | 'work'>('home');
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    line: '',
    city: '',
    pincode: ''
  });

  // Pre-fill user data if available when component mounts or user changes
  useEffect(() => {
    if (user) {
        setFormData(prev => ({
            ...prev,
            fullName: prev.fullName || user.name,
            email: prev.email || user.email
        }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsProcessing(true);

    const address: Address = {
        fullName: formData.fullName,
        phone: formData.phone,
        line: formData.line,
        city: formData.city,
        pincode: formData.pincode,
        type: addressType
    };

    try {
        // Save to Database and Trigger Email
        const order = await db.saveOrder(items, cartTotal + 10, address, formData.email); 
        
        setStep(3); // Show Success UI
        
        setTimeout(() => {
            clearCart();
            // Redirect to tracking page with the specific Order ID
            navigate(`/track-order?orderId=${order.id}`);
        }, 2500); // Slightly longer delay to let user read success message
    } catch (error) {
        console.error("Order Failed", error);
        alert("Failed to place order. Please try again.");
        setIsProcessing(false);
    }
  };

  if (step === 3) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="bg-white p-12 rounded-3xl shadow-lg text-center animate-fade-in max-w-md">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={48} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
                  <p className="text-gray-500 mb-2">A confirmation email has been sent to:</p>
                  <p className="font-bold text-gray-800 mb-6 bg-gray-50 py-2 px-4 rounded-lg inline-block">{formData.email}</p>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
                      <div className="bg-green-500 h-full w-full animate-[shimmer_1s_infinite]"></div>
                  </div>
                  <p className="text-xs text-gray-400">Redirecting to order tracking...</p>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                
                {/* Contact Info Section */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                     <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Mail className="text-pastel-primary" /> Contact Details
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input 
                                required name="fullName" value={formData.fullName} onChange={handleInputChange}
                                type="text" placeholder="Full Name" 
                                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none transition-all" 
                            />
                            <input 
                                required name="phone" value={formData.phone} onChange={handleInputChange}
                                type="tel" placeholder="Phone Number" 
                                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none transition-all" 
                            />
                        </div>
                        <input 
                            required name="email" value={formData.email} onChange={handleInputChange}
                            type="email" placeholder="Email Address (for order confirmation)" 
                            className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none transition-all" 
                        />
                    </div>
                </div>

                {/* Address Section */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="text-pastel-primary" /> Delivery Address
                    </h2>

                    {/* Visual Map for Pinning */}
                    <div className="mb-6 h-48 bg-gray-100 rounded-xl relative overflow-hidden group border border-gray-200 cursor-crosshair">
                         <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Map_of_Bangalore.jpg')] bg-cover opacity-60"></div>
                         <div className="absolute inset-0 flex items-center justify-center">
                             <div className="bg-pastel-primary text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold transform group-hover:-translate-y-2 transition-transform">
                                <MapPin size={18} /> Confirm Location
                             </div>
                         </div>
                    </div>

                    <div className="space-y-4">
                        <input 
                            required name="line" value={formData.line} onChange={handleInputChange}
                            type="text" placeholder="House No, Building, Area" 
                            className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none transition-all" 
                        />
                        <div className="grid grid-cols-2 gap-4">
                             <input 
                                required name="city" value={formData.city} onChange={handleInputChange}
                                type="text" placeholder="City" 
                                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none transition-all" 
                             />
                             <input 
                                required name="pincode" value={formData.pincode} onChange={handleInputChange}
                                type="text" placeholder="Pincode" 
                                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none transition-all" 
                             />
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button 
                                type="button"
                                onClick={() => setAddressType('home')}
                                className={`flex-1 py-2 rounded-lg border-2 flex items-center justify-center gap-2 font-medium transition-all ${addressType === 'home' ? 'border-pastel-primary text-pastel-primary bg-pastel-blue/20' : 'border-gray-200 text-gray-500'}`}
                            >
                                <Home size={18} /> Home
                            </button>
                            <button 
                                type="button"
                                onClick={() => setAddressType('work')}
                                className={`flex-1 py-2 rounded-lg border-2 flex items-center justify-center gap-2 font-medium transition-all ${addressType === 'work' ? 'border-pastel-primary text-pastel-primary bg-pastel-blue/20' : 'border-gray-200 text-gray-500'}`}
                            >
                                <Building size={18} /> Work
                            </button>
                        </div>
                    </div>
                </div>

                {/* Payment Section */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CreditCard className="text-pastel-primary" /> Payment Method
                    </h2>
                    <div className="space-y-3">
                        <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-pastel-primary transition-colors">
                            <input type="radio" name="payment" className="w-5 h-5 text-pastel-primary" defaultChecked />
                            <div className="flex-1">
                                <span className="font-bold text-gray-800 block">UPI / Netbanking</span>
                                <span className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</span>
                            </div>
                        </label>
                         <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-pastel-primary transition-colors">
                            <input type="radio" name="payment" className="w-5 h-5 text-pastel-primary" />
                            <div className="flex-1">
                                <span className="font-bold text-gray-800 block">Cash on Delivery</span>
                                <span className="text-xs text-gray-500">Pay when you receive</span>
                            </div>
                        </label>
                    </div>
                </div>

            </div>

            {/* Summary Sidebar */}
            <div>
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
                     <h3 className="text-lg font-bold text-gray-800 mb-4">Bill Details</h3>
                     <div className="space-y-3 text-sm mb-6">
                        <div className="flex justify-between text-gray-600">
                             <span>Item Total</span>
                             <span>₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                             <span>Delivery Partner Fee</span>
                             <span>₹10.00</span>
                        </div>
                         <div className="flex justify-between text-green-600 font-medium">
                             <span>Total Discount</span>
                             <span>- ₹0.00</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-800">
                             <span>To Pay</span>
                             <span>₹{(cartTotal + 10).toFixed(2)}</span>
                        </div>
                     </div>

                     <button 
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-pastel-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-pastel-secondary transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Truck size={20} />}
                        {isProcessing ? 'Processing...' : 'Place Order'}
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                        <CheckCircle2 size={12} /> 100% Safe & Secure Payments
                    </p>
                 </div>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;