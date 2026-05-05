import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useMessages(userId: string | null) {
  return useQuery({
    queryKey: ["messages", userId],
    queryFn: async () => {
      const res = await api.get(`/conversations/${userId}/messages`);
      return res.data;
    },
    enabled: !!userId,
  });
}