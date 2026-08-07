import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import api from '../lib/api';
import queryKeys from '../lib/queryKeys';
import { fetchPokemon } from '../lib/pokeApi';

export function useUserQuery(userId) {
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => api.get(`/user/${userId}`).then((res) => res.data),
    enabled: Boolean(userId),
  });
}

export function usePokemonQuery(idOrName) {
  return useQuery({
    queryKey: ['pokemon', idOrName],
    queryFn: () => fetchPokemon(idOrName),
    enabled: !!idOrName, // don't fetch until we actually have an id
  });
}


