import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "../../api/product";
import { 
  Package, Tag, Store, User, MapPin, 
  ChevronLeft, Loader2, Sprout, ShieldCheck, 
  ImageIcon, Calendar, Mail, Phone
} from "lucide-react";

const ViewProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchProductById, single, loading } = useProducts();
  
console.log(single)
  const product = single?.product;
  const stock = single?.stock;

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id, fetchProductById]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <Loader2 className="animate-spin text-[#14532d] mb-4" size={40} />
        <p className="font-medium">Fetching Product Data...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500">Product details not available.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-green-800 transition-colors">
          <ChevronLeft size={20} /> Back
        </button>
        <div className={`px-4 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${
          product.approval?.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'
        }`}>
          <ShieldCheck size={14} />
          {product.approval?.status || 'PENDING'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide">
            {product.image && product.image.length > 0 ? (
              product.image.map((img, index) => (
                <img 
                  key={index} 
                  src={img} 
                  alt={product.name} 
                  className="w-full h-96 object-cover rounded-2xl shadow-md snap-center shrink-0"
                />
              ))
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
                <ImageIcon size={48} />
              </div>
            )}
          </div>
          <p className="text-center text-xs text-gray-400">Swipe to view all {product.image?.length || 0} images</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div>
            <div className="flex gap-2">
                <span className="text-green-600 text-xs font-bold uppercase tracking-widest bg-green-50 px-2 py-1 rounded">
                {product.category}
                </span>
                {product.subCategory && (
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">
                    {product.subCategory}
                    </span>
                )}
            </div>
            <h1 className="text-4xl font-black text-gray-900 mt-2 capitalize">{product.name}</h1>
            <p className="text-gray-500 mt-4 leading-relaxed">{product.description}</p>
          </div>

          <div className="flex items-center gap-6 py-4 border-y border-gray-50">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Sale Price</p>
              <p className="text-3xl font-black text-[#10913ae8]">₹{product.pricing?.salePrice.toLocaleString()}</p>
            </div>
            <div className="opacity-50">
              <p className="text-xs text-gray-400 uppercase font-bold">MRP</p>
              <p className="text-xl font-bold line-through">₹{product.pricing?.mrp.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 text-green-700 rounded-lg"><Tag size={18} /></div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Unit</p>
                <p className="text-sm font-bold capitalize">{product.unit || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg"><Package size={18} /></div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Total Stock</p>
                <p className="text-sm font-bold">{stock?.totalStock?.toLocaleString() || 0} {product.unit}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Vendor Info */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold border-b pb-2">
            <User size={18} className="text-green-600" />
            <h2>Vendor Profile</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Name:</span>
              <span className="text-sm font-bold">{product.vendor?.user?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 text-gray-500"><Mail size={14}/> <span className="text-sm">Email:</span></div>
              <span className="text-sm font-medium">{product.vendor?.user?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 text-gray-500"><Phone size={14}/> <span className="text-sm">Phone:</span></div>
              <span className="text-sm font-medium">{product.vendor?.user?.phone}</span>
            </div>
          </div>
        </div>

        {/* Farm & Verification */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold border-b pb-2">
            <Sprout size={18} className="text-green-600" />
            <h2>Farm Details</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Farm Name:</span>
              <span className="text-sm font-bold capitalize">{product.vendor?.farmName || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Verification:</span>
              <span className={`text-xs font-bold ${product.vendor?.verification?.status === 'APPROVED' ? 'text-green-600' : 'text-amber-600'}`}>
                {product.vendor?.verification?.status}
              </span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-1 text-gray-500"><Calendar size={14}/> <span className="text-sm">Approved:</span></div>
              <span className="text-xs font-medium">
                {product.vendor?.verification?.approvedAt ? new Date(product.vendor.verification.approvedAt).toLocaleDateString() : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Warehouse Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold border-b pb-2">
            <MapPin size={18} className="text-green-600" />
            <h2>Stock Locations</h2>
          </div>
          <div className="space-y-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {stock?.stockByWarehouse?.map((wh, idx) => (
              <div key={idx} className="flex justify-between items-start border-b border-gray-50 pb-2 last:border-0">
                <div>
                  <p className="text-sm font-bold text-gray-700">{wh.warehouseName}</p>
                  <p className="text-[10px] text-gray-400 uppercase">{wh.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{wh.totalQuantity.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">{product.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Metadata */}
      <div className="flex justify-center gap-8 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
        <span>Created: {new Date(product.createdAt).toLocaleString()}</span>
        <span>Last Updated: {new Date(product.updatedAt).toLocaleString()}</span>
        <span>Product ID: {product._id}</span>
      </div>
    </div>
  );
};

export default ViewProductDetails;