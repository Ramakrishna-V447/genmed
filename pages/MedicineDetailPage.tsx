
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MEDICINES } from '../constants';
import { ArrowLeft, Heart, ShoppingCart, Zap, CheckCircle2, AlertTriangle, ShieldOff } from 'lucide-react';
import { PriceComparisonBlock, UsageBlock, DosageBlock, DetailsBlock } from '../components/blocks/MedicineDetailBlocks';
import { useBookmarks } from '../context/BookmarkContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const MedicineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const medicine = MEDICINES.find(m => m.id === id);
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [added, setAdded] = React.useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!medicine) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Medicine Not Found</h2>
        <Link to="/" className="text-pastel-primary hover:underline">Go back home</Link>
      </div>
    );
  }

  // Check Expiry Logic
  const checkExpiringSoon = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30; // Expiring in 30 days
  };

  const isExpiringSoon = checkExpiringSoon(medicine.expiryDate);

  const saved = isBookmarked(medicine.id);
  const toggleBookmark = () => {
    if (saved) {
      removeBookmark(medicine.id);
    } else {
      addBookmark(medicine.id);
    }
  };

  const handleAddToCart = () => {
    if (isExpiringSoon) return;
    addToCart(medicine);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isExpiringSoon) return;
    addToCart(medicine);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-pastel-background pb-32 animate-fade-in">
      {/* Header / Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-pastel-dark line-clamp-1 flex items-center gap-2">
                    {medicine.name}
                    {isExpiringSoon && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full border border-orange-200">Expiring Soon</span>}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Generic for <span className="font-medium text-gray-600">{medicine.brandExample}</span></p>
            </div>
          </div>

          <button
             onClick={toggleBookmark}
             className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${
               saved 
                ? 'bg-red-50 border-red-100 text-red-400' 
                : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
             }`}
           >
             <Heart size={18} className={saved ? 'fill-current' : ''} />
             <span className="text-sm font-semibold hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
           </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        
        {/* E-commerce Action Block (Mobile Top) */}
        <div className="lg:hidden bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wide font-bold">Best Price</span>
                    <div className="text-3xl font-bold text-pastel-primary">
                         {isAuthenticated ? `₹${medicine.genericPrice.toFixed(2)}` : 'Login'}
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${isExpiringSoon ? 'bg-orange-100 text-orange-600' : 'bg-pastel-mint text-pastel-primary'}`}>
                    {isExpiringSoon ? 'Restricted' : 'In Stock'}
                </span>
            </div>
            {isAuthenticated && (
                <div className="grid grid-cols-2 gap-3">
                    {isExpiringSoon ? (
                        <div className="col-span-2 bg-orange-50 border border-orange-100 text-orange-600 p-3 rounded-xl text-xs text-center font-medium flex items-center justify-center gap-2">
                            <ShieldOff size={16} /> Purchase disabled due to short expiry
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={handleAddToCart}
                                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all ${
                                    added ? 'bg-pastel-secondary text-white' : 'bg-pastel-blue text-pastel-primary hover:bg-pastel-mint'
                                }`}
                            >
                                {added ? <CheckCircle2 size={18}/> : <ShoppingCart size={18} />}
                                {added ? 'Added' : 'Add to Cart'}
                            </button>
                            <button 
                                onClick={handleBuyNow}
                                className="flex items-center justify-center gap-2 bg-pastel-primary text-white py-3.5 rounded-xl font-bold hover:bg-pastel-secondary transition-all shadow-lg shadow-teal-500/20"
                            >
                                <Zap size={18} /> Buy Now
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>

        {/* Block 1: Price Comparison (Full Width) */}
        <div className="flex flex-col lg:flex-row gap-8">
            <section className="flex-1 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <PriceComparisonBlock medicine={medicine} />
            </section>
            
            {/* Desktop Buy Box */}
            <div className="hidden lg:block w-96 shrink-0">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 sticky top-40">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Purchase Options</h3>
                    
                    <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1 font-medium">Generic Price</div>
                        <div className="text-4xl font-extrabold text-pastel-primary">
                            {isAuthenticated ? `₹${medicine.genericPrice}` : '---'}
                        </div>
                        {isAuthenticated && <div className="text-xs text-gray-400 mt-2 font-medium">Inclusive of all taxes</div>}
                    </div>

                    {isAuthenticated ? (
                        <div className="space-y-4">
                             {isExpiringSoon ? (
                                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
                                    <AlertTriangle className="mx-auto text-orange-500 mb-2" size={24} />
                                    <p className="text-orange-700 font-bold text-sm">Unavailable for Purchase</p>
                                    <p className="text-orange-600 text-xs mt-1">This batch is expiring soon (within 30 days) and has been restricted for safety.</p>
                                </div>
                             ) : (
                                <>
                                    <button 
                                        onClick={handleAddToCart}
                                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${
                                            added ? 'bg-pastel-secondary text-white' : 'bg-pastel-blue text-pastel-primary hover:bg-pastel-mint'
                                        }`}
                                    >
                                        {added ? <CheckCircle2 size={20}/> : <ShoppingCart size={20} />}
                                        {added ? 'Added to Cart' : 'Add to Cart'}
                                    </button>
                                    <button 
                                        onClick={handleBuyNow}
                                        className="w-full flex items-center justify-center gap-2 bg-pastel-primary text-white py-4 rounded-2xl font-bold hover:bg-pastel-secondary transition-all shadow-xl shadow-teal-500/20 transform hover:-translate-y-0.5"
                                    >
                                        <Zap size={20} /> Buy Now
                                    </button>
                                    <p className="text-xs text-center text-gray-400 mt-2">
                                        Free delivery on orders above ₹200
                                    </p>
                                </>
                             )}
                        </div>
                    ) : (
                        <div className="bg-pastel-blue/30 p-6 rounded-2xl text-center border border-pastel-blue/50">
                            <p className="text-sm font-bold text-pastel-primary mb-2">Login to purchase</p>
                            <p className="text-xs text-gray-500">Access exclusive generic prices</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Block 2: Usage */}
          <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <UsageBlock medicine={medicine} />
          </section>

          {/* Block 3: Dosage */}
          <section className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <DosageBlock medicine={medicine} />
          </section>
        </div>

        {/* Block 4: Details (Full Width) */}
        <section className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <DetailsBlock medicine={medicine} />
        </section>

      </div>
      
      {/* Mobile Sticky Bottom Bar */}
      {isAuthenticated && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40 flex items-center gap-4 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
            <div className="flex-1 pl-2">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total</div>
                <div className="text-2xl font-bold text-pastel-primary">₹{medicine.genericPrice}</div>
            </div>
            {isExpiringSoon ? (
                <button disabled className="flex-1 bg-gray-300 text-white py-3.5 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2">
                    <ShieldOff size={18} /> Restricted
                </button>
            ) : (
                <button 
                    onClick={handleBuyNow}
                    className="flex-1 bg-pastel-primary text-white py-3.5 rounded-xl font-bold shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                >
                    <Zap size={18} /> Buy Now
                </button>
            )}
        </div>
      )}
    </div>
  );
};

export default MedicineDetailPage;
