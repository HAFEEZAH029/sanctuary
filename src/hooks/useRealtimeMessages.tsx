import { useCallback, useEffect, useRef, useState } from "react";
import { clearAuthTokens, refreshAccessToken } from "../lib/api";

const WS_URL = "wss://whisperbox.koyeb.app/ws";

type RealtimeEvent = {
  event: string;
  [key: string]: any;
};

type UseRealtimeMessagesOptions = {
  enabled?: boolean;
  onMessageReceived: (message: any) => void;
};

export function useRealtimeMessages({
  enabled = true,
  onMessageReceived,
}: UseRealtimeMessagesOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);
  const onMessageReceivedRef = useRef(onMessageReceived);

  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    clearReconnectTimer();

    if (!enabled) return;

    const token = localStorage.getItem("token");

    if (!token) return;

    socketRef.current?.close();

    const socket = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as RealtimeEvent;

        if (data.event === "message.receive") {
          onMessageReceivedRef.current(data);
        }

        if (data.event === "error") {
          console.error("WebSocket error event", data.detail);
        }
      } catch (error) {
        console.error("Invalid WebSocket message", error);
      }
    };

    socket.onerror = () => {
      setIsConnected(false);
    };

    socket.onclose = async (event) => {
      setIsConnected(false);

      if (!shouldReconnectRef.current) return;

      if (event.code === 4001) {
        const accessToken = await refreshAccessToken();

        if (accessToken) {
          reconnectTimerRef.current = window.setTimeout(connect, 250);
        } else {
          clearAuthTokens();
          window.location.assign("/login");
        }

        return;
      }

      if (event.code === 4003) {
        clearAuthTokens();
        window.location.assign("/login");
        return;
      }

      reconnectTimerRef.current = window.setTimeout(connect, 3000);
    };
  }, [clearReconnectTimer, enabled]);

  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();

    return () => {
      shouldReconnectRef.current = false;
      clearReconnectTimer();
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [clearReconnectTimer, connect]);

  const sendRealtimeMessage = useCallback((to: string, payload: any) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify({
      event: "message.send",
      to,
      payload,
    }));

    return true;
  }, []);

  return {
    isConnected,
    sendRealtimeMessage,
  };
}
