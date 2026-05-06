import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api, saveAuthTokens } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { generateRSAKeyPair,
         exportPublicKey,
         wrapPrivateKey,
         deriveEncryptionKey,
         generateSalt,
         toBase64 } from "../../lib/crypto";

type RegisteredUser = {
  id: string;
  user_id?: string;
  username?: string;
  display_name?: string;
  public_key?: string;
  wrapped_private_key?: string;
  pbkdf2_salt?: string;
};

function getRegisteredUser(data: any): RegisteredUser | null {
  const user = data.user ?? data;
  const userId = user?.id ?? user?.user_id;

  if (!userId) {
    return null;
  }

  return {
    ...user,
    id: userId,
  };
}


export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const { setToken, setCurrentUser, setPrivateKey } = useAuth();
  const [errors, setErrors] = useState<{ email?: string; displayName?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string>("");

  function generateUsername(email: string) {
  return email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toLowerCase();
}

  const signupMutation = useMutation({
  mutationFn: async () => {
    const keyPair = await generateRSAKeyPair();

    const salt = generateSalt();

    const derivedKey = await deriveEncryptionKey(password, salt);

    const wrappedPrivateKey = await wrapPrivateKey(
      keyPair.privateKey,
      derivedKey
    );

    const publicKey = await exportPublicKey(keyPair.publicKey);
    const username = generateUsername(email);

    const res = await api.post("/auth/register", {
      username,
      display_name: displayName.trim() || email.split("@")[0],
      password,
      public_key: publicKey,
      wrapped_private_key: wrappedPrivateKey,
      pbkdf2_salt: toBase64(salt),
    });

    return {
      data: res.data,
      privateKey: keyPair.privateKey,
    };
  },

  onSuccess: ({ data, privateKey }) => {
    const user = getRegisteredUser(data);

    if (!user) {
      setServerError("Account created, but the session could not be restored. Please log in.");
      return;
    }

    saveAuthTokens(data.access_token, data.refresh_token);
    setToken(data.access_token);
    setPrivateKey(privateKey);
    setCurrentUser(user);
    navigate("/setup");
  },

  onError: (error: any) => {
    const message =
      error?.response?.data?.message ||
      formatServerError(error?.response?.data?.detail) ||
      error?.response?.data?.error ||
      "Signup failed";

    setServerError(
    typeof message === "string"
      ? message
      : JSON.stringify(message)
  );
  },
  });

  const validate = () => {
  const newErrors: typeof errors = {};

  if (!email) {
    newErrors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    newErrors.email = "Invalid email format";
  }

  if (!displayName.trim()) {
    newErrors.displayName = "Display name is required";
  }

  if (!password) {
    newErrors.password = "Password is required";
  } else if (password.length < 8) {
    newErrors.password = "Password must be at least 8 characters";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-90 text-center">

        <div className="w-12 h-12 bg-blue-700 text-white flex items-center justify-center rounded-xl mx-auto mb-4">
          🔐
        </div>

        <h1 className="text-xl font-semibold">
          Create Your Sanctuary
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Start your journey into private communication.
        </p>

        <form className="mt-6 space-y-4 text-left" onSubmit={(e) => {e.preventDefault();
                                                                     setServerError("");
                                                                     if (!validate()) return;
                                                                     signupMutation.mutate();}}
        >

          <div>
            <label htmlFor="email" className="text-sm text-gray-600">Email Address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              type="email"
              placeholder="name@domain.com"
              className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="displayName" className="text-sm text-gray-600">Display Name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              id="displayName"
              type="text"
              placeholder="Your name"
              className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.displayName && (
              <p className="text-red-500 text-xs mt-1">{errors.displayName}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="text-sm text-gray-600">Secure Password</label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="********"
              className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {serverError && (
          <p className="text-red-500 text-sm text-left mb-2">
                    {serverError}
          </p>
          )}

          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full bg-blue-700 text-white py-2 rounded-lg mt-2 hover:bg-blue-800 transition"
          >
            {signupMutation.isPending ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="bg-gray-100 rounded-lg p-3 mt-4 text-sm text-gray-600">
          🔐 Your encryption keys will be generated locally on this device.
        </div>

        <p className="text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function formatServerError(detail: unknown) {
  if (!detail) return "";

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          return String(item.msg);
        }
        return "";
      })
      .filter(Boolean)
      .join(", ");
  }

  return "";
}
