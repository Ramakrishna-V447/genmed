import React, { useState, useEffect } from 'react';
import { Check, Package, Truck, Phone, Home, Clock, User, Box, Loader2, AlertCircle, Search, Bell, MessageCircle, Smartphone, ShoppingBag, ArrowRight, RefreshCcw, Store } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';

const OrderTrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlOrderId = searchParams.get('orderId');
  const { user, isAuthenticated } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [inputId, setInputId] = useState('');
  const [error, setError] = useState('');
  const [isRecentOrder, setIsRecentOrder] = useState(false);
  
  // Notification States
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [notifySms, setNotifySms] = useState(false);

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
      setError('');
      setOrder(null);

      try {
        if (urlOrderId) {
            // Case 1: Specific Order ID in URL
            const data = await db.getOrder(urlOrderId);
            if (data) {
                setOrder(data);
                setIsRecentOrder(false);
            } else {
                setError(`Order #${urlOrderId} not found.`);
            }
        } else if (isAuthenticated && user?.email) {
            // Case 2: Logged in, No URL ID -> Fetch Latest
            const userOrders = await db.getOrdersByEmail(user.email);
            if (userOrders.length > 0) {
                setOrder(userOrders[0]);
                setIsRecentOrder(true);
            } else {
                // User has no orders yet
                setOrder(null);
            }
        } else {
            // Case 3: Guest, No URL ID -> Show Manual Input
            setOrder(null);
        }
      } catch (err) {
        setError("Unable to retrieve order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [urlOrderId, isAuthenticated, user]);

  // Simulate progress
  useEffect(() => {
    if (!order) return;
    const timer = setInterval(() => {
      setCurrentStep(prev => (prev < 2 ? prev + 1 : prev));
    }, 3000);
    return () => clearInterval(timer);
  }, [order]);

  const handleManualTrack = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputId.trim()) return;
      navigate(`/track-order?orderId=${inputId.trim()}`);
  };

  const clearTracking = () => {
      setSearchParams({});
      setOrder(null);
      setIsRecentOrder(false);
  };

  const steps = [
    { id: 0, title: 'Order Placed', sub: 'Order received', time: order ? new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--', icon: Package, completed: true },
    { id: 1, title: 'Packed', sub: 'Processed by shop', time: 'In Progress', icon: Check, completed: currentStep >= 1 },
    { id: 2, title: 'Dispatched', sub: 'Partner is on the way', time: 'Estimated 15 mins', icon: Truck, completed: currentStep >= 2 },
    { id: 3, title: 'Delivered', sub: `Expected in ${order?.deliveryTime || 'soon'}`, time: '--:--', icon: Home, completed: false },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-pastel-primary mb-2" size={32} />
        <p className="text-gray-500 font-medium">Retrieving status...</p>
      </div>
    );
  }

  // --- CASE: LOGGED IN BUT NO ORDERS ---
  if (!order && isAuthenticated && !urlOrderId) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center animate-fade-in">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag size={32} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
                <p className="text-gray-500 mb-8">
                    Welcome, {user?.name.split(' ')[0]}! You haven't placed any orders yet. Start saving on medicines today.
                </p>
                <Link 
                    to="/" 
                    className="block w-full bg-pastel-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/20 hover:bg-pastel-secondary transition-all"
                >
                    Start Shopping
                </Link>
                <button 
                    onClick={() => navigate('/track-order?orderId=manual')} 
                    className="mt-6 text-sm text-gray-400 hover:text-pastel-primary"
                >
                    Have an Order ID? Track manually
                </button>
            </div>
        </div>
      );
  }

  // --- CASE: MANUAL INPUT (Guest or explicit request) ---
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-pastel-primary/5 max-w-md w-full border border-gray-100 animate-slide-up">
            <div className="flex justify-center mb-6">
                <div className="bg-pastel-blue/30 p-4 rounded-full">
                    <Truck className="text-pastel-primary w-10 h-10" />
                </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Track Delivery</h1>
            <p className="text-gray-500 text-center mb-8 text-sm">Enter your Order ID to see real-time status.</p>

            <form onSubmit={handleManualTrack} className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        value={inputId}
                        onChange={(e) => setInputId(e.target.value)}
                        placeholder="Order ID (e.g. ORD-4521)"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pastel-primary focus:border-transparent outline-none transition-all"
                    />
                </div>
                
                {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={!inputId}
                    className="w-full bg-pastel-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/20 hover:bg-pastel-secondary transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Truck size={18} /> Track Status
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">
                    Need help? <Link to="/" className="text-pastel-primary hover:underline">Contact Support</Link>
                </p>
            </div>
        </div>
      </div>
    );
  }

  // --- CASE: DASHBOARD VIEW (Order Found) ---
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                {isRecentOrder ? (
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">Hello, {user?.name.split(' ')[0]}</h1>
                        <p className="text-xs text-gray-500">Here is your recent order</p>
                    </div>
                ) : (
                     <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Truck className="text-pastel-primary" /> Order #{order.id}
                    </h1>
                )}
            </div>
            
            <div className="flex items-center gap-3">
                 <button 
                    onClick={clearTracking}
                    className="text-xs font-bold text-gray-400 hover:text-pastel-primary flex items-center gap-1"
                 >
                    <RefreshCcw size={12} /> Track Another
                 </button>
                 <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide animate-pulse flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> In Transit
                 </span>
            </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        
        {/* Map & Driver Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group">
             {/* Simulated Live Map */}
             <div className="h-64 w-full bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Map_of_Bangalore.jpg')] bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>
                
                {/* Route Path Animation */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                    <path d="M 40% 40% Q 50% 60% 60% 50%" stroke="#009688" strokeWidth="4" fill="none" strokeDasharray="8 4" className="animate-[dash_20s_linear_infinite]" />
                </svg>

                {/* Driver Marker */}
                <div className="absolute top-[40%] left-[40%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 transition-all duration-1000" style={{ transform: `translate(${currentStep * 10}px, ${currentStep * 5}px)` }}>
                    <div className="bg-white p-1.5 rounded-full shadow-md">
                        <div className="bg-pastel-primary w-4 h-4 rounded-full animate-ping absolute opacity-75"></div>
                        <div className="bg-pastel-primary w-4 h-4 rounded-full relative border-2 border-white"></div>
                    </div>
                    <span className="bg-white text-[10px] px-2 py-0.5 rounded shadow mt-1 font-bold text-gray-700">Driver</span>
                </div>

                {/* Destination Marker */}
                <div className="absolute top-[50%] left-[60%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="bg-gray-800 p-2 rounded-full shadow-lg text-white">
                        <Home size={16} />
                    </div>
                </div>
             </div>

             {/* Driver Info Bar */}
             <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                        <User size={24} className="text-gray-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm">Ramesh Kumar</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            GenericPlus Logistics • 4.8★
                        </p>
                    </div>
                </div>
                <button className="p-2.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors shadow-sm">
                    <Phone size={18} />
                </button>
             </div>
        </div>

        {/* Timeline Tracking Block */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <Clock size={18} className="text-pastel-primary" /> Delivery Timeline
                </h2>
                <span className="text-xs text-gray-400 font-medium">Est. Delivery: {order.deliveryTime}</span>
            </div>
            
            <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
                {steps.map((step, idx) => (
                    <div key={idx} className={`relative pl-8 transition-all duration-500 ${step.completed || idx === currentStep ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[23px] top-0 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-colors duration-500 z-10 ${
                            step.completed 
                            ? 'bg-pastel-primary' 
                            : (idx === currentStep ? 'bg-orange-400 animate-pulse' : 'bg-gray-200')
                        }`}>
                            {step.completed && <Check size={12} className="text-white" />}
                        </div>

                        <div>
                            <h3 className={`font-bold text-sm ${idx === currentStep ? 'text-gray-900' : 'text-gray-700'}`}>
                                {step.title}
                            </h3>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">{step.sub}</p>
                                <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded">{step.time}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Notification Preferences Block */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
                <Bell size={18} className="text-pastel-primary" />
                <h2 className="font-bold text-gray-800">Get Updates</h2>
            </div>
            
            <div className="space-y-4">
                {/* WhatsApp Toggle */}
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 text-green-600 p-2.5 rounded-full">
                            <MessageCircle size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">WhatsApp Notifications</h3>
                            <p className="text-xs text-gray-500">Get real-time delivery updates</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setNotifyWhatsapp(!notifyWhatsapp)}
                        className={`w-12 h-7 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pastel-primary ${
                            notifyWhatsapp ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        aria-label="Toggle WhatsApp notifications"
                    >
                        <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-200 ${
                            notifyWhatsapp ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                    </button>
                </div>

                {/* SMS Toggle */}
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-600 p-2.5 rounded-full">
                            <Smartphone size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">SMS Alerts</h3>
                            <p className="text-xs text-gray-500">Receive status via text message</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setNotifySms(!notifySms)}
                        className={`w-12 h-7 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pastel-primary ${
                            notifySms ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        aria-label="Toggle SMS notifications"
                    >
                        <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-200 ${
                            notifySms ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                    </button>
                </div>
            </div>
        </div>

        {/* Package Contents Accordion (Simplified) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Box size={18} className="text-pastel-primary" /> Package Details
            </h2>

             {/* Added Shop Type Info */}
             <div className="mb-4 bg-gray-50 rounded-xl p-3 flex justify-between items-center border border-gray-100">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1"><Store size={12}/> Shop Type</span>
                <span className="text-sm font-bold text-pastel-primary bg-pastel-blue/30 px-3 py-1 rounded-full">Generic Medical Store</span>
            </div>

            <div className="space-y-4">
                {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h4>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                         <span className="font-bold text-gray-700 text-sm">₹{item.genericPrice}</span>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center font-bold text-gray-800">
                <span>Total Amount</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="bg-yellow-50 rounded-xl p-4 flex gap-3">
             <AlertCircle className="text-yellow-600 shrink-0" size={18} />
             <p className="text-xs text-yellow-800 leading-relaxed">
                <strong>Disclaimer:</strong> Delivery timelines may vary depending on location and medical shop availability. 
                Please inspect package seals upon delivery.
             </p>
        </div>

        <Link to="/" className="block w-full text-center py-4 text-gray-400 hover:text-pastel-primary font-medium text-sm transition-colors">
            Back to Home
        </Link>

      </div>
    </div>
  );
};

export default OrderTrackingPage;