import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { apiFetch } from "../api";

export default function CreateBlog() {
  const navigate = useNavigate();

  // Basic form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Cybersecurity");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Extract plain text to calculate words & reading time
  const plainText = content.replace(/<[^>]*>/g, "");
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(words / 200));

  // Handle cover image selection
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Submit blog data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!content || words === 0) {
      setError("Blog content cannot be empty");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await apiFetch("/api/blogs", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to publish blog");
      }

      navigate("/blog");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white px-4 sm:px-6 py-24">
      <div className="max-w-7xl mx-auto mb-14">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          Create <span className="text-cyan-400">Blog</span>
        </h1>
        <p className="text-gray-400 mt-3 max-w-xl">
          Share your cybersecurity insights with the CSC community.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Blog creation form */}
        <form
          onSubmit={handleSubmit}
          className="bg-black/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 sm:p-8 space-y-7 shadow-[0_0_40px_rgba(34,211,238,0.15)]"
        >
          <h2 className="text-lg font-black uppercase tracking-widest text-cyan-400">
            Writer Console
          </h2>

          {/* Blog title input */}
          <div>
            <label className="text-[11px] uppercase tracking-widest text-gray-400">
              Blog Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a powerful title..."
              className="w-full mt-2 p-4 rounded-lg bg-black/50 border border-white/10 focus:border-cyan-400 outline-none"
              required
            />
          </div>

          {/* Blog category selector */}
          <div>
            <label className="text-[11px] uppercase tracking-widest text-gray-400">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-2 p-4 rounded-lg bg-black/50 border border-white/10 focus:border-cyan-400 outline-none"
            >
              <option>Cybersecurity</option>
              <option>Awareness</option>
              <option>Ethical Hacking</option>
              <option>AI & Tech</option>
            </select>
          </div>

          {/* Optional cover image */}
          <div>
            <label className="text-[11px] uppercase tracking-widest text-gray-400">
              Cover Image (optional)
            </label>
            <label className="mt-3 flex flex-col items-center justify-center border-2 border-dashed border-cyan-500/30 rounded-xl p-6 cursor-pointer hover:border-cyan-400 transition">
              <span className="text-sm text-gray-400">
                Click to upload image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Rich text editor */}
          <div>
            <label className="text-[11px] uppercase tracking-widest text-gray-400">
              Content
            </label>

            <div className="relative mt-2 rounded-2xl p-[1px] bg-gradient-to-br from-cyan-500/30 via-transparent to-transparent">
              <div className="rounded-2xl bg-[#020617]/95 backdrop-blur-xl">
                <div className="px-4 py-2 border-b border-cyan-500/20 text-[10px] uppercase tracking-[0.35em] text-cyan-400 font-mono">
                  Rich Text Editor
                </div>

                {/* CKEditor styling fix for better readability */}
                <style>{`
                  .ck-editor__editable {
                    color: #000 !important;
                    background-color: #ffffff !important;
                    min-height: 220px;
                  }
                  .ck-editor__editable:focus {
                    outline: none;
                  }
                  .ck.ck-editor__main > .ck-editor__editable {
                    padding: 1rem;
                  }
                `}</style>

                <CKEditor
                  editor={ClassicEditor}
                  data={content}
                  onChange={(event, editor) => {
                    setContent(editor.getData());
                  }}
                  config={{
                    toolbar: {
                      items: [
                        "heading",
                        "|",
                        "bold",
                        "italic",
                        "underline",
                        "link",
                        "|",
                        "bulletedList",
                        "numberedList",
                        "|",
                        "code",
                        "codeBlock",
                        "blockQuote",
                        "insertTable",
                        "mediaEmbed",
                        "|",
                        "undo",
                        "redo",
                      ],
                      shouldNotGroupWhenFull: true,
                    },
                    codeBlock: {
                      languages: [
                        { language: "plaintext", label: "Plain text" },
                        { language: "javascript", label: "JavaScript" },
                        { language: "python", label: "Python" },
                        { language: "bash", label: "Bash" },
                        { language: "html", label: "HTML" },
                        { language: "css", label: "CSS" },
                      ],
                    },
                    mediaEmbed: {
                      previewsInData: true,
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Blog stats */}
          <div className="flex justify-between text-xs text-gray-400 font-mono">
            <span>Words: {words}</span>
            <span>Reading Time: {readTime} min</span>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-lg bg-cyan-500 text-black font-black uppercase text-xs tracking-widest hover:bg-cyan-400 disabled:opacity-60"
          >
            {loading ? "Publishing..." : "Publish Blog"}
          </button>
        </form>

        {/* Live preview section */}
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-44 sm:h-56 object-cover rounded-xl mb-6"
            />
          )}

          <span className="text-[10px] uppercase tracking-widest text-cyan-400">
            {category}
          </span>

          <h3 className="text-2xl sm:text-3xl font-black mt-3 mb-4">
            {title || "Blog Title"}
          </h3>

          <div
            className="prose prose-invert max-w-none text-gray-400"
            dangerouslySetInnerHTML={{
              __html:
                content || "<p>Your blog content will appear here...</p>",
            }}
          />
        </div>
      </div>
    </div>
  );
}
