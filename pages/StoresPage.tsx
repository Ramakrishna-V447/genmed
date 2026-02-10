import React, { useState } from 'react';
import { MapPin, Navigation, Search, Phone, Clock, Truck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORES = [
    { id: 1, name: "Jan Aushadhi Kendra - Indiranagar", address: "123, 100 Feet Rd, Indiranagar, Bengaluru", dist: "1.2 km", open: true },
    { id: 2, name: "Generic Plus Pharmacy", address: "45, CMH Road, Metro Station, Bengaluru", dist: "2.5 km", open: true },
    { id: 3, name: "Sanjivani Generic Meds", address: "88, Koramangala 4th Block, Bengaluru", dist: "4.8 km", open: false },
    { id: 4, name: "Pradhan Mantri Janaushadhi", address: "Near Government Hospital, Jayanagar", dist: "5.5 km", open: true },
];

const StoresPage: React.FC = () => {
    const [activeStore, setActiveStore] = useState(STORES[0].id);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-100 sticky top-16 z-20">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <MapPin className="text-pastel-primary" /> Locate Generic Stores
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
                
                {/* Left Column: Tracking & Store List */}
                <div className="w-full lg:w-1/3 flex flex-col gap-4 h-full">
                    
                    {/* Active Order Widget */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden group shrink-0 animate-fade-in">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-pastel-blue/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-pastel-primary text-white p-2.5 rounded-xl shadow-md shadow-teal-500/20">
                                        <Truck size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-sm">Order #ORD-49201</h3>
                                        <span className="text-[10px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-full uppercase tracking-wide">Out for Delivery</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                 <Clock size={14} className="text-pastel-secondary"/>
                                 <span>Arriving in <span className="text-gray-800 font-bold">15 mins</span></span>
                            </div>

                            <Link to="/track-order" className="flex items-center justify-between w-full bg-pastel-primary text-white p-3 rounded-xl transition-all shadow-md shadow-teal-500/10 hover:bg-pastel-secondary hover:shadow-lg">
                                <span className="text-sm font-bold">Track Live Status</span> 
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>

                    {/* Store List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1 min-h-0">
                        <div className="p-4 border-b border-gray-100 shrink-0">
                             <div className="relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search location..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-primary" 
                                />
                             </div>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-2">
                            {STORES.map(store => (
                                <button 
                                    key={store.id}
                                    onClick={() => setActiveStore(store.id)}
                                    className={`w-full text-left p-4 rounded-xl transition-all border ${
                                        activeStore === store.id 
                                        ? 'bg-pastel-blue/20 border-pastel-primary' 
                                        : 'bg-white border-transparent hover:bg-gray-50'
                                    }`}
                                >
                                    <h3 className="font-bold text-gray-800">{store.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{store.address}</p>
                                    <div className="flex items-center gap-4 mt-3 text-xs font-medium">
                                        <span className="flex items-center gap-1 text-gray-600"><Navigation size={12}/> {store.dist}</span>
                                        <span className={`${store.open ? 'text-green-600' : 'text-red-500'}`}>
                                            {store.open ? 'Open Now' : 'Closed'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Map View Area */}
                <div className="w-full lg:w-2/3 bg-gray-200 rounded-2xl overflow-hidden relative shadow-inner">
                    {/* Simulated Map Background */}
                    <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Map_of_Bangalore.jpg')] bg-cover bg-center opacity-50 grayscale hover:grayscale-0 transition-all duration-700"></div>
                    
                    {/* Simulated Pins */}
                    <div className="absolute inset-0 pointer-events-none">
                        {STORES.map((store, idx) => (
                            <div 
                                key={store.id} 
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer pointer-events-auto transition-all duration-300 ${
                                    activeStore === store.id ? 'scale-110 z-10' : 'scale-90 opacity-80'
                                }`}
                                style={{ top: `${30 + (idx * 15)}%`, left: `${40 + (idx * 10)}%` }}
                                onClick={() => setActiveStore(store.id)}
                            >
                                <div className={`p-2 rounded-full shadow-lg ${activeStore === store.id ? 'bg-pastel-primary text-white' : 'bg-white text-gray-600'}`}>
                                    <MapPin size={24} className="fill-current" />
                                </div>
                                {activeStore === store.id && (
                                    <div className="mt-2 bg-white px-3 py-1 rounded-lg shadow-md text-xs font-bold text-gray-800 whitespace-nowrap">
                                        {store.name}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Bottom Info Card for Mobile */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-xl shadow-lg lg:hidden">
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="font-bold text-gray-800">{STORES.find(s => s.id === activeStore)?.name}</h3>
                                <p className="text-xs text-gray-500">{STORES.find(s => s.id === activeStore)?.address}</p>
                             </div>
                             <button className="bg-pastel-primary text-white p-2 rounded-full">
                                <Navigation size={20} />
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoresPage;