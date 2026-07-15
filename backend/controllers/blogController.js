import Blog from "../models/Blog.js";

// Create blog
export const createBlog = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        message: "Title, content and category are required",
      });
    }

    const blog = await Blog.create({
      title,
      content,
      category,
      author: req.user._id,
      image: req.file
        ? `/uploads/csc/blogs/${req.file.filename}`
        : "",
      status: "pending",
    });

    const populatedBlog = await Blog.findById(blog._id).populate(
      "author",
      "name email"
    );

    res.status(201).json(populatedBlog);
  } catch (err) {
    console.error("Create blog error:", err);
    res.status(500).json({ message: "Blog creation failed" });
  }
};

// Get approved blogs
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "approved" })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch {
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

// My blogs
export const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({
      author: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(blogs);
  } catch {
    res.status(500).json({ message: "Failed to fetch user blogs" });
  }
};

// User blogs
export const getUserBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({
      author: req.params.id,
      status: "approved",
    }).sort({ createdAt: -1 });

    res.status(200).json(blogs);
  } catch {
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

// Pending blogs
export const getPendingBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "pending" })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch {
    res.status(500).json({ message: "Failed to fetch pending blogs" });
  }
};

// Moderate blog
export const moderateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate("author", "name email");

    if (!blog)
      return res.status(404).json({ message: "Blog not found" });

    res.json(blog);
  } catch {
    res.status(500).json({ message: "Moderation failed" });
  }
};

// Blog detail
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name email")
      .populate("comments.user", "name email");

    if (!blog || blog.status !== "approved") {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch {
    res.status(500).json({ message: "Failed to fetch blog" });
  }
};

// Like blog
export const likeBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog)
    return res.status(404).json({ message: "Blog not found" });

  const uid = req.user._id.toString();

  blog.likes = blog.likes.some((id) => id.toString() === uid)
    ? blog.likes.filter((id) => id.toString() !== uid)
    : [...blog.likes, req.user._id];

  await blog.save();
  res.json(blog);
};

// Comment
export const commentBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog)
    return res.status(404).json({ message: "Blog not found" });

  blog.comments.push({
    user: req.user._id,
    text: req.body.text,
  });

  await blog.save();
  res.json(blog);
};

// Delete comment
export const deleteComment = async (req, res) => {
  const { blogId, commentId } = req.params;
  const userId = req.user._id.toString();

  const blog = await Blog.findById(blogId)
    .populate("author", "name email")
    .populate("comments.user", "name email");

  if (!blog)
    return res.status(404).json({ message: "Blog not found" });

  const comment = blog.comments.find(
    (c) => c._id.toString() === commentId
  );

  if (!comment)
    return res.status(404).json({ message: "Comment not found" });

  if (
    comment.user._id.toString() !== userId &&
    blog.author._id.toString() !== userId
  ) {
    return res.status(403).json({ message: "Not authorized" });
  }

  blog.comments = blog.comments.filter(
    (c) => c._id.toString() !== commentId
  );

  await blog.save();
  res.json(blog);
};
