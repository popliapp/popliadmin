import { useState, useEffect } from "react";
import { useOrders } from "../../api/order";
import CustomTable from "../../components/CustomTable";
import OrderStatusFilter from "../../orders/components/OrderStatusFilter";
import { useNavigate } from "react-router-dom";

export default function OrderStatusList() {
  const { orders, loading, fetchOrders, fetchOrdersByStatus } = useOrders();
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (status) {
      fetchOrdersByStatus(status);
    } else {
      fetchOrders();
    }
  }, [status, fetchOrders, fetchOrdersByStatus]);

  const columns = [
    { key: "customer", label: "Customer", render: row => row.customer?.name },
    { key: "store", label: "Store", render: row => row.store?.name },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created", render: row => new Date(row.createdAt).toLocaleString() },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <OrderStatusFilter value={status} onChange={setStatus} />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <CustomTable
          columns={columns}
          rows={orders}
          actions={{ view: true }}
          onView={(row) => navigate(`/order/${row._id}`)}
        />
      )}
    </div>
  );
}
