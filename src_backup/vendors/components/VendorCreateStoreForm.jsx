import React, { useState } from 'react';
import { useVendor } from '../../api/vendor';
import { Building2, Home, MapPin, Phone, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const VendorCreateStoreForm = () => {
  const { vendorCreateStore, loading } = useVendor();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    pincode: '',
    city: '',
    phone: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await vendorCreateStore(formData);
    if (!result.success) {
      setStatus({ type: 'error', message: result.message });
      return;
    }
    setStatus({ type: 'success', message: 'Store created successfully!' });
    setFormData({ name: '', address: '', pincode: '', city: '', phone: '' });
  };

  const inputClasses = "w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#14532d]/5 focus:border-[#14532d] transition-all outline-none text-sm font-medium";

  return (
    <div className="min-h-screen bg-[#fcfdfc] text-slate-900 font-sans antialiased pb-8">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Create Your Store</h1>
          <p className="text-lg text-gray-500 mt-2">Add a new store to start selling your products.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          {status.message && (
            <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {status.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
              <p className="text-sm font-bold">{status.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase ml-1">Store Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input name="name" type="text" className={inputClasses} placeholder="e.g. Kheti Corner Store" value={formData.name} onChange={handleChange} required />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase ml-1">Address</label>
                  <div className="relative">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input name="address" type="text" className={inputClasses} placeholder="123, Main Street" value={formData.address} onChange={handleChange} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase ml-1">Pincode</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input name="pincode" type="text" className={inputClasses} placeholder="e.g. 110001" value={formData.pincode} onChange={handleChange} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase ml-1">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input name="city" type="text" className={inputClasses} placeholder="e.g. New Delhi" value={formData.city} onChange={handleChange} required />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input name="phone" type="tel" className={inputClasses} placeholder="+91 00000 00000" value={formData.phone} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-8 border-t border-gray-50">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-[#14532d] text-white px-10 py-3 rounded-2xl font-bold hover:bg-[#0f3a20] transition-all shadow-xl shadow-[#14532d]/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Store"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorCreateStoreForm;
