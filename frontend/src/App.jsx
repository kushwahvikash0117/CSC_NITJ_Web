import React from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./context/auth-context";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import Education from "./pages/education";
import Awareness from "./pages/awareness";
import Competitions from "./pages/competition";
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

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#010714] flex items-center justify-center text-cyan-400">
        Checking authentication...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppLayout() {
  const location = useLocation();
  const { user, isLoggedIn, refreshAuth, logout } = useAuth();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!isAuthPage && (
        <Navbar
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={logout}
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/events" element={<Events />} />
        <Route path="/team" element={<TeamsPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/education" element={<Education />} />
        <Route path="/awareness" element={<Awareness />} />
        <Route path="/competitions" element={<Competitions />} />

        <Route
          path="/login"
          element={<Login onLogin={refreshAuth} />}
        />
        <Route path="/register" element={<Register />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-blog"
          element={
            <ProtectedRoute>
              <CreateBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-blogs"
          element={
            <ProtectedRoute>
              <MyBlogs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blogs"
          element={
            <ProtectedRoute requiredRole="admin">
              <BlogModeration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute requiredRole="admin">
              <EventManager />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAuthPage && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
