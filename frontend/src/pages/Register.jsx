/**
 * @file Register.jsx
 * @description Multi-step terminal-styled user registration component
 * with email OTP authorization.
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Register() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Details
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  /**
   * Axios configuration for cookie-based authentication.
   *
   * credentials are not required for the public registration
   * endpoints, but keeping withCredentials enabled makes the
   * requests compatible with the application's cookie-based
   * authentication system.
   */
  const axiosConfig = {
    withCredentials: true,
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_BASE_URL}/api/auth/send-otp`,
        { email },
        axiosConfig
      );

      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_BASE_URL}/api/auth/verify-otp`,
        {
          email,
          otp,
        },
        axiosConfig
      );

      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        otp,
      };

      await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        payload,
        axiosConfig
      );

      /*
       * Remove any authentication data left behind by the
       * previous localStorage-based authentication system.
       *
       * Registration itself does not create an authenticated
       * session. The user will log in normally afterward.
       */
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      navigate("/login");
    } catch (err) {
      console.error(
        "Registration error response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Registration failed. Please check inputs."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00050a] px-4">
      <div className="relative w-full max-w-md">

        {/* Glow effect */}
        <div
          className="absolute -inset-1 rounded-2xl
                     bg-gradient-to-r from-cyan-500/40 to-blue-500/40
                     blur-lg opacity-40"
        />

        <div
          className="relative bg-[#0a0f1d] border border-cyan-500/30
                     p-10 rounded-2xl
                     shadow-[0_0_60px_rgba(0,209,255,0.15)]"
        >

          {/* Header */}
          <h1 className="text-3xl font-black italic uppercase tracking-tight text-center text-white">
            Terminal{" "}
            <span className="text-cyan-400">
              Register
            </span>
          </h1>

          <p className="text-gray-500 text-[10px] font-bold tracking-[0.35em] uppercase text-center mt-2 mb-10">
            {step === 1 &&
              "Step 1: Email Authorization"}

            {step === 2 &&
              "Step 2: Enter Verification OTP"}

            {step === 3 &&
              "Step 3: User Details Initialization"}
          </p>

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <div className="mb-2">
                <label className="block text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                  Enter Your Email Address
                </label>

                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-4
                             text-white text-xs font-mono
                             focus:border-cyan-500/60 outline-none transition-all"
                  required
                />
              </div>

              {error && (
                <div
                  className="text-red-500 text-[9px] font-bold tracking-widest uppercase
                             bg-red-500/5 p-2 border-l-2 border-red-500 mb-4 mt-2"
                >
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 text-black font-black py-4 rounded-lg
                           text-xs tracking-[0.25em] uppercase
                           hover:bg-cyan-400 transition-all
                           shadow-[0_0_25px_rgba(34,211,238,0.3)]
                           disabled:opacity-60 mt-4 cursor-pointer"
              >
                {loading
                  ? "Sending OTP..."
                  : "Send Verification OTP"}
              </button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <div className="text-center text-gray-400 text-xs mb-4">
                OTP sent to{" "}
                <span className="text-cyan-400 font-mono">
                  {email}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError("");
                    setOtp("");
                  }}
                  className="block mx-auto mt-1 text-[10px] text-gray-500 underline hover:text-cyan-300 cursor-pointer"
                >
                  Change Email
                </button>
              </div>

              <div className="mb-2">
                <label className="block text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                  Enter Verification Code
                </label>

                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-4
                             text-white text-center text-lg font-mono tracking-widest
                             focus:border-cyan-500/60 outline-none transition-all"
                  required
                />
              </div>

              {error && (
                <div
                  className="text-red-500 text-[9px] font-bold tracking-widest uppercase
                             bg-red-500/5 p-2 border-l-2 border-red-500 mb-4 mt-2"
                >
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 text-black font-black py-4 rounded-lg
                           text-xs tracking-[0.25em] uppercase
                           hover:bg-cyan-400 transition-all
                           shadow-[0_0_25px_rgba(34,211,238,0.3)]
                           disabled:opacity-60 mt-4 cursor-pointer"
              >
                {loading
                  ? "Verifying..."
                  : "Verify OTP"}
              </button>
            </form>
          )}

          {/* STEP 3: USER DETAILS */}
          {step === 3 && (
            <form onSubmit={handleRegister}>
              <div className="text-center text-cyan-400 text-xs font-mono mb-4 bg-cyan-500/10 p-2 rounded border border-cyan-500/20">
                ✓ Email verified successfully
              </div>

              <div className="mb-4">
                <label className="block text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-4
                             text-white text-xs font-mono
                             focus:border-cyan-500/60 outline-none transition-all"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter password (min 4 characters)"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-4
                             text-white text-xs font-mono
                             focus:border-cyan-500/60 outline-none transition-all"
                  required
                />
              </div>

              {error && (
                <div
                  className="text-red-500 text-[9px] font-bold tracking-widest uppercase
                             bg-red-500/5 p-2 border-l-2 border-red-500 mb-4"
                >
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 text-black font-black py-4 rounded-lg
                           text-xs tracking-[0.25em] uppercase
                           hover:bg-cyan-400 transition-all
                           shadow-[0_0_25px_rgba(34,211,238,0.3)]
                           disabled:opacity-60 cursor-pointer"
              >
                {loading
                  ? "Creating..."
                  : "Create Account"}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10" />

            <span className="text-gray-500 text-[9px] font-bold tracking-[0.3em] uppercase">
              OR
            </span>

            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Login */}
          <p className="text-center text-gray-400 text-xs">
            Already have an account?
          </p>

          <Link
            to="/login"
            className="block text-center mt-3 text-cyan-400
                       text-xs font-black tracking-[0.25em] uppercase
                       hover:text-cyan-300 transition"
          >
            Login Instead
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;