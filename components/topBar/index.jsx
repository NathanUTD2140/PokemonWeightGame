import {useState, React} from 'react';
import { AppBar, Box, Toolbar, Typography, Button } from '@mui/material';
import { useLocation, useMatch, Link, useNavigate } from 'react-router-dom';

import { useUserQuery } from '../../hooks/useQueries';
import api from '../../lib/api';
import './styles.css';



function topBar( {loggedInUser, setLoggedInUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userDetailMatch = useMatch('/users/:userId');
  const userId = userDetailMatch?.params.userId;
  
  const { data: user, isError } = useUserQuery(userId);

  const userName = user
    ? `${user.user_name}`
    : null;

  let rightText = '';

  if (userDetailMatch && userName) {
    rightText = 'Profile Page';
  } else if (location.pathname === '/') {
    rightText = 'Game Page';
  } else if (location.pathname === '/login'){
    rightText = 'Sign-In Page';
  } else {
    rightText = '';
  }

  if (isError && userId) {
    rightText = 'Error loading view';
  }

  //made to handle the logout in top bar with a button
  const handleLogout = async () => {
  try {
    await api.post('/admin/logout', {}, { withCredentials: true }); 
    //calls the API to log out
    setLoggedInUser(null); //set it as blank if it worked
  } catch (err) {
    console.error('Logout failed');
  }
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar className ="topbar-toolbar">
          
          {/* Left side of the top bar */}
          <Typography variant="h6" color="inherit">
            Guess the Weight!
          </Typography>

           {/* Center with link back to index.html */}
          <Box className="topbar-center">
            <Button
              component={Link}
              to="/"
              className="topbar-title-link"
              variant="outlined"
              color="inherit"
              sx={{ color: 'black', borderColor: 'black' }}
            >
              Pokemon Weight Comparison
            </Button>
          </Box>

          {/* Right side with the logged in user, logout button, and description of page*/}
          <Box className="topbar-right">
            {rightText && (
              <Typography variant="h6" className="topbar-context">
                {rightText}
              </Typography>
            )}

            {loggedInUser ? (
              <>
                <Typography variant="h6" 
                  component = {Link}
                  to={`/users/${loggedInUser._id}`}
                  className="topbar-user"
                  sx = {{ textDecoration: 'none', color: 'inherit' }}
                  >
                  {loggedInUser.user_name} {/*Outputs login name*/}
                </Typography>

                <button className="logout-button" onClick={handleLogout}> 
                  {/*calls the function to logout*/}
                  Logout
                </button>

              </>
            ) : (
                <Typography
                    variant = "h6"
                    component = {Link}
                    to = "login"
                    className = "topbar-login-link"
                >
                    Please Login
                </Typography>
            )}
          </Box>
      </Toolbar>
    </AppBar>
  );
}

export default topBar;
