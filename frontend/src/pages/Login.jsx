/**
 * @file Login.jsx
 * @description Authentication component using secure HttpOnly cookie-based sessions.
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/auth-context";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Authenticate the user through AuthContext.
   *
   * AuthContext handles:
   * - Sending credentials to the backend
   * - Receiving the HttpOnly authentication cookie
   * - Refreshing the authenticated user
   *
   * No JWT is stored in localStorage.
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      /*
       * Login through AuthContext.
       * This also verifies the newly-created session through /api/auth/me.
       */
      const currentUser = await login(email.trim(), password);

      /*
       * Remove any authentication data left behind by the
       * previous localStorage-based authentication system.
       */
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      /*
       * Authorization is enforced by the backend.
       * The role here is only used for frontend navigation.
       */
      if (currentUser.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/profile", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.message || "Unable to authenticate. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010614] px-4">
      <div className="relative w-full max-w-md">

        {/* Glow */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/40 to-blue-500/40 blur-lg opacity-40" />

        <form
          onSubmit={handleLogin}
          className="relative bg-[#0a0f1d] border border-cyan-500/30 p-10 rounded-2xl shadow-[0_0_60px_rgba(0,209,255,0.15)]"
        >
          {/* Header */}
          <h1 className="text-3xl font-black italic uppercase text-center text-white">
            Terminal{" "}
            <span className="text-cyan-400">
              Login
            </span>
          </h1>

          <p className="text-gray-500 text-[10px] font-bold tracking-[0.35em] uppercase text-center mt-2 mb-10">
            Authorization Required
          </p>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5">
              Email
            </label>

            <input
              type="email"
              placeholder="student@nitj.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-white text-xs font-mono focus:border-cyan-500/60 outline-none"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-white text-xs font-mono focus:border-cyan-500/60 outline-none"
              required
              autoComplete="current-password"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-500 text-[9px] font-bold tracking-widest uppercase bg-red-500/5 p-2 border-l-2 border-red-500 mb-4">
              ⚠️ {error}
            </div>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 text-black font-black py-4 rounded-lg text-xs tracking-[0.25em] uppercase hover:bg-cyan-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "AUTHENTICATING..." : "VERIFY IDENTITY"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10" />

            <span className="text-gray-500 text-[9px] font-bold tracking-[0.3em] uppercase">
              OR
            </span>

            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Register */}
          <p className="text-center text-gray-400 text-xs">
            Don’t have an account?
          </p>

          <Link
            to="/register"
            className="block text-center mt-3 text-cyan-400 text-xs font-black tracking-[0.25em] uppercase hover:text-cyan-300 transition"
          >
            Create New Account
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Login;