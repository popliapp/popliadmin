import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import CustomTable from "../../components/CustomTable";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import { useStoreManager } from "../../api/store.manager";
import { toast } from "react-hot-toast";

const StoreManagers = () => {
  const navigate = useNavigate();
  const {
    storeManagers,
    getStoreManagers,
    deleteStoreManager,
    loading,
    error,
  } = useStoreManager();

  const [deleteManager, setDeleteManager] = useState(null);

  useEffect(() => {
    getStoreManagers();
  }, [getStoreManagers]);

  const handleDelete = async () => {
    if (!deleteManager) return;

    const result = await deleteStoreManager(deleteManager._id);

    if (result.success) {
      toast.success("Store manager deleted successfully");
      await getStoreManagers();
    } else {
      toast.error(result.message || "Failed to delete store manager");
    }

    setDeleteManager(null);
  };

  const columns = [
    { key: "name", label: "Name", render: (row) => row.user?.name ?? "N/A" },
    { key: "email", label: "Email", render: (row) => row.user?.email ?? "N/A" },
    { key: "phone", label: "Phone", render: (row) => row.user?.phone ?? "N/A" },
    { key: "store", label: "Store", render: (row) => row.store?.name ?? "N/A" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Chip
          size="small"
          label={row.status}
          color={row.status === "ACTIVE" ? "success" : "default"}
        />
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Store Managers</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/store-managers/create")}
        >
          Create Store Manager
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <CustomTable
        columns={columns}
        rows={storeManagers}
        actions={{ view: true}}
        onView={(row) => navigate(`/store-manager/${row._id}`)}
        onEdit={(row) => navigate(`/store-manager/edit/${row._id}`)}
        onDelete={(row) => setDeleteManager(row)}
      />

      <ConfirmDeleteDialog
        open={!!deleteManager}
        onClose={() => setDeleteManager(null)}
        onConfirm={handleDelete}
        title="Delete Store Manager"
        description={`Are you sure you want to delete ${deleteManager?.user?.name}?`}
        loading={loading}
      />
    </Box>
  );
};

export default StoreManagers;
