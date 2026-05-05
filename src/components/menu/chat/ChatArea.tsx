import ChatAreaEmpty from "./ChatAreaEmpty";
import { useMessages } from "../../../hooks/useMessages";
import { useState, useEffect, useRef } from "react";
import { api } from "../../../lib/api";
import { getOwnPublicKey, getUserPublicKey } from "../../../lib/keys";
import {encryptAESKey,
        importPublicKey,
        generateAESKey,
        encryptMessage,
        decryptMessage,
        decryptAESKey
} from "../../../lib/crypto";
import { useAuth } from "../../../context/AuthContext";



type Props = {
  activeUser: any;
  onBack: () => void;
};

const EMPTY_MESSAGES: any[] = [];

function getMessageTime(message: any) {
  const time = new Date(message.created_at ?? 0).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function getInitial(user: any) {
  return (user?.display_name || user?.username || "?").charAt(0).toUpperCase();
}

function getSendErrorMessage(error: any) {
  const detail =
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    error?.response?.data?.error ||
    error?.message;

  if (!detail) return "Message failed to send. Please try again.";

  return typeof detail === "string"
    ? detail
    : JSON.stringify(detail);
}

export default function ChatArea({ activeUser, onBack }: Props) {

  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const activeUserId = activeUser?.id ?? activeUser?.user_id ?? null;
  const { data: messages = EMPTY_MESSAGES, isLoading, refetch } = useMessages(activeUserId);
  const { currentUser, privateKey } = useAuth();
  const currentUserId = currentUser?.id ?? currentUser?.user_id ?? null;
  const [decryptedMessages, setDecryptedMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  if (!activeUser || !privateKey) {
    setDecryptedMessages([]);
    return;
  }

  const processMessages = async () => {
    const result = await Promise.all(
      messages.map(async (msg: any) => {
        try {
          // 1. decrypt AES key
          const encryptedKeyForThisUser =
            msg.from_user_id === currentUserId
              ? msg.payload.encryptedKeyForSelf
              : msg.payload.encryptedKey;

          const aesKey = await decryptAESKey(encryptedKeyForThisUser, privateKey);

          // 2. decrypt message
          const text = await decryptMessage(
            msg.payload.ciphertext,
            msg.payload.iv,
            aesKey
          );

          return {
            id: msg.id,
            text,
            isOwn: msg.from_user_id === currentUserId,
            created_at: msg.created_at,
          };
        } catch {
          return {
            id: msg.id,
            text: "[Unable to decrypt]",
            isOwn: msg.from_user_id === currentUserId,
          };
        }
      })
    );

    setDecryptedMessages(
      result.sort((first, second) => getMessageTime(first) - getMessageTime(second))
    );
  };

  processMessages();
}, [activeUserId, currentUserId, messages, privateKey]);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [decryptedMessages.length]);


  const handleSend = async () => {
    const messageText = text.trim();

    if (!messageText || isSending) return;
    if (!currentUserId) return;

    if (!activeUserId) return;

    setIsSending(true);
    setSendError("");

    try {
      const recipientPublicKeyBase64 = await getUserPublicKey(activeUserId);
      const ownPublicKeyBase64 = await getOwnPublicKey(currentUserId);

      const recipientPublicKey = await importPublicKey(recipientPublicKeyBase64);
      const ownPublicKey = await importPublicKey(ownPublicKeyBase64);

      const aesKey = await generateAESKey();

      const { ciphertext, iv } = await encryptMessage(messageText, aesKey);

      const encryptedKey = await encryptAESKey(aesKey, recipientPublicKey);

      const encryptedKeyForSelf = await encryptAESKey(aesKey, ownPublicKey);

      await api.post("/messages", {
      to: activeUserId,
      payload: {
        ciphertext,
        iv,
        encryptedKey,
        encryptedKeyForSelf,
      },
      });
    } catch (error) {
      console.error("Failed to send message", error);
      setSendError(getSendErrorMessage(error));
      setIsSending(false);
      return;
    }

    setDecryptedMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `pending-${Date.now()}`,
        text: messageText,
        isOwn: true,
        created_at: new Date().toISOString(),
      },
    ]);
    setText("");
    setIsSending(false);

    try {
      await refetch();
    } catch (error) {
      console.error("Message sent, but failed to refresh messages", error);
    }
  };


  if (!activeUser) {
    return <ChatAreaEmpty />;
  }


  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-screen overflow-hidden">

      <div className="px-6 py-4 border-b bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to empty chat"
            className="text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
              <div className="w-6 h-6 bg-slate-500 rounded-full"></div>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{activeUser.display_name}</h2>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-green-600 font-medium">SECURE LINK ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-6 py-2.5 bg-green-50 border-b border-green-100 shrink-0">
        <div className="flex items-center justify-center gap-2 text-xs text-green-700">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
          <span className="font-medium">Messages are end-to-end encrypted. No one outside of this chat can read them.</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {isLoading ? (
          <p className="text-center text-gray-400">Loading messages...</p>
        ) : (
          decryptedMessages.map((message: any) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                message.isOwn ? "justify-end" : "justify-start"
              }`}
            >
              {!message.isOwn && (
                <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center overflow-hidden shrink-0">
                  <span className="text-white text-xs font-medium">
                    {getInitial(activeUser)}
                  </span>
                </div>
              )}

              <div
                className={`max-w-[70%] px-3 py-2 rounded-lg ${
                  message.isOwn
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-blue-50 text-black rounded-bl-sm"
                }`}
              >
                <p className="text-[0.9rem] leading-relaxed break-words">
                  {message.text}
                </p>
              </div>

              {message.isOwn && (
                <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center overflow-hidden shrink-0">
                  <div className="w-5 h-5 bg-slate-300 rounded-full"></div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-white shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-end gap-3">
            <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a secure message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <button className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || !text.trim()}
              aria-label={isSending ? "Sending message" : "Send message"}
              className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed rounded-full cursor-pointer transition"
            >
              {isSending ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              )}
            </button>
          </div>
          {sendError && (
            <p className="mt-2 text-xs text-red-500">{sendError}</p>
          )}
        </div>

        <div className="px-6 pb-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
          <span className="font-medium">HARDWARE ENCRYPTED SESSION</span>
        </div>
      </div>
    </div>
  );
}
