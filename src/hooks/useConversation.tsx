import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await api.get("/conversations");
      return res.data;
    },
  });
}