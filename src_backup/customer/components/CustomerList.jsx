import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Chip from "@mui/material/Chip";

import CustomTable from "../../components/CustomTable";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import { useCustomer } from "../../api/customer";

const CustomerList = () => {
  const navigate = useNavigate();
  const { customers, loading, error, getAllCustomers, deleteCustomer, blockUnblockCustomer } = useCustomer();
  const [deleteId, setDeleteId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [feedback, setFeedback] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const fetchCustomers = useCallback(async () => {
    const { success, message } = await getAllCustomers();
    if (!success) {
      setFeedback({ open: true, message: message, severity: "error" });
    }
  }, [getAllCustomers]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };


  const handleConfirmDelete = async () => {
    if (deleteId) {
      const { success, message } = await deleteCustomer(deleteId);
      if (success) {
        setFeedback({
          open: true,
          message: "Customer deleted successfully!",
          severity: "success",
        });
        await fetchCustomers(); // Refetch
      } else {
        setFeedback({ open: true, message: message, severity: "error" });
      }
      setDeleteId(null);
    }
    setOpenDeleteDialog(false);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteId(null);
    setOpenDeleteDialog(false);
  };

  const handleBlockUnblock = async (id) => {
    console.log("Block/Unblock Customer ID:", id)
  if (!id || loading) return;

  const result = await blockUnblockCustomer(id);
  await fetchCustomers();

  if (!result.success) {
    console.error(result.message);
  }
};

  
  

 const columns = [
  {
    key: "name",
    label: "Name",
    render: (row) => row.user?.name ?? "N/A",
  },
  {
    key: "email",
    label: "Email",
    render: (row) => row.user?.email ?? "N/A",
  },
  {
    key: "phone",
    label: "Phone",
    render: (row) => row.user?.phone ?? "N/A",
  },
  {
    key: "address",
    label: "Address",
    render: (row) => row.defaultAddress?.addressLine1 ?? "N/A",
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <Chip
        size="small"
        label={row.user?.status === "ACTIVE" ? "Active" : "Inactive"}
        color={row.user?.status === "ACTIVE" ? "success" : "error"}
      />
    ),
  },
  {
    key: "isBlocked",
    label: "Blocked status",
    render: (row) => (

       <Chip
        size="small"
        label={row.user?.isBlocked ? "Blocked" : "Unblocked"}
        color={row.user?.isBlocked ? "error" : ""}
      />
  
    ),
  },
];


  return (
    <Box sx={{ p: 3 }}>
       
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
         <CustomTable
          rows={customers}
          columns={columns}
          actions={{ view: true, delete: true,isBlock:true }}
          onView={(row)=>navigate(`/admin/customers/details/${row._id}`)}
          onDelete={(row) => handleDelete(row._id)}
          onBlock={(row) => handleBlockUnblock(row._id)}
  />
      )}
      <ConfirmDeleteDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        description="Are you sure you want to delete this customer? This action cannot be undone."
      />
      {feedback.open && (
        <Alert
          onClose={() => setFeedback({ ...feedback, open: false })}
          severity={feedback.severity}
          sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1400 }}
        >
          {feedback.message}
        </Alert>
      )}
    </Box>
  );
};

export default CustomerList;