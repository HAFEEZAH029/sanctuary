import NewChatPanel from "../create/NewChatPanel";

type Props = {
  viewMode: "conversations" | "newChat";
};

export default function ListPanel({ viewMode }: Props) {
  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col">

      {viewMode === "conversations" ? (
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

      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-center text-gray-500 text-sm leading-relaxed">
          Click the new chat button to start a conversation
        </p>
      </div>
     </>
      ) :
      <NewChatPanel />
      }

    </div>
  );
}