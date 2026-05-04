export interface User {
  id: string;
  username: string;
  display_name: string;
}

export interface Conversation {
  user_id: string;
  username: string;
  display_name: string;
  last_message_at: string;
}

export interface MessagePayload {
  ciphertext: string;
  iv: string;
  encryptedKey: string;
  encryptedKeyForSelf: string;
}

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  payload: MessagePayload;
  created_at: string;
}