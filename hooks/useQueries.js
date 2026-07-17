import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import api from '../lib/api';
import queryKeys from '../lib/queryKeys';

export function useUserQuery(userId) {
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => api.get(`/user/${userId}`).then((res) => res.data),
    enabled: Boolean(userId),
  });
}





