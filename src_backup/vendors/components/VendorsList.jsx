import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  CircularProgress,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  Box,
  Avatar,
  Stack
} from '@mui/material';
import { Email, Phone, VisibilityOutlined, LocationOn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { useVendor } from '../../api/vendor';
import CustomTable from '../../components/CustomTable';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';


// --- Static Dummy Data ---
const DUMMY_VENDORS = [
  {
    _id: "temp-1",
    name: { en: "Sunrise Organic Farms" },
    email: "contact@sunrisefarms.com",
    owner: { name: "Rajesh Kumar", mobile: "+91 98765 43210" },
    city: "Indore",
    area: "Vijay Nagar",
    restaurantApproved: false,
    restaurantRejected: false,
  },
  {
    _id: "temp-2",
    name: { en: "Green Leaf Co-op" },
    email: "admin@greenleaf.in",
    owner: { name: "Anita Desai", mobile: "+91 88223 34455" },
    city: "Pune",
    area: "Baner",
    restaurantApproved: false,
    restaurantRejected: false,
  }
];

const VendorsList = () => {
  const navigate = useNavigate();
  const { vendors ,setVendors, getAllVendors, loading, error } = useVendor();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [busy, setBusy] = useState(null);

  
  const handleDelete = async () => {
    const id = deleteTarget?._id;
    setDeleteTarget(null);
    if (!id) return;

    if (!id.startsWith("d")) await deleteVendor(id); // skip backend for dummy

    setVendors((prev) => prev.filter((v) => v._id !== id));
  };
  useEffect(() => {
  const load = async () => {
    const res = await getAllVendors();

    if (res?.success && res.data?.length > 0) {
      setVendors(res.data);
    } else {
      setVendors(DUMMY_VENDORS);
    }
  };

  load();
}, [getAllVendors]);


  const patchVendor = (id, data) => {
    setVendors(prev =>
      prev.map(v => (v._id === id || v.id === id ? { ...v, ...data } : v))
    );
  };



  const columns = useMemo(
    () => [
      { 
        key: 'vendor', 
        label: 'Vendor Profile', 
        render: v => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              {(v.name?.en || v.name || "V")[0]}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {v.name?.en || v.user.name || "vendor"}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ fontSize: 12, mr: 0.5 }} /> {v.email}
              </Typography>
            </Box>
          </Box>
        )
      },
      {
        key: 'Phone',
        label: 'Phone',
        render: v => (
          <Box>
            <Typography variant="body2">{v.owner?.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              <Phone sx={{ fontSize: 12, mr: 0.5 }} /> {v.user?.phone}
            </Typography>
          </Box>
        ),
      },
      {
        key: 'email',
        label: 'email',
        render: v => (
          <Box>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
               <LocationOn sx={{ fontSize: 14, mr: 0.5, color: 'error.main' }} /> {v?.user?.email || v?.email }
            </Typography>
          </Box>
        ),
      },
      
      {
       key: 'activestatus',
       label: 'Active Status',
       render: v =>
         v?.status==="ACTIVE"
           ? <Chip label="Active" color="success" size="small" />
           : <Chip label="InActive" color="error" size="small" />

      },
      {
       key: 'verificationstatus',
       label: 'Verification Status',
       render: v =>
         v?.verification?.status==="APPROVED"
           ? <Chip label="Approved" color="success" size="small" />
           : <Chip label="Rejected" color="error" size="small" />

      },

      // {
      //   key: 'actions',
      //   label: 'Actions',
      //   render: v => {
      //     const id = v._id || v.id;

      //     return (
      //       <Stack direction="row" spacing={1}>
      //         <Tooltip title="View Profile">
      //           <IconButton size="small" onClick={() => navigate(`/vendor/${id}`)}>
      //             <VisibilityOutlined fontSize="small" />
      //           </IconButton>
      //         </Tooltip>

          
      //       </Stack>
      //     );
      //   },
      // },
    ],
    [busy, navigate]
  );

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f7f9', minHeight: '100vh' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e4e8' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Vendor List</Typography>
            <Typography variant="body2" color="text.secondary">All Vendors List</Typography>
          </Box>
          <Chip label={`${vendors.length} Vendors`} color="primary" variant="soft" />
        </Box>

        {/* Loading spinner only shows if we have NO data and are loading */}
        {loading && vendors.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress /></Box>
        ) : (
          <CustomTable 
             columns={columns} 
             rows={vendors} 
             actions={{ view: true,  delete: true }}
             onView={(row) => navigate(`/vendor/${row._id}`)}
            //  onEdit={(row) => navigate(`/admin-edit-vendor/${row._id}`)}
             onDelete={(row) => setDeleteTarget(row)}
 />
        )}
      </Paper>
       <ConfirmDeleteDialog
              open={!!deleteTarget}
              onCancel={() => setDeleteTarget(null)}
              onConfirm={handleDelete}
            />

    </Box>
  );
};

export default VendorsList;