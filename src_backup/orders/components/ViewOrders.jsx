import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrders } from "../../api/order";
import { 
  Box, Typography, Paper, Stack, Divider, 
  Chip, Grid, IconButton, Skeleton, Container, Avatar
} from "@mui/material";
import { 
  ArrowLeft, Package, User, Store, 
  CreditCard, Truck, Calendar, MapPin,
  ShoppingBag, Phone, Receipt, Info
} from "lucide-react";

// DUMMY DATA FALLBACK
const DUMMY_ORDERS = [
  {
    _id: "ORD-88291",
    customer: { name: "Rohan Sharma", phone: "+91 99999 99999" },
    store: { name: "Kheti Corner - Indore Central", address: "Plot 12, Scheme 54, Vijay Nagar, Indore" },
    items: [
      { product: { name: "Organic Fuji Apples" }, qty: 2, price: 50, total: 100 },
      { product: { name: "Green Cavendish Banana" }, qty: 5, price: 10, total: 50 },
    ],
    amount: { subTotal: 150, tax: 15, deliveryFee: 20, grandTotal: 185 },
    status: "PLACED",
    payment: { method: "UPI / Online", status: "PAID" },
    delivery: { partner: { name: "Suresh Kumar" }, eta: 30 },
    createdAt: new Date().toISOString(),
  }
];

export default function ViewOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { order, fetchOrderById, setOrder } = useOrders();
  const [loading, setLoading] = useState(true);

  const brandGreen = "#14532d";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchOrderById(id);
        if (!data) {
          const dummy = DUMMY_ORDERS.find((o) => o._id === id) || DUMMY_ORDERS[0];
          setOrder(dummy);
        }
      } catch (err) {
        setOrder(DUMMY_ORDERS[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const currentOrder = Array.isArray(order) ? order[0] : order;
  if (loading || !currentOrder) return <OrderSkeleton />;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f7f5", py: 6 }}>
      <Container maxWidth="lg">
        
        {/* Header Section */}
        <Stack direction="row" spacing={2} alignItems="center" mb={4}>
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ bgcolor: "white", color: brandGreen, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={900} color="#1a202c" sx={{ letterSpacing: "-1px" }}>
              Order Details
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Tracking ID: <span style={{ color: brandGreen, fontWeight: 700 }}>{currentOrder._id}</span>
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={3}>
          
          {/* Top Row: Info & Billing (Aligned Side-by-Side) */}
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 4, height: "100%", borderRadius: 6, border: "1px solid #e0e7e1", bgcolor: "white" }}>
              <Typography variant="subtitle2" color={brandGreen} fontWeight={900} sx={{ letterSpacing: 1, mb: 3 }}>
                SHIPMENT ENTITIES
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Typography variant="caption" fontWeight={800} color="text.secondary" display="flex" alignItems="center" gap={1}>
                      <User size={14} /> CUSTOMER
                    </Typography>
                    <Typography variant="h6" fontWeight={800}>{currentOrder.customer.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Phone size={12} /> {currentOrder.customer.phone}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Typography variant="caption" fontWeight={800} color="text.secondary" display="flex" alignItems="center" gap={1}>
                      <Store size={14} /> FULFILLMENT POINT
                    </Typography>
                    <Typography variant="h6" fontWeight={800}>{currentOrder.store.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <MapPin size={12} /> {currentOrder.store.address}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 4, borderStyle: "dashed" }} />
              
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" fontWeight={800} color="text.secondary">ORDER STATUS</Typography>
                  <Chip label={currentOrder.status} sx={{ mt: 1, bgcolor: `${brandGreen}10`, color: brandGreen, fontWeight: 900, borderRadius: 2 }} />
                </Box>
                <Box textAlign="right">
                  <Typography variant="caption" fontWeight={800} color="text.secondary">LOGISTICS ETA</Typography>
                  <Typography variant="h6" fontWeight={900} color={brandGreen}>{currentOrder.delivery.eta} MINS</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 4, height: "100%", borderRadius: 6, bgcolor: brandGreen, color: "white", boxShadow: `0 12px 30px ${brandGreen}30` }}>
              <Typography variant="h6" fontWeight={900} mb={3} display="flex" alignItems="center" gap={1.5}>
                <Receipt size={22} /> Billing Summary
              </Typography>
              <Stack spacing={2.5}>
                <PriceItem label="Items Subtotal" value={currentOrder.amount.subTotal} />
                <PriceItem label="Applicable Taxes" value={currentOrder.amount.tax} />
                <PriceItem label="Delivery Surcharge" value={currentOrder.amount.deliveryFee} />
                <Divider sx={{ bgcolor: "rgba(255,255,255,0.15)", my: 1 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5" fontWeight={900}>Grand Total</Typography>
                  <Typography variant="h4" fontWeight={900}>₹{currentOrder.amount.grandTotal}</Typography>
                </Stack>
                
                <Box sx={{ mt: 2, p: 2.5, borderRadius: 4, bgcolor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                   <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.7, letterSpacing: 0.5 }}>PAYMENT METHOD</Typography>
                   <Stack direction="row" justifyContent="space-between" alignItems="center" mt={0.5}>
                     <Typography fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                       <CreditCard size={18} /> {currentOrder.payment.method}
                     </Typography>
                     <Chip label={currentOrder.payment.status} size="small" sx={{ bgcolor: "white", color: brandGreen, fontWeight: 900, fontSize: "0.65rem" }} />
                   </Stack>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Bottom Row: Full Width Items Manifest */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ borderRadius: 6, border: "1px solid #e0e7e1", overflow: "hidden", bgcolor: "white" }}>
              <Box sx={{ px: 4, py: 3, bgcolor: "#fafafa", borderBottom: "1px solid #e0e7e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography fontWeight={900} color="#1a202c" display="flex" alignItems="center" gap={1.5}>
                  <ShoppingBag size={20} color={brandGreen} /> Order Manifest
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {currentOrder.items.length} Items Selected
                </Typography>
              </Box>
              <Box sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  {currentOrder.items.map((item, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Stack direction="row" spacing={3} alignItems="center" sx={{ p: 2, borderRadius: 4, "&:hover": { bgcolor: "#f8faf9" }, transition: "0.2s" }}>
                        <Avatar variant="rounded" sx={{ bgcolor: `${brandGreen}10`, color: brandGreen, width: 56, height: 56, fontWeight: 900 }}>
                          {item.product.name[0]}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography fontWeight={800} color="#1a202c">{item.product.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.qty} units × ₹{item.price}
                          </Typography>
                        </Box>
                        <Typography fontWeight={900} color={brandGreen}>₹{item.total}</Typography>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// Sub-components for cleaner code
const PriceItem = ({ label, value }) => (
  <Stack direction="row" justifyContent="space-between">
    <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500 }}>{label}</Typography>
    <Typography variant="body2" fontWeight={800}>₹{value}</Typography>
  </Stack>
);

const OrderSkeleton = () => (
  <Container maxWidth="lg" sx={{ py: 8 }}>
    <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
    <Grid container spacing={3}>
      <Grid item xs={7}><Skeleton variant="rectangular" height={300} sx={{ borderRadius: 6 }} /></Grid>
      <Grid item xs={5}><Skeleton variant="rectangular" height={300} sx={{ borderRadius: 6 }} /></Grid>
      <Grid item xs={12}><Skeleton variant="rectangular" height={200} sx={{ borderRadius: 6 }} /></Grid>
    </Grid>
  </Container>
);