import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function BlogDetail() {
  const { slug } = useParams();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const [commentText, setCommentText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // 🔒 normalize ONLY image
  const normalizeImage = (image) =>
    image ? `${API_BASE}${image}` : "";

  // Fetch blog (FULL populated data)
  const fetchBlog = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/blogs/${slug}`);
      const data = await res.json();

      setBlog({
        ...data,
        image: normalizeImage(data.image),
      });
    } catch (err) {
      console.error("Failed to fetch blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  // Reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrolled =
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100;
      setProgress(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Like / Unlike (PRESERVE author + comments)
  const handleLike = async () => {
    if (!token) {
      alert("Please login to like this blog");
      return;
    }

    try {
      setActionLoading(true);

      const res = await fetch(
        `${API_BASE}/api/blogs/${slug}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = await res.json();

      setBlog((prev) => ({
        ...prev,
        likes: updated.likes, // ✅ only likes update
      }));
    } catch (err) {
      console.error("Like failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Add comment (REFETCH for correctness)
  const handleComment = async (e) => {
    e.preventDefault();
    if (!token) return alert("Please login to comment");
    if (!commentText.trim()) return;

    try {
      setActionLoading(true);

      await fetch(
        `${API_BASE}/api/blogs/${slug}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: commentText }),
        }
      );

      setCommentText("");
      fetchBlog(); // ✅ ensures populated comments
    } catch (err) {
      console.error("Comment failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete comment (REFETCH for correctness)
  const handleDeleteComment = async (commentId) => {
    if (!token) return;

    try {
      setActionLoading(true);

      await fetch(
        `${API_BASE}/api/blogs/${slug}/comment/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchBlog(); // ✅ ensures populated comments
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-slate-400">
        Loading blog...
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        Blog not found
      </div>
    );
  }

  // Decode user ID
  let userId = null;
  if (token) {
    try {
      userId = JSON.parse(atob(token.split(".")[1])).id;
    } catch {}
  }

  const isLiked =
    userId && blog.likes?.some((id) => id.toString() === userId);

  return (
    <div className="bg-[#020617] text-slate-200 min-h-screen relative">
      {/* Top reading progress bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] z-[100]">
        <div
          className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Blog header */}
      <section className="pt-32 md:pt-40 pb-12 px-6 border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/blog"
            className="text-cyan-400 text-xs uppercase tracking-widest"
          >
            ← Back to Blog
          </Link>

          <h1 className="mt-6 text-3xl md:text-6xl font-black text-white">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-slate-400">
            <span className="text-white font-semibold">
              {blog.author?.name || "Unknown"}
            </span>

            <span>{new Date(blog.createdAt).toDateString()}</span>

            <button
              onClick={handleLike}
              disabled={actionLoading}
              className={`flex items-center gap-2 transition
                ${isLiked ? "text-red-400" : "text-cyan-400"}
                ${actionLoading ? "opacity-50" : ""}
              `}
            >
              {isLiked ? "♥" : "♡"} {blog.likes?.length || 0}
            </button>
          </div>
        </div>
      </section>

      {/* Cover image */}
      {blog.image && (
        <section className="py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full max-h-[520px] object-cover rounded-2xl border border-cyan-500/20"
            />
          </div>
        </section>
      )}

      {/* Blog content & author sidebar */}
      <main className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <aside className="lg:col-span-3 hidden lg:block sticky top-40">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-black font-black mb-4">
              {blog.author?.name?.[0] || "U"}
            </div>
            <h4 className="text-white font-bold">
              {blog.author?.name || "Unknown"}
            </h4>
            <p className="text-xs text-slate-400 mt-2">
              CSC NITJ Contributor
            </p>
          </div>
        </aside>

        <article
          className="
            lg:col-span-9
            prose prose-invert prose-cyan max-w-none
            prose-h1:text-white
            prose-h2:text-white
            prose-h3:text-white
            prose-ul:list-disc
            prose-ol:list-decimal
            prose-li:marker:text-cyan-400
            prose-code:bg-slate-900
            prose-code:text-cyan-300
            prose-code:px-1
            prose-code:py-0.5
            prose-code:rounded
            prose-pre:bg-slate-900
            prose-pre:border
            prose-pre:border-slate-800
            [&_iframe]:w-full
            [&_iframe]:aspect-video
            [&_iframe]:rounded-xl
            [&_iframe]:border
            [&_iframe]:border-slate-800
          "
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </main>

      {/* Comments section */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <h3 className="text-xl font-black text-white mb-8">
          Comments ({blog.comments?.length || 0})
        </h3>

        <form onSubmit={handleComment} className="mb-10">
          <textarea
            rows="3"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={
              token ? "Write your comment..." : "Login to write a comment"
            }
            disabled={!token}
            className="w-full p-4 rounded-lg bg-slate-900 border border-slate-700"
          />
          <button
            type="submit"
            disabled={!token || actionLoading}
            className="mt-3 px-6 py-2 rounded-lg bg-cyan-500 text-black text-xs font-black uppercase"
          >
            Post Comment
          </button>
        </form>

        <div className="space-y-6">
          {blog.comments?.map((c) => {
            const canDelete =
              userId &&
              (c.user?._id === userId || blog.author?._id === userId);

            return (
              <div
                key={c._id}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-5"
              >
                <div className="flex justify-between mb-2">
                  <p className="text-white font-semibold text-sm">
                    {c.user?.name || "CSC Member"}
                  </p>

                  {canDelete && (
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      className="text-red-400 text-xs"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <p className="text-slate-300 text-sm">{c.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="text-center py-12 text-xs text-slate-500 uppercase tracking-widest">
        Awareness is the first line of cyber defense • CSC NITJ
      </footer>
    </div>
  );
}
