import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDeliveryPartner } from '../../api/delivery';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Grid,
    Chip,
    Link as MuiLink,
} from '@mui/material';

const DriverDetails = () => {
    const { id } = useParams(); // This 'id' is the deliveryPartnerId
    const { getDeliveryPartnerById, loading, error } = useDeliveryPartner();
    const [driverDetails, setDriverDetails] = useState(null);

    useEffect(() => {
        const fetchDriverDetails = async () => {
            if (id) {
                const result = await getDeliveryPartnerById(id);
                if (result.success) {
                    setDriverDetails(result.data);
                }
            }
        };
        fetchDriverDetails();
    }, [id, getDeliveryPartnerById]);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!driverDetails) {
        return <Alert severity="info">No driver details found.</Alert>;
    }

    const { user, vehicle, status: dpStatus, currentLocation, assignedOrder } = driverDetails;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Driver Details: {user?.name}</Typography>
            
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Personal Information</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1">Name:</Typography>
                            <Typography variant="body1">{user?.name}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1">Email:</Typography>
                            <Typography variant="body1">{user?.email}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1">Phone:</Typography>
                            <Typography variant="body1">{user?.phone}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1">Account Status:</Typography>
                            <Chip 
                                label={user?.status} 
                                color={user?.status === 'ACTIVE' ? 'success' : user?.status === 'PENDING' ? 'warning' : 'error'} 
                            />
                        </Grid>
                        {user?.rejectionReason && (
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" color="error">Rejection Reason:</Typography>
                                <Typography variant="body1" color="error">{user.rejectionReason}</Typography>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Vehicle Information</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1">Model:</Typography>
                            <Typography variant="body1">{vehicle?.model}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1">License Plate:</Typography>
                            <Typography variant="body1">{vehicle?.licensePlate}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1">Color:</Typography>
                            <Typography variant="body1">{vehicle?.color}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Delivery Partner Status</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1">Current Status:</Typography>
                            <Chip label={dpStatus} color={dpStatus === 'AVAILABLE' ? 'success' : dpStatus === 'BUSY' ? 'info' : 'default'} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1">Assigned Order:</Typography>
                            <Typography variant="body1">{assignedOrder ? assignedOrder : 'N/A'}</Typography> {/* Link to order details if available */}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1">Current Location:</Typography>
                            <Typography variant="body1">
                                {currentLocation && currentLocation.coordinates ? 
                                    `Lat: ${currentLocation.coordinates[1]}, Lon: ${currentLocation.coordinates[0]}` : 'N/A'}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Documents</Typography>
                    {user?.documents && user.documents.length > 0 ? (
                        user.documents.map((doc, index) => (
                            <Box key={index} sx={{ mb: 1 }}>
                                <Typography variant="subtitle1">Type: {doc.type} <Chip label={doc.status} size="small" color={doc.status === 'APPROVED' ? 'success' : doc.status === 'PENDING' ? 'warning' : 'error'} /></Typography>
                                <MuiLink href={doc.url} target="_blank" rel="noopener">{doc.url}</MuiLink>
                                <Typography variant="caption" display="block">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</Typography>
                            </Box>
                        ))
                    ) : (
                        <Typography variant="body1">No documents available.</Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default DriverDetails;
