import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import StoreManagerForm from "../components/StoreManagerForm";
import { useStoreManager } from "../../api/store.manager";
import { Box, Typography } from "@mui/material";

const EditStoreManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    singleStoreManager,
    getStoreManagerById,
    updateStoreManager,
    loading,
  } = useStoreManager();

  useEffect(() => {
    getStoreManagerById(id);
  }, [id, getStoreManagerById]);

  const handleSubmit = async (formData) => {
    const result = await updateStoreManager(id, formData);
    if (result.success) {
      toast.success("Store manager updated successfully");
      navigate("/store-managers");
    } else {
      toast.error(result.message || "Failed to update store manager");
    }
  };

  if (loading && !singleStoreManager) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Edit Store Manager
      </Typography>
      {singleStoreManager && (
        <StoreManagerForm
          onSubmit={handleSubmit}
          initialData={singleStoreManager}
          loading={loading}
        />
      )}
    </Box>
  );
};

export default EditStoreManager;
