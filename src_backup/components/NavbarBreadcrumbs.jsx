import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useLocation } from 'react-router-dom';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: theme.palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

export default function NavbarBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      {/* <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
        Dashboard
      </Typography> */}
      {pathnames.map((value, index) => {
        return (
          <Typography
            key={value}
            variant="body1"
            sx={{ color: 'text.primary', fontWeight: 600, textTransform: 'capitalize' }}
          >
            {value.replace(/-/g, ' ')}
          </Typography>
        );
      })}
    </StyledBreadcrumbs>
  );
}