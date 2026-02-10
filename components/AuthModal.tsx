
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Mail, User as UserIcon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialEmail = '' }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState('');
  const { login } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || '');
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth
    const userName = name || email.split('@')[0];
    login(email, userName);
    onClose();
  };

  const autofillAdmin = () => {
      setEmail('admin@upchar.com');
      setIsLogin(true);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={24} />
        </button>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {isLogin ? 'Welcome Back' : 'Join UpcharGeneric'}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              {isLogin 
                ? 'Login to view medicine prices and savings.' 
                : 'Create an account to start saving on medicines.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pastel-primary focus:border-transparent outline-none transition-all"
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pastel-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pastel-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-pastel-primary hover:bg-pastel-secondary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/20 transition-all transform hover:scale-[1.02]"
            >
              {isLogin ? 'Login to Continue' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-pastel-primary font-bold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
            
            {/* Admin Hint */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center">
               <button 
                 onClick={autofillAdmin}
                 className="inline-flex items-center gap-1.5 text-[10px] text-gray-400 bg-gray-50 px-3 py-1 rounded-full hover:bg-gray-100 hover:text-pastel-primary transition-colors cursor-pointer" 
                 title="Click to autofill admin@upchar.com"
               >
                   <ShieldCheck size={12} /> Admin? Click to autofill
               </button>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 py-3 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">Secure Healthcare Platform • India</p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AuthModal;
