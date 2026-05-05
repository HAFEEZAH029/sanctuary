import NewChatPanel from "../create/NewChatPanel";
import ListPanelEmpty from "./ListPanelEmpty";
{/**import { api } from "../../lib/api"; **/}

type Props = {
  viewMode: "conversations" | "newChat";
  setViewMode: (mode: "conversations" | "newChat") => void;
  onSelectUser: (user: any) => void;
  activeUser: any;
  chats: any[];
  refetchChats: () => void;
};

export default function ListPanel({ viewMode, setViewMode, onSelectUser, activeUser, chats }: Props) {

  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col">

      {viewMode === "conversations" ? (
        chats.length === 0 ? (
          <ListPanelEmpty activeUser={activeUser} onSelectUser={onSelectUser} />
        ) : (
          <>

            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-gray-900">Conversations</h2>
                <button className="text-gray-400 hover:text-gray-600 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {chats.map((chat) => {
              const chatId = chat.id ?? chat.user_id;

              return (
                <button
                  type="button"
                  key={chatId}
                  onClick={() => onSelectUser({ ...chat, id: chatId })}
                  className={`w-full flex items-center gap-3 p-4 cursor-pointer transition text-left ${
                    (activeUser?.id ?? activeUser?.user_id) === chatId ? "bg-blue-50" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-slate-400 flex items-center justify-center">
                    <span className="text-white text-sm">
                      {chat.display_name?.charAt(0)}
                    </span>
                  </div>

                  {/* Name + last message */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-black truncate">
                      {chat.display_name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </>
        )
      ) : (
        <NewChatPanel
          onSelectUser={ async (user) => {
           {/** await api.post("/conversations", {
              recipient_username: user.username,
              });

            refetchChats(); **/}

            onSelectUser(user);

            setViewMode("conversations");
          }}
        />
      )}

    </div>
  );
}
