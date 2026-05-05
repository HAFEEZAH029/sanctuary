import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api, getRefreshToken } from "../../lib/api";

type Props = {
  onNewChat: () => void;
  onViewChat: () => void;
};

export default function MenuPanel({ onNewChat, onViewChat }: Props) {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, setPrivateKey, setToken } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const displayName = currentUser?.display_name || currentUser?.username || "Signed in";
  const username = currentUser?.username ? `@${currentUser.username}` : "";

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        await api.post("/auth/logout", {
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      console.error("Failed to revoke refresh token during logout", error);
    } finally {
      setPrivateKey(null);
      setCurrentUser(null);
      setToken(null);
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="w-64 bg-gray-50 flex flex-col justify-between p-4 border-r border-gray-200">
      <div>
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              <div className="w-6 h-6 bg-slate-500 rounded-full"></div>
            </div>
            <div className="min-w-0">
              <h1 className="text-blue-600 font-semibold text-base truncate">Sanctuary</h1>
              <p className="text-green-600 text-[10px] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full shrink-0"></span>
                E2E Secured
              </p>
            </div>
          </div>

          <div className="min-w-0 max-w-24 pt-0.5 text-right">
            <p className="text-gray-700 text-sm font-medium truncate">
              {displayName}
            </p>
            {username && (
              <p className="text-gray-400 text-xs truncate">
                {username}
              </p>
            )}
          </div>
        </div>

        <nav className="space-y-1">
          <button
            type="button"
            onClick={onViewChat}
            className="w-full flex items-center gap-3 bg-blue-50 text-blue-600 p-3 rounded-lg cursor-pointer text-left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-medium">Chats</span>
          </button>
          
          <div className="flex items-center gap-3 p-3 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Contacts</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Calls</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </div>
        </nav>
      </div>

      <div>
        <button
          type="button"
          onClick={onNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg mb-4 font-medium transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="text-lg">+</span>
          <span>New Chat</span>
        </button>

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2 text-gray-600 text-sm p-2 rounded-lg cursor-pointer hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
          
          <div className="flex items-center gap-2 text-gray-600 text-sm p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Lock</span>
          </div>
        </div>
      </div>
    </div>
  );
}
