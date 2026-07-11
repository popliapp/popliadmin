import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVendor } from '../../api/vendor.js';
import { useAuth } from '../../api/auth';
import { 
  Sprout, Building2, CreditCard, FileText, User, ArrowRight, Leaf,
  CheckCircle2, AlertCircle, Loader2, Upload, Mail, Phone, Lock, Landmark,
  ShieldCheck, ArrowLeft, Save
} from 'lucide-react';
import {toast} from 'react-hot-toast';

const EditVendorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vendor, getVendorById, updateVendor, loading } = useVendor();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "",
    farmName: '', panNumber: '', bankAccountNumber: '',
    bankHolderName: '', bankIFSC: '', bankName: '',
    certifications: null
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [currentStep, setCurrentStep] = useState(1);
  console.log(vendor)
  // Fetch existing vendor data on mount
  useEffect(() => {
    if (id) {
      getVendorById(id);
    }
  }, [id, getVendorById]);

  // Sync fetched vendor data to local state
  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.user?.name || "",
        email: vendor.user?.email || "",
        phone: vendor.user?.phone || "",
        password: "", // Keep password empty unless changing
        farmName: vendor.farmName || "",
        panNumber: vendor.panNumber || "",
        bankAccountNumber: vendor.bank?.accountNumber || "",
        bankHolderName: vendor.bank?.holderName || "",
        bankIFSC: vendor.bank?.ifsc || "",
        bankName: vendor.bank?.bankName || "",
        certifications: null // Files aren't pre-filled
      });
    }
  }, [vendor]);

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
      // Only append password if the user actually typed a new one
      if (key === 'password' && !formData[key]) return;
      if (formData[key] !== null) {
        payload.append(key, formData[key]);
      }
    });

    const result = await updateVendor(id, payload);
    if (!result.success) {
      setStatus({ type: "error", message: result.message });
      return;
    }
    toast.success("Vendor profile updated successfully" );
	navigate("/vendors")
    // Optional: navigate back after success
    // setTimeout(() => navigate('/vendors'), 2000);
  };

  const steps = [
    { id: 1, title: 'Profile', icon: User },
    { id: 2, title: 'Business', icon: Leaf },
    { id: 3, title: 'Banking', icon: Landmark }
  ];

  const inputClasses = "w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 transition-all outline-none text-sm font-medium";

  if (loading && !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfc] text-slate-900 font-sans antialiased pb-8">
      <div className="bg-white border-b border-gray-100 mb-6">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
              <Building2 className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Vendor Profile</h1>
              <p className="text-sm text-gray-500 font-medium">Updating: <span className="text-emerald-700">{vendor?.farmName}</span></p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep >= s.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {currentStep > s.id ? <CheckCircle2 size={16} /> : s.id}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${currentStep >= s.id ? 'text-emerald-900' : 'text-gray-400'}`}>{s.title}</span>
                {s.id !== 3 && <div className="w-8 h-0.5 bg-gray-100 mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-emerald-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-4">Manage Information</h2>
                <p className="text-emerald-50/80 text-sm leading-relaxed mb-8">
                  Updates to banking details may require up to 24 hours for re-verification by our compliance team.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <ShieldCheck className="text-emerald-300" size={18} /> Encrypted Data Storage
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 className="text-emerald-300" size={18} /> Verified Status Maintained
                  </div>
                </div>
             </div>
             <Leaf className="absolute -bottom-10 -right-10 h-40 w-40 text-white/10 rotate-12" />
          </div>
        </div>

        <div className="lg:col-span-8 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          {status.message && (
            <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
              {status.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
              <p className="text-sm font-bold">{status.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-800">Account Credentials</h3>
                  <p className="text-sm text-gray-500">Update the primary contact and login info.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Vendor Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input name="name" type="text" className={inputClasses} placeholder="Vendor name" value={formData.name} onChange={handleChange} required />
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
                    <label className="text-xs font-black text-gray-400 uppercase ml-1">New Password (Optional)</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input name="password" type="password" className={inputClasses} placeholder="Leave blank to keep current" value={formData.password} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-800">Business Details</h3>
                  <p className="text-sm text-gray-500">Update farm registration and tax identifiers.</p>
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
                
                <div className="border-2 border-dashed border-emerald-100 rounded-3xl p-10 flex flex-col items-center justify-center bg-emerald-50/30 hover:bg-emerald-50 transition-all group relative">
                    <input type="file" name="certifications" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleChange} />
                    <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-emerald-600 group-hover:scale-110 transition-transform">
                      <Upload size={24} />
                    </div>
                    <p className="font-bold text-gray-900">Upload New FSSAI Certificate</p>
                    <p className="text-xs text-gray-500 mt-1">Leave blank to keep existing file</p>
                    {formData.certifications && (
                      <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold animate-bounce">
                        <CheckCircle2 size={14} /> New File Selected
                      </div>
                    )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-800">Banking Information</h3>
                  <p className="text-sm text-gray-500">Earnings will be settled to this account.</p>
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
                  <ArrowLeft size={18} /> Previous Step
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
              )}

              {currentStep < 3 ? (
                <button 
                  type="button" 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/10"
                >
                  Next <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-slate-900 text-white px-10 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      <Save size={18} /> Save Changes
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditVendorForm;