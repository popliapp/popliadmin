import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Leaf, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../api/auth';
import {toast} from 'react-hot-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await handleLogin(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0fdf4] relative overflow-hidden p-4">
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-green-200/40 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-yellow-200/40 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-5xl bg-white rounded-4xl shadow-2xl shadow-green-900/10 overflow-hidden flex flex-col md:flex-row relative z-10 min-h-150">
        
        <div className="hidden md:flex w-1/2 relative flex-col justify-between p-12 bg-[#14532d] text-white overflow-hidden">
            <div className="absolute inset-0   ">
                <img 
                    src="/khetivalah.png" 
                    alt="Farm" 
                    className=" h-full object-cover opacity-90 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-linear-to-b from-[#14532d]/80 to-[#14532d]/95"></div>
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                        <Leaf className="text-green-300" size={24} />
                    </div>
                    <span className="text-xl font-bold tracking-wider text-white">KHETI Valah</span>
                </div>
            </div>

            <div className="relative z-10 mb-10">
                <h1 className="text-5xl font-bold leading-tight mb-0 font-serif tracking-tight">
                    Cultivating <br/>
                    <span className="text-green-400 italic mt-0 ">Tomorrow.</span>
                </h1>
                <p className="text-green-100/80 text-lg max-w-sm font-light">
                    Empowering farmers with advanced technology for a sustainable future.
                </p>
            </div>

            <div className="relative z-10 flex gap-6 text-sm text-green-200/60 font-medium">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Sprout size={16} />
                    </div>
                    <span>Sustainable</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-300">
                        <Leaf size={16} />
                    </div>
                    <span>Organic</span>
                </div>
            </div>
        </div>

        <div className="w-full md:w-1/2  flex flex-col justify-center bg-white">
            <div className="max-w-sm mx-auto w-full">
                <div className="text-center md:text-left">
                    <img src="/khetivalah.png" alt="Kheti Corner Logo" className="h-65  w-80 object-contain md:mx-5 mx-auto self-center " />
                    
                    <h2 className="text-3xl font-bold text-[#14532d] mb-2">Welcome Back</h2>
                    <p className="text-slate-500">Please enter your details to sign in.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <div className="relative group m-4">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-[#16a34a] transition-colors" />
                            </div>
                            <input
                                type="email"
                                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20 focus:border-[#16a34a] transition-all duration-200 font-medium"
                                placeholder="admin@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                      
                        <div className="relative group m-4">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#16a34a] transition-colors" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20 focus:border-[#16a34a] transition-all duration-200 font-medium"
                                placeholder="admin123"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            >
                                {showPassword ? 
                                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" /> : 
                                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                                }
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-[90%] m-4 flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-green-900/10 text-sm font-bold text-white bg-[#14532d] hover:bg-[#1a4d2e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#14532d] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>

              
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;