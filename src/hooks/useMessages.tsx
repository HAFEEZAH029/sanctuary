import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function useMessages(userId: string | null) {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id ?? currentUser?.user_id ?? null;

  return useQuery({
    queryKey: ["messages", currentUserId, userId],
    queryFn: async () => {
      const res = await api.get(`/conversations/${userId}/messages`);
      return res.data;
    },
    enabled: !!currentUserId && !!userId,
  });
}
