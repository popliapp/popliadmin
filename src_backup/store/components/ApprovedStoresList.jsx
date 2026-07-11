import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, CircularProgress, Alert, IconButton, Button, Paper, Tooltip
} from "@mui/material";
import { Store,RefreshCcw } from "lucide-react";

import CustomTable from "../../components/CustomTable";
import ConfirmDeleteDialog  from "../../components/ConfirmDeleteDialog";
import { useStore } from "../../api/store";
import { useNavigate } from "react-router-dom";


const dummyStores = [
  { _id: "D1", name: "City Fresh Mart", phone: "+91 9876543210", address: "MG Road, Pune", vendorId: { businessName: "Vendor A", _id: "V1" } },
  { _id: "D2", name: "Green Basket Store", phone: "+91 9988776655", address: "Koramangala, Bangalore", vendorId: { businessName: "Vendor B", _id: "V2" } },
];

const ApprovedStoresList = () => {
  const { fetchStoreByStatus, loading } = useStore();
  const navigate=useNavigate()

  const [stores, setStores] = useState([]);
  const [error, setError] = useState(null);
  const [isDummy, setIsDummy] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ open: false, target: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadStores = useCallback(async () => {
    setError(null); 
    setIsDummy(false);

    const res = await fetchStoreByStatus("APPROVED", 1, 20);

    if (!res?.success) {
      setError("Failed to load approved stores");
      return;
    }

    if (!Array.isArray(res.data) || res.data.length === 0) {
      setStores(dummyStores);
      setIsDummy(true);
      return;
    }

    setStores(res.data);
  }, [fetchStoreByStatus]);

  useEffect(() => { loadStores(); }, [loadStores]);

  const handleView = (row) => {
	navigate(`/store/${row._id}`)
  }
  const handleEdit = (row) => {
	navigate(`/admin-edit-store/${row._id}`)
  }

  const handleDeleteClick = (row) => {
    setDeleteModal({ open: true, target: row });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.target) return;

    setDeleteLoading(true);

    console.log("DELETE:", deleteModal.target);

    setStores(prev => prev.filter(s => s._id !== deleteModal.target._id));

    setDeleteLoading(false);
    setDeleteModal({ open: false, target: null });
  };

  const handleDeleteClose = () => {
    if (!deleteLoading) {
      setDeleteModal({ open: false, target: null });
    }
  };

  const columns = [
    {
      key: "name",
      label: "Store Name", 
      render: (row) => (
        <Box className="flex items-center gap-2">
          <Store size={20} className="text-green-800" />
          <Typography className="font-semibold">{row?.name}</Typography>
        </Box>
      ),

    },
    {
      key: "vendor",
      label: "Vendor",
      render: (row) => row.vendor?.user?.name || "Direct Register",
    },
    { key: "phone", label: "Contact" ,render:(row)=> row.vendor?.user?.phone },
    {
      key: "address",
      label: "Address",
      render: (row) => (
        <Typography variant="body2" color="text.secondary">{row.address}</Typography>
      ),
    },
  ];

  if (loading && stores.length === 0) {
    return (
      <Box py={10} textAlign="center">
        <CircularProgress />
        <Typography mt={2}>Fetching stores…</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Approved Stores</Typography>
          <Typography variant="body2" color="text.secondary">
            List of active store profiles
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={loadStores}><RefreshCcw size={20} /></IconButton>
        </Tooltip>
      </Box>

      {isDummy && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Showing preview mode — backend returned no data.
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={<Button onClick={loadStores}>Retry</Button>}
        >
          {error}
        </Alert>
      )}

      <Paper elevation={0}>
        <CustomTable
          columns={columns}
          rows={stores}
          actions={{ view: true, delete: true }}
          onView={handleView}
          // onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </Paper>

      <ConfirmDeleteDialog
        open={deleteModal.open}
        title="Delete Store"
        description={`Are you sure you want to delete "${deleteModal.target?.name}"?`}
        loading={deleteLoading}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
};

export default ApprovedStoresList;
