import React, { useState } from 'react';
import DriverForm from '../components/DriverForm';
import {
    Box,
    Typography,
    Paper,
    Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';


const CreateDriver = () => {
    const navigate = useNavigate();
    // The form is now controlled by a page-level trigger, not a dialog state.
    // We can simulate the 'open' state by simply being on this page.
    // The 'handleClose' will now navigate back or to a different page.

    const handleFormClose = () => {
        // Navigate to the drivers list or dashboard after creation/cancel
        navigate('/drivers'); 
    };

    return (
        <Paper sx={{ p: 4, margin: 2 }}>
            <Typography variant="h4" gutterBottom>Create a New Driver</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
                Fill in the details below to add a new driver. Documents uploaded will be marked as pending for self-registered drivers, but admin-created drivers are automatically verified.
            </Typography>
            
            {/* 
              The DriverForm is used here directly.
              It's not in a Dialog, so we pass `open={true}` to keep its internal logic working.
              The `handleClose` is repurposed to navigate away.
              `selectedDriver` is null because we are creating a new one.
              `refreshDrivers` can be omitted or replaced with a function that gives a success message.
            */}
            <DriverForm 
                open={true} // Keep the form content visible
                handleClose={handleFormClose} // On cancel or success, this function is called
                selectedDriver={null} // We are not editing
                refreshDrivers={() => {
                    console.log("Driver created, navigating away.");
                    // The navigation is handled in handleClose, so this can be a simple notification if needed
                }} 
            />
        </Paper>
    );
};

export default CreateDriver;