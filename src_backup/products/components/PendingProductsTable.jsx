import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useProducts } from "../../api/product";
import CustomTable from "../../components/CustomTable";
import { useNavigate } from "react-router-dom";

const placeholderImg = "https://via.placeholder.com/60";

export default function PendingProductsTable() {
  const navigate = useNavigate();

  const dummyPendingData = [
    {
      _id: "dummy1",
      name: "Organic Tomatoes",
      category: "Vegetables",
      pricing: { mrp: 80, salePrice: 65 },
      image: ["https://via.placeholder.com/80x80?text=Tomato"],
    },
  ];

  const {
    products,
    setProducts,
    fetchProductsByStatus,
    approveProduct,
    rejectProduct,
  } = useProducts();

  const [rejectItem, setRejectItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchProductsByStatus("PENDING").then((data) => {
      if (!data || data.length === 0) {
        setProducts(dummyPendingData);
      }
    });
  }, [fetchProductsByStatus]);

  const handleApproveProduct = async (productId) =>{
    await approveProduct(productId);
    fetchProductsByStatus("PENDING");
  }
  const handleReject = async () => {
    if (!rejectReason.trim() || !rejectItem) return;

    await rejectProduct(rejectItem._id, rejectReason);
    setRejectItem(null);
    setRejectReason("");
    fetchProductsByStatus("PENDING");
  };

  const columns = [
    {
      key: "name",
      label: "Product Name",
    },
    {
      key: "image",
      label: "Image",
      render: (row) => (
        <img
          src={row.image?.[0] || placeholderImg}
          width={60}
          height={60}
          style={{ borderRadius: 6 }}
        />
      ),
    },
    {
      key: "category",
      label: "Category",
    },
    {
      key: "pricing",
      label: "Pricing",
      render: (row) =>
        `₹${row.pricing?.salePrice} / ₹${row.pricing?.mrp}`,
    },
    {
      key: "approval",
      label: "Approval",
      render: (row) => {
        const isDummy = row._id.startsWith("dummy");

        return (
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              disabled={isDummy}
              onClick={() => handleApproveProduct(row._id)}
            >
              Approve
            </Button>

            <Button
              variant="contained"
              size="small"
              color="error"
              disabled={isDummy}
              onClick={() => setRejectItem(row)}
            >
              Reject
            </Button>
          </Stack>
        );
      },
    },
  ];

  return (
    <Box p={2}>
      <Typography variant="h6" mb={2}>
        Pending Products
      </Typography>

      <CustomTable
        columns={columns}
        rows={products}
        actions={{ view: true }}
        onView={(row) => navigate(`/product-details/${row._id}`)}
      />

      {/* REJECT DIALOG */}
      <Dialog open={!!rejectItem} onClose={() => setRejectItem(null)}>
        <DialogTitle>Reject Product</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason for rejection"
            multiline
            fullWidth
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectItem(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleReject}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
