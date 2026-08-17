import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';

import { useUserQuery } from '../../hooks/useQueries';
import './styles.css';

function UserDetail({ userId: userIdProp }) {
  const { userId: routeUserId } = useParams();
  const userId = userIdProp ?? routeUserId;
  const { data: user, isPending, isError, error } = useUserQuery(userId);

  if (isError) {
    const status = error?.response?.status;
    const hint = status === 401
      ? ' Session may have expired — try logging in again.'
      : status === 404
        ? ' User not found (database may need reseeding).'
        : '';
    return (
      <Typography color="error">
        Unable to load this user.
        {hint}
      </Typography>
    );
  }

  if (isPending) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  // high_score is an array of Numbers, default []
  // Will need to adjust later for multiple high scores
  const highScoreObject = user.high_score_object && user.high_score_object.length > 0
    ? Math.max(...user.high_score_object)
    : 'No scores yet';
  const highScorePokemon= user.high_score_pokemon && user.high_score_pokemon.length > 0
    ? Math.max(...user.high_score_pokemon)
    : 'No scores yet';


  return (
    <Card className="user-detail-card">
      <CardContent>
        <Typography className="user-detail-title"> {/*pulls from the style file */}
          {user.user_name} {/*Shows the user name */}
        </Typography>

        <Typography className="user-detail-row">
          <span className="user-detail-label"> Highest Score for Pokemon: </span> {highScorePokemon}
        </Typography>
        <Typography className="user-detail-row">
          <span className="user-detail-label"> Highest Score for Objects: </span> {highScoreObject}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default UserDetail;
