import React, { useState, useEffect } from 'react';
import { MEDICINES } from '../constants';
import MedicineCard from '../components/MedicineCard';
import { Search, Filter, Truck, ChevronRight, Clock, Package } from 'lucide-react';
import { MedicineCategory, Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const { user, isAuthenticated } = useAuth();
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);

  // Auto-fetch latest order for dashboard
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      db.getOrdersByEmail(user.email).then(orders => {
        if (orders.length > 0) setRecentOrder(orders[0]);
      });
    } else {
        setRecentOrder(null);
    }
  }, [isAuthenticated, user]);

  const categories = ['All', ...Object.values(MedicineCategory)];

  const filteredMedicines = MEDICINES.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          med.brandExample.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          med.commonUse.some(u => u.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pb-20">
      
      {/* Dashboard Section: Recent Order (Auto-displayed for logged-in users) */}
      {recentOrder && (
        <div className="bg-white border-b border-gray-100 animate-slide-up relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-pastel-mint/30 border border-pastel-mint shadow-sm relative overflow-hidden">
                    {/* Decorative bg element */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-pastel-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    
                    <div className="flex items-start sm:items-center gap-5 relative z-10">
                        <div className="bg-white p-3.5 rounded-2xl shadow-sm text-pastel-primary border border-gray-50">
                            <Truck size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                                Your Recent Order 
                                <span className="text-[10px] bg-white/60 text-pastel-primary border border-pastel-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold backdrop-blur-sm">In Transit</span>
                            </h2>
                            <div className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                               <span className="font-medium text-gray-700">#{recentOrder.id}</span>
                               <span className="text-gray-300">•</span>
                               <span className="flex items-center gap-1"><Package size={14} className="text-gray-400" /> {recentOrder.items.length} Items</span>
                               <span className="text-gray-300">•</span>
                               <span className="font-bold text-gray-700">₹{recentOrder.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6 pl-16 sm:pl-0 relative z-10">
                        <div className="text-right hidden md:block">
                            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5 flex items-center justify-end gap-1">
                                <Clock size={12} /> Est. Delivery
                            </div>
                            <div className="text-base font-bold text-pastel-primary">{recentOrder.deliveryTime}</div>
                        </div>
                        
                        <div className="h-10 w-px bg-pastel-primary/20 hidden md:block"></div>

                        <Link 
                            to="/track-order"
                            className="bg-white text-pastel-primary border border-pastel-primary/20 hover:bg-pastel-primary hover:text-white hover:border-transparent px-6 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 text-sm whitespace-nowrap group"
                        >
                            Track Status <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                 </div>
            </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-pastel-blue to-transparent pt-20 pb-24 px-4 sm:px-6 lg:px-8 mb-4">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-block mb-4 px-4 py-1.5 bg-white rounded-full border border-gray-100 shadow-sm text-xs font-bold text-pastel-primary uppercase tracking-wider animate-bounce">
            Compare & Save Today
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-pastel-dark mb-6 tracking-tight leading-tight">
            Find Affordable <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pastel-primary to-pastel-secondary">Generic Medicines</span>
          </h1>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Compare prices between top brands and generic alternatives. Save up to 70% on your monthly medical bills in India with our transparent pricing.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto shadow-2xl shadow-pastel-primary/10 rounded-full transition-transform hover:scale-[1.01]">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-300" />
            </div>
            <input
              type="text"
              className="block w-full pl-14 pr-6 py-5 rounded-full border-0 ring-1 ring-gray-100 focus:ring-2 focus:ring-pastel-primary bg-white text-gray-800 placeholder-gray-400 text-lg transition-all shadow-sm"
              placeholder="Search medicine (e.g. Dolo, Pan 40, Fever)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        
        {/* Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-8 mb-4 scrollbar-hide">
          <div className="bg-white p-2.5 rounded-full shadow-sm border border-gray-100 text-gray-400 mr-2 flex-shrink-0">
            <Filter size={20} />
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === cat 
                  ? 'bg-pastel-primary text-white shadow-lg shadow-teal-500/20 transform scale-105' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50 hover:text-gray-700 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filteredMedicines.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredMedicines.map((med, index) => (
              <div key={med.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <MedicineCard medicine={med} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-400">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={40} className="text-gray-300" />
            </div>
            <p className="text-xl font-medium text-gray-600">No medicines found</p>
            <p className="text-sm mt-2">Try searching for generic names like 'Paracetamol'.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;