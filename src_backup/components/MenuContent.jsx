import * as React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Collapse,
  Box,
} from '@mui/material'
import {
  HomeRounded,
  Chat,
  Assignment,
  Store,
  LocationCity,
  DirectionsCar,
  LocalOffer,
  DriveEta,
  Description,
  Cancel,
  Percent,
  People,
  ChevronRight,
  RadioButtonUnchecked,
  SettingsApplications,
  MoneyOffCsredTwoTone,
  SupportAgentSharp
  
} from '@mui/icons-material'
import FilterAlt from "@mui/icons-material/FilterAlt";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";
import RateReview from "@mui/icons-material/RateReview";
import Article from "@mui/icons-material/Article";
import Security from "@mui/icons-material/Security";
import BarChart from "@mui/icons-material/BarChart";
import PaymentsIcon from '@mui/icons-material/Payments';


export const menuItems = [
  { text: 'Dashboard', icon: <HomeRounded />, path: '/dashboard' },

  // {
  //   text: 'Support Chat',
  //   icon: <Chat />,
  //   children: [
  //     { text: 'Chat', path: '/chat' },
  //     { text: 'User & Store Chat', path: '/user-store-chat' },
  //     { text: 'User & Driver Chat', path: '/user-driver-chat' }
  //   ]
  // },

  {
    text: 'Vender Management',
    icon: <Assignment />,
    children: [
      { text: 'Vendor Dashboard', path: '/vendor-dashboard' },
      // { text: 'Create Vendor', path: '/create-vendor' },
      { text: 'vendor List', path: '/vendors' },
      { text: 'Pending Approve Vendors', path: '/pending-vendors' },
      { text: 'Approved Vendors', path: '/approved-vendors' },
    ]
  },

  {
    text: 'Store Management',
    icon: <Store />,
    children: [
      { text: 'Store List', path: '/stores' },
      { text: 'Active Store List', path: '/active-store' },
      // {text: 'Admin Create Store ', path: '/admin-create-store' },
      {text: 'Pending Store', path: '/pending-store' },
      {text: 'Approved Stores', path: '/approve-store' },

    ]
  },
  // {
  //   text: 'Store Manager',
  //   icon: <SupportAgentSharp />,
  //   children: [
  //     { text: 'Store Managers', path: '/store-managers' },
  //   ]
  // },
  //   {
  //   text: 'Products',
  //   icon: <Description />,
  //   children: [
  //     { text: 'Products', path: '/products' },
  //     { text: 'Pending Products', path: '/pending-products' },
  //     { text: 'Approve Products', path: '/approve-products' },
  //   ]
  // },
    {
    text: 'Orders',
    icon: <Description />,
    children: [
      { text: 'Orders', path: '/orders' },
    ]
  },
  {
    text: 'Customer Management',
    icon: <People />,
    children: [
      { text: 'Customers', path: '/customers' },
    ]
  },

  // {
  //   text: 'Financial Support',
  //   icon: <MoneyOffCsredTwoTone/>,
  //   children: [
  //     { text: 'Financial Support', path: '/financial-support' },
  //   ]
  // },

  // {
  //   text: 'Analyticas Report',
  //   icon: <LocationCity />,
  //   children: [
  //      { text: 'Vender Report', path: '/vender-report' },
  //      { text: 'Store Report', path: '/store-report' },
  //      { text: 'Delivery Partner Report', path: '/delivery-patner-report' },

  //   ]
  // },

  // {
  //   text: 'Customer Support Campaigns',
  //   icon: <SupportAgentSharp/>,
  //   children: [
  //     { text: 'customer', path: '/customer-support' },
  //   ]
  // },

 
  {
    text: 'Driver Management',
    icon: <DriveEta />,
    children: [
      { text: 'Drivers', path: '/drivers' },
      { text: 'Approved Drivers', path: '/drivers/approved' },
      { text: 'Pending Drivers', path: '/drivers/pending' },
      // { text: 'Create Driver', path: '/drivers/create' },
    ]
  },
 

  // {
  //   text: 'Promocodes',
  //   icon: <Percent />,
  //   children: [
  //     { text: 'Promocode List', path: '/promocodes' },
  //     { text: 'Add Promocode ', path: '/add-promocodes' },
  //   ]
  // },

  // {
  //   text: 'User Management',
  //   icon: <People />,
  //   path:"/user-management"
    
  // },



// ... (rest of the imports)

// ... (menuItems array)
{
    text: "Payout",
    icon: <PaymentsIcon />,
    children: [
      // { text: "Payouts", path: "/payouts" },
      { text: "Store Payouts", path: "/payouts/stores" },
      { text: "Vendor Payouts", path: "/payouts/vendors" },
      { text: "Delivery Payouts", path: "/payouts/delivery-partners" },
    ],
  }, 
// ... (rest of the menuItems array)


// {
//   text: "Content Management",
//   icon: <Article />,
//   children: [
//     { text: "Privacy Policy", path: "/privacy-policy" },
//     { text: "Terms and Conditions", path: "/terms-condition" },
//     { text: "FAQ", path: "/faq" },
//     { text: "About", path: "/about-us" },
//     { text: "contact", path: "/contact" },
//     { text: "Landing Page", path: "/landing-page" },
//   ],
// },

// {
//   text: "Roles",
//   icon: <Security />,
//   children: [
//     { text: "Create Role", path: "/create-role" },
//     { text: "Role List", path: "/role" },
//     { text: "Create Staff", path: "/create-staff" },
//     { text: "Staff List", path: "/staff" },
//   ],
// },

// {
//   text: "Reports",
//   icon: <BarChart />,
//   children: [
//     { text: "Restaurant Reports", path: "/restaurant-report" },
//     { text: "Delivery People Reports", path: "/delivery-report" },
//     { text: "Order Reports", path: "/order-report" },
//     { text: "Top Users Reports", path: "/top-user-report" },
//     { text: "Wallet Reports", path: "/wallet-report" },
// ],},
//  {
//     text: 'Settings',
//     icon: <SettingsApplications/>,
//     path:"/setting"
//   },

  
]

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(null);

  return (
   <Stack
  sx={{
    width: '100%',
    position: 'relative',
    top: 0,
    left: 0,
    height: 'auto',
    bgcolor: 'transparent',
    boxShadow: 'none',
    overflowY: 'auto',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  }}
>
  <List sx={{ pt: 2 }}>
    {menuItems.map((item) => (
      <React.Fragment key={item.text}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() =>
              item.children
                ? setOpen(open === item.text ? null : item.text)
                : navigate(item.path)
            }
            sx={{
              px: 2,
              py: 1,
              borderRadius: 1,
              mx: 1, // Adds a little gap from the sidebar edges
              backgroundColor: location.pathname === item.path ? 'action.selected' : 'transparent',
              color: location.pathname === item.path ? 'primary.main' : 'text.primary',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 36, 
              color: location.pathname === item.path ? 'primary.main' : 'inherit' 
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
            {item.children && (
              <Box
                sx={{
                  ml: 'auto',
                  transform: open === item.text ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: '0.2s',
                  display: 'flex',
                  color: 'inherit'
                }}
              >
                <ChevronRight fontSize="small" />
              </Box>
            )}
          </ListItemButton>
        </ListItem>

        {item.children && (
          <Collapse in={open === item.text} timeout="auto" unmountOnExit>
            <List sx={{ pl: 4, mt: 0.5 }}>
              {item.children.map((sub) => (
                <ListItem key={sub.text} disablePadding sx={{ mb: 0.3 }}>
                  <ListItemButton
                    onClick={() => navigate(sub.path)}
                    sx={{
                      px: 2,
                      py: 0.7,
                      borderRadius: 1,
                      mr: 1,
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        color: 'text.primary',
                        '& .MuiListItemIcon-root': { color: 'inherit' }
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
                      <RadioButtonUnchecked sx={{ fontSize: 10 }} />
                    </ListItemIcon>
                    <ListItemText primary={sub.text} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    ))}
  </List>
</Stack>
  );
}