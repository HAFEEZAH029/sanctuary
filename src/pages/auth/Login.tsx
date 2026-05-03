import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function Login() {


  const navigate = useNavigate();
  const { setToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setToken(data.token);

      // 🔥 Important decision point
      navigate("/dashboard");
    },
    onError: () => {
      alert("Invalid credentials");
    },
  });


  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-90">

        <h1 className="text-2xl font-bold text-blue-700 text-center">
          Sanctuary
        </h1>

        <p className="text-center text-sm text-green-600 mt-1">
          🔒 E2E Secured
        </p>

        <form className="mt-6 space-y-4" onSubmit={(e) => {e.preventDefault(); loginMutation.mutate();}}>
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
          </div>

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
