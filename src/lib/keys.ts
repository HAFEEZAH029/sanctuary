import { api } from "./api";

export async function getUserPublicKey(userId: string) {
  const res = await api.get(`/users/${userId}/public-key`);
  return res.data.public_key;
}

export async function getOwnPublicKey(userId: string) {
  return getUserPublicKey(userId);
}
