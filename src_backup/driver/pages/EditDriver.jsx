import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeliveryPartner } from '../../api/delivery';
import DriverForm from '../components/DriverForm';
import { CircularProgress, Alert, Box, Typography } from '@mui/material';

const EditDriver = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getDeliveryPartnerById, loading, error } = useDeliveryPartner();
    const [driver, setDriver] = useState(null);

    useEffect(() => {
        const fetchDriver = async () => {
            const result = await getDeliveryPartnerById(id);
            if (result.success) {
                setDriver(result.data);
            } else {
                // Handle error, maybe navigate back or show a message
                console.error(result.message);
            }
        };

        if (id) {
            fetchDriver();
        }
    }, [id, getDeliveryPartnerById]);

    const handleClose = () => {
        navigate('/drivers/approved'); // Navigate back to the list after closing
    };
    
    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!driver) return <Alert severity="info">Driver not found.</Alert>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Edit Driver</Typography>
            <DriverForm
                selectedDriver={driver}
                handleClose={handleClose}
                refreshDrivers={() => {}} // No need to refresh here, we are navigating away
            />
        </Box>
    );
};

export default EditDriver;
