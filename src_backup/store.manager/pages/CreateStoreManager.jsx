import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import StoreManagerForm from "../components/StoreManagerForm";
import { useStoreManager } from "../../api/store.manager";
import { Box, Typography } from "@mui/material";

const CreateStoreManager = () => {
  const navigate = useNavigate();
  const { createStoreManager, loading } = useStoreManager();

  const handleSubmit = async (formData) => {
    const result = await createStoreManager(formData);
    if (result.success) {
      toast.success("Store manager created successfully");
      navigate("/store-managers");
    } else {
      toast.error(result.message || "Failed to create store manager");
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create Store Manager
      </Typography>
      <StoreManagerForm onSubmit={handleSubmit} loading={loading} />
    </Box>
  );
};

export default CreateStoreManager;
