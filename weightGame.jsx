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
import TopBar from './components/TopBar';
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
  // well set up a user login here
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
