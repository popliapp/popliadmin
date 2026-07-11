import React, { useState, useEffect, useMemo } from "react";
import {
  Typography,
  CircularProgress,
  Chip,
  Paper,
  Box,
  Avatar,
  Stack,
} from "@mui/material";
import { Email, Phone, LocationOn } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { useVendor } from "../../api/vendor";
import CustomTable from "../../components/CustomTable";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";



const ApproveVendorList = () => {
  const navigate = useNavigate();
  const { getVendors,vendors,setVendors, deleteVendor, loading } = useVendor();
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await getVendors({ verificationStatus:"APPROVED"});
      })();
  }, [getVendors]);

  const handleDelete = async () => {
    const id = deleteTarget?._id;
    setDeleteTarget(null);
    if (!id) return;

    if (!id.startsWith("d")) await deleteVendor(id); 

    setVendors((prev) => prev.filter((v) => v._id !== id));
  };

  const columns = useMemo(
    () => [
      {
        key: "vendor",
        label: "Vendor",
        render: (v) => (
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main" }}>
              {(v?.user.name?.en || v.user.name || "V")[0]}
            </Avatar>
            <Box>
              <Typography fontWeight={700}>{v.name?.en || v.user?.name}</Typography>
              <Typography variant="caption" sx={{ display: "flex", gap: 0.5 }}>
                <Email fontSize="small" /> {v.user.email}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        key: "FamrName",
        label: "Farm Name",
        render: (v) => (
          <Box>
            <Typography>{v.farmName}</Typography>
            <Typography variant="caption" sx={{ display: "flex", gap: 0.5 }}>
              <Phone fontSize="small" /> {v.user?.phone}
            </Typography>
          </Box>
        ),
      },
      // {
      //   key: "location",
      //   label: "Location",
      //   render: (v) => (
      //     <Box>
      //       <Typography sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      //         <LocationOn fontSize="small" sx={{ color: "error.main" }} />
      //         {v.city}
      //       </Typography>
      //       <Typography variant="caption" color="text.secondary">
      //         {v.area}
      //       </Typography>
      //     </Box>
      //   ),
      // },
      {
        key: "status",
        label: "Status",
        render: (v) => {
          const approved = v.restaurantApproved;
          const rejected = v.restaurantRejected;

          if (approved)
            return <Chip label="Approved" color="success" size="small" />;
          if (rejected)
            return <Chip label="Rejected" color="error" size="small" />;
          return <Chip label="Pending" color="warning" size="small" variant="outlined" />;
        },
      },
    ],
    []
  );
 console.log(vendors)
  return (
    <Box sx={{ p: 4, bgcolor: "#f5f7f9", minHeight: "100vh" }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #e0e4e8" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Approved Vendors
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vendor List
            </Typography>
          </Box>
          <Chip label={`${vendors.length} Vendors`} color="primary" />
        </Box>

        {loading && vendors.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <CustomTable
            columns={columns}
            rows={vendors}
            actions={{ view: true, edit:false, delete: true }}
            onView={(row) => navigate(`/vendor/${row._id}`)}
            // onEdit={(row) => navigate(`/admin-edit-vendor/${row._id}`)}
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

export default ApproveVendorList;
