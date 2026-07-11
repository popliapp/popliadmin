import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useVendor } from "../../api/vendor.js";
import { 
  CircularProgress, Typography, Stack, Chip, Paper, 
  Box, Grid, Avatar, IconButton, Tooltip, Divider 
} from "@mui/material";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import HistoryIcon from '@mui/icons-material/History';
import InfoIcon from '@mui/icons-material/Info';

const ViewVendorDetails = () => {
  const { id } = useParams();
  const { vendor, getVendorById, loading } = useVendor();

  useEffect(() => {
    getVendorById(id);
  }, [id, getVendorById]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress size={45} thickness={4} sx={{ color: '#10b981' }} />
    </Box>
  );

  const data = vendor || {};

  const formatFullDate = (date) => date ? new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : "N/A";

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 }, bgcolor: '#f8fafc' }}>
      
      <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 4, border: '1px solid #e2e8f0', background: '#fff' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar sx={{ width: 70, height: 70, bgcolor: '#0f172a', fontWeight: 'bold' }}>
              {data.farmName?.charAt(0) || "V"}
            </Avatar>
          </Grid>
          <Grid item xs={12} sm>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{data.farmName}</Typography>
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
              <Chip label={data.status} color="primary" size="small" />
              <Chip label={`KYC: ${data.kycStatus}`} variant="outlined" color="warning" size="small" />
              {data.isDeleted && <Chip label="Marked for Deletion" color="error" size="small" />}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <SectionTitle icon={<ContactPageIcon />} title="Account Owner" />
              <Stack spacing={2} mt={2}>
                <DataField label="Name" value={data.user?.name} />
                <DataField label="Email" value={data.user?.email} />
                <DataField label="Phone" value={data.user?.phone} />
                <DataField label="User Object ID" value={data.user?._id} isCode />
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
              <SectionTitle icon={<SettingsSuggestIcon />} title="System Metadata" />
              <Stack spacing={2} mt={2}>
                <DataField label="Document ID (_id)" value={data._id} isCode />
                <DataField label="Version Key (__v)" value={data.__v?.toString()} />
                <DataField label="Payouts Enabled" value={data.payoutsEnabled ? "YES" : "NO"} highlight />
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <SectionTitle icon={<AccountBalanceIcon />} title="Banking & Tax" />
              <Grid container spacing={2} mt={1}>
                <Grid item xs={12} sm={6}><DataField label="Bank" value={data.bank?.bankName} /></Grid>
                <Grid item xs={12} sm={6}><DataField label="IFSC" value={data.bank?.ifsc} highlight /></Grid>
                <Grid item xs={12} sm={6}><DataField label="Account Name" value={data.bank?.holderName} /></Grid>
                <Grid item xs={12} sm={6}><DataField label="Account Number" value={data.bank?.accountNumber} isSensitive /></Grid>
                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                <Grid item xs={12}><DataField label="PAN Card Number" value={data.panNumber} highlight /></Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <SectionTitle icon={<HistoryIcon />} title="Audit Trail" />
              <Grid container spacing={3} mt={1}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2 }}>
                    <Typography variant="caption" color="textSecondary">RECORD CREATED</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatFullDate(data.createdAt)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: 2 }}>
                    <Typography variant="caption" color="textSecondary">LAST MODIFIED</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatFullDate(data.updatedAt)}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', borderStyle: 'dashed' }}>
              <SectionTitle icon={<InfoIcon />} title="Additional Assets" />
              <Grid container spacing={2} mt={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">CERTIFICATIONS</Typography>
                  <Typography variant="body2">{data.certifications?.length || 0} items found</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">CONNECTED STORES</Typography>
                  <Typography variant="body2">{data.stores?.length || 0} stores linked</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

// Reusable Helper Components
const SectionTitle = ({ icon, title }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box sx={{ color: '#475569' }}>{icon}</Box>
    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', textTransform: 'uppercase' }}>{title}</Typography>
  </Stack>
);

const DataField = ({ label, value, highlight, isSensitive, isCode }) => (
  <Box>
    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>{label}</Typography>
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: 700, 
          color: highlight ? '#0284c7' : '#334155',
          fontFamily: isCode ? 'Monospace' : 'inherit',
          fontSize: isCode ? '0.7rem' : '0.9rem'
        }}
      >
        {value || "—"}
      </Typography>
      {isCode && value && (
        <IconButton size="small" onClick={() => navigator.clipboard.writeText(value)}>
          <ContentCopyIcon sx={{ fontSize: 12 }} />
        </IconButton>
      )}
    </Stack>
  </Box>
);

export default ViewVendorDetails;