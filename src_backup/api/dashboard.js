import { useState, useEffect } from 'react';

const useDashboardData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simulate API Network Delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock Data - In a real app, replace this with:
        // const response = await api.get('/dashboard');
        // const dummyData = response.data;
        
        const dummyData = {
          stats: {
            liveOrders: { value: "142", trend: "+12%" },
            totalSales: { value: "₹45,200", trend: "+5.4%" },
            deliverySLA: { value: "98.2%", trend: "Stable" },
            activeFleet: { value: "24/30", trend: "High Load" }
          },
          chartData: [
            { time: '10am', orders: 12 }, 
            { time: '11am', orders: 18 },
            { time: '12pm', orders: 45 }, 
            { time: '1pm', orders: 30 },
            { time: '2pm', orders: 55 }, 
            { time: '3pm', orders: 48 },
          ],
          alerts: [
            { id: "#ORD-9921", time: "4m left", status: "Critical", color: "bg-red-100 text-red-700" },
            { id: "#ORD-9925", time: "12m left", status: "Warning", color: "bg-orange-100 text-orange-700" },
            { id: "#ORD-9928", time: "22m left", status: "Pending", color: "bg-blue-100 text-blue-700" }
          ]
        };

        setData(dummyData);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { data, loading, error };
};

export { useDashboardData};