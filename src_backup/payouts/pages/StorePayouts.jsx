import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import {usePayout} from "../../api/payout";
import CustomTable from "../../components/CustomTable";
import toast from "react-hot-toast";

const StorePayouts = () => {
  const navigate = useNavigate();
  const { payouts, loading, error, getStorePayouts, updatePayoutStatus } = usePayout();
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    getStorePayouts(1, 10, statusFilter);
  }, [statusFilter]);

  if (error) {
    toast.error(error);
  }

  const handleStatusChange = async (id, newStatus) => {
    await updatePayoutStatus(id, newStatus);
  };
  
  const columns = [
    { id: "store", label: "Store Name", minWidth: 170, render: (payout) => payout.store?.name },
    { id: "amount", label: "Amount", minWidth: 100, render: (payout) => `₹${payout.amount}` },
    { id: "status", label: "Status", minWidth: 100 },
    { id: "date", label: "Date", minWidth: 170, render: (payout) => new Date(payout.createdAt).toLocaleDateString() },
    {
      id: "actions",
      label: "Actions",
      minWidth: 170,
      render: (payout) => (
        <Box>
          <Button onClick={() => navigate(`/payouts/stores/${payout.store?._id}`)}>View History</Button>
          <FormControl size="small" style={{ marginLeft: 8 }}>
            <Select
              value={payout.status}
              onChange={(e) => handleStatusChange(payout._id, e.target.value)}
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
              <MenuItem value="FAILED">Failed</MenuItem>
            </Select>
          </FormControl>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Store Payouts
      </Typography>
      <FormControl size="small" style={{ marginBottom: 16 }}>
        <InputLabel>Status</InputLabel>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
          <MenuItem value=""><em>All</em></MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
          <MenuItem value="PAID">Paid</MenuItem>
          <MenuItem value="FAILED">Failed</MenuItem>
        </Select>
      </FormControl>
      <CustomTable
        columns={columns}
        data={payouts}
        loading={loading}
      />
    </Box>
  );
};

export default StorePayouts;