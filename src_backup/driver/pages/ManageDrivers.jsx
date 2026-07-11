import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Button,
    IconButton,
    Tooltip,
    Chip,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Typography
} from '@mui/material';
import { useDeliveryPartner } from '../../api/delivery';
import CustomTable from '../../components/CustomTable';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import DriverForm from '../components/DriverForm';

const ManageDrivers = () => {
    const {
        getAllDeliveryPartners,
        deleteDeliveryPartner,
        getPendingDeliveryPartners,
        approveDeliveryPartner,
        rejectDeliveryPartner,
        loading,
        error
    } = useDeliveryPartner();

    const [allDrivers, setAllDrivers] = useState([]);
    const [pendingDrivers, setPendingDrivers] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
    const [driverToDelete, setDriverToDelete] = useState(null);
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [driverToReject, setDriverToReject] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchDrivers = useCallback(async () => {
        const allResult = await getAllDeliveryPartners();
        if (allResult.success) {
            setAllDrivers(allResult.data);
        }
        const pendingResult = await getPendingDeliveryPartners();
        if (pendingResult.success) {
            setPendingDrivers(pendingResult.data);
        }
    }, [getAllDeliveryPartners, getPendingDeliveryPartners]);

    useEffect(() => {
        fetchDrivers();
    }, [fetchDrivers]);

    const handleAddDriver = () => {
        setSelectedDriver(null);
        setOpenForm(true);
    };

    const handleEditDriver = (driver) => {
        setSelectedDriver(driver);
        setOpenForm(true);
    };

    const handleDeleteDriver = (driverId) => {
        setDriverToDelete(driverId);
        setOpenConfirmDelete(true);
    };

    const confirmDelete = async () => {
        const result = await deleteDeliveryPartner(driverToDelete);
        if (result.success) {
            fetchDrivers();
            setOpenConfirmDelete(false);
            setDriverToDelete(null);
        }
    };

    const handleApproveDriver = async (userId) => {
        const result = await approveDeliveryPartner(userId);
        if (result.success) {
            fetchDrivers();
        }
    };

    const handleRejectDriver = (userId) => {
        setDriverToReject(userId);
        setOpenRejectDialog(true);
    };

    const confirmReject = async () => {
        if (!rejectionReason) {
            alert('Rejection reason is required!');
            return;
        }
        const result = await rejectDeliveryPartner(driverToReject, rejectionReason);
        if (result.success) {
            fetchDrivers();
            setOpenRejectDialog(false);
            setDriverToReject(null);
            setRejectionReason('');
        }
    };

    const handleViewDocuments = (documents) => {
        if (documents && documents.length > 0) {
            alert(
                `Driver Documents:\n${documents.map(doc => `- Type: ${doc.type}, URL: ${doc.url}, Status: ${doc.status}`).join('\n')}`
            );
        } else {
            alert('No documents available for this driver.');
        }
    };

    const allDriversColumns = [
        { id: 'name', label: 'Name', render: (driver) => driver.user.name },
        { id: 'email', label: 'Email', render: (driver) => driver.user.email },
        { id: 'phone', label: 'Phone', render: (driver) => driver.user.phone },
        { id: 'status', label: 'Account Status', render: (driver) => <Chip label={driver.user.status} color={driver.user.status === 'ACTIVE' ? 'success' : driver.user.status === 'PENDING' ? 'warning' : 'error'} /> },
        { id: 'dpStatus', label: 'DP Status', render: (driver) => driver.status },
        { id: 'vehicleModel', label: 'Vehicle Model', render: (driver) => driver.vehicle.model },
        { id: 'licensePlate', label: 'License Plate', render: (driver) => driver.vehicle.licensePlate },
        { id: 'actions', label: 'Actions', render: (driver) => (
            <Box>
                <Tooltip title="View Documents">
                    <IconButton onClick={() => handleViewDocuments(driver.user.documents)}>
                        <VisibilityIcon />
                    </IconButton>
                </Tooltip>
                <Button variant="outlined" size="small" onClick={() => handleEditDriver(driver)}>Edit</Button>
                <Button variant="outlined" size="small" color="error" sx={{ ml: 1 }} onClick={() => handleDeleteDriver(driver._id)}>Delete</Button>
            </Box>
        )}
    ];

    const pendingDriversColumns = [
        { id: 'name', label: 'Name', render: (user) => user.name },
        { id: 'email', label: 'Email', render: (user) => user.email },
        { id: 'phone', label: 'Phone', render: (user) => user.phone },
        { id: 'status', label: 'Account Status', render: (user) => <Chip label={user.status} color="warning" /> },
        { id: 'documents', label: 'Documents', render: (user) => (
            <Tooltip title="View Documents">
                <IconButton onClick={() => handleViewDocuments(user.documents)}>
                    <VisibilityIcon />
                </IconButton>
            </Tooltip>
        )},
        { id: 'rejectionReason', label: 'Rejection Reason', render: (user) => user.rejectionReason || 'N/A' },
        { id: 'actions', label: 'Actions', render: (user) => (
            <Box>
                <Button variant="contained" size="small" color="success" onClick={() => handleApproveDriver(user._id)}>Approve</Button>
                <Button variant="contained" size="small" color="error" sx={{ ml: 1 }} onClick={() => handleRejectDriver(user._id)}>Reject</Button>
            </Box>
        )}
    ];

    if (loading && allDrivers.length === 0 && pendingDrivers.length === 0) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Driver Management</Typography>
            
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Pending Verification Drivers</Typography>
            {pendingDrivers.length > 0 ? (
                <CustomTable
                    columns={pendingDriversColumns}
                    data={pendingDrivers}
                    uniqueKey="_id"
                />
            ) : (
                <Alert severity="info">No drivers currently pending verification.</Alert>
            )}

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>All Registered Drivers</Typography>
            <Button variant="contained" onClick={handleAddDriver} sx={{ mb: 2 }}>Add New Driver</Button>
            {error && <Alert severity="error">{error}</Alert>}
            
            {allDrivers.length > 0 ? (
                <CustomTable
                    columns={allDriversColumns}
                    data={allDrivers}
                    uniqueKey="_id"
                />
            ) : (
                <Alert severity="info">No registered drivers found.</Alert>
            )}


            <DriverForm
                open={openForm}
                handleClose={() => setOpenForm(false)}
                selectedDriver={selectedDriver}
                refreshDrivers={fetchDrivers}
            />

            <ConfirmDeleteDialog
                open={openConfirmDelete}
                handleClose={() => setOpenConfirmDelete(false)}
                handleConfirm={confirmDelete}
                title="Confirm Driver Deletion"
                description="Are you sure you want to delete this driver? This action cannot be undone."
            />

            <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
                <DialogTitle>Reject Driver</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Reason for Rejection"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
                    <Button onClick={confirmReject} disabled={loading || !rejectionReason}>Reject</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManageDrivers;