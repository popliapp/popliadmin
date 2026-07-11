import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Button,
    IconButton,
    Tooltip,
    Chip,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useDeliveryPartner } from '../../api/delivery';
import CustomTable from '../../components/CustomTable';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';
import { Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ApprovedDrivers = () => {
    const { getAllDeliveryPartners, deleteDeliveryPartner, loading, error } = useDeliveryPartner();
    const [drivers, setDrivers] = useState([]);
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
    const [driverToDelete, setDriverToDelete] = useState(null);
    const navigate = useNavigate();

    const fetchDrivers = useCallback(async () => {
        const result = await getAllDeliveryPartners();
        if (result.success) {
            const approved = result.data.filter(d => d.status === 'APPROVED');
            setDrivers(approved);
        }
    }, [getAllDeliveryPartners]);

    useEffect(() => {
        fetchDrivers();
    }, [fetchDrivers]);

    const handleEditDriver = (driverId) => {
        // Assuming you have a route like /drivers/edit/:id
        navigate(`/drivers/edit/${driverId}`);
    };

    const handleDeleteDriver = (driverId) => {
        setDriverToDelete(driverId);
        setOpenConfirmDelete(true);
    };

    const confirmDelete = async () => {
        if (driverToDelete) {
            const result = await deleteDeliveryPartner(driverToDelete);
            if (result.success) {
                fetchDrivers();
            }
            setOpenConfirmDelete(false);
            setDriverToDelete(null);
        }
    };
    
    const handleViewDriver = (driverId) => {
        navigate(`/drivers/${driverId}`);
    };


     const columns = [
            { 
                id: 'name', 
                label: 'Name', 
                render: (driver) => driver.user?.name || 'N/A' 
            },
            { 
                id: 'onlineStatus', 
                label: 'Presence', 
                render: (driver) => (
                    <Chip 
                        label={driver.status === 'AVAILABLE' ? 'ONLINE' : 'OFFLINE'} 
                        size="small"
                        variant="filled"
                        sx={{ 
                            bgcolor: driver.status === 'AVAILABLE' ? '#dcfce7' : '#f3f4f6', 
                            color: driver.status === 'AVAILABLE' ? '#15803d' : '#374151',
                            fontWeight: 'bold'
                        }}
                    />
                ) 
            },
            { 
                id: 'accountStatus', 
                label: 'Account', 
                render: (driver) => (
                    <Chip 
                        label={driver.user?.status || 'INACTIVE'} 
                        size="small"
                        color={driver.user?.status === 'ACTIVE' ? 'success' : 'error'} 
                    />
                ) 
            },
            { 
                id: 'verification', 
                label: 'Verification', 
                render: (driver) => (
                    <Typography variant="body2" sx={{ color: driver.verification?.status === 'APPROVED' ? 'green' : 'orange', fontWeight: 500 }}>
                        {driver.verification?.status}
                    </Typography>
                ) 
            },
            { 
                id: 'vehicle', 
                label: 'Vehicle Info', 
                render: (driver) => driver.vehicle ? `${driver.vehicle.model} - ${driver.vehicle.licensePlate}` : 'N/A'
            },
           
        ];

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <h1>Approved Drivers</h1>
            <CustomTable
                columns={columns}
                rows={drivers}
                actions={{ view: true, delete: true }}
                onView={(row)=>navigate(`/drivers/${row._id}`)}
                onDelete={confirmDelete}

            />
            <ConfirmDeleteDialog
                open={openConfirmDelete}
                handleClose={() => setOpenConfirmDelete(false)}
                handleConfirm={confirmDelete}
                title="Confirm Delete"
                description="Are you sure you want to delete this driver?"
            />
        </Box>
    );
};

export default ApprovedDrivers;