import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateKeyPair, exportPublicKey } from "../../lib/crypto";
import { savePrivateKey } from "../../lib/storage";
import { api } from "../../lib/api";

export default function SetupKeys() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
  const setup = async () => {
    try {
      const keyPair = await generateKeyPair();

      await savePrivateKey(keyPair.privateKey);

      const publicKey = await exportPublicKey(keyPair.publicKey);

      await api.post("/keys", {
        publicKey,
      });

      setProgress(100);

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);

    } catch (err) {
      console.error(err);
      alert("Key setup failed");
    }
  };

  setup();
}, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">

      <h1 className="text-xl font-semibold mb-6 flex items-center gap-2">
        🔐 Sanctuary
      </h1>

      <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-md text-center">

        <div className="w-20 h-20 mx-auto rounded-full border-4 border-blue-500 flex items-center justify-center text-3xl mb-4">
          🔑
        </div>

        <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm mb-4">
          Quantum-Resistant Entropy
        </div>

        <h2 className="text-lg font-medium">
          Generating secure encryption keys...
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          We're creating your unique end-to-end encryption keys. This ensures only you and your recipients can read your messages.
        </p>

        <div className="mt-6">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between text-sm mt-2 text-gray-600">
            <span>{progress}% Completed</span>
            <span>Generating...</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6 text-left text-sm">
          <div className="border rounded-lg p-3">
            🔒 <strong>Client-Side</strong>
            <p className="text-gray-500 mt-1">
              Keys are generated locally. We never see your private keys.
            </p>
          </div>

          <div className="border rounded-lg p-3">
            🛡 <strong>AES-256 Bit</strong>
            <p className="text-gray-500 mt-1">
              Military-grade encryption for maximum privacy.
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-6 text-center max-w-md">
        Your safety is our priority. Sanctuary uses strong encryption principles to ensure your conversations remain private.
      </p>
    </div>
  );
}
