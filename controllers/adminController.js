const Post = require("../models/Post");
const Project = require("../models/Project");
const Message = require("../models/Message");
const NewsItem = require("../models/NewsItem");
const { getTechNews } = require("../services/newsService");
const { getSiteProfile, updateSiteProfile } = require("../services/siteProfileService");
const fs = require("fs");
const path = require("path");

function hasUsefulValue(value) {
  return Boolean(value && String(value).trim() && String(value).trim() !== "#");
}

function deleteLocalUploadedImage(imagePath = "") {
  if (!imagePath || !imagePath.startsWith("/uploads/")) {
    return;
  }

  const fullPath = path.join(__dirname, "../public", imagePath);

  fs.unlink(fullPath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Failed to delete uploaded image:", err.message);
    }
  });
}

function calculateProfileCompletion(profile) {
  const social = profile?.socialLinks || {};

  const checks = [
    profile?.siteName,
    profile?.ownerName,
    profile?.initials,
    profile?.professionalTitle,
    profile?.availabilityStatus,
    profile?.location,
    profile?.email,
    profile?.heroEyebrow,
    profile?.heroHeadline,
    profile?.heroDescription,
    profile?.aboutIntro,
    profile?.bio,
    profile?.currentFocusTitle,
    profile?.currentFocus,
    profile?.mission,
    profile?.seoTitle,
    profile?.seoDescription,
    Array.isArray(profile?.skills) && profile.skills.length >= 3,
    hasUsefulValue(social.github),
    hasUsefulValue(social.linkedin),
    hasUsefulValue(social.resume),
  ];

  const total = checks.length;
  const completed = checks.filter(Boolean).length;
  const percent = Math.round((completed / total) * 100);

  return {
    total,
    completed,
    percent,
  };
}


function splitList(value = "") {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stripHtml(value = "") {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isValidHttpUrl(value = "") {
  const text = String(value || "").trim();

  if (!text) return true;

  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidImageReference(value = "") {
  const text = String(value || "").trim();

  if (!text) return true;

  if (text.startsWith("/uploads/") || text.startsWith("/images/")) {
    return true;
  }

  return isValidHttpUrl(text);
}

function getSubmittedImage(req, existingImage = "") {
  if (req.file && req.file.filename) {
    return `/uploads/${req.file.filename}`;
  }

  const imageUrl = String(req.body.image || "").trim();

  if (imageUrl) {
    return imageUrl;
  }

  return existingImage || "";
}

function validatePostInput(body) {
  const errors = [];

  if (!String(body.title || "").trim()) {
    errors.push("Post title is required.");
  }

  if (!stripHtml(body.content)) {
    errors.push("Post content is required.");
  }

  if (body.status && !["draft", "published"].includes(body.status)) {
    errors.push("Post status must be either draft or published.");
  }

  if (body.image && !isValidImageReference(body.image)) {
    errors.push("Post image must be a valid image URL or uploaded image path.");
  }

  return errors;
}

function validateProjectInput(body) {
  const errors = [];

  if (!String(body.title || "").trim()) {
    errors.push("Project title is required.");
  }

  if (!String(body.summary || "").trim() && !String(body.description || "").trim()) {
    errors.push("Project summary or description is required.");
  }

  if (body.image && !isValidImageReference(body.image)) {
    errors.push("Project image must be a valid image URL or uploaded image path.");
  }

  if (body.githubUrl && !isValidHttpUrl(body.githubUrl)) {
    errors.push("GitHub URL must be a valid http or https link.");
  }

  if (body.liveUrl && !isValidHttpUrl(body.liveUrl)) {
    errors.push("Live demo URL must be a valid http or https link.");
  }

  return errors;
}

function formatDatabaseError(err, fallbackMessage) {
  if (err && err.code === 11000) {
    const duplicatedField = Object.keys(err.keyPattern || {})[0] || "field";
    return `A record with this ${duplicatedField} already exists. Please use another value.`;
  }

  if (err && err.name === "ValidationError") {
    return Object.values(err.errors)
      .map((error) => error.message)
      .join(" ");
  }

  return fallbackMessage;
}

exports.getSettings = async (req, res, next) => {
  try {
    const profile = await getSiteProfile();

    res.render("admin/settings", {
      title: "Site Settings | TechSphere Admin",
      profile,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSettings = async (req, res) => {
  try {
    await updateSiteProfile(req.body);

    req.flash("success", "Site settings updated successfully.");
    res.redirect("/admin/settings");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update site settings.");
    res.redirect("/admin/settings");
  }
};

function getAuthorId(req) {
  return req.session.admin && req.session.admin._id;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

exports.getDashboard = async (req, res, next) => {
  try {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalProjects,
      featuredProjects,
      totalMessages,
      unreadMessages,
      totalNewsItems,
      importedNewsItems,
      profile,
      latestPosts,
      latestProjects,
      latestMessages,
    ] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ status: "published" }),
      Post.countDocuments({ status: "draft" }),
      Project.countDocuments(),
      Project.countDocuments({ featured: true }),
      Message.countDocuments(),
      Message.countDocuments({ read: false }),
      NewsItem.countDocuments(),
      NewsItem.countDocuments({ isImported: true }),
      getSiteProfile(),
      Post.find().sort({ createdAt: -1 }).limit(5),
      Project.find().sort({ createdAt: -1 }).limit(5),
      Message.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const profileCompletion = calculateProfileCompletion(profile);

    res.render("admin/dashboard", {
      title: "Dashboard | TechSphere Admin",
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalProjects,
        featuredProjects,
        totalMessages,
        unreadMessages,
        totalNewsItems,
        importedNewsItems,
      },
      profileCompletion,
      latestPosts,
      latestProjects,
      latestMessages,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.render("admin/posts", {
      title: "Manage Posts | TechSphere",
      posts,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCreatePost = (req, res) => {
  res.render("admin/create-post", {
    title: "Create Post | TechSphere",
    post: null,
  });
};

exports.createPost = async (req, res) => {
  try {
    const validationErrors = validatePostInput(req.body);

    if (validationErrors.length) {
      req.flash("error", validationErrors.join(" "));
      return res.redirect("/admin/posts/new");
    }

    const image = getSubmittedImage(req);

    await Post.create({
      title: req.body.title,
      slug: req.body.slug,
      excerpt: req.body.excerpt,
      category: req.body.category || "Learning Journey",
      tags: splitList(req.body.tags),
      image,
      featuredImage: image,
      content: req.body.content,
      status: req.body.status || "published",
      featured: req.body.featured === "on",
      author: getAuthorId(req),
    });

    req.flash("success", "Post created successfully.");
    res.redirect("/admin/posts");
  } catch (err) {
    console.error(err);
    req.flash(
      "error",
      formatDatabaseError(err, "Failed to create post. Please check the fields and try again.")
    );
    res.redirect("/admin/posts/new");
  }
};

exports.getEditPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      req.flash("error", "Post not found.");
      return res.redirect("/admin/posts");
    }

    res.render("admin/edit-post", {
      title: "Edit Post | TechSphere",
      post,
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePost = async (req, res) => {
  try {
    const validationErrors = validatePostInput(req.body);

    if (validationErrors.length) {
      req.flash("error", validationErrors.join(" "));
      return res.redirect(`/admin/posts/${req.params.id}/edit`);
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      req.flash("error", "Post not found.");
      return res.redirect("/admin/posts");
    }

    const image = getSubmittedImage(req, post.image);

    post.title = req.body.title;
    post.slug = req.body.slug;
    post.excerpt = req.body.excerpt;
    post.category = req.body.category || "Learning Journey";
    post.tags = splitList(req.body.tags);
    post.image = image;
    post.featuredImage = image;
    post.content = req.body.content;
    post.status = req.body.status || "published";
    post.featured = req.body.featured === "on";

    await post.save();

    req.flash("success", "Post updated successfully.");
    res.redirect("/admin/posts");
  } catch (err) {
    console.error(err);
    req.flash(
      "error",
      formatDatabaseError(err, "Failed to update post. Please check the fields and try again.")
    );
    res.redirect(`/admin/posts/${req.params.id}/edit`);
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      req.flash("error", "Post not found.");
      return res.redirect("/admin/posts");
    }

    deleteLocalUploadedImage(post.image);
    deleteLocalUploadedImage(post.featuredImage);

    await Post.findByIdAndDelete(req.params.id);

    req.flash("success", "Post deleted successfully.");
    res.redirect("/admin/posts");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete post.");
    res.redirect("/admin/posts");
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.render("admin/projects", {
      title: "Manage Projects | TechSphere",
      projects,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCreateProject = (req, res) => {
  res.render("admin/create-project", {
    title: "Create Project | TechSphere",
    project: null,
  });
};

exports.createProject = async (req, res) => {
  try {
    const validationErrors = validateProjectInput(req.body);

    if (validationErrors.length) {
      req.flash("error", validationErrors.join(" "));
      return res.redirect("/admin/projects/new");
    }

    const image = getSubmittedImage(req);

    await Project.create({
      title: req.body.title,
      slug: req.body.slug,
      summary: req.body.summary,
      problem: req.body.problem,
      description: req.body.description,
      caseStudy: req.body.caseStudy,
      lessons: req.body.lessons,
      techStack: splitList(req.body.techStack),
      features: splitList(req.body.features),
      image,
      githubUrl: req.body.githubUrl,
      liveUrl: req.body.liveUrl,
      status: req.body.status || "In Progress",
      category: req.body.category || "Full-Stack",
      featured: req.body.featured === "on",
    });

    req.flash("success", "Project created successfully.");
    res.redirect("/admin/projects");
  } catch (err) {
    console.error(err);
    req.flash(
      "error",
      formatDatabaseError(err, "Failed to create project. Please check the fields and try again.")
    );
    res.redirect("/admin/projects/new");
  }
};

exports.getEditProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      req.flash("error", "Project not found.");
      return res.redirect("/admin/projects");
    }

    res.render("admin/edit-project", {
      title: "Edit Project | TechSphere",
      project,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProject = async (req, res) => {
  try {
    const validationErrors = validateProjectInput(req.body);

    if (validationErrors.length) {
      req.flash("error", validationErrors.join(" "));
      return res.redirect(`/admin/projects/${req.params.id}/edit`);
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      req.flash("error", "Project not found.");
      return res.redirect("/admin/projects");
    }

    const image = getSubmittedImage(req, project.image);

    project.title = req.body.title;
    project.slug = req.body.slug;
    project.summary = req.body.summary;
    project.problem = req.body.problem;
    project.description = req.body.description;
    project.caseStudy = req.body.caseStudy;
    project.lessons = req.body.lessons;
    project.techStack = splitList(req.body.techStack);
    project.features = splitList(req.body.features);
    project.image = image;
    project.githubUrl = req.body.githubUrl;
    project.liveUrl = req.body.liveUrl;
    project.status = req.body.status || "In Progress";
    project.category = req.body.category || "Full-Stack";
    project.featured = req.body.featured === "on";

    await project.save();

    req.flash("success", "Project updated successfully.");
    res.redirect("/admin/projects");
  } catch (err) {
    console.error(err);
    req.flash(
      "error",
      formatDatabaseError(err, "Failed to update project. Please check the fields and try again.")
    );
    res.redirect(`/admin/projects/${req.params.id}/edit`);
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      req.flash("error", "Project not found.");
      return res.redirect("/admin/projects");
    }

    deleteLocalUploadedImage(project.image);

    await Project.findByIdAndDelete(req.params.id);

    req.flash("success", "Project deleted successfully.");
    res.redirect("/admin/projects");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete project.");
    res.redirect("/admin/projects");
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.render("admin/messages", {
      title: "Messages | TechSphere",
      messages,
    });
  } catch (err) {
    next(err);
  }
};

exports.markMessageRead = async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { read: true });
    req.flash("success", "Message marked as read.");
    res.redirect("/admin/messages");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update message.");
    res.redirect("/admin/messages");
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    req.flash("success", "Message deleted.");
    res.redirect("/admin/messages");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete message.");
    res.redirect("/admin/messages");
  }
};

exports.getNews = async (req, res, next) => {
  try {
    const newsResult = await getTechNews({
      refresh: false,
      limit: Number(process.env.NEWS_MAX_ITEMS) || 40,
    });

    res.render("admin/news", {
      title: "Tech News | TechSphere Admin",
      newsItems: newsResult.items,
      newsMeta: newsResult,
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshNews = async (req, res) => {
  try {
    const newsResult = await getTechNews({
      refresh: true,
      limit: Number(process.env.NEWS_MAX_ITEMS) || 40,
    });

    if (newsResult.error) {
      req.flash("error", `Could not fetch fresh news: ${newsResult.error}`);
    } else {
      req.flash("success", "Fresh tech news fetched successfully.");
    }

    res.redirect("/admin/news");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to refresh tech news.");
    res.redirect("/admin/news");
  }
};

exports.importNewsAsDraft = async (req, res) => {
  try {
    const news = await NewsItem.findById(req.params.id);

    if (!news) {
      req.flash("error", "News item not found.");
      return res.redirect("/admin/news");
    }

    if (news.isImported && news.importedPost) {
      req.flash("error", "This news item has already been imported.");
      return res.redirect("/admin/news");
    }

    const sourceName = escapeHtml(news.sourceName || "External Source");
    const title = escapeHtml(news.title);
    const description = escapeHtml(news.description || "");
    const originalUrl = escapeHtml(news.originalUrl);

    const content = `
      <p><strong>Source:</strong> ${sourceName}</p>
      <p>${description || "This draft was imported from an external technology news source."}</p>
      <p><a href="${originalUrl}" target="_blank" rel="noopener noreferrer">Read the original article</a></p>
      <hr>
      <p><strong>My thoughts:</strong></p>
      <p>Write your own explanation, opinion, lesson, or breakdown here before publishing.</p>
    `;

    const post = await Post.create({
      title: news.title,
      slug: `${news.title}-${String(news._id).slice(-6)}`,
      excerpt: news.description || "A technology news item imported as a draft.",
      category: "Tech News",
      tags: ["Tech News", news.sourceName].filter(Boolean),
      image: news.imageUrl,
      featuredImage: news.imageUrl,
      content,
      status: "draft",
      featured: false,
      author: getAuthorId(req),
    });

    news.isImported = true;
    news.importedPost = post._id;
    await news.save();

    req.flash("success", "News item imported as a draft blog post.");
    res.redirect(`/admin/posts/${post._id}/edit`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to import news item as draft.");
    res.redirect("/admin/news");
  }
};

exports.deleteNewsItem = async (req, res) => {
  try {
    await NewsItem.findByIdAndDelete(req.params.id);
    req.flash("success", "News item deleted from cache.");
    res.redirect("/admin/news");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete news item.");
    res.redirect("/admin/news");
  }
};