import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api, saveAuthTokens } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { unwrapPrivateKey,
         deriveEncryptionKey,
         fromBase64 } from "../../lib/crypto";

export default function Login() {

  const navigate = useNavigate();
  const { setToken, setPrivateKey, setCurrentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string>(" ");

   function generateUsername(email: string) {
    return email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toLowerCase();
   }

  const loginMutation = useMutation({
  mutationFn: async () => {

   const username = generateUsername(email);

    const res = await api.post("/auth/login", {
      username,
      password,
    });

    return res.data;
  },

  onSuccess: async (data) => {
    try {
      // ✅ Save token
      saveAuthTokens(data.access_token, data.refresh_token);
      setToken(data.access_token);
      setCurrentUser(data.user);

      // 🔓 Extract values
      const wrappedKey = data.user.wrapped_private_key;
      const saltBase64 = data.user.pbkdf2_salt;

      // 🔄 Convert salt
      const salt = fromBase64(saltBase64);

      // 🔑 Derive key again
      const derivedKey = await deriveEncryptionKey(password, salt);

      // 🔓 Unwrap private key
      const privateKey = await unwrapPrivateKey(
        wrappedKey,
        derivedKey
      );

      // 💾 Store in memory
      setPrivateKey(privateKey);

      // 🚀 Go to dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Failed to restore secure session");
    }
  },

  onError: (error: any) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      "Login failed";

    setServerError(message);
  },
});

  const validate = () => {
  const newErrors: typeof errors = {};

  if (!email) {
    newErrors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    newErrors.email = "Invalid email format";
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
      <div className="bg-white p-8 rounded-2xl shadow-sm w-90">

        <h1 className="text-2xl font-bold text-blue-700 text-center">
          Sanctuary
        </h1>

        <p className="text-center text-sm text-green-600 mt-1">
          🔒 E2E Secured
        </p>

        <form className="mt-6 space-y-4" onSubmit={(e) => {e.preventDefault();
                                                          setServerError("");
                                                          if (!validate()) return;
                                                          loginMutation.mutate();}}
        >
          <div className="text-left">
            <label htmlFor="email" className="text-sm text-gray-600 text-left">Email address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              type="email"
              placeholder="name@company.com"
              className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="text-left">
            <label htmlFor="password" className="text-gray-600">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              type="password"
              placeholder="********"
              className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {serverError && (
          <p className="text-red-500 text-sm mb-2 text-left">
                    {serverError}
          </p>
          )}

          <button
            role="button"
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-blue-700 text-white py-2 rounded-lg mt-2 hover:bg-blue-800 transition"
          >
            {loginMutation.isPending ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          🔑 Your private keys will be unlocked locally upon login.
        </p>

        <p className="text-sm text-center mt-2">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
