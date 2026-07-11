import React, { useEffect, useState } from 'react';
import { useDeliveryPartner } from '../../api/delivery';
import {
    Button,
    CircularProgress,
    Alert,
    TextField,
    Typography,
    Box,
    Paper
} from '@mui/material';

const DriverForm = ({ handleClose, selectedDriver, refreshDrivers }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '',
        vehicle: { model: '', licensePlate: '', color: '' },
    });
    const [documents, setDocuments] = useState({
        LICENSE: null,
        ID_CARD: null,
    });
    const { createDeliveryPartner, updateDeliveryPartner, loading, error } = useDeliveryPartner();

    useEffect(() => {
        if (selectedDriver) {
            setFormData({
                name: selectedDriver.user.name || '',
                email: selectedDriver.user.email || '',
                phone: selectedDriver.user.phone || '',
                password: '',
                vehicle: {
                    model: selectedDriver.vehicle.model || '',
                    licensePlate: selectedDriver.vehicle.licensePlate || '',
                    color: selectedDriver.vehicle.color || ''
                },
            });
            // Note: We don't pre-fill file inputs for editing.
            // The user can upload new documents to replace existing ones.
            setDocuments({ LICENSE: null, ID_CARD: null });
        } else {
            setFormData({
                name: '', email: '', phone: '', password: '',
                vehicle: { model: '', licensePlate: '', color: '' },
            });
            setDocuments({ LICENSE: null, ID_CARD: null });
        }
    }, [selectedDriver]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('vehicle.')) {
            setFormData(prev => ({
                ...prev,
                vehicle: {
                    ...prev.vehicle,
                    [name.split('.')[1]]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDocumentChange = (e) => {
        const { name, files } = e.target;
        if (files[0]) {
            setDocuments(prev => ({
                ...prev,
                [name]: files[0]
            }));
        }
    };

    const handleSubmit = async () => {
        const submissionData = new FormData();

        // Append user and vehicle data
        submissionData.append('name', formData.name);
        submissionData.append('email', formData.email);
        submissionData.append('phone', formData.phone);
        if (formData.password) {
            submissionData.append('password', formData.password);
        }
        submissionData.append('vehicle', JSON.stringify(formData.vehicle));
        
        // Append documents
        if (documents.LICENSE) {
            submissionData.append('documents', documents.LICENSE, 'LICENSE');
        }
        if (documents.ID_CARD) {
            submissionData.append('documents', documents.ID_CARD, 'ID_CARD');
        }

        let result;
        if (selectedDriver) {
            result = await updateDeliveryPartner(selectedDriver._id, submissionData);
        } else {
            result = await createDeliveryPartner(submissionData);
        }

        if (result.success) {
            if (refreshDrivers) refreshDrivers();
            handleClose();
        } else {
            console.error("Form submission error:", result.message);
        }
    };

    return (
        <Paper sx={{ p: 3, border: '1px solid #ddd' }}>
            <Typography variant="h5" gutterBottom>{selectedDriver ? 'Edit Driver' : 'Add New Driver'}</Typography>
            <Box component="form" noValidate autoComplete="off">
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <TextField autoFocus margin="dense" name="name" label="Name" type="text" fullWidth variant="outlined" value={formData.name} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField margin="dense" name="email" label="Email Address" type="email" fullWidth variant="outlined" value={formData.email} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField margin="dense" name="phone" label="Phone Number" type="text" fullWidth variant="outlined" value={formData.phone} onChange={handleChange} sx={{ mb: 2 }} />
                {!selectedDriver && (
                    <TextField margin="dense" name="password" label="Password" type="password" fullWidth variant="outlined" value={formData.password} onChange={handleChange} sx={{ mb: 2 }} />
                )}

                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Vehicle Details</Typography>
                <TextField margin="dense" name="vehicle.model" label="Vehicle Model" type="text" fullWidth variant="outlined" value={formData.vehicle.model} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField margin="dense" name="vehicle.licensePlate" label="License Plate" type="text" fullWidth variant="outlined" value={formData.vehicle.licensePlate} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField margin="dense" name="vehicle.color" label="Vehicle Color" type="text" fullWidth variant="outlined" value={formData.vehicle.color} onChange={handleChange} sx={{ mb: 2 }} />
                
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Documents</Typography>
                <Box sx={{ mb: 2 }}>
                    <Typography component="label" htmlFor="LICENSE" sx={{ display: 'block', mb: 1 }}>License</Typography>
                    <TextField 
                        id="LICENSE" 
                        name="LICENSE" 
                        type="file" 
                        fullWidth 
                        variant="outlined" 
                        onChange={handleDocumentChange}
                        // To show the file name, we can use a helper text
                        helperText={documents.LICENSE ? documents.LICENSE.name : "Upload License"}
                    />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <Typography component="label" htmlFor="ID_CARD" sx={{ display: 'block', mb: 1 }}>ID Card</Typography>
                    <TextField 
                        id="ID_CARD" 
                        name="ID_CARD" 
                        type="file" 
                        fullWidth 
                        variant="outlined" 
                        onChange={handleDocumentChange} 
                        helperText={documents.ID_CARD ? documents.ID_CARD.name : "Upload ID Card"}
                    />
                </Box>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleClose} sx={{ mr: 1 }}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : (selectedDriver ? 'Update' : 'Add')}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default DriverForm;