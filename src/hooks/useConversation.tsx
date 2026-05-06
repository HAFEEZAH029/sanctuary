import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function useConversations() {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id ?? currentUser?.user_id ?? null;

  return useQuery({
    queryKey: ["conversations", currentUserId],
    queryFn: async () => {
      const res = await api.get("/conversations");
      return res.data;
    },
    enabled: !!currentUserId,
  });
}
