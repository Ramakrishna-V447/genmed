
import React, { useState, useRef, useEffect } from 'react';
import { ScanLine, Upload, Camera, X, CheckCircle2, Loader2, ShoppingCart, FileText, AlertCircle, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { MEDICINES } from '../constants';
import { Link } from 'react-router-dom';

const PrescriptionScanner: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'upload' | 'scanning' | 'results'>('upload');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToCart } = useCart();
    const [detectedMeds, setDetectedMeds] = useState<typeof MEDICINES>([]);

    // Reset state when closed
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep('upload');
                setSelectedImage(null);
                setDetectedMeds([]);
            }, 300);
        }
    }, [isOpen]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target?.result as string);
                startScanning();
            };
            reader.readAsDataURL(file);
        }
    };

    const startScanning = () => {
        setStep('scanning');
        // Simulate scanning delay
        setTimeout(() => {
            // Simulate detecting random medicines (e.g., Paracetamol and Pantoprazole)
            const simulatedResults = [MEDICINES[0], MEDICINES[1]]; 
            setDetectedMeds(simulatedResults);
            setStep('results');
        }, 3000);
    };

    const handleAddToCart = (med: typeof MEDICINES[0]) => {
        addToCart(med);
        // Show local feedback or toast
        const btn = document.getElementById(`add-btn-${med.id}`);
        if(btn) {
            btn.innerText = "Added";
            btn.classList.add('bg-green-600');
        }
    };

    return (
        <>
            {/* Styles for scanning animation */}
            <style>{`
                @keyframes scan-line {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan-line 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
            `}</style>

            {/* Floating Action Button (Positioned above ChatBot) */}
            <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-2">
                <div className="relative group">
                     {/* Label Tooltip */}
                    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Upload Prescription
                        <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
                    </div>

                    <button 
                        onClick={() => setIsOpen(true)}
                        className="bg-white hover:bg-gray-50 text-pastel-primary p-4 rounded-full shadow-xl shadow-gray-200 border border-gray-100 transition-all transform hover:scale-110 group-active:scale-95"
                    >
                        <ScanLine size={24} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up relative flex flex-col max-h-[85vh]">
                        
                        {/* Header */}
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <ScanLine size={20} className="text-pastel-primary" /> Smart Scanner
                                </h3>
                                <p className="text-xs text-gray-400">Upload prescription to find medicines</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto">
                            
                            {step === 'upload' && (
                                <div className="space-y-6">
                                    {/* Upload Area */}
                                    <div 
                                        className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-pastel-primary hover:bg-pastel-blue/5 transition-all group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="bg-pastel-mint p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                            <Upload className="text-pastel-primary" size={32} />
                                        </div>
                                        <p className="font-bold text-gray-700">Click to Upload</p>
                                        <p className="text-xs text-gray-400 mt-1">Supported: JPG, PNG, PDF</p>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or use camera</span></div>
                                    </div>

                                    {/* Camera Button */}
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-3.5 bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors shadow-lg shadow-gray-200"
                                    >
                                        <Camera size={20} /> Open Camera
                                    </button>

                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        capture="environment"
                                        onChange={handleFileSelect}
                                    />
                                </div>
                            )}

                            {step === 'scanning' && selectedImage && (
                                <div className="flex flex-col items-center">
                                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-inner border border-gray-200 bg-black">
                                        <img src={selectedImage} alt="Scanning" className="w-full h-full object-contain opacity-80" />
                                        
                                        {/* Scanning Overlay */}
                                        <div className="absolute inset-0 z-10">
                                            <div className="absolute left-0 right-0 h-0.5 bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.8)] animate-scan"></div>
                                        </div>
                                        
                                        {/* Status Text Overlay */}
                                        <div className="absolute bottom-4 left-0 right-0 text-center">
                                            <span className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 w-fit mx-auto">
                                                <Loader2 size={12} className="animate-spin" /> Analyzing Prescription...
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4 text-center">
                                        Our AI is identifying medicines from your prescription.
                                    </p>
                                </div>
                            )}

                            {step === 'results' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex items-start gap-3">
                                        <CheckCircle2 className="text-green-600 mt-0.5" size={18} />
                                        <div>
                                            <p className="text-sm font-bold text-green-800">Analysis Complete</p>
                                            <p className="text-xs text-green-700">We found {detectedMeds.length} medicines in your prescription.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {detectedMeds.map((med) => (
                                            <div key={med.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                                                <img src={med.imageUrl} alt={med.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50" />
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm text-gray-800">{med.name}</h4>
                                                    <p className="text-xs text-gray-500">Generic for {med.brandExample}</p>
                                                    <div className="text-pastel-primary font-bold text-sm mt-0.5">₹{med.genericPrice}</div>
                                                </div>
                                                <button 
                                                    id={`add-btn-${med.id}`}
                                                    onClick={() => handleAddToCart(med)}
                                                    className="p-2 bg-pastel-blue text-pastel-primary rounded-lg hover:bg-pastel-primary hover:text-white transition-colors"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button 
                                            onClick={() => { setSelectedImage(null); setStep('upload'); }}
                                            className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                                        >
                                            Scan Another
                                        </button>
                                        <Link 
                                            to="/cart"
                                            className="flex-1 py-3 bg-pastel-primary text-white font-bold rounded-xl hover:bg-pastel-secondary transition-colors shadow-lg shadow-teal-500/20 text-sm flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart size={16} /> Go to Cart
                                        </Link>
                                    </div>
                                    
                                    <p className="text-[10px] text-center text-gray-400 mt-2">
                                        Verify medicine details with your doctor before purchasing.
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PrescriptionScanner;
