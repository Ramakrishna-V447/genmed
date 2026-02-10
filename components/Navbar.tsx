import React from 'react';
import { Pill, LogOut, Heart, ShoppingCart, MapPin, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useCart } from '../context/CartContext';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { bookmarks } = useBookmarks();
  const { itemCount } = useCart();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center cursor-pointer">
             <Link to="/" className="flex items-center gap-3 group">
                <div className="bg-pastel-mint p-2.5 rounded-xl group-hover:bg-pastel-secondary/20 transition-colors">
                    <Pill className="h-6 w-6 text-pastel-primary" />
                </div>
                <div>
                   <span className="font-bold text-xl text-pastel-primary tracking-tight block leading-none">Upchar<span className="text-pastel-accent">Generic</span></span>
                   <span className="text-[10px] text-pastel-text tracking-widest uppercase font-medium">Healthcare India</span>
                </div>
             </Link>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-8">
            <Link 
                to="/stores" 
                className={`hidden md:flex items-center gap-2 text-sm font-medium transition-all ${
                    location.pathname === '/stores' 
                    ? 'text-pastel-primary bg-pastel-mint/50 px-3 py-1.5 rounded-full' 
                    : 'text-gray-400 hover:text-pastel-primary'
                }`}
            >
                <MapPin size={18} />
                <span>Stores</span>
            </Link>

            <Link 
                to="/track-order" 
                className={`hidden md:flex items-center gap-2 text-sm font-medium transition-all ${
                    location.pathname === '/track-order' 
                    ? 'text-pastel-primary bg-pastel-mint/50 px-3 py-1.5 rounded-full' 
                    : 'text-gray-400 hover:text-pastel-primary'
                }`}
            >
                <Truck size={18} />
                <span>Track</span>
            </Link>

            <Link 
                to="/saved" 
                className={`relative p-2.5 rounded-full transition-all hover:scale-105 ${
                    location.pathname === '/saved' 
                    ? 'bg-red-50 text-pastel-accent' 
                    : 'text-gray-400 hover:text-pastel-accent hover:bg-red-50/50'
                }`}
                title="Saved Comparisons"
            >
                <Heart size={22} className={location.pathname === '/saved' ? "fill-current" : ""} />
                {bookmarks.length > 0 && (
                    <span className="absolute top-0 right-0 bg-pastel-accent text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                        {bookmarks.length}
                    </span>
                )}
            </Link>

            <Link 
                to="/cart" 
                className={`relative p-2.5 rounded-full transition-all hover:scale-105 ${
                    location.pathname === '/cart' 
                    ? 'bg-pastel-mint text-pastel-primary' 
                    : 'text-gray-400 hover:text-pastel-primary hover:bg-pastel-mint/50'
                }`}
                title="Shopping Cart"
            >
                <ShoppingCart size={22} className={location.pathname === '/cart' ? "fill-current" : ""} />
                {itemCount > 0 && (
                    <span className="absolute top-0 right-0 bg-pastel-primary text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                        {itemCount}
                    </span>
                )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
                 <div className="hidden lg:block text-right">
                    <p className="text-xs text-gray-400 font-medium">Welcome,</p>
                    <p className="text-sm font-bold text-gray-700">{user?.name.split(' ')[0]}</p>
                 </div>
                 <button 
                   onClick={logout}
                   className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 text-sm font-medium text-gray-500 bg-gray-50 hover:bg-red-50 hover:text-red-400 rounded-full transition-all"
                   title="Logout"
                 >
                   <LogOut size={18} />
                   <span className="hidden sm:inline">Logout</span>
                 </button>
              </div>
            ) : (
              <div className="hidden sm:block text-sm font-medium text-pastel-primary/80 bg-pastel-mint/30 px-4 py-2 rounded-full">
                Login for Prices
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;