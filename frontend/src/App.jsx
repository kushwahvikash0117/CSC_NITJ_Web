/**
 * @file App.jsx
 * @description Root application component setting up router configuration,
 * authentication state management, protected routes, admin authorization,
 * and conditional layout rendering.
 */

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

/* Layout */
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

/* Pages */
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";


import TeamsPage from "./pages/team";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import CreateBlog from "./pages/CreateBlog";
import MyBlogs from "./pages/MyBlogs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import AdminPage from "./pages/Admin";
import BlogModeration from "./pages/BlogModeration";
import EventManager from "./pages/EventManager";

import { useAuth } from "./context/auth-context";

/**
 * @component AuthLoadingScreen
 * @description Shared loading screen while AuthContext verifies
 * the current session with the backend.
 */
const AuthLoadingScreen = ({ message = "AUTHENTICATING_SESSION..." }) => {
  return (
    <div className="min-h-screen bg-[#010614] flex items-center justify-center">
      <div className="text-cyan-400 font-mono text-xs tracking-[0.25em] uppercase">
        {message}
      </div>
    </div>
  );
};

/**
 * @component ProtectedRoute
 * @description Allows access only to authenticated users.
 *
 * Authentication is NOT determined from localStorage.
 * AuthContext obtains the authenticated user from the backend,
 * which validates the HttpOnly authentication cookie.
 */
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AuthLoadingScreen message="VERIFYING_SESSION..." />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

/**
 * @component AdminRoute
 * @description Allows access only to authenticated admin users.
 *
 * The frontend checks the user role obtained from AuthContext.
 * The backend must STILL protect every admin API endpoint with
 * protect + isAdmin.
 */
const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AuthLoadingScreen message="VERIFYING_ADMIN_CLEARANCE..." />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

/**
 * @component AppLayout
 * @description Layout controller that conditionally displays
 * Navbar and Footer based on the current route and authentication state.
 */
const AppLayout = () => {
  const location = useLocation();

  const {
    user,
    loading,
    logout,
  } = useAuth();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  /*
   * Wait until AuthContext has completed the initial
   * backend session verification.
   */
  if (loading) {
    return (
      <AuthLoadingScreen />
    );
  }

  const isLoggedIn = Boolean(user);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {!isAuthPage && (
        <Navbar
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
      )}

      <Routes>
        {/* =========================================================
            PUBLIC ROUTES
        ========================================================= */}

        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/events" element={<Events />} />

        <Route path="/team" element={<TeamsPage />} />

        <Route path="/blog" element={<Blog />} />

        <Route
          path="/blog/:slug"
          element={<BlogDetail />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        
        {/* =========================================================
            AUTHENTICATED USER ROUTES

            The user must exist in AuthContext.

            AuthContext gets the user from the backend.
            The backend validates the HttpOnly cookie.
        ========================================================= */}

        <Route element={<ProtectedRoute />}>
          <Route
            path="/create-blog"
            element={<CreateBlog />}
          />

          <Route
            path="/my-blogs"
            element={<MyBlogs />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/edit-profile"
            element={<EditProfilePage />}
          />
        </Route>

        {/* =========================================================
            ADMIN ROUTES

            Requires:
              1. Valid authenticated session
              2. user.role === "admin"

            Backend admin endpoints MUST ALSO use:
              protect
              isAdmin
        ========================================================= */}

        <Route element={<AdminRoute />}>
          <Route
            path="/admin"
            element={<AdminPage />}
          />

          <Route
            path="/admin/blogs"
            element={<BlogModeration />}
          />

          <Route
            path="/admin/events"
            element={<EventManager />}
          />
        </Route>

        {/* =========================================================
            FALLBACK
        ========================================================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>

      {!isAuthPage && <Footer />}
    </>
  );
};

/**
 * @component App
 * @description Main application entry point.
 *
 * AuthProvider must wrap App from main.jsx.
 */
function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;