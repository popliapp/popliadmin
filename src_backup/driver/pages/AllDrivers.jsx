import React, { useEffect, useState, useCallback } from 'react';
import { useDeliveryPartner } from '../../api/delivery';
import CustomTable from '../../components/CustomTable';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';
import {
    Box,
    Button,
    CircularProgress,
    Typography,
    Alert,
    Chip,
    Tooltip,
    IconButton
} from '@mui/material';
import { Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AllDrivers = () => {
    const { getAllDeliveryPartners, deleteDeliveryPartner, loading, error } = useDeliveryPartner();
    const [drivers, setDrivers] = useState([]);
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
    const [driverToDelete, setDriverToDelete] = useState(null);
    const navigate = useNavigate();

    const fetchDrivers = useCallback(async () => {
        const result = await getAllDeliveryPartners();
        if (result.success) {
            setDrivers(result.data);
        }
    }, [getAllDeliveryPartners]);

    useEffect(() => {
        fetchDrivers();
    }, [fetchDrivers]);

    const confirmDelete = async () => {
        if(driverToDelete) {
            const result = await deleteDeliveryPartner(driverToDelete);
            if (result.success) fetchDrivers();
            setOpenConfirmDelete(false);
            setDriverToDelete(null);
        }
    };

    const allDriversColumns = [
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

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a202c' }}>Delivery Management</Typography>
                <Button 
                    variant="contained" 
                    sx={{ bgcolor: '#15803d', '&:hover': { bgcolor: '#166534' } }}
                    onClick={() => navigate('/drivers/create')}
                >
                    Add Driver
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            
            {loading && drivers.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
            ) : (
                <CustomTable
                    columns={allDriversColumns}
                    rows={drivers}
                    actions={{ view: true, delete: true }}
                    onView={(row)=>navigate(`/drivers/${row._id}`)}
                    onDelete={confirmDelete}
                />
            )}

            <ConfirmDeleteDialog
                open={openConfirmDelete}
                handleClose={() => setOpenConfirmDelete(false)}
                handleConfirm={confirmDelete}
                title="Delete Driver"
                description="This will permanently remove the delivery partner from the system."
            />
        </Box>
    );
};

export default AllDrivers;