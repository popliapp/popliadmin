import * as React from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
import { 
  Box, Stack, Typography, Badge, Avatar, IconButton, 
  InputBase, Paper, List, ListItem, ListItemText, 
  ClickAwayListener, ListItemIcon, Menu, MenuItem 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; 
// import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'; // Added Logout Icon
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
import { menuItems } from './MenuContent'; 

export default function Header({ onToggleDashboard, showToggleButton }) {
  const navigate = useNavigate();
  // const { logout } = useAuth();
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // --- Logout Menu State ---
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    console.log("User logged out");
        localStorage.removeItem('user');
    
    // Call AuthContext logout
    // logout();
    
    // Navigate to login
    navigate('/', { replace: true });
  };

  // Flatten menu for search logic
  const flatMenu = React.useMemo(() => {
    let flat = [];
    menuItems.forEach(item => {
      if (item.path) flat.push({ text: item.text, path: item.path, icon: item.icon });
      if (item.children) {
        item.children.forEach(child => {
          flat.push({ text: child.text, path: child.path, parent: item.text, icon: item.icon });
        });
      }
    });
    return flat;
  }, []);

  const filteredResults = flatMenu.filter(item =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Stack direction="column" sx={{ width: '100%', bgcolor: '#ffffff', position: 'sticky', top: 0, zIndex: 1100 }}>
      
      {showToggleButton && onToggleDashboard && (
        <Box sx={{ p: 1, bgcolor: '#2563eb' }}>
          <button onClick={onToggleDashboard} style={{ color: 'white', background: 'none', border: '1px solid white', cursor: 'pointer', padding: '4px 8px' }}>
            🔄 Switch Dashboard
          </button>
        </Box>
      )}

      <Stack 
        direction="row" 
        sx={{ px: 2, py: 1.5, alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: '#e5e7eb' }}
      >
        {!isSearchExpanded && (
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              aria-label="open drawer"
              onClick={onToggleDashboard}
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <NavbarBreadcrumbs />
            </Box>
          </Stack>
        )}

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: isSearchExpanded ? 1 : 0, justifyContent: 'flex-end' }}>
          <ClickAwayListener onClickAway={() => setIsSearchExpanded(false)}>
            <Box sx={{ position: 'relative', width: isSearchExpanded ? '100%' : 'auto', display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{
                display: 'flex', alignItems: 'center', bgcolor: isSearchExpanded ? 'action.hover' : 'transparent',
                borderRadius: 2, px: isSearchExpanded ? 1 : 0, width: isSearchExpanded ? '35%' : 40, height: 40, border: isSearchExpanded ? '1px solid #ddd' : 'none'
              }}>
                <IconButton onClick={() => setIsSearchExpanded(true)}><SearchRoundedIcon /></IconButton>
                {isSearchExpanded && (
                  <InputBase
                    autoFocus
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ ml: 1, flex: 1 }}
                  />
                )}
              </Box>

              {isSearchExpanded && searchQuery && (
                <Paper sx={{ position: 'absolute', top: 50, right: 0, width: { xs: '90vw', sm: 350 }, zIndex: 1000 }}>
                  <List dense>
                    {filteredResults.map((item, i) => (
                      <ListItem button key={i} onClick={() => { navigate(item.path); setIsSearchExpanded(false); }}>
                        <ListItemIcon sx={{ minWidth: 35 }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} secondary={item.parent} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
          </ClickAwayListener>

          {!isSearchExpanded && (
            <Stack direction="row" spacing={1} alignItems="center">
              {/* <Badge badgeContent={86} color="error"><NotificationsRoundedIcon color="action" /></Badge> */}
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600 }}>Admin</Typography>
              
              {/* Profile Avatar Trigger */}
              <Avatar 
                onClick={handleProfileClick}
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: '#e0f2f1', 
                  color: '#00897b', 
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 } 
                }}
              >
                AD
              </Avatar>

              {/* Logout Only Menu */}
              <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                  elevation: 2,
                  sx: { mt: 1.5, minWidth: 140, filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))' }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutRoundedIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Logout" 
                    primaryTypographyProps={{ fontSize: '14px', color: 'error.main', fontWeight: 500 }} 
                  />
                </MenuItem>
              </Menu>

            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}