import { openDB } from "idb";

const DB_NAME = "secure-chat";
const STORE_NAME = "keys";

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
}

export async function savePrivateKey(key: CryptoKey) {
  const db = await getDB();
  await db.put(STORE_NAME, key, "privateKey");
}

export async function getPrivateKey() {
  const db = await getDB();
  return db.get(STORE_NAME, "privateKey");
}