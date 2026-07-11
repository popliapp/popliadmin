import React from 'react';
import { 
  TrendingUp, Users, ShoppingCart, Clock, 
  MapPin, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import {useDashboardData} from '../../api/dashboard';

const DashboardData = () => {
  const { data, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-red-600">Error loading dashboard data</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex">
     

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Operational Pulse</h2>
            <p className="text-slate-500 text-sm">Real-time data from API events</p>
          </div>
          <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span>LIVE SYSTEM ACTIVE</span>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Live Orders" value={data.stats.liveOrders.value} icon={<ShoppingCart className="text-blue-600" />} trend={data.stats.liveOrders.trend} />
          <StatCard title="Total Sales" value={data.stats.totalSales.value} icon={<TrendingUp className="text-green-600" />} trend={data.stats.totalSales.trend} />
          <StatCard title="Delivery SLA" value={data.stats.deliverySLA.value} icon={<Clock className="text-orange-500" />} trend={data.stats.deliverySLA.trend} />
          <StatCard title="Active Fleet" value={data.stats.activeFleet.value} icon={<MapPin className="text-purple-600" />} trend={data.stats.activeFleet.trend} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold mb-4 text-slate-700">Order Velocity (Last 6 Hours)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="orders" stroke="#4CAF50" fillOpacity={1} fill="url(#colorOrders)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Critical Alerts / SLAs */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold mb-4 text-slate-700">SLA Critical Alerts</h3>
            <div className="space-y-4">
              {data.alerts.map((alert, index) => (
                <AlertItem key={index} {...alert} />
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm font-semibold text-[#001F4D] border border-[#001F4D] rounded-lg hover:bg-slate-50 transition">
              View All Logistics
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-components
const StatCard = ({ title, value, icon, trend }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">{trend}</span>
    </div>
    <h4 className="text-slate-500 text-sm font-medium">{title}</h4>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

const AlertItem = ({ id, time, status, color }) => (
  <div className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0">
    <div>
      <p className="text-sm font-bold text-slate-700">{id}</p>
      <p className="text-xs text-slate-400">Assign Courier</p>
    </div>
    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${color}`}>
      {time}
    </div>
  </div>
);

export default DashboardData;