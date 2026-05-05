import { useState } from "react";
import { useSearchUsers } from "../../hooks/useSearchUsers";


type Props = {
  onSelectUser: (user: any) => void;
};

export default function NewChatPanel({ onSelectUser }: Props) {
  const [query, setQuery] = useState("");

  const { data: users, isLoading } = useSearchUsers(query);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold mb-2">
        New Conversation
      </h2>

      <p className="text-sm text-gray-500 mb-4">
        Start a secure, end-to-end encrypted chat
      </p>
      <input
        type="text"
        placeholder="Search username..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 border rounded-lg mb-4"
      />
     </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading && <p>Searching...</p>}

        {users?.map((user: any) => (
          <div
            key={user.id}
            className="flex justify-between items-center border p-3 rounded-lg cursor-pointer"
          >
            <div>
              <p className="font-medium">{user.display_name}</p>
              <p className="text-sm text-gray-500">
                @{user.username}
              </p>
            </div>

            <button onClick={() => onSelectUser(user)} className="bg-blue-50 text-blue-600 font-medium p-3 rounded-2xl cursor-pointer">
              Start
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
