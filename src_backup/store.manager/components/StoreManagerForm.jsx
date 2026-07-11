import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { useStore } from "../../api/store"; 
import { useAuth } from "../../api/auth";

const StoreManagerForm = ({ onSubmit, initialData = {}, loading }) => {
  const [formState, setFormState] = useState({
    userId: initialData?.user?._id || "",
    storeId: initialData?.store?._id || "",
  });

  const { stores, fetchAllStore } = useStore();
  const { users, getAllUsers } = useAuth(); 

  useEffect(() => {
    fetchAllStore();
    if (fetchAllStore) {
      fetchAllStore();
    }
  }, [fetchAllStore, getAllUsers]);


  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formState);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {initialData?._id ? "Edit Store Manager" : "Create Store Manager"}
      </Typography>
      
      <FormControl fullWidth margin="normal">
        <InputLabel id="user-select-label">User</InputLabel>
        <Select
          labelId="user-select-label"
          id="userId"
          name="userId"
          value={formState.userId}
          onChange={handleChange}
          required
        >
          {users?.map((user) => (
            <MenuItem key={user._id} value={user._id}>
              {user.name} ({user.email})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel id="store-select-label">Store</InputLabel>
        <Select
          labelId="store-select-label"
          id="storeId"
          name="storeId"
          value={formState.storeId}
          onChange={handleChange}
          required
        >
          {stores?.map((store) => (
            <MenuItem key={store._id} value={store._id}>
              {store.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? "Saving..." : "Save"}
      </Button>
    </Box>
  );
};

export default StoreManagerForm;
