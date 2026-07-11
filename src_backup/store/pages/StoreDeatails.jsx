import React, { useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Avatar,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import {
  Store as StoreIcon,
  User,
  Calendar,
  MapPin,
  ShieldCheck,
  Mail,
  Phone,
  Home,
} from "lucide-react";
import { useStore } from "../../api/store";

const StoreDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchStoreById, single, loading, error } = useStore();

  const loadStore = useCallback(() => {
    if (id) fetchStoreById(id);
  }, [id, fetchStoreById]);

  useEffect(() => {
    loadStore();
  }, [loadStore]);

  if (loading) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-screen py-20">
        <CircularProgress />
        <Typography className="mt-2 text-gray-500">
          Loading store details…
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-6">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  /** ✅ CORRECT & SAFE DATA EXTRACTION */
  const store = single?.store;
  if (!store) return null;

  const vendor = store.vendor || {};
  const user = vendor.user || {};

  const [lng, lat] = store.geo?.coordinates || [];

  return (
    <Box className="p-6 min-h-screen bg-gray-50">
      <Box className="flex justify-between items-center mb-6">
        <Box>
          <Typography variant="h4" className="font-bold">
            Store Profile
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            ID: {store._id}
          </Typography>
        </Box>
        <button
          className="px-6 py-2 bg-green-700 text-white rounded-lg"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </Box>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
        <Paper className="p-6 lg:col-span-2 space-y-6">
          <Box className="flex items-center gap-4">
            <Avatar className="bg-green-100 text-green-700 w-16 h-16">
              <StoreIcon size={32} />
            </Avatar>
            <Box>
              <Typography variant="h5" className="font-bold">
                {store.name}
              </Typography>
              <Chip
                label={store.status}
                color={store.status === "ACTIVE" ? "success" : "default"}
                size="small"
              />
            </Box>
          </Box>

          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Box className="flex gap-3">
              <MapPin className="text-red-500" />
              <Box>
                <Typography className="text-xs font-bold uppercase">
                  Address
                </Typography>
                <Typography>
                  {store.address || "N/A"}, {store.city || ""}
                </Typography>
                <Typography className="text-xs text-gray-400">
                  Pincode: {store.pincode || "N/A"}
                </Typography>
                <Typography className="text-xs text-gray-400">
                  Lat: {lat ?? "—"} | Lng: {lng ?? "—"}
                </Typography>
              </Box>
            </Box>

            <Box className="flex gap-3">
              <Phone />
              <Box>
                <Typography className="text-xs font-bold uppercase">
                  Contact
                </Typography>
                <Typography>{store.phone || "N/A"}</Typography>
              </Box>
            </Box>

            <Box className="flex gap-3">
              <ShieldCheck className="text-blue-500" />
              <Box>
                <Typography className="text-xs font-bold uppercase">
                  Store Verification
                </Typography>
                <Typography>
                  {store.verification?.verifiedStatus || "N/A"}
                </Typography>
              </Box>
            </Box>

            <Box className="flex gap-3">
              <Calendar />
              <Box>
                <Typography className="text-xs font-bold uppercase">
                  Created
                </Typography>
                <Typography>
                  {new Date(store.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>

            <Box className="flex gap-3">
              <Calendar />
              <Box>
                <Typography className="text-xs font-bold uppercase">
                  Updated
                </Typography>
                <Typography>
                  {new Date(store.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </div>
        </Paper>

        <Paper className="p-6 space-y-4 border-l-4 border-green-600">
          <Typography variant="h6" className="font-bold flex gap-2">
            <User size={18} /> Vendor Details
          </Typography>

          <Box>
            <Typography className="text-xs">Farm Name</Typography>
            <Typography className="font-semibold flex gap-2">
              <Home size={14} /> {vendor.farmName || "N/A"}
            </Typography>
          </Box>

          <Box>
            <Typography className="text-xs">Vendor Status</Typography>
            <Chip
              label={vendor.verification?.status || "N/A"}
              size="small"
              color={
                vendor.verification?.status === "APPROVED"
                  ? "success"
                  : "warning"
              }
            />
          </Box>

          <Divider />

          <Box className="mt-4">
            <Typography className="text-xs">Contact Person</Typography>
            <Typography>{user.name || "N/A"}</Typography>
          </Box>

          <Box className="flex gap-2">
            <Mail size={16} />
            <Typography>{user.email || "N/A"}</Typography>
          </Box>

          <Box className="flex gap-2">
            <Phone size={16} />
            <Typography>{user.phone || "N/A"}</Typography>
          </Box>

          <Divider />

          <Box className="mt-4">
            <Typography className="text-xs uppercase font-bold">
              PAN Number
            </Typography>
            <Typography className="font-mono">
              {vendor.panNumber || "N/A"}
            </Typography>
          </Box>

          <Box className="flex justify-between bg-gray-50 p-2 rounded">
            <Typography>KYC Status</Typography>
            <Chip
              label={vendor.kycStatus || "N/A"}
              size="small"
              color={vendor.kycStatus === "APPROVED" ? "success" : "warning"}
            />
          </Box>
        </Paper>
      </div>
    </Box>
  );
};

export default StoreDetails;
