/**
 * @file CreateBlog.jsx
 * @description Writer console component for authoring, configuring, and publishing technical blog posts with live preview.
 */

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { apiFetch } from "../api";

// Extracted outside component scope to prevent re-allocation on every render cycle
const EDITOR_STYLES = `
  .blog-editor-wrapper .ck.ck-editor {
    border: none !important;
    width: 100%;
  }
  .blog-editor-wrapper .ck.ck-editor__main {
    border: none !important;
  }
  .blog-editor-wrapper .ck.ck-toolbar {
    background: #071426 !important;
    border: none !important;
    border-bottom: 1px solid rgba(34, 211, 238, 0.15) !important;
    padding: 10px 12px !important;
    border-radius: 0 !important;
    display: flex !important;
    flex-wrap: wrap !important;
  }
  .blog-editor-wrapper .ck.ck-toolbar__items {
    flex-wrap: wrap !important;
    gap: 3px;
  }
  .blog-editor-wrapper .ck.ck-button,
  .blog-editor-wrapper a.ck.ck-button {
    color: #94a3b8 !important;
    background: transparent !important;
    border-radius: 8px !important;
    transition: all 0.2s ease;
  }
  .blog-editor-wrapper .ck.ck-button:hover,
  .blog-editor-wrapper a.ck.ck-button:hover {
    background: rgba(34, 211, 238, 0.12) !important;
    color: #22d3ee !important;
  }
  .blog-editor-wrapper .ck.ck-button.ck-on,
  .blog-editor-wrapper a.ck.ck-button.ck-on {
    background: rgba(34, 211, 238, 0.2) !important;
    color: #22d3ee !important;
  }
  .blog-editor-wrapper .ck.ck-button .ck-icon {
    color: currentColor !important;
  }
  .blog-editor-wrapper .ck.ck-button .ck-icon path {
    fill: currentColor !important;
  }
  .blog-editor-wrapper .ck.ck-dropdown__panel {
    background: #071426 !important;
    border: 1px solid rgba(34, 211, 238, 0.2) !important;
    color: #cbd5e1 !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6) !important;
    border-radius: 12px !important;
  }
  .blog-editor-wrapper .ck.ck-list {
    background: #071426 !important;
  }
  .blog-editor-wrapper .ck.ck-list__item .ck-button {
    color: #cbd5e1 !important;
  }
  .blog-editor-wrapper .ck.ck-list__item .ck-button:hover {
    background: rgba(34, 211, 238, 0.12) !important;
    color: #22d3ee !important;
  }
  .blog-editor-wrapper .ck-editor__editable {
    min-height: 400px !important;
    max-height: 600px !important;
    overflow-y: auto !important;
    background: rgba(4, 11, 22, 0.95) !important;
    color: #e2e8f0 !important;
    border: none !important;
    padding: 24px !important;
    font-family: inherit !important;
    font-size: 15px !important;
    line-height: 1.8 !important;
  }
  .blog-editor-wrapper .ck-editor__editable:focus {
    border: none !important;
    box-shadow: inset 0 0 0 1px rgba(34, 211, 238, 0.2) !important;
  }
  .blog-editor-wrapper .ck-editor__editable p {
    margin-top: 0 !important;
    margin-bottom: 16px !important;
    color: #cbd5e1 !important;
  }
  .blog-editor-wrapper .ck-editor__editable h1,
  .blog-editor-wrapper .ck-editor__editable h2,
  .blog-editor-wrapper .ck-editor__editable h3,
  .blog-editor-wrapper .ck-editor__editable h4 {
    font-weight: 800 !important;
    color: #ffffff !important;
    line-height: 1.3 !important;
    margin-top: 24px !important;
    margin-bottom: 12px !important;
  }
  .blog-editor-wrapper .ck-editor__editable h2 { color: #22d3ee !important; }
  .blog-editor-wrapper .ck-editor__editable h3 { color: #67e8f9 !important; }
  .blog-editor-wrapper .ck-editor__editable a {
    color: #22d3ee !important;
    text-decoration: underline;
  }
  .blog-editor-wrapper .ck-editor__editable ul,
  .blog-editor-wrapper .ck-editor__editable ol {
    color: #cbd5e1 !important;
    padding-left: 24px !important;
    margin-bottom: 16px !important;
  }
  .blog-editor-wrapper .ck-editor__editable li { margin-bottom: 6px !important; }
  .blog-editor-wrapper .ck-editor__editable blockquote {
    border-left: 3px solid #22d3ee !important;
    background: rgba(34, 211, 238, 0.08) !important;
    color: #e2e8f0 !important;
    padding: 12px 16px !important;
    border-radius: 0 8px 8px 0 !important;
    margin: 20px 0 !important;
  }
  .blog-editor-wrapper .ck-editor__editable code {
    background: rgba(34, 211, 238, 0.1) !important;
    color: #22d3ee !important;
    border: 1px solid rgba(34, 211, 238, 0.2) !important;
    border-radius: 6px !important;
    padding: 2px 6px !important;
    font-family: monospace !important;
  }
  .blog-editor-wrapper .ck-editor__editable pre {
    background: #010714 !important;
    border: 1px solid rgba(34, 211, 238, 0.2) !important;
    border-radius: 10px !important;
    color: #a7f3d0 !important;
    padding: 16px !important;
    overflow-x: auto !important;
    margin: 20px 0 !important;
  }
  .blog-editor-wrapper .ck-editor__editable table {
    border-collapse: collapse !important;
    width: 100% !important;
    margin: 20px 0 !important;
  }
  .blog-editor-wrapper .ck-editor__editable th,
  .blog-editor-wrapper .ck-editor__editable td {
    border: 1px solid rgba(148, 163, 184, 0.2) !important;
    padding: 10px !important;
    color: #cbd5e1 !important;
  }
  .blog-editor-wrapper .ck-editor__editable th {
    background: rgba(34, 211, 238, 0.1) !important;
    color: #22d3ee !important;
  }
  .blog-editor-wrapper .ck-editor__editable::-webkit-scrollbar { width: 6px; }
  .blog-editor-wrapper .ck-editor__editable::-webkit-scrollbar-track { background: #040b16; }
  .blog-editor-wrapper .ck-editor__editable::-webkit-scrollbar-thumb {
    background: rgba(34, 211, 238, 0.3);
    border-radius: 4px;
  }
  .blog-preview-terminal {
    width: 100%;
    background: #010714;
    border: 1px solid rgba(34, 211, 238, 0.2);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  }
  .blog-preview-terminal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 40px;
    padding: 0 14px;
    background: rgba(34, 211, 238, 0.04);
    border-bottom: 1px solid rgba(34, 211, 238, 0.15);
  }
  .blog-preview-terminal-dots {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .blog-preview-terminal-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .blog-preview-terminal-dots span:nth-child(1) { background: #f87171; }
  .blog-preview-terminal-dots span:nth-child(2) { background: #facc15; }
  .blog-preview-terminal-dots span:nth-child(3) { background: #4ade80; }
  .blog-preview-terminal-label {
    font-family: monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    color: rgba(34, 211, 238, 0.6);
  }
  .blog-preview-terminal-body {
    display: flex;
    align-items: flex-start;
    width: 100%;
    padding: 16px;
    overflow-x: auto;
  }
  .blog-preview-terminal-prompt {
    flex: 0 0 auto;
    width: 20px;
    padding-top: 2px;
    font-family: monospace;
    font-size: 14px;
    color: #22d3ee;
  }
  .blog-preview {
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    color: #cbd5e1;
    font-size: 15px;
    line-height: 1.8;
    overflow-wrap: break-word;
    word-break: break-word;
  }
  .blog-preview p {
    margin-top: 0;
    margin-bottom: 16px;
    color: #cbd5e1;
    overflow-wrap: break-word;
  }
  .blog-preview h1,
  .blog-preview h2,
  .blog-preview h3,
  .blog-preview h4 {
    color: #ffffff;
    font-weight: 800;
    line-height: 1.3;
    margin-top: 24px;
    margin-bottom: 12px;
    overflow-wrap: break-word;
  }
  .blog-preview h1 { font-size: 1.8rem; }
  .blog-preview h2 { font-size: 1.5rem; color: #22d3ee; }
  .blog-preview h3 { font-size: 1.25rem; color: #67e8f9; }
  .blog-preview h4 { font-size: 1.1rem; color: #22d3ee; }
  .blog-preview ul, .blog-preview ol {
    margin-top: 10px;
    margin-bottom: 16px;
    padding-left: 24px;
    color: #cbd5e1;
  }
  .blog-preview ul { list-style-type: disc; }
  .blog-preview ol { list-style-type: decimal; }
  .blog-preview li { margin-bottom: 6px; overflow-wrap: break-word; }
  .blog-preview a {
    color: #22d3ee;
    text-decoration: underline;
    overflow-wrap: break-word;
  }
  .blog-preview blockquote {
    margin: 20px 0;
    padding: 12px 16px;
    border-left: 3px solid #22d3ee;
    border-radius: 0 8px 8px 0;
    background: rgba(34, 211, 238, 0.08);
    color: #cbd5e1;
  }
  .blog-preview code {
    color: #22d3ee;
    background: rgba(34, 211, 238, 0.1);
    border: 1px solid rgba(34, 211, 238, 0.2);
    padding: 2px 6px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 0.9em;
    overflow-wrap: break-word;
  }
  .blog-preview pre {
    margin: 20px 0;
    padding: 16px;
    background: #040b16;
    border: 1px solid rgba(34, 211, 238, 0.2);
    border-radius: 10px;
    overflow-x: auto;
    color: #a7f3d0;
    font-family: monospace;
    font-size: 13px;
    line-height: 1.6;
  }
  .blog-preview pre code {
    border: none;
    padding: 0;
    background: transparent;
    color: inherit;
  }
  .blog-preview figure.table {
    width: 100%;
    margin: 20px 0;
    overflow-x: auto;
  }
  .blog-preview table {
    width: 100%;
    min-width: 450px;
    border-collapse: collapse;
    background: #040b16;
  }
  .blog-preview th, .blog-preview td {
    border: 1px solid rgba(148, 163, 184, 0.2);
    padding: 10px;
    color: #cbd5e1;
    text-align: left;
  }
  .blog-preview th {
    color: #22d3ee;
    background: rgba(34, 211, 238, 0.1);
    font-weight: 800;
  }
  .blog-preview img {
    max-width: 100%;
    height: auto;
    margin: 20px auto;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: block;
  }
  .blog-preview iframe {
    width: 100%;
    max-width: 100%;
    aspect-ratio: 16/9;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .blog-terminal-cursor {
    display: inline-block;
    width: 6px;
    height: 14px;
    margin-left: 4px;
    background: #22d3ee;
    vertical-align: middle;
    box-shadow: 0 0 8px #22d3ee;
    animation: pulse 1s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  @media (max-width: 640px) {
    .blog-editor-wrapper .ck-editor__editable {
      min-height: 300px !important;
      padding: 16px !important;
      font-size: 14px !important;
    }
    .blog-preview { font-size: 14px; }
  }
`;

export default function CreateBlog() {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Cybersecurity");
  const [customCategory, setCustomCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Clean up object URL to prevent memory leaks on unmount or update
   */
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  /**
   * Optimized metrics calculation using useMemo
   */
  const { words, readTime } = useMemo(() => {
    const plainText = content
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
    const computedReadTime = Math.max(1, Math.ceil(wordCount / 200));

    return { words: wordCount, readTime: computedReadTime };
  }, [content]);

  /**
   * Handle cover image selection and validation
   */
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Cover image must be smaller than 5MB.");
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  /**
   * Remove uploaded image asset
   */
  const removeImage = useCallback(() => {
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setImageFile(null);
  }, []);

  /**
   * Handle secure transmission submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Blog title cannot be empty.");
      return;
    }

    if (!content || words === 0) {
      setError("Blog content cannot be empty.");
      return;
    }

    if (category === "Other" && !customCategory.trim()) {
      setError("Please enter your custom category.");
      return;
    }

    try {
      setLoading(true);
      const finalCategory = category === "Other" ? customCategory.trim() : category;

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content);
      formData.append("category", finalCategory);

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
      setError(err.message || "Something went wrong while publishing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#010714] text-white px-4 sm:px-6 md:px-10 py-24 md:py-32 selection:bg-cyan-500/30">
      <style>{EDITOR_STYLES}</style>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-10 md:mb-14">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 md:w-10 h-px bg-cyan-500/50" />
          <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-cyan-400/70">
            CSC_NITJ // BLOG ENGINE
          </span>
          <div className="w-6 md:w-10 h-px bg-cyan-500/50" />
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight">
          Create <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">Blog</span>
        </h1>
        <p className="mt-3 text-slate-400 text-sm md:text-base max-w-2xl font-mono">
          Deploy technical insights, guides, and security breakdowns to the global node network.
        </p>
      </div>

      {/* Main Responsive Grid Container */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 items-start">
        
        {/* Writer Console Form */}
        <form
          onSubmit={handleSubmit}
          className="relative w-full bg-[#071426]/90 backdrop-blur-2xl border border-cyan-500/20 rounded-2xl md:rounded-3xl p-5 sm:p-8 space-y-6 md:space-y-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {/* Console Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
              <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/60">
                writer_console.sh
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 font-mono text-[10px] text-cyan-400 uppercase tracking-widest">
              MODE: DRAFT
            </span>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <label className="block font-mono text-xs uppercase tracking-[0.2em] text-slate-300">
              Blog Title <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter secure transmission title..."
              className="w-full px-4 py-3.5 md:py-4 rounded-xl bg-[#040b16] border border-white/10 text-white placeholder:text-slate-600 font-mono text-sm outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              required
            />
          </div>

          {/* Category Select */}
          <div className="space-y-2">
            <label className="block font-mono text-xs uppercase tracking-[0.2em] text-slate-300">
              Classification Matrix <span className="text-cyan-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (e.target.value !== "Other") setCustomCategory("");
              }}
              className="w-full px-4 py-3.5 md:py-4 rounded-xl bg-[#040b16] border border-white/10 text-white font-mono text-sm outline-none cursor-pointer transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            >
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Awareness">Awareness</option>
              <option value="Ethical Hacking">Ethical Hacking</option>
              <option value="AI & Tech">AI & Tech</option>
              <option value="Other">Other</option>
            </select>

            {category === "Other" && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Define custom protocol/category..."
                className="w-full mt-3 px-4 py-3.5 rounded-xl bg-[#040b16] border border-cyan-400/30 text-white font-mono text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            )}
          </div>

          {/* Cover Graphic Uploader */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-mono text-xs uppercase tracking-[0.2em] text-slate-300">
                Cover Graphic
              </label>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                Optional (Max 5MB)
              </span>
            </div>

            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full min-h-[140px] px-4 py-6 border-2 border-dashed border-cyan-500/20 rounded-2xl cursor-pointer bg-[#040b16]/60 hover:border-cyan-400/60 hover:bg-cyan-500/[0.03] transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xl font-bold mb-2">
                  +
                </div>
                <span className="font-mono text-xs text-slate-300">Upload Header Image</span>
                <span className="font-mono text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                  PNG, JPG, WEBP accepted
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-black/40">
                <img
                  src={imagePreview}
                  alt="Cover Preview"
                  className="w-full h-48 sm:h-56 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-red-500/40 text-red-400 font-mono text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-all"
                >
                  Remove Asset
                </button>
              </div>
            )}
          </div>

          {/* CKEditor Wrapper */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-mono text-xs uppercase tracking-[0.2em] text-slate-300">
                Article Transmission Content <span className="text-cyan-400">*</span>
              </label>
              <span className="font-mono text-[10px] text-cyan-400/60 uppercase tracking-widest">
                Rich Text Enabled
              </span>
            </div>

            <div className="blog-editor-wrapper w-full rounded-2xl overflow-hidden border border-cyan-500/20 bg-[#040b16] shadow-inner">
              <CKEditor
                editor={ClassicEditor}
                data={content}
                onChange={(_, editor) => setContent(editor.getData())}
                config={{
                  toolbar: {
                    items: [
                      "heading", "|", "bold", "italic", "underline", "link", "|",
                      "bulletedList", "numberedList", "|", "code", "codeBlock",
                      "blockQuote", "insertTable", "mediaEmbed", "|", "undo", "redo",
                    ],
                    shouldNotGroupWhenFull: true,
                  },
                  heading: {
                    options: [
                      { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
                      { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
                      { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
                      { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
                    ],
                  },
                  codeBlock: {
                    languages: [
                      { language: "plaintext", label: "Plain text" },
                      { language: "javascript", label: "JavaScript" },
                      { language: "python", label: "Python" },
                      { language: "bash", label: "Bash" },
                      { language: "html", label: "HTML" },
                      { language: "css", label: "CSS" },
                      { language: "json", label: "JSON" },
                      { language: "sql", label: "SQL" },
                      { language: "cpp", label: "C++" },
                    ],
                  },
                  mediaEmbed: { previewsInData: true },
                }}
              />
            </div>
          </div>

          {/* Metadata Analytics Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#040b16] border border-white/10 font-mono">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Word Count
              </span>
              <span className="block mt-1 text-lg font-bold text-cyan-400">
                {words} WDS
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#040b16] border border-white/10 font-mono">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Read Speed
              </span>
              <span className="block mt-1 text-lg font-bold text-cyan-400">
                {readTime} MIN
              </span>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs">
              ERROR: {error}
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-cyan-500 text-[#010714] font-mono text-xs font-black uppercase tracking-[0.25em] transition-all hover:bg-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "INITIALIZING UPLOAD..." : "PUBLISH TRANSMISSION →"}
          </button>
        </form>

        {/* Live Preview Console Container */}
        <div className="relative w-full h-fit bg-[#071426]/80 backdrop-blur-2xl border border-cyan-500/20 rounded-2xl md:rounded-3xl p-5 sm:p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {/* Preview Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400/60">
                csc_nitj // live_preview
              </span>
              <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-white mt-1">
                Real-time Render
              </h2>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 font-mono text-[10px] text-green-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              STREAM_ACTIVE
            </div>
          </div>

          {/* Cover Preview Image */}
          {imagePreview && (
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
              <img
                src={imagePreview}
                alt="Live cover preview"
                className="w-full h-48 sm:h-64 object-cover"
              />
            </div>
          )}

          {/* Category Tag */}
          <div>
            <span className="inline-block px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 font-mono text-xs uppercase tracking-widest text-cyan-400">
              {category === "Other" ? customCategory || "OTHER" : category}
            </span>
          </div>

          {/* Title Preview */}
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white break-words leading-tight">
            {title || "Untitled Transmission Vector"}
          </h3>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-slate-400 pb-4 border-b border-white/[0.08]">
            <span>{words} WORDS</span>
            <span>•</span>
            <span>{readTime} MIN READ</span>
            <span>•</span>
            <span className="text-cyan-400">NITJ_NODE</span>
          </div>

          {/* Terminal View Component */}
          <div className="blog-preview-terminal">
            <div className="blog-preview-terminal-header">
              <div className="blog-preview-terminal-dots">
                <span />
                <span />
                <span />
              </div>
              <span className="blog-preview-terminal-label">terminal_output</span>
            </div>

            <div className="blog-preview-terminal-body">
              <span className="blog-preview-terminal-prompt">&gt;</span>
              <article className="blog-preview">
                {content ? (
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  <p className="text-slate-500 font-mono italic">
                    Awaiting content compilation sequence... Type in the writer console to stream data here.
                  </p>
                )}
                {content && <span className="blog-terminal-cursor" />}
              </article>
            </div>
          </div>

          {/* Preview Footer Metrics */}
          <div className="pt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
            <span>SECURE_FEED // READY</span>
            <span>STATUS: OK</span>
          </div>
        </div>

      </div>
    </div>
  );
}