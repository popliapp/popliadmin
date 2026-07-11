import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Typography,
  CircularProgress,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Alert,
  Avatar,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Store,
  Phone,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  RefreshCcw,
} from "lucide-react";
import { useStore } from "../../api/store";
import { useNavigate } from "react-router-dom";
import CustomTable from "../../components/CustomTable";

const dummyStores = [
  {
    _id: "DUMMY1",
    name: "City Fresh Mart",
    phone: "+91 9876543210",
    city: "Pune",
    vendorId: { businessName: "Vendor A" },
  },
  {
    _id: "DUMMY2",
    name: "Green Basket Store",
    phone: "+91 9988776655",
    city: "Bangalore",
    vendorId: { businessName: "Vendor B" },
  },
];

const PendingStores = () => {
  const { fetchStoreByStatus, approveStore, rejectStore, loading } = useStore();
  const navigate=useNavigate();
  const [stores, setStores] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [isDummy, setIsDummy] = useState(false);

  const [rejectModal, setRejectModal] = useState({
    open: false,
    store: null,
    reason: "",
  });

  const loadStores = useCallback(async () => {
    setError(null);
    setIsDummy(false);

    const res = await fetchStoreByStatus("PENDING", 1, 20);

    if (!res?.success) {
      setError("Failed to load pending stores");
      return;
    }

    if (!res.data?.length) {
      setStores(dummyStores);
      setIsDummy(true);
      return;
    }

    setStores(res.data);
  }, [fetchStoreByStatus]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const handleApprove = async (id) => {
    if (isDummy) return;
    setBusyId(id);
    const res = await approveStore(id);
    if (res?.success) {
      setStores((prev) => prev.filter((s) => s._id !== id));
      navigate(`/stores`);
    }
    setBusyId(null);
  };

  const handleRejectSubmit = async () => {
    if (isDummy) return;
    const { store, reason } = rejectModal;
    if (!reason.trim()) return;

    setBusyId(store._id);
    const res = await rejectStore(store._id, reason);

    if (res?.success) {
      setStores((prev) => prev.filter((s) => s._id !== store._id));
    }

    setBusyId(null);
    setRejectModal({ open: false, store: null, reason: "" });
  };


  const columns = [
    {
      key: "name",
      label: "Store",
      render: (row) => (
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: "#14532d15", color: "#14532d" }}>
            <Store size={18} />
          </Avatar>
          <Typography fontWeight={700}>{row.name}</Typography>
        </Box>
      ),
    },
    {
      key: "vendor",
      label: "Vendor / Owner",
      render: (row) => (
        <Box display="flex" alignItems="center" gap={1}>
          <User size={14} />
          <Typography>
            {row.vendorId?.businessName || "Direct Register"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "phone",
      label: "Contact",
      render: (row) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Phone size={14} />
          <Typography>{row.phone || "-"}</Typography>
        </Box>
      ),
    },
    {
      key: "city",
      label: "Address",
      render: (row) => (
        <Box display="flex" alignItems="center" gap={1}>
          <MapPin size={14} />
          <Typography color="text.secondary">{row.city}</Typography>
        </Box>
      ),
    },
    {
      key: "actions",
      label: "Approval",
      render: (row) => {
        const busy = busyId === row._id;
        return (
          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="contained"
              sx={{ bgcolor: "#14532d" }}
              disabled={busy || isDummy}
              startIcon={
                busy ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <CheckCircle size={14} />
                )
              }
              onClick={() => handleApprove(row._id)}
            >
              Approve
            </Button>

            <Button
              size="small"
              variant="outlined"
              color="error"
              disabled={busy || isDummy}
              startIcon={<XCircle size={14} />}
              onClick={() =>
                setRejectModal({ open: true, store: row, reason: "" })
              }
            >
              Reject
            </Button>
          </Box>
        );
      },
    },
  ];

  if (loading && !stores.length) {
    return (
      <Box textAlign="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Pending Store Approvals
          </Typography>
          <Typography color="text.secondary">
            Review store registrations
          </Typography>
        </Box>

        <Tooltip title="Refresh">
          <IconButton onClick={loadStores}>
            <RefreshCcw size={18} />
          </IconButton>
        </Tooltip>
      </Box>

      {isDummy && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Preview Mode — no pending stores from backend
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <CustomTable
        columns={columns}
        rows={stores}
        actions={{ view: true }}
        onView={(row) => navigate(`/store/${row._id}`)}
      />

      <Dialog
        open={rejectModal.open}
        onClose={() =>
          setRejectModal({ open: false, store: null, reason: "" })
        }
      >
        <DialogTitle fontWeight={800}>Reject Store</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Reason for rejecting <strong>{rejectModal.store?.name}</strong>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={rejectModal.reason}
            onChange={(e) =>
              setRejectModal((m) => ({ ...m, reason: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setRejectModal({ open: false, store: null, reason: "" })
            }
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!rejectModal.reason.trim()}
            onClick={handleRejectSubmit}
          >
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingStores;
