
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, ChevronRight, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, cartTotal, itemCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);

  // Billing Constants
  const DELIVERY_THRESHOLD = 200;
  const DELIVERY_FEE = 40;
  const PLATFORM_FEE = 10;
  const GST_RATE = 0.12; // 12% GST

  const gstAmount = cartTotal * GST_RATE;
  const deliveryCharge = cartTotal > DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const finalTotal = cartTotal + gstAmount + deliveryCharge + PLATFORM_FEE;
  const savings = items.reduce((acc, i) => acc + (i.brandedPrice - i.genericPrice) * i.quantity, 0);

  useEffect(() => {
    const fetchOrders = async () => {
        if (isAuthenticated && user?.email) {
            try {
                const orders = await db.getOrdersByEmail(user.email);
                if (orders.length > 0) {
                    setLatestOrder(orders[0]);
                }
            } catch (e) {
                console.error("Failed to fetch orders", e);
            }
        }
    }
    fetchOrders();
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-pastel-background py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-pastel-dark mb-8 flex items-center gap-3">
            <ShoppingBag className="text-pastel-primary" /> Your Cart
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="bg-pastel-mint w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={40} className="text-pastel-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Looks like you haven't added any medicines yet. Discover affordable options now.</p>
            <Link 
              to="/" 
              className="inline-block bg-pastel-primary text-white px-8 py-3.5 rounded-full font-bold hover:bg-pastel-secondary transition-all shadow-lg shadow-teal-500/20"
            >
              Start Shopping
            </Link>

            {/* Show tracker even if cart is empty if an order exists */}
            {latestOrder && (
                <div className="mt-12 max-w-md mx-auto text-left border-t border-gray-100 pt-8">
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">Active Order</h3>
                     <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={() => navigate(`/track-order?orderId=${latestOrder.id}`)}>
                        <div className="flex items-center gap-4">
                            <div className="bg-pastel-mint text-pastel-primary p-3 rounded-xl">
                                <Truck size={20} />
                            </div>
                            <div>
                                <span className="block font-bold text-gray-800">Order #{latestOrder.id}</span>
                                <span className="text-xs text-green-600 font-medium">Arriving Today • {latestOrder.deliveryTime}</span>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-pastel-primary" size={20} />
                     </div>
                </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items List */}
            <div className="flex-1 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 items-center hover:shadow-md transition-shadow">
                  <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover img-soft" />
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">Generic for {item.brandExample}</p>
                    <div className="text-xs text-gray-500 mb-2">Batch: {item.batchNumber}</div>
                    <div className="text-pastel-primary font-bold text-lg">₹{item.genericPrice}</div>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-50 rounded-full px-5 py-2.5 border border-gray-100">
                    <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-gray-400 hover:text-pastel-primary disabled:opacity-30 transition-colors"
                        disabled={item.quantity <= 1}
                    >
                        <Minus size={16} />
                    </button>
                    <span className="font-bold text-gray-700 w-6 text-center">{item.quantity}</span>
                    <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-gray-400 hover:text-pastel-primary transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-96 shrink-0 space-y-6">
              
              {/* Tracker Widget in Sidebar */}
              {latestOrder && (
                <div className="bg-gradient-to-br from-pastel-primary to-pastel-secondary rounded-3xl p-6 text-white shadow-xl shadow-teal-500/20 relative overflow-hidden group">
                     <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                     
                     <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 font-bold text-xs bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                                <Package size={14} /> On the way
                            </div>
                            <span className="text-xs font-medium opacity-80">#{latestOrder.id}</span>
                        </div>
                        
                        <div className="mb-6">
                             <div className="text-3xl font-bold mb-1">{latestOrder.deliveryTime}</div>
                             <div className="text-white/80 text-sm">Estimated Arrival</div>
                        </div>

                        <Link to={`/track-order?orderId=${latestOrder.id}`} className="block w-full bg-white text-pastel-primary text-center py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm hover:shadow-lg">
                            Track Order
                        </Link>
                     </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-gray-500 text-sm">
                        <span>Items Subtotal ({itemCount})</span>
                        <span className="font-medium text-gray-700">₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-sm">
                        <span>GST (12%)</span>
                        <span className="font-medium text-gray-700">₹{gstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-sm">
                        <span>Delivery Fee</span>
                        {deliveryCharge === 0 ? (
                           <span className="text-green-500 font-medium">Free</span>
                        ) : (
                           <span className="font-medium text-gray-700">₹{DELIVERY_FEE.toFixed(2)}</span>
                        )}
                    </div>
                    {deliveryCharge > 0 && (
                        <div className="text-[10px] text-orange-500 text-right -mt-2 font-medium">
                            Add items worth ₹{(DELIVERY_THRESHOLD - cartTotal).toFixed(0)} more for free delivery
                        </div>
                    )}
                    <div className="flex justify-between text-gray-500 text-sm">
                        <span>Platform Fee</span>
                        <span className="font-medium text-gray-700">₹{PLATFORM_FEE.toFixed(2)}</span>
                    </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-6 mb-8">
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                        <span>Total Amount</span>
                        <span>₹{finalTotal.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-green-700 mt-3 bg-green-50 p-3 rounded-xl text-center font-medium border border-green-100">
                        You saved ₹{savings.toFixed(2)} on this order!
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-pastel-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:bg-pastel-secondary transition-all flex items-center justify-center gap-2 group hover:shadow-xl hover:-translate-y-0.5"
                >
                    Proceed to Checkout <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
