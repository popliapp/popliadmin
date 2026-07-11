import React, { useState, useEffect } from "react";
import { useStore } from "../../api/store";
import { useVendor } from "../../api/vendor"; // Assuming this is the correct path
import { 
  Store, 
  MapPin, 
  Navigation, 
  User, 
  Plus,
  Loader2,
  ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const AdminCreateStoreForm = ({ onSuccess }) => {
  const { adminCreateStore, loading } = useStore();
  const navigate=useNavigate();
  const { getVendorList, vendors, loading: vendorsLoading } = useVendor();

  const [form, setForm] = useState({
    name: "Green Velly",
    phone:"5468464554",
    address: "LIG Square",
    pincode: "4540020",
    city: "indore",
    lat: "52",
    lng: "22",
    vendor: "",
	status:"INACTIVE"
  });

  // Fetch vendors on component mount
  useEffect(() => {
    getVendorList();
  }, [getVendorList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    const payload = {
      name: form.name,
      phone: form.phone,
      address: form.address,
      pincode: form.pincode,
      city: form.city,
      vendorId: form.vendor,
	  status:form.status,
      geo: {
        type: "Point",
        coordinates: [
          parseFloat(form.lng) || 0,
          parseFloat(form.lat) || 0,
        ],
      },
    };

    const res = await adminCreateStore(payload);

    if (!res.success) {
      alert(res.message || "Failed to create store");
      return;
    }
    navigate("/stores")

    onSuccess?.(res.data);
  };

  const inputStyle = `
    w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 
    text-gray-900 placeholder:text-gray-400 outline-none transition-all
    focus:border-[#14532d] focus:bg-white focus:ring-4 focus:ring-[#14532d]/5
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const labelStyle = `text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2`;
console.log(vendors)
  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-8 pt-8 pb-6 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#14532d]/10 rounded-lg text-[#14532d]">
            <Store size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Configure New Store</h2>
            <p className="text-sm text-gray-500">Link a vendor and set up operational coordinates</p>
          </div>
        </div>
      </div>

      <form className="p-8" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          
          <div className="space-y-6">
            <div>
              <p className={labelStyle}><User size={14} /> Ownership & Identity</p>
              <div className="space-y-4">
                <div className="relative">
                  <select
                    name="vendor"
                    className={`${inputStyle} appearance-none cursor-pointer`}
                    value={form.rvendo}
                    onChange={handleChange}
                    disabled={vendorsLoading}
                  >
                    <option value="">{vendorsLoading ? "Loading Vendors..." : "Select Vendor Name"}</option>
                    {vendors && vendors.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.user.name?.en || v.user?.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown size={18} />
                  </div>
                </div>
               <lable>Store Name</lable>
                <input 
                  name="name" 
                  placeholder="Store Name (e.g. Downtown Outlet)" 
                  className={inputStyle}
                  value={form.name} 
                  onChange={handleChange} 
                />
                <br/>
               <lable>Contact</lable>
                <input 
                  name="phone" 
                  placeholder="Store contact number" 
                  className={inputStyle}
                  value={form.phone} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div>
              <p className={labelStyle}><Navigation size={14} /> Logistics Coordinates</p>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  name="lat" 
                  placeholder="Latitude" 
                  className={inputStyle}
                  value={form.lat} 
                  onChange={handleChange} 
                />
                <input 
                  name="lng" 
                  placeholder="Longitude" 
                  className={inputStyle}
                  value={form.lng} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className={labelStyle}><MapPin size={14} /> Physical Address</p>
              <div className="space-y-4">
                <textarea 
                  name="address" 
                  placeholder="Full Address" 
                  rows="1"
                  className={`${inputStyle} resize-none`}
                  value={form.address} 
                  onChange={handleChange} 
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    name="city" 
                    placeholder="City" 
                    className={inputStyle}
                    value={form.city} 
                    onChange={handleChange} 
                  />
                  <input 
                    name="pincode" 
                    placeholder="Pincode" 
                    className={inputStyle}
                    value={form.pincode} 
                    onChange={handleChange} 
                  />

				  <div>
            <p className={labelStyle}><Store size={14} /> Store Status</p>

              <div className="space-y-4">
                <div className="relative">
                 
                  <select
                    name="status"
					placeholder="Status"
                    className={`${inputStyle} appearance-none cursor-pointer`}
					value={form.status}
					onChange={handleChange}
					>
						<option value="INACTIVE">Inactive</option>
						<option value="ACTIVE">Active</option>
					</select>
         
                </div>
              </div>
            </div>

				  
                </div>
              </div>
            </div>

            <div className="p-5 bg-[#14532d]/5 rounded-xl border border-[#14532d]/10">
              <h4 className="text-[11px] font-black text-[#14532d] uppercase mb-1">Admin Tip</h4>
              <p className="text-[11px] text-[#14532d]/70 leading-relaxed font-medium">
                The selected vendor will receive all stock-low alerts and daily closure reports for this store location.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium">
            * All fields are required for operational readiness.
          </p>
          <div className="flex gap-4">
            <button 
              type="button"
              className="px-6 py-2.5 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Discard
            </button>
            <button 
              disabled={loading || vendorsLoading}
              className={`
                flex items-center gap-2 px-10 py-2.5 rounded-lg font-bold text-white shadow-xl transition-all
                active:transform active:scale-95
                ${loading 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-[#14532d] hover:bg-[#0f3f22] shadow-[#14532d]/20'
                }
              `}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Register Store
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateStoreForm;