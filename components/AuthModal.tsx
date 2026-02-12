
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Mail, User as UserIcon, Loader2, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialEmail = '' }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, register } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || '');
      setPassword('');
      setName('');
      setError('');
      if (initialEmail) setIsLogin(true);
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        await new Promise(resolve => setTimeout(resolve, 800));

        if (isLogin) {
            const res = await login(email, password);
            if (res.success) {
                onClose();
            } else {
                setError(res.error || "Login failed");
            }
        } else {
            const res = await register(name, email, password);
            if (res.success) {
                onClose();
            } else {
                setError(res.error || "Registration failed");
            }
        }
    } catch (err) {
        setError("An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[420px] overflow-hidden animate-slide-up relative flex flex-col max-h-[90vh]">
        
        {/* Header / Tabs */}
        <div className="relative pt-6 px-6 pb-4 bg-gray-50/50 border-b border-gray-100">
             <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
                 <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                    Medi<span className="text-pastel-primary">Gen</span>
                 </h2>
                 <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">Healthcare Simplified</p>
            </div>

            <div className="flex p-1 bg-gray-200/50 rounded-xl relative">
                <div 
                    className={`absolute inset-y-1 w-1/2 bg-white rounded-lg shadow-sm transition-all duration-300 ease-out transform ${isLogin ? 'translate-x-0' : 'translate-x-full'}`}
                ></div>
                <button 
                    onClick={() => { setIsLogin(true); setError(''); }}
                    className={`flex-1 relative z-10 py-2.5 text-sm font-bold transition-colors duration-300 ${isLogin ? 'text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Sign In
                </button>
                <button 
                    onClick={() => { setIsLogin(false); setError(''); }}
                    className={`flex-1 relative z-10 py-2.5 text-sm font-bold transition-colors duration-300 ${!isLogin ? 'text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Register
                </button>
            </div>
        </div>
        
        <div className="p-6 md:p-8 overflow-y-auto">
          {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-2xl flex items-start gap-3 border border-red-100 animate-fade-in">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" /> 
                  <span className="font-medium">{error}</span>
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                    <UserIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-pastel-primary transition-colors" />
                    <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-pastel-primary/10 focus:border-pastel-primary outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
                    placeholder="John Doe"
                    />
                </div>
              </div>
            )}
            
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-pastel-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-pastel-primary/10 focus:border-pastel-primary outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="group">
               <div className="flex justify-between items-center mb-1.5 ml-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Password</label>
                    {isLogin && (
                        <button type="button" className="text-xs font-bold text-pastel-primary hover:text-pastel-secondary transition-colors">
                            Forgot?
                        </button>
                    )}
               </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-pastel-primary transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-pastel-primary/10 focus:border-pastel-primary outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isLogin && (
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-pastel-primary border-pastel-primary' : 'bg-white border-gray-300 group-hover:border-pastel-primary'}`}>
                        {rememberMe && <Check size={12} className="text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                    <span className="text-sm text-gray-500 font-medium">Keep me signed in</span>
                </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pastel-primary hover:bg-pastel-secondary text-white font-bold py-4 rounded-xl shadow-xl shadow-teal-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                  <Loader2 className="animate-spin" size={20} />
              ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={18} />
                  </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-gray-400 font-bold tracking-wider">Or continue with</span>
                </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  <span className="text-sm font-bold text-gray-600">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
                 <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
                 <span className="text-sm font-bold text-gray-600">Facebook</span>
              </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

export default AuthModal;
