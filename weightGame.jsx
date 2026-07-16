import React, { useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Grid, Typography, Paper } from '@mui/material';
import {
  createBrowserRouter, RouterProvider, Outlet, useParams,
} from 'react-router-dom';

import './styles/main.css';
import login from './components/login';
import topBar from './components/topBar';
import { apiUrl } from './lib/apiBaseUrl.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: true,
    },
  },
});

function Home() {
  return (
    <Typography variant="body1">
      Welcome to the my funny little game! Click on the pokemon button to get the weight comparison!
      Login to save your high scores or come back to see your high scores. Happy gaming!
    </Typography>
  );
}


function Root() {
  // sets up the users to log in
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Check session on load
  useEffect(() => {
    fetch(apiUrl('/admin/me'), {
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => setLoggedInUser(data)) //if data found, stay logged in
      .catch(() => setLoggedInUser(null)); //otherwise no user
  }, []);

  // only shows in login page if no current user
  if (!loggedInUser) {
    return (
      <login setLoggedInUser={setLoggedInUser} />
    ); //routs to login page
  }

  // If logged in, can show the normal page
  return (
    <div>
      <Grid container spacing={2}>
        
        {/* TopBar */}
        <Grid item xs={12}>
          <topBar
            loggedInUser={loggedInUser}
            setLoggedInUser={setLoggedInUser}
          />
        </Grid>

        <div className="main-topbar-buffer" />

        {/* Sidebar */}
        <Grid item sm={3}>
          <Paper className="main-grid-item">
            <UserList />
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item sm={9}>
          <Paper className="main-grid-item">
            <Outlet />
          </Paper>
        </Grid>

      </Grid>
    </div>
  );
}

function UserLayout() {
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Home /> },

      { path: null, element: null },

      {
        path: null,
        element: <UserLayout />,
        children: [ //need to add in paths later
          { index: true, element: null},
          { path: null},
        ],
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('weightGameApp'));
root.render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    {import.meta.env.DEV ? (
      <ReactQueryDevtools initialIsOpen={false} />
    ) : null}
  </QueryClientProvider>,
);
