import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";

const BlogModeration = () => {
  const [blogs, setBlogs] = useState({
    pending: [],
    approved: [],
    rejected: [],
  });

  useEffect(() => {
    // Fetch blogs based on moderation status
    const fetchBlogs = async () => {
      try {
        // Public approved blogs
        const approvedRes = await apiFetch("/api/blogs");
        const approvedData = await approvedRes.json();

        // Pending blogs (admin only)
        const pendingRes = await apiFetch("/api/blogs/pending");

        if (!pendingRes.ok) {
          const err = await pendingRes.text();
          console.error("Pending blog fetch failed:", pendingRes.status, err);
          return;
        }

        const pendingData = await pendingRes.json();

        setBlogs({
          approved: approvedData || [],
          pending: pendingData || [],
          rejected: [],
        });
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchBlogs();
  }, []);

  // Update blog moderation status
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await apiFetch(`/api/blogs/moderate/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Moderation failed");
      }

      setBlogs((prev) => ({
        ...prev,
        pending: prev.pending.filter((b) => b._id !== id),
        approved:
          newStatus === "approved"
            ? [...prev.approved, prev.pending.find((b) => b._id === id)]
            : prev.approved,
        rejected:
          newStatus === "rejected"
            ? [...prev.rejected, prev.pending.find((b) => b._id === id)]
            : prev.rejected,
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  // Reusable section renderer
  const renderSection = (heading, list, status) => (
    <section className="mb-20">
      <h2 className="text-xl font-black uppercase tracking-widest mb-6">
        {heading}
      </h2>

      {list.length === 0 && (
        <p className="text-gray-500 italic">No blogs found.</p>
      )}

      <div className="space-y-4">
        {list.map((blog) => (
          <div
            key={blog._id}
            className="flex justify-between items-center bg-black/40 border border-cyan-500/10 p-4 rounded-xl"
          >
            <div>
              <h3 className="text-base font-bold">{blog.title}</h3>
              <p className="text-cyan-400 text-sm">
                {blog.author?.name || "Unknown Author"}
              </p>
            </div>

            {status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(blog._id, "approved")}
                  className="px-4 py-2 bg-green-500 text-black text-xs font-bold rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(blog._id, "rejected")}
                  className="px-4 py-2 bg-red-500 text-black text-xs font-bold rounded"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="bg-[#010714] min-h-screen text-white pt-36 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black uppercase mb-16">
          Blog <span className="text-cyan-400">Moderation</span>
        </h1>

        {renderSection("Pending Blogs", blogs.pending, "pending")}
        {renderSection("Approved Blogs", blogs.approved, "approved")}
        {renderSection("Rejected Blogs", blogs.rejected, "rejected")}
      </div>
    </div>
  );
};

export default BlogModeration;
