import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography, CircularProgress, Alert, IconButton, Tooltip } from "@mui/material";
import { Store, Phone, MapPin, User, RefreshCcw } from "lucide-react";
import CustomTable from "../../components/CustomTable";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import { useStore } from "../../api/store";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const dummyStores = [
  {
    _id: "DUMMY1",
    name: "City Fresh Mart",
    phone: "+91 9876543210",
    address: "MG Road, Pune",
    vendorId: { businessName: "Vendor A", _id: "V1" },
  },
  {
    _id: "DUMMY2",
    name: "Green Basket Store",
    phone: "+91 9988776655",
    address: "Koramangala, Bangalore",
    vendorId: { businessName: "Vendor B", _id: "V2" },
  },
];

const ActiveStoreList = () => {
	const navigate=useNavigate()
  const { fetchStoreByStatus, deleteStore, loading } = useStore();
  const [stores, setStores] = useState([]);
  const [error, setError] = useState(null);
  const [deleteStoreId, setDeleteStoreId] = useState(null);
  const [isDummy, setIsDummy] = useState(false);

  const loadStores = useCallback(async () => {
    setError(null);
    setIsDummy(false);

    const res = await fetchStoreByStatus("ACTIVE", 1, 20);
    if (!res?.success) {
      setError("Failed to load active stores");
      return;
    }

    if (!Array.isArray(res.data) || res.data.length === 0) {
      setStores(dummyStores);
      setIsDummy(true);
      return;
    }

    setStores(res.data);
  }, [fetchStoreByStatus]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const handleDelete = (store) => {
    setDeleteStoreId(store._id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteStoreId) return;

    const res = await deleteStore(deleteStoreId);
    if (res.success) {
      toast.success("Store deleted successfully");
      await loadStores();
    } else {
      toast.error(res.message || "Failed to delete store");
    }
    setDeleteStoreId(null);
  };

  const handleView = (store) => {
    navigate(`/store/${store._id}`);
  };

  const columns = [
    {
      id: "name",
      label: "Store Name",
      render: (row) => (
        <Box className="flex items-center gap-2">
          <Store size={20} className="text-green-800" />
          <Typography className="font-semibold">{row.name}</Typography>
        </Box>
      ),
    },
    {
      id: "vendor",
      label: "Vendor / Owner",
      render: (row) => (
        <Box className="flex items-center gap-1">
          <User size={14} className="text-gray-500" />
          <Typography>{row.vendorId?.businessName || "Direct Register"}</Typography>
        </Box>
      ),
    },
    {
      id: "contact",
      label: "Phone",
      render: (row) => (
        <Box className="flex items-center gap-1">
          <Phone size={14} className="text-gray-500" />
          <Typography>{row?.vendor?.user?.phone || "N/A"}</Typography>
        </Box>
      ),
    },
    {
      id: "address",
      label: "Address",
      render: (row) => (
        <Box className="flex items-start gap-1">
          <MapPin size={14} className="text-red-500 mt-0.5" />
          <Typography>{row.address || row.city || "N/A"}</Typography>
        </Box>
      ),
    },
    {
      id: "status",
      label: "Status",
      render: (row) => (
        <Typography
          className={`font-semibold ${
            row.status === "ACTIVE" ? "text-green-700" : "text-gray-500"
          }`}
        >
          {row.status || "N/A"}
        </Typography>
      ),
    },
    
  ];

  if (loading && stores.length === 0) {
    return (
      <Box className="flex flex-col items-center py-10">
        <CircularProgress className="text-green-800" />
        <Typography className="mt-2 text-gray-500 text-sm">Loading active stores...</Typography>
      </Box>
    );
  }

  return (
    <Box className="p-6 bg-gray-50 min-h-screen">
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h5" className="font-bold text-gray-900">
          Active Stores
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={loadStores} className="bg-white shadow">
            <RefreshCcw size={20} className="text-green-800" />
          </IconButton>
        </Tooltip>
      </Box>

      {isDummy && (
        <Alert severity="info" className="mb-3 rounded-lg border border-blue-200">
          Showing <strong>Preview Mode</strong>. No active stores from backend.
        </Alert>
      )}

      {error && (
        <Alert severity="error" className="mb-3" action={
          <Button color="inherit" size="small" onClick={loadStores}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      )}

      <CustomTable
        columns={columns}
        rows={stores}
        actions={{ view: true, delete: true }}
        onView={handleView}
        onDelete={handleDelete}
      />

      <ConfirmDeleteDialog
        open={!!deleteStoreId}
        onClose={() => setDeleteStoreId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Store"
        description="Are you sure you want to delete this store? This action cannot be undone."
        loading={loading}
      />
    </Box>
  );
};

export default ActiveStoreList;
