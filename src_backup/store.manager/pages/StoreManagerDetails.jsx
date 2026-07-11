import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStoreManager } from "../../api/store.manager";
import { 
  ArrowLeft, 
  User, 
  Store, 
  ShieldCheck, 
  CreditCard, 
  Trophy, 
  Clock 
} from "lucide-react";

const StoreManagerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { singleStoreManager, getStoreManagerById, loading, error } = useStoreManager();

  useEffect(() => {
    if (id) getStoreManagerById(id);
  }, [id]);

  if (loading && !singleStoreManager) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-500 font-medium">Fetching details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
        {error}
      </div>
    );
  }

  if (!singleStoreManager) return null;

  const {
    user,
    store,
    vendor,
    role,
    status,
    kyc,
    payout,
    loyalty,
    createdAt,
    updatedAt,
  } = singleStoreManager;

  const StatusBadge = ({ condition, text }) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
      condition ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}>
      {text}
    </span>
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          className="group flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          onClick={() => navigate("/store-managers")}
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Managers
        </button>
        <div className="flex gap-2">
           <StatusBadge condition={status === "ACTIVE"} text={status} />
        </div>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{user?.name || "Manager Details"}</h1>
        <p className="text-gray-500">Manage account permissions and store assignments</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
            <div className="flex items-center mb-4 pb-2 border-b border-gray-50">
              <User className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-bold text-gray-800">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                <p className="text-gray-900 font-medium">{user?.name || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                <p className="text-gray-900 font-medium">{user?.email || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                <p className="text-gray-900 font-medium">{user?.phone || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Role</label>
                <p className="text-gray-900 font-medium">{role || "N/A"}</p>
              </div>
            </div>
          </section>

          <section className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
            <div className="flex items-center mb-4 pb-2 border-b border-gray-50">
              <Store className="h-5 w-5 text-purple-500 mr-2" />
              <h2 className="text-lg font-bold text-gray-800">Store Assignment</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Assigned Store</label>
                <p className="text-gray-900 font-medium">{store?.name || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Vendor ID</label>
                <p className="text-gray-900 font-mono text-sm">{vendor || "N/A"}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Status Card */}
          <section className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-lg font-bold text-gray-800">Verification</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">KYC Status</span>
                <StatusBadge condition={kyc?.verified} text={kyc?.verified ? "Verified" : "Pending"} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payouts</span>
                <StatusBadge condition={payout?.enabled} text={payout?.enabled ? "Enabled" : "Disabled"} />
              </div>
            </div>
          </section>

          {/* Loyalty Card */}
          <section className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center mb-4">
              <Trophy className="h-5 w-5 text-blue-200 mr-2" />
              <h2 className="text-lg font-bold">Loyalty</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-blue-100 text-xs uppercase font-bold">Current Points</p>
                <p className="text-2xl font-bold">{loyalty?.points ?? 0}</p>
              </div>
              <div>
                <p className="text-blue-100 text-xs uppercase font-bold">Lifetime</p>
                <p className="text-2xl font-bold">{loyalty?.lifetimeEarned ?? 0}</p>
              </div>
            </div>
          </section>

          {/* Timestamps */}
          <section className="bg-gray-100 rounded-xl p-4">
            <div className="flex items-center text-gray-500 mb-2">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-xs font-bold uppercase">Activity Log</span>
            </div>
            <div className="text-[11px] text-gray-500 space-y-1">
              <p>Created: {new Date(createdAt).toLocaleString()}</p>
              <p>Last Update: {new Date(updatedAt).toLocaleString()}</p>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default StoreManagerDetails;