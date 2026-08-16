/**
 * @file BlogDetail.jsx
 * @description Detailed view for individual blog posts with interactive
 * elements like liking, sharing, commenting, and reading progress.
 */

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../api";
import { useAuth } from "../context/auth-context";

/** Strips HTML tags and normalizes whitespace */
const stripHtml = (html = "") =>
  html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

/** Calculates estimated reading time based on word count */
const getReadingTime = (html = "") => {
  const words = stripHtml(html)
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
};

/** TerminalLabel Component */
const TerminalLabel = ({
  children,
  className = "",
}) => (
  <span
    className={`font-mono text-[10px] md:text-xs font-medium uppercase tracking-[0.24em] text-cyan-500/65 ${className}`}
  >
    {children}
  </span>
);

/** TerminalWindow Component */
const TerminalWindow = ({
  label,
  children,
  className = "",
}) => (
  <div
    className={`rounded-[1.5rem] overflow-hidden border border-cyan-500/15 bg-[#071426]/90 backdrop-blur-2xl shadow-[0_20px_60px_rgba(34,211,238,0.06)] ${className}`}
  >
    <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/10 bg-cyan-500/[0.03]">
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-400/50" />
        <span className="w-2 h-2 rounded-full bg-yellow-400/50" />
        <span className="w-2 h-2 rounded-full bg-green-400/50" />
      </div>

      <TerminalLabel>
        {label}
      </TerminalLabel>
    </div>

    {children}
  </div>
);

/** BlogDetail Component */
export default function BlogDetail() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL;

  /**
   * Fetch blog details.
   *
   * This endpoint is public, so normal fetch is sufficient.
   */
  const fetchBlog = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/blogs/${slug}`
      );

      if (!res.ok) {
        throw new Error("Blog not found");
      }

      const data = await res.json();

      setBlog({
        ...data,
        image: data.image
          ? `${API_BASE}${data.image}`
          : "",
      });
    } catch (error) {
      console.error(
        "Failed to fetch blog",
        error
      );

      setBlog(null);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, slug]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  /**
   * Reading progress tracking.
   */
  useEffect(() => {
    const handleScroll = () => {
      const documentHeight =
        document.documentElement.scrollHeight;

      const windowHeight = window.innerHeight;

      const scrollable =
        documentHeight - windowHeight;

      if (scrollable <= 0) {
        setProgress(0);
        return;
      }

      const scrolled =
        (window.scrollY / scrollable) * 100;

      setProgress(
        Math.min(100, Math.max(0, scrolled))
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    handleScroll();

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  /**
   * Like / unlike blog.
   *
   * Authentication is determined by the AuthContext.
   * The JWT is NOT read from localStorage.
   *
   * apiFetch() automatically sends the HttpOnly cookie
   * using credentials: "include".
   */
  const handleLike = async () => {
    if (!user) {
      alert("Please login to like this blog");
      return;
    }

    try {
      setActionLoading(true);

      const res = await apiFetch(
        `/api/blogs/${slug}/like`,
        {
          method: "POST",
        }
      );

      const updated = await res.json();

      if (!res.ok) {
        throw new Error(
          updated.message || "Like failed"
        );
      }

      setBlog((prev) => ({
        ...prev,
        likes: updated.likes,
      }));
    } catch (error) {
      console.error(
        "Like failed:",
        error
      );

      alert(
        error.message || "Like failed"
      );
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Copy article URL to clipboard.
   */
  const handleShare = () => {
    navigator.clipboard.writeText(
      window.location.href
    );

    setCopied(true);

    setTimeout(
      () => setCopied(false),
      2000
    );
  };

  /**
   * Post a new comment.
   *
   * Authentication is handled through the AuthContext
   * and HttpOnly cookie.
   */
  const handleComment = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to comment");
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    try {
      setActionLoading(true);

      const res = await apiFetch(
        `/api/blogs/${slug}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            text: commentText.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Comment failed"
        );
      }

      setCommentText("");

      await fetchBlog();
    } catch (error) {
      console.error(
        "Comment failed:",
        error
      );

      alert(
        error.message || "Comment failed"
      );
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Delete a comment.
   *
   * Backend remains responsible for verifying whether
   * the authenticated user is actually allowed to delete it.
   */
  const handleDeleteComment = async (
    commentId
  ) => {
    if (!user) {
      alert(
        "Please login to delete comment"
      );
      return;
    }

    try {
      setActionLoading(true);

      const res = await apiFetch(
        `/api/blogs/${slug}/comment/${commentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to delete comment"
        );
      }

      await fetchBlog();
    } catch (error) {
      console.error(
        "Delete comment failed:",
        error
      );

      alert(
        error.message ||
          "Failed to delete comment"
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#010714] flex items-center justify-center text-cyan-400">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto mb-5 shadow-[0_0_15px_#22d3ee]" />

          <TerminalLabel>
            LOADING_ARTICLE...
          </TerminalLabel>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#010714] flex items-center justify-center px-5 text-center">
        <div className="max-w-md w-full p-8 rounded-[2rem] border border-cyan-500/20 bg-[#071426]/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <TerminalLabel className="text-cyan-400">
            ERROR_404
          </TerminalLabel>

          <h1 className="mt-4 text-2xl sm:text-3xl font-black uppercase text-white">
            Blog Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            The requested technical transmission
            does not exist or has been removed
            from the database.
          </p>

          <Link
            to="/blog"
            className="inline-block mt-7 px-6 py-3 rounded-xl bg-cyan-500 text-[#010714] font-mono text-xs font-black uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all"
          >
            ← Back to Blog Feed
          </Link>
        </div>
      </div>
    );
  }

  /*
   * Support both MongoDB _id and id formats.
   */
  const userId =
    user?._id || user?.id;

  /*
   * Determine whether current user has liked
   * this blog.
   */
  const isLiked =
    userId &&
    blog.likes?.some(
      (id) =>
        id?.toString() ===
        userId?.toString()
    );

  const readingTime =
    getReadingTime(blog.content);

  return (
    <div className="blog-detail-page min-h-screen bg-[#010714] text-slate-300 relative overflow-x-hidden selection:bg-cyan-500/30">

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-white/[0.04] z-[100]">
        <div
          className="h-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] transition-[width] duration-100"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {/* Header Section */}
      <header className="relative z-10 pt-28 sm:pt-32 md:pt-40 pb-12 px-4 sm:px-5 md:px-6">
        <div className="max-w-6xl mx-auto rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/[0.07] bg-[#071426]/85 backdrop-blur-2xl relative shadow-[0_25px_80px_rgba(0,0,0,0.35)]">

          <div className="absolute top-0 left-0 right-0 h-px bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06),transparent_70%)] pointer-events-none" />

          <div className="p-6 sm:p-8 md:p-12 lg:p-16 relative">

            <Link
              to="/blog"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-cyan-500/70 hover:text-cyan-400 transition-colors"
            >
              ← Knowledge Base
            </Link>

            <div className="flex flex-wrap items-center gap-3 mt-6 sm:mt-8">

              <span className="px-3 py-1.5 rounded-md border border-cyan-400/20 bg-cyan-400/10 font-mono text-xs font-medium uppercase tracking-[0.18em] text-cyan-400">
                {blog.category ||
                  "GENERAL"}
              </span>

              <TerminalLabel>
                ARTICLE_
                {String(
                  blog._id || ""
                )
                  .slice(-5)
                  .toUpperCase()}
              </TerminalLabel>

            </div>

            <h1 className="mt-6 sm:mt-7 max-w-5xl text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[1.05] sm:leading-[0.95] text-white">
              {blog.title}
            </h1>

            <div className="mt-6 sm:mt-7 max-w-3xl flex items-start font-mono text-sm md:text-base leading-6 sm:leading-7 text-slate-400">

              <span className="text-cyan-400 mr-3 mt-0.5">
                &gt;
              </span>

              <p>
                CSC NITJ knowledge base
                publication covering{" "}
                {blog.category ||
                  "technical insights"}{" "}
                and structural security
                frameworks.
              </p>

            </div>

            <div className="mt-8 sm:mt-10 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-y-5 gap-x-6">

              <div className="flex items-center gap-3.5">

                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyan-500 text-[#010714] flex items-center justify-center font-black text-base shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                  {blog.author?.name?.[0]?.toUpperCase() ||
                    "U"}
                </div>

                <div>
                  <p className="text-white font-semibold text-sm sm:text-base">
                    {blog.author?.name ||
                      "Unknown"}
                  </p>

                  <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                    CSC NITJ Contributor
                  </p>
                </div>

              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-xs text-slate-400">

                <span>
                  {blog.createdAt
                    ? new Date(
                        blog.createdAt
                      ).toLocaleDateString()
                    : ""}
                </span>

                <span>•</span>

                <span>
                  {readingTime} MIN READ
                </span>

                <span>•</span>

                <div className="flex items-center gap-3">

                  <button
                    onClick={handleLike}
                    disabled={
                      actionLoading
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                      isLiked
                        ? "border-red-500/30 bg-red-500/10 text-red-400"
                        : "border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10"
                    } ${
                      actionLoading
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    title="Like Article"
                  >
                    <span>
                      {isLiked
                        ? "♥"
                        : "♡"}
                    </span>

                    <span>
                      {blog.likes
                        ?.length || 0}
                    </span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-slate-300 hover:text-cyan-400 hover:border-cyan-400/30 transition-all"
                    title="Share Article"
                  >
                    {copied
                      ? "COPIED!"
                      : "SHARE ↗"}
                  </button>

                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {blog.image && (
        <section className="relative z-10 px-4 sm:px-5 md:px-6 pb-12 sm:pb-16">

          <div className="max-w-6xl mx-auto">

            <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-cyan-500/20 bg-[#071426] shadow-[0_20px_80px_rgba(0,0,0,0.4)]">

              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#010714]/40 to-transparent z-10" />

              <img
                src={blog.image}
                alt={blog.title}
                className="w-full max-h-[450px] sm:max-h-[550px] md:max-h-[650px] object-cover transition-transform duration-700 hover:scale-[1.02]"
              />

            </div>
          </div>
        </section>
      )}

      {/* Main Content & Sidebar Layout */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-5 md:px-6 pb-16 sm:pb-24">

        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8 lg:gap-12">

          {/* Contributor Sidebar */}
          <aside className="hidden lg:block">

            <div className="sticky top-28 space-y-6">

              <TerminalWindow label="contributor_module">

                <div className="p-6">

                  <div className="w-14 h-14 rounded-xl bg-cyan-500 flex items-center justify-center text-[#010714] font-black text-xl mb-5 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                    {blog.author?.name?.[0]?.toUpperCase() ||
                      "U"}
                  </div>

                  <TerminalLabel>
                    AUTHOR_PROFILE
                  </TerminalLabel>

                  <h3 className="mt-2 text-white font-black uppercase text-base tracking-wide">
                    {blog.author?.name ||
                      "Unknown"}
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    Active security analyst
                    & contributor at Cyber
                    Security Club, NITJ.
                  </p>

                  <div className="mt-6 pt-5 border-t border-white/[0.06]">

                    <div className="flex items-center gap-2.5">

                      <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]" />

                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-green-400/80">
                        NODE_SECURE
                      </span>

                    </div>

                  </div>
                </div>
              </TerminalWindow>

              <TerminalWindow label="system_info">

                <div className="p-6 space-y-4">

                  <div>

                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Views /
                      Interactions
                    </span>

                    <p className="text-sm font-mono font-bold text-cyan-400 mt-1">
                      {blog.likes
                        ?.length || 0}{" "}
                      Likes •{" "}
                      {blog.comments
                        ?.length || 0}{" "}
                      Comments
                    </p>

                  </div>

                  <div>

                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Classification
                    </span>

                    <p className="text-sm font-mono font-bold text-white mt-1 uppercase">
                      {blog.category ||
                        "General Research"}
                    </p>

                  </div>

                </div>
              </TerminalWindow>

            </div>
          </aside>

          {/* Article Body */}
          <div className="min-w-0">

            <TerminalWindow
              label="csc_nitj // article_stream"
              className="mb-8"
            >

              <div className="p-6 sm:p-8 md:p-10">

                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-cyan-500/10">

                  <span className="font-mono text-cyan-400 text-lg">
                    &gt;
                  </span>

                  <TerminalLabel>
                    EXECUTE_DOCUMENT_RENDER
                  </TerminalLabel>

                </div>

                <article
                  className="prose prose-invert prose-cyan max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-h1:text-white prose-h2:text-white prose-h2:border-b prose-h2:border-white/[0.08] prose-h2:pb-3 prose-h3:text-white prose-h4:text-white prose-p:text-slate-300 prose-p:leading-8 prose-p:text-base prose-strong:text-white prose-strong:font-bold prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-li:text-slate-300 prose-li:leading-7 prose-ul:marker:text-cyan-400 prose-ol:marker:text-cyan-400 prose-blockquote:border-l-cyan-400 prose-blockquote:text-slate-300 prose-blockquote:bg-cyan-500/[0.03] prose-blockquote:rounded-r-xl prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:not-italic prose-code:bg-[#010714] prose-code:text-cyan-300 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:border prose-code:border-cyan-500/20 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#010714] prose-pre:border prose-pre:border-cyan-500/20 prose-pre:rounded-2xl prose-pre:shadow-[0_10px_40px_rgba(0,0,0,0.5)] [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:border [&_iframe]:border-cyan-500/20 [&_img]:rounded-xl [&_img]:border [&_img]:border-white/[0.08] [&_img]:mx-auto [&_table]:w-full [&_table]:border-collapse [&_th]:bg-cyan-500/[0.08] [&_th]:text-cyan-400 [&_th]:border [&_th]:border-white/[0.08] [&_th]:p-3 [&_td]:border [&_td]:border-white/[0.08] [&_td]:p-3 [&_td]:text-slate-300"
                  dangerouslySetInnerHTML={{
                    __html: blog.content,
                  }}
                />

                <div className="mt-12 pt-6 border-t border-white/[0.08] flex items-center justify-between flex-wrap gap-4">

                  <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-cyan-500/60">

                    <span className="text-cyan-400">
                      &gt;
                    </span>

                    END_OF_TRANSMISSION

                  </div>

                  <div className="flex items-center gap-3">

                    <button
                      onClick={handleLike}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider hover:bg-cyan-500/20 transition-all"
                    >
                      {isLiked
                        ? "♥ Liked"
                        : "♡ Like Article"}{" "}
                      (
                      {blog.likes
                        ?.length || 0}
                      )
                    </button>

                  </div>
                </div>
              </div>
            </TerminalWindow>
          </div>
        </div>
      </main>

      {/* Comments Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-5 md:px-6 pb-24">

        <div className="flex items-center gap-4 mb-8">

          <div>

            <TerminalLabel>
              COMMUNITY_FEEDBACK_MODULE
            </TerminalLabel>

            <h2 className="mt-2 text-2xl sm:text-3xl font-black uppercase text-white">
              Discussion Thread{" "}
              <span className="text-cyan-400">
                //{" "}
                {blog.comments
                  ?.length || 0}
              </span>
            </h2>

          </div>

          <div className="h-px flex-1 bg-white/[0.08] hidden sm:block" />

        </div>

        <TerminalWindow
          label="comment_input_node"
          className="mb-10"
        >

          <form
            onSubmit={handleComment}
            className="p-6"
          >

            <div className="flex items-start gap-3">

              <span className="font-mono text-cyan-400 mt-1 hidden sm:inline">
                &gt;
              </span>

              <textarea
                rows="4"
                value={commentText}
                onChange={(e) =>
                  setCommentText(
                    e.target.value
                  )
                }
                placeholder={
                  user
                    ? "Write your secure comment or inquiry..."
                    : "Please authenticate / login to participate in this discussion..."
                }
                disabled={
                  !user ||
                  actionLoading
                }
                className="flex-1 resize-none bg-transparent outline-none border-none font-mono text-sm leading-relaxed text-slate-300 placeholder:text-slate-600"
              />

            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-4">

              <span className="font-mono text-xs text-slate-400">
                {user
                  ? `Logged in as ${
                      user.name ||
                      "User"
                    }`
                  : "Authentication required to post"}
              </span>

              <button
                type="submit"
                disabled={
                  !user ||
                  actionLoading ||
                  !commentText.trim()
                }
                className="px-6 py-2.5 rounded-xl bg-cyan-500 text-[#010714] font-mono text-xs font-black uppercase tracking-[0.18em] hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              >
                {actionLoading
                  ? "Transmitting..."
                  : "Post Comment →"}
              </button>

            </div>
          </form>
        </TerminalWindow>

        <div className="space-y-4">

          {blog.comments &&
          blog.comments.length > 0 ? (
            blog.comments.map(
              (comment, index) => {
                const commentUserId =
                  comment.user?._id ||
                  comment.user?.id;

                const authorUserId =
                  blog.author?._id ||
                  blog.author?.id;

                /*
                 * UI-level check for showing the delete button.
                 *
                 * IMPORTANT:
                 * The backend must still verify authorization.
                 */
                const canDelete =
                  userId &&
                  (
                    commentUserId
                      ?.toString() ===
                      userId?.toString() ||
                    authorUserId
                      ?.toString() ===
                      userId?.toString()
                  );

                return (
                  <TerminalWindow
                    key={
                      comment._id ||
                      index
                    }
                    label={`comment_${String(
                      index + 1
                    ).padStart(
                      3,
                      "0"
                    )}`}
                  >

                    <div className="p-5 sm:p-6">

                      <div className="flex items-center justify-between gap-4 mb-4">

                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-black text-sm">
                            {comment.user
                              ?.name?.[0]
                              ?.toUpperCase() ||
                              "C"}
                          </div>

                          <div>

                            <p className="text-white font-semibold text-sm">
                              {comment.user
                                ?.name ||
                                "CSC Member"}
                            </p>

                            <TerminalLabel className="text-[9px]">
                              MEMBER_NODE
                            </TerminalLabel>

                          </div>

                        </div>

                        {canDelete && (
                          <button
                            onClick={() =>
                              handleDeleteComment(
                                comment._id
                              )
                            }
                            disabled={
                              actionLoading
                            }
                            className="font-mono text-[10px] uppercase tracking-[0.15em] text-red-400/70 hover:text-red-400 transition-colors px-2 py-1 rounded-md border border-red-500/20 bg-red-500/5"
                          >
                            Delete
                          </button>
                        )}

                      </div>

                      <div className="flex items-start gap-3">

                        <span className="font-mono text-cyan-400 text-xs hidden sm:inline">
                          &gt;
                        </span>

                        <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                          {comment.text}
                        </p>

                      </div>

                    </div>

                  </TerminalWindow>
                );
              }
            )
          ) : (
            <div className="p-8 text-center rounded-2xl border border-white/[0.06] bg-[#071426]/50">

              <TerminalLabel className="text-cyan-400/60">
                NO_COMMENTS_YET
              </TerminalLabel>

              <p className="text-sm text-slate-400 mt-2">
                Be the first member to
                initialize a response on
                this article.
              </p>

            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-12 px-6 text-center bg-[#010714]">

        <TerminalLabel>
          CSC_NITJ // KNOWLEDGE_BASE //
          SECURE_TRANSMISSION
        </TerminalLabel>

        <p className="mt-3 text-[11px] font-mono uppercase tracking-[0.2em] text-slate-500">
          Awareness is the first line of
          cyber defense
        </p>

      </footer>
    </div>
  );
}