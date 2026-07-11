import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useVendor } from '../../api/vendor';
import CustomTable from '../../components/CustomTable';
import { 
  Box, CircularProgress, Paper, Typography, Grid, 
  Card, CardContent, Chip, useMediaQuery, useTheme 
} from '@mui/material';
import { 
  TrendingUp, Wallet, CheckCircle, HourglassEmpty, 
  ShoppingBag, BarChart as BarChartIcon 
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const INITIAL_CHART_DATA = [
  { name: 'Product A', revenue: 4000, quantity: 24 },
  { name: 'Product B', revenue: 3000, quantity: 18 },
  { name: 'Product C', revenue: 2000, quantity: 45 },
  { name: 'Product D', revenue: 2780, quantity: 39 },
  { name: 'Product E', revenue: 1890, quantity: 10 },
];

const COLORS = ['#15803d', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

const VendorDashboard = () => {
  const { id: paramId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const vendorId = paramId || "696fad30035d4c60ea1a0975";
  
  const { getVendorDashboard, dashboardData, loading, error } = useVendor();

  useEffect(() => {
    getVendorDashboard(vendorId);
  }, [vendorId, getVendorDashboard]);

  const chartData = useMemo(() => {
    if (dashboardData?.salesPerSku && dashboardData.salesPerSku.length > 0) {
      return dashboardData.salesPerSku.map(item => ({
        name: item.productName.substring(0, 10),
        revenue: item.totalRevenue,
        quantity: item.totalQuantitySold
      }));
    }
    return INITIAL_CHART_DATA; 
  }, [dashboardData]);

  if (loading) return (
    <Box className="flex justify-center items-center min-h-screen"><CircularProgress color="success" /></Box>
  );

  return (
    <Box className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <Typography variant="h4" className="font-bold text-slate-800 mb-6">Vendor Dashboard</Typography>

      {/* Responsive Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Sales', val: `₹${(dashboardData?.totalSales || 0).toLocaleString()}`, icon: <TrendingUp />, color: '#15803d' },
          { label: 'Revenue Share', val: `₹${(dashboardData?.revenueShare || 0).toLocaleString()}`, icon: <Wallet />, color: '#2563eb' },
          { label: 'Paid Out', val: `₹${(dashboardData?.totalPaidOut || 0).toLocaleString()}`, icon: <CheckCircle />, color: '#059669' },
          { label: 'Pending Payouts', val: dashboardData?.payoutRequests?.length || 0, icon: <HourglassEmpty />, color: '#ea580c' },
        ].map((stat, i) => (
          <Card key={i} className="rounded-xl shadow-sm border-none">
            <CardContent className="flex items-center p-4">
              <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900">{stat.val}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section - Fixed Height and Responsive Flex */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Bar Chart - Revenue */}
        <Paper className="col-span-1 lg:col-span-8 p-6 rounded-xl shadow-sm border-none">
          <Typography className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <BarChartIcon /> Revenue Analysis
          </Typography>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '10px', border: 'none'}} />
                <Bar dataKey="revenue" fill="#15803d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Paper>

        {/* Pie Chart - Volume Mix - FIXED */}
        <Paper className="col-span-1 lg:col-span-4 p-6 rounded-xl shadow-sm border-none">
          <Typography className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <ShoppingBag /> Sales Mix
          </Typography>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 60 : 70}
                  outerRadius={isMobile ? 80 : 90}
                  paddingAngle={5}
                  dataKey="quantity"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Paper>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Paper className="rounded-xl shadow-sm border-none overflow-hidden">
          <div className="p-4 bg-white border-b">
            <Typography className="font-bold">Pending Payouts</Typography>
          </div>
          <CustomTable 
            columns={[
              { label: 'Amount', key: 'amount', render: (row) => `₹${row.amount.toFixed(2)}` },
              { label: 'Status', key: 'status', render: (row) => <Chip label={row.status} size="small" color="warning" /> },
              { label: 'Date', key: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleDateString() },
            ]} 
            rows={dashboardData?.payoutRequests || []} 
          />
        </Paper>

        <Paper className="rounded-xl shadow-sm border-none overflow-hidden">
          <div className="p-4 bg-white border-b">
            <Typography className="font-bold">Product Performance</Typography>
          </div>
          <CustomTable 
            columns={[
              { label: 'Product', key: 'productName' },
              { label: 'Sold', key: 'totalQuantitySold' },
              { label: 'Revenue', key: 'totalRevenue', render: (row) => `₹${row.totalRevenue.toLocaleString()}` },
            ]} 
            rows={dashboardData?.salesPerSku || []} 
          />
        </Paper>
      </div>
    </Box>
  );
};

export default VendorDashboard;