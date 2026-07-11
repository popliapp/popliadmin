import React, { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import CustomTable from "../../components/CustomTable";
import { usePayout } from "../../api/payout.js";

const PayoutHistoryPage = () => {
  const { entityType, id } = useParams();
  const { payoutHistory, loading, error, fetchPayoutHistory } = usePayout();
  const [feedback, setFeedback] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const getHistory = useCallback(async () => {
    if (entityType && id) {
      const { success, message } = await fetchPayoutHistory(entityType, id);
      if (!success) {
        setFeedback({ open: true, message: message, severity: "error" });
      }
    } else {
      setFeedback({
        open: true,
        message: "Missing entity type or ID for payout history.",
        severity: "error",
      });
    }
  }, [fetchPayoutHistory, entityType, id]);

  useEffect(() => {
    getHistory();
  }, [getHistory]);

  const columns = [
    {
      field: "amount",
      headerName: "Amount",
      flex: 1,
      valueGetter: (params) => `$${params.row.amount.toFixed(2)}`,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            display: "inline-flex",
            padding: "4px 8px",
            borderRadius: "12px",
            backgroundColor:
              params.value === "completed"
                ? "success.light"
                : params.value === "pending"
                ? "warning.light"
                : "error.light",
            color:
              params.value === "completed"
                ? "success.dark"
                : params.value === "pending"
                ? "warning.dark"
                : "error.dark",
            fontWeight: "bold",
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Date",
      flex: 1,
      valueGetter: (params) => new Date(params.row.createdAt).toLocaleDateString(),
    },
    // Add more columns as needed for history details
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {entityType ? `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Payout History (ID: ${id})` : "Payout History"}
      </Typography>

      {feedback.open && (
        <Alert severity={feedback.severity} sx={{ mb: 2 }}>
          {feedback.message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <CustomTable
          rows={payoutHistory}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._id}
        />
      )}
       {feedback.open && (
        <Alert
          onClose={() => setFeedback({ ...feedback, open: false })}
          severity={feedback.severity}
          sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1400 }}
        >
          {feedback.message}
        </Alert>
      )}
    </Box>
  );
};

export default PayoutHistoryPage;