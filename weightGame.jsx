import React, { useEffect, useState, useRef } from 'react';
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
import { usePokemonQuery, useRandomObjectQuery } from './hooks/useQueries';
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

  const { loggedInUser, gameMode } = useOutletContext();

  const [pokemonId, setPokemonId] = useState(() => getRandomPokemonId());
  const [pokemonId2, setPokemonId2] = useState(() => getRandomPokemonId());
  const { data: pokemon, isPending, isError } = usePokemonQuery(pokemonId);
  const pokemonQuery2 = usePokemonQuery(pokemonId2);

  const [score, setScore] = useState(0);
  const [objectFetchCount, setObjectFetchCount] = useState(0);
  const [message, setMessage] = useState(''); 
  const objectQuery = useRandomObjectQuery(objectFetchCount);
  const previousGameMode = useRef(gameMode);

  const isPokemonMode = gameMode === 'pokemon';
  const opponent = isPokemonMode
    ? (pokemonQuery2.data ? { name: pokemonQuery2.data.name, image: pokemonQuery2.data.sprite, weight: pokemonQuery2.data.weight / 10 } : null)
    : (objectQuery.data ? { name: objectQuery.data.name, image: objectQuery.data.image, weight: objectQuery.data.weight } : null);
  const isPending2 = isPokemonMode ? pokemonQuery2.isPending : objectQuery.isPending;
  const isError2 = isPokemonMode ? pokemonQuery2.isError : objectQuery.isError;
  
  const refreshPokemon = () => {
    setPokemonId(getRandomPokemonId());
    if(isPokemonMode) {
      setPokemonId2(getRandomPokemonId());
    } else {
      setObjectFetchCount((c) => c + 1);
    }    
  };

  const saveScore = async (finalScore) => {
    //only send to database if there is score to save
    if (!loggedInUser || finalScore === 0) return;

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

  useEffect(() => {
  // skip the very first render - there's no "previous mode" to save from yet
    if (previousGameMode.current !== gameMode) {
      if (score > 0) {
        saveScore(score);
      }
      setScore(0);
      setMessage(`You changed game modes, your final score is ${score}`);
      previousGameMode.current = gameMode;
    }
  }, [gameMode]);

  const handleGuess = (guessedPokemon) => {
    if (!pokemon || !opponent) return; //in case one isn't working

    const pokemonWeight = pokemon.weight / 10;

    let heavierSide;
    if (pokemonWeight === opponent.weight){
      heavierSide = null; //ties, no points added
    } else {
      heavierSide = pokemonWeight > opponent.weight ? 1 : 2;
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
      {/* Second pokemon or random object here*/}
      <Box textAlign="center">
      {isPending2 && (
        <Box display="flex" justifyContent="left" py={4}>
          <CircularProgress />
        </Box>
      )}

      {isError2 && <Typography color="error">Failed to load other item</Typography>}

      {opponent && (
        <Box onClick={() => handleGuess(2)}
          sx ={{ cursor: 'pointer' }}
        >
          <img src={opponent.image} alt={opponent.name} style={{ maxWidth: 200}}/>
          <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
            {opponent.name}
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
  //swapping between the game's mode
  const [gameMode, setGameMode] = useState('pokemon'); // 'pokemon' or 'object'

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
            <Box display="flex" flexDirection="column" gap={1} p={2}>
            <Button
                variant={gameMode === 'pokemon' ? 'contained' : 'outlined'}
                onClick={() => setGameMode('pokemon')}
              >
                Pokemon vs. Pokemon
              </Button>
              <Button
                variant={gameMode === 'object' ? 'contained' : 'outlined'}
                onClick={() => setGameMode('object') }
              >
                Pokemon vs. Object
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item sm={9}>
          <Paper className="main-grid-item">
            <Outlet context={{ loggedInUser, setLoggedInUser, gameMode, setGameMode }} />
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
