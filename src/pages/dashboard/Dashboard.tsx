import MenuPanel from "../../components/sidebar/MenuPanel";
import ChatArea from "../../components/menu/chat/ChatArea";
import ListPanel from "../../components/list/ListPanel";
import { useState } from "react";

type ViewMode = "conversations" | "newChat";


export default function Dashboard() {

  const [viewMode, setViewMode] = useState<ViewMode>("conversations");

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <MenuPanel onNewChat={() => setViewMode("newChat")} onViewChat={() => setViewMode("conversations")} />
      <ListPanel viewMode={viewMode} />
      <ChatArea />
    </div>
  );
}