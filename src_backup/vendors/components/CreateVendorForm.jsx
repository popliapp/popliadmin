import React, { useState } from 'react';
import { useVendor } from '../../api/vendor.js';
import { useAuth } from '../../api/auth';
import { 
  Sprout, Building2, CreditCard, FileText, User, ArrowRight, Leaf,
  CheckCircle2, AlertCircle, Loader2, Upload, Mail, Phone, Lock, Landmark,
  ShieldCheck, ArrowLeft
} from 'lucide-react';

const CreateVendorForm = () => {
  const { adminCreateVendor, loading } = useVendor();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name:"",email: "", phone: "", password: "",
    farmName:"", panNumber: '', bankAccountNumber: '',
    bankHolderName: '', bankIFSC: '', bankName: '',
    certifications: null
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: files ? files[0] : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
      return;
    }

    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      payload.append(key, formData[key]);
    });

    const result = await adminCreateVendor(payload);
    if (!result.success) {
      setStatus({ type: "error", message: result.message });
      return;
    }
    setStatus({ type: "success", message: "Vendor created successfully" });
    setCurrentStep(1);
    setFormData({ });
  };

  const steps = [
    { id: 1, title: 'Account', icon: User },
    { id: 2, title: 'Business', icon: Leaf },
    { id: 3, title: 'Banking', icon: Landmark }
  ];

  const inputClasses = "w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#14532d]/5 focus:border-[#14532d] transition-all outline-none text-sm font-medium";

  return (
    <div className="min-h-screen bg-[#fcfdfc] text-slate-900 font-sans antialiased pb-8">
      <div className="bg-white border-b border-gray-100 mb-6">
        <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-[#257f49] rounded-xl flex items-center justify-center shadow-lg shadow-[#14532d]/20">
              <Sprout className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Vendor Onboarding</h1>
              <p className="text-sm text-gray-500">Step {currentStep} of 3: {steps[currentStep-1].title}</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep >= s.id ? 'bg-[#257f49] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {currentStep > s.id ? <CheckCircle2 size={16} /> : s.id}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${currentStep >= s.id ? 'text-[#14532d]' : 'text-gray-400'}`}>{s.title}</span>
                {s.id !== 3 && <div className="w-8 h-0.5 bg-gray-100 mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#257f49] rounded-3xl p-8 text-white shadow-2xl shadow-[#14532d]/20 relative overflow-hidden">
             <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-4">Grow with Kheti Valah</h2>
                <p className="text-green-100/80 text-sm leading-relaxed mb-8">
                  Register your farm today. Our automated banking system ensures you get paid within 24 hours of delivery.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <ShieldCheck className="text-green-400" size={18} /> Fully Encrypted Data
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 className="text-green-400" size={18} /> Verified Vendor Status
                  </div>
                </div>
             </div>
             <Leaf className="absolute -bottom-10 -right-10 h-40 w-40 text-white/10 rotate-12" />
          </div>
          
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
            <h4 className="text-amber-800 text-xs font-bold uppercase mb-2 flex items-center gap-2">
              <AlertCircle size={14} /> Note
            </h4>
            <p className="text-amber-700 text-xs leading-normal">
              Ensure your PAN number matches your Bank Account Name to avoid payment delays.
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          {status.message && (
            <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {status.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
              <p className="text-sm font-bold">{status.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-8">
                  <h3 className="text-lg font-bold">Authentication Settings</h3>
                  <p className="text-sm text-gray-500">These details will be used for your secure dashboard login.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Vender Name</label>
                    <div className="relative">
                      
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input name="name" type="name" className={inputClasses} placeholder="vendor name" value={formData.name} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Email Address</label>
                    <div className="relative">
                      
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input name="email" type="email" className={inputClasses} placeholder="farmer@kheti.com" value={formData.email} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input name="phone" type="tel" className={inputClasses} placeholder="+91 00000 00000" value={formData.phone} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Security Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input name="password" type="password" className={inputClasses} placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-8">
                  <h3 className="text-lg font-bold">Business Information</h3>
                  <p className="text-sm text-gray-500">Tell us about your farm and provide certifications.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Farm Name</label>
                    <div className="relative">
                      <Sprout className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input name="farmName" className={inputClasses} placeholder="e.g. Green Valley" value={formData.farmName} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase ml-1">PAN Number</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input name="panNumber" className={inputClasses} placeholder="ABCDE1234F" value={formData.panNumber} onChange={handleChange} required />
                    </div>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-[#14532d]/5 transition-all group relative">
                    <input type="file" name="certifications" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleChange} />
                    <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-[#257f49] group-hover:scale-110 transition-transform">
                      <Upload size={24} />
                    </div>
                    <p className="font-bold text-gray-900">Upload FSSAI Certificate</p>
                    <p className="text-xs text-gray-500 mt-1">PDF or high-quality Image up to 5MB</p>
                    {formData.certifications && (
                      <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#257f49] text-white rounded-full text-xs font-bold animate-bounce">
                        <CheckCircle2 size={14} /> File Ready
                      </div>
                    )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-8">
                  <h3 className="text-lg font-bold">Payout Settings</h3>
                  <p className="text-sm text-gray-500">Where should we send your earnings?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Bank Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input name="bankName" className={inputClasses} placeholder="HDFC, SBI, etc." value={formData.bankName} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Holder Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input name="bankHolderName" className={inputClasses} placeholder="As per passbook" value={formData.bankHolderName} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Account Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input name="bankAccountNumber" className={inputClasses} placeholder="000000000000" value={formData.bankAccountNumber} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase ml-1">IFSC Code</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input name="bankIFSC" className={inputClasses} placeholder="HDFC0001234" value={formData.bankIFSC} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-8 border-t border-gray-50">
              {currentStep > 1 ? (
                <button 
                  type="button" 
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft size={18} /> Previous
                </button>
              ) : <div />}

              {currentStep < 3 ? (
                <button 
                  type="button" 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="flex items-center gap-2 bg-[#257f49] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#0f3a20] transition-all shadow-xl shadow-gray-200"
                >
                  Next Step <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#14532d] text-white px-10 py-3 rounded-2xl font-bold hover:bg-[#0f3a20] transition-all shadow-xl shadow-[#14532d]/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Launch Registration"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateVendorForm;