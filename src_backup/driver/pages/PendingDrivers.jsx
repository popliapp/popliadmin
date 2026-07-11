import React, { useEffect, useState, useCallback } from 'react';
import { useDeliveryPartner } from '../../api/delivery';
import CustomTable from '../../components/CustomTable';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack
} from '@mui/material';
import { useNavigate } from "react-router-dom";

const PendingDrivers = () => {
  const navigate = useNavigate();
  const {
    getPendingDeliveryPartners,
    approveDeliveryPartner,
    rejectDeliveryPartner,
    loading,
    error
  } = useDeliveryPartner();

  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [busy, setBusy] = useState(null);

  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [driverToReject, setDriverToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchPendingDrivers = useCallback(async () => {
    const result = await getPendingDeliveryPartners();
    if (result.success) setPendingDrivers(result.data);
  }, [getPendingDeliveryPartners]);

  useEffect(() => {
    fetchPendingDrivers();
  }, [fetchPendingDrivers]);

  const handleApprove = async (id) => {
    setBusy(id);
    const res = await approveDeliveryPartner(id);
    if (res.success) {
      setPendingDrivers(prev => prev.filter(d => d._id !== id)); 
    }
    setBusy(null);
  };

  const handleRejectOpen = (id) => {
    setDriverToReject(id);
    setOpenRejectDialog(true);
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) return;
    const id = driverToReject;
    setBusy(id);

    const res = await rejectDeliveryPartner(id, rejectionReason);
    if (res.success) {
      setPendingDrivers(prev => prev.filter(d => d._id !== id));
      setOpenRejectDialog(false);
      setRejectionReason('');
      setDriverToReject(null);
    }
    setBusy(null);
  };

  const pendingDriversColumns = [
    {
      id: 'name',
      label: 'Name',
      render: d => d.user?.name || 'N/A',
    },
    {
      id: 'presence',
      label: 'Presence',
      render: d => (
        <Chip
          label={d.status === 'AVAILABLE' ? 'ONLINE' : 'OFFLINE'}
          size="small"
          sx={{
            bgcolor: d.status === 'AVAILABLE' ? '#dcfce7' : '#f3f4f6',
            color: d.status === 'AVAILABLE' ? '#15803d' : '#374151',
            fontWeight: 'bold'
          }}
        />
      )
    },
    {
      id: 'account',
      label: 'Account',
      render: d => (
        <Chip
          label={d.user?.status || 'INACTIVE'}
          size="small"
          color={d.user?.status === 'ACTIVE' ? 'success' : 'error'}
        />
      )
    },
    {
      id: 'verification',
      label: 'Verification',
      render: d => (
        <Chip
          label={d.verification?.status}
          size="small"
          color="warning"
        />
      )
    },
    {
      id: 'vehicle',
      label: 'Vehicle Info',
      render: d => d.vehicle ? `${d.vehicle.model} - ${d.vehicle.licensePlate}` : 'N/A'
    },
    {
      id: 'actions',
      label: 'Approve or Reject',
      render: d => {
        const id = d._id;
        return (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              color="success"
              disabled={busy === id}
              onClick={() => handleApprove(id)}
            >
              {busy === id ? <CircularProgress size={16} color="inherit" /> : 'Approve'}
            </Button>

            <Button
              size="small"
              variant="outlined"
              color="error"
              disabled={busy === id}
              onClick={() => handleRejectOpen(id)}
            >
              Reject
            </Button>

          </Stack>
        );
      }
    }
  ];

  if (loading && pendingDrivers.length === 0) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Pending Verification Drivers</Typography>
      {error && <Alert severity="error">{error}</Alert>}

      {pendingDrivers.length > 0 ? (
      <CustomTable 
       columns={pendingDriversColumns}
       rows={pendingDrivers}
        actions={{ view: true, }} 
        onView={(row)=>navigate(`/drivers/${row._id}`)} />
      ) : (
        <Alert severity="info">No drivers currently pending verification.</Alert>
      )}

      {/* Reject Dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
        <DialogTitle>Reject Driver</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection"
            fullWidth
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmReject}
            disabled={!rejectionReason.trim() || busy !== null}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingDrivers;
