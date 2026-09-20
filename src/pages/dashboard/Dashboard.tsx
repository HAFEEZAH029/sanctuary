import MenuPanel from "../../components/sidebar/MenuPanel";
import ChatArea from "../../components/menu/chat/ChatArea";
import ListPanel from "../../components/list/ListPanel";
import { useState, } from "react";
import { useConversations } from "../../hooks/useConversation";


type ViewMode = "conversations" | "newChat";


export default function Dashboard() {

  const [viewMode, setViewMode] = useState<ViewMode>("conversations");
  const [activeUser, setActiveUser] = useState<any | null>(null);
  const { data: conversationsFromServer = [], refetch } = useConversations();

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <MenuPanel onNewChat={() => setViewMode("newChat")} onViewChat={() => setViewMode("conversations")} />
      <ListPanel 
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSelectUser={setActiveUser}
        refetchChats={refetch}
        chats={conversationsFromServer}
        activeUser={activeUser}
       />
      <ChatArea activeUser={activeUser} onBack={() => setActiveUser(null)} />
    </div>
  );
}
