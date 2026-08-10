import React, { useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Box, Button, Card, CardContent, 
  CircularProgress, Typography, Grid, Paper } from '@mui/material';
import {
  createBrowserRouter, RouterProvider, Outlet, useParams,
useOutletContext } from 'react-router-dom';

import './styles/main.css';
import Login from './components/login';
import TopBar from './components/topBar';
import UserDetail from './components/userDetail';
import { usePokemonQuery } from './hooks/useQueries';
import { getRandomPokemonId } from './lib/randomPokemonID.js'
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

  const { loggedInUser } = useOutletContext();

  const [pokemonId, setPokemonId] = useState(() => getRandomPokemonId());
  const [pokemonId2, setPokemonId2] = useState(() => getRandomPokemonId());
  const { data: pokemon, isPending, isError } = usePokemonQuery(pokemonId);
  const { data: pokemon2, isPending: isPending2, isError: isError2 } = usePokemonQuery(pokemonId2);

  const [score, setScore] = useState(0);
  const [message, setMessage] = useState(''); 

  const refreshPokemon = () => {
    setPokemonId2(getRandomPokemonId());
    setPokemonId(getRandomPokemonId());
  };
  
  const saveScore = async (finalScore) => {
    //only send to database if there is score to save
    if (!loggedInUser) return;

    try {
      await fetch(apiUrl(`/user/${loggedInUser._id}/score`), {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ score: finalScore })
      });
    } catch (err){
      console.error ('Failed to save data', err);
    }
  }

  const handleGuess = (guessedPokemon) => {
    if (!pokemon || !pokemon2) return; //in case one isn't working

    let heavierSide;
    if (pokemon.weight === pokemon2.weight){
      heavierSide = null; //ties, no points added
    } else {
      heavierSide = pokemon.weight > pokemon2.weight ? 1 : 2;
    }
    
    if (heavierSide === null){
      setMessage("It's a Tie! You should find a shiny next time!")
      refreshPokemon();
      return;
    }

    if(guessedPokemon === heavierSide){
      setScore((prev) => prev + 1);
      setMessage("Awesome! You're right!");
      refreshPokemon();
    }
    else{
      setMessage(`Unfortunate, you got it wrong. Your final score is ${score}`)
      saveScore(score);
      setScore(0);
      refreshPokemon();
    }
  }

  return (
    <div>
    <Typography variant="body1">
      Welcome to the my funny little game! Click on the pokemon button to get the weight comparison!
      Login to save your high scores or come back to see your high scores. Happy gaming!
    </Typography>

      <Typography variant="h6" textAlign="center" py={1}>
        Score: {score}
      </Typography>

      {message && (
        <Typography textAlign="center" color="text.secondary">
          {message}
        </Typography>
      )}

      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="center"
        alignItems="center"
        gap={4}
        py={2}
      >

    {/* First Mon */}
    <Box textAlign="center">
     {isPending && (
        <Box display="flex" justifyContent="right" py={4}>
          <CircularProgress />
        </Box>
      )}

      {isError && <Typography color="error">Failed to load Pokemon.</Typography>}

      {pokemon && (
        <Box onClick={() => handleGuess(1)}
          sx ={{ cursor: 'pointer' }}
        >
          <img src={pokemon.sprite} alt={pokemon.name} />
          <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
            {pokemon.name}
          </Typography>
          {/* <Typography>Weight: {pokemon.weight / 10} kg</Typography>

          <Button variant="contained" onClick={handleNewPokemon}>
            New Pokemon
          </Button> */}
        </Box>
      )}
      </Box>

      <Box textAlign="center">
      {isPending2 && (
        <Box display="flex" justifyContent="left" py={4}>
          <CircularProgress />
        </Box>
      )}

      {isError2 && <Typography color="error">Failed to load Pokemon.</Typography>}

      {pokemon2 && (
        <Box onClick={() => handleGuess(2)}
          sx ={{ cursor: 'pointer' }}
        >
          <img src={pokemon2.sprite} alt={pokemon2.name} />
          <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
            {pokemon2.name}
          </Typography>
          {/* <Typography>Weight: {pokemon2.weight / 10} kg</Typography>

          <Button variant="contained" onClick={handleNewPokemon2}>
            New Pokemon
          </Button> */}
        </Box>
      )}
      </Box>
      </Box>
    </div>
  );
}

function UserDetailRoute() {
  const { userId } = useParams();
  return <UserDetail userId={userId} />;
}

function LoginRoute(){
  const { loggedInUser, setLoggedInUser } = useOutletContext();
  return <Login loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />;
}

function Root() {
  // sets up the users to log in
  // If logged in, can show the normal page
  const [loggedInUser, setLoggedInUser] = useState(null);

  // check session on load, so a page refresh doesn't log the user out
  useEffect(() => {
    fetch(apiUrl('/admin/me'), { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setLoggedInUser(data))
      .catch(() => setLoggedInUser(null));
  }, []);

  return (
    <div>
      <Grid container spacing={2}>
        
        {/* TopBar */}
        <Grid item xs={12}>
          <TopBar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
        </Grid>

        <div className="main-topbar-buffer" />

        {/* Sidebar, will need to implement later. */}
        <Grid item sm={3}>
          <Paper className="main-grid-item">
            
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item sm={9}>
          <Paper className="main-grid-item">
            <Outlet context={{ loggedInUser, setLoggedInUser }} />
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
      { path: 'users/:userId', element: <UserDetailRoute />  },
      { path: 'login', element: <LoginRoute />  },
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
