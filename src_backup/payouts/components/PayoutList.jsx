import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Edit as EditIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import CustomTable from "../../components/CustomTable";
import {usePayout} from "../../api/payout.js"

const PayoutList = ({ entityType = "vendors" }) => {
  const navigate = useNavigate();
  const { payouts, loading, error, fetchPayouts, updatePayoutStatus } = usePayout();
  const [editPayout, setEditPayout] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [feedback, setFeedback] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const getPayouts = useCallback(async () => {
    const { success, message } = await fetchPayouts(entityType);
    if (!success) {
      setFeedback({ open: true, message: message, severity: "error" });
    }
  }, [fetchPayouts]);

  useEffect(() => {
    getPayouts();
  }, [getPayouts]);

  const handleEdit = (payout) => {
    setEditPayout(payout);
    setOpenEditDialog(true);
  };

  const handleConfirmEdit = async () => {
    if (editPayout) {
      const { success, message } = await updatePayoutStatus(editPayout._id, {
        status: editPayout.status,
      });
      if (success) {
        setFeedback({
          open: true,
          message: "Payout status updated successfully!",
          severity: "success",
        });
        await fetchPayouts(); // Refetch
      } else {
        setFeedback({ open: true, message: message, severity: "error" });
      }
      setEditPayout(null);
    }
    setOpenEditDialog(false);
  };

  const handleCloseEditDialog = () => {
    setEditPayout(null);
    setOpenEditDialog(false);
  };

  const handleCreate = () => {
    navigate(`/admin/payouts/create`);
  };

  const handleViewHistory = (payout) => {
    let id;
    if (entityType === "vendors") {
      id = payout.vendor?._id;
    } else if (entityType === "stores") {
      id = payout.store?._id;
    } else if (entityType === "delivery-partners") {
      id = payout.deliveryPartner?._id;
    }

    if (id) {
      navigate(`/admin/payouts/history/${entityType}/${id}`);
    } else {
      setFeedback({
        open: true,
        message: "Could not find entity ID for history.",
        severity: "error",
      });
    }
  };

  const columns = [
    {
      field: "vendor",
      headerName: "Vendor",
      flex: 1,
      valueGetter: (params) => params.row.vendor?.name || "N/A",
    },
    {
      field: "amount",
      headerName: "Amount",
      flex: 1,
      valueGetter: (params) => `$${params.row.amount.toFixed(2)}`,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            display: "inline-flex",
            padding: "4px 8px",
            borderRadius: "12px",
            backgroundColor:
              params.value === "completed"
                ? "success.light"
                : params.value === "pending"
                ? "warning.light"
                : "error.light",
            color:
              params.value === "completed"
                ? "success.dark"
                : params.value === "pending"
                ? "warning.dark"
                : "error.dark",
            fontWeight: "bold",
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Date",
      flex: 1,
      valueGetter: (params) => new Date(params.row.createdAt).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit Status">
            <IconButton
              onClick={() => handleEdit(params.row)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="View History">
            <IconButton
              onClick={() => handleViewHistory(params.row)}
              color="info"
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Create Payout
        </Button>
      </Box>

      
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
          rows={payouts}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._id}
        />
      )}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Payout Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{mt: 2}}>
            <InputLabel>Status</InputLabel>
            <Select
              value={editPayout?.status || ""}
              onChange={(e) =>
                setEditPayout({ ...editPayout, status: e.target.value })
              }
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleConfirmEdit} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
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

export default PayoutList;