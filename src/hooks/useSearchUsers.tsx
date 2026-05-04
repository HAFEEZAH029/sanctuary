import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

type User = {
  id: string;
  username: string;
  display_name: string;
};

export function useSearchUsers(query: string) {
  return useQuery<User[]>({
    queryKey: ["search-users", query],
    queryFn: async () => {
      const res = await api.get(`/users/search?q=${query}`);
      return res.data;
    },
    enabled: query.length >= 2,
  });
}