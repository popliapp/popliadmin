import * as React from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuContent from './MenuContent';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function SideMenu({ open, toggleDrawer }) {
  return (
    <>
      <MuiDrawer
        variant="temporary"
        open={open}
        onClose={toggleDrawer(false)}
        ModalProps={{
          keepMounted: true, 
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          [`& .${drawerClasses.paper}`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <SideMenuContent />
      </MuiDrawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          [`& .${drawerClasses.paper}`]: {
            backgroundColor: 'background.paper',
          },
        }}
      >
        <SideMenuContent />
      </Drawer>
    </>
  );
}

function SideMenuContent() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth:68 ,height:64}}>
        <img 
          src="/khetivalah.png" 
          alt="KHETI CORNER"
          className='h-38 w-32 object-contain'
        />
      </Box>
      
      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <MenuContent />
      </Box>

      <Divider />
      
      {/* User Profile Footer */}
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          sizes="small"
          alt="Admin"
          sx={{ width: 36, height: 36 }}
        >
          A
        </Avatar>
        <Box sx={{ mr: 'auto' }}>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
            Admin User
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            admin@kheti.com
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
