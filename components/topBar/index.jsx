import { React } from 'react';
import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import { useLocation, useMatch, Link } from 'react-router-dom';

import { useUserQuery } from '../../hooks/useQueries';
import './styles.css';

function TopBar() {
  const location = useLocation();
  const userDetailMatch = useMatch('/users/:userId');
  const userId = userDetailMatch?.params.userId;

  const { data: user, isError } = useUserQuery(userId);

  const userName = user
    ? `${user.user_name}`
    : null;

  let rightText = '';

  if (userDetailMatch && userName) {
    rightText = userName;
  } else if (location.pathname === '/') {
    rightText = 'Home';
  } else {
    rightText = '';
  }

  if (isError && userId) {
    rightText = 'Error loading view';
  }

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar className="topbar-toolbar">

        {/* Left side of the top bar */}
        <Typography variant="h6" color="inherit">
          Guess the Weight!
        </Typography>

        {/* Center with link back to index.html */}
        <Box className="topbar-center">
          <Typography
            variant="h6"
            component={Link}
            to="/"
            className="topbar-title-link"
          >
            Pokemon Weight Comparison
          </Typography>
        </Box>

        {/* Right side with description of page */}
        <Box className="topbar-right">
          {rightText && (
            <Typography variant="h6" className="topbar-context">
              {rightText}
            </Typography>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;