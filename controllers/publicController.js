const mongoose = require("mongoose");
const Post = require("../models/Post");
const Project = require("../models/Project");
const Message = require("../models/Message");
const { getTechNews } = require("../services/newsService");
const {
  placeholderProjects,
  placeholderPosts,
  postCategories,
  projectCategories,
} = require("../data/placeholders");

function buildTextSearch(search, fields) {
  if (!search) return {};
  const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(safe, "i");
  return { $or: fields.map((field) => ({ [field]: regex })) };
}

function findPlaceholderBySlug(items, slug) {
  return items.find((item) => item.slug === slug);
}

exports.getHome = async (req, res, next) => {
  try {
    const dbPosts = await Post.find({ status: "published" }).sort({ createdAt: -1 }).limit(3);
    const dbProjects = await Project.find({ featured: true }).sort({ createdAt: -1 }).limit(3);

const totalProjects = await Project.countDocuments();
const totalPublishedPosts = await Post.countDocuments({ status: "published" });

res.render("public/index", {
  title: req.siteProfile?.seoTitle || "TechSphere | Portfolio & Tech Blog",
  posts: dbPosts.length ? dbPosts : placeholderPosts,
  projects: dbProjects.length ? dbProjects : placeholderProjects,
  stats: {
    totalProjects,
    totalPublishedPosts,
  },
});
  } catch (err) {
    next(err);
  }
};

exports.getAbout = async (req, res, next) => {
  try {
    const [totalProjects, totalPublishedPosts] = await Promise.all([
      Project.countDocuments(),
      Post.countDocuments({ status: "published" }),
    ]);

    res.render("public/about", {
      title: `About | ${req.siteProfile?.siteName || "TechSphere"}`,
      stats: {
        totalProjects,
        totalPublishedPosts,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const { category = "All", search = "" } = req.query;
    const query = {};

    if (category && category !== "All" && category !== "Featured") {
      query.category = category;
    }

    if (category === "Featured") {
      query.featured = true;
    }

    Object.assign(query, buildTextSearch(search, ["title", "summary", "description", "techStack"]));

    const dbProjects = await Project.find(query).sort({ createdAt: -1 });

    let projects = dbProjects;
    if (!projects.length && !search && category === "All") {
      projects = placeholderProjects;
    }

    res.render("public/projects", {
      title: "Projects | TechSphere",
      projects,
      categories: projectCategories,
      selectedCategory: category,
      search,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProjectDetails = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let project = null;

    if (mongoose.Types.ObjectId.isValid(slug)) {
      project = await Project.findById(slug);
    }

    if (!project) {
      project = await Project.findOne({ slug });
    }

    if (!project) {
      project = findPlaceholderBySlug(placeholderProjects, slug);
    }

    if (!project) {
      return res.status(404).render("public/404", { title: "Project Not Found | TechSphere" });
    }

    const relatedProjects = placeholderProjects.filter((item) => item.slug !== project.slug).slice(0, 2);

    res.render("public/project-details", {
      title: `${project.title} | TechSphere Projects`,
      project,
      relatedProjects,
    });
  } catch (err) {
    next(err);
  }
};

exports.getBlog = async (req, res, next) => {
  try {
    const { category = "All", search = "" } = req.query;
    const query = { status: "published" };

    if (category && category !== "All") {
      query.category = category;
    }

    Object.assign(query, buildTextSearch(search, ["title", "excerpt", "content", "tags"]));

    const dbPosts = await Post.find(query).sort({ createdAt: -1 });
    let posts = dbPosts;

    if (!posts.length && !search && category === "All") {
      posts = placeholderPosts;
    }

    res.render("public/blog", {
      title: "Blog | TechSphere",
      posts,
      categories: postCategories,
      selectedCategory: category,
      search,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPostDetails = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let post = null;

    if (mongoose.Types.ObjectId.isValid(slug)) {
      post = await Post.findById(slug).populate("author", "firstname surname email");
    }

    if (!post) {
      post = await Post.findOne({ slug, status: "published" }).populate("author", "firstname surname email");
    }

    if (!post) {
      post = findPlaceholderBySlug(placeholderPosts, slug);
    }

    if (!post) {
      return res.status(404).render("public/404", { title: "Post Not Found | TechSphere" });
    }

    const relatedPosts = placeholderPosts.filter((item) => item.slug !== post.slug).slice(0, 2);

    res.render("public/post-details", {
      title: `${post.title} | TechSphere Blog`,
      post,
      relatedPosts,
    });
  } catch (err) {
    next(err);
  }
};

exports.getContact = (req, res) => {
  res.render("public/contact", {
    title: `Contact | ${req.siteProfile?.siteName || "TechSphere"}`,
  });
};

exports.postContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    await Message.create({ name, email, subject, message });

    req.flash("success", "Your message has been saved. I will respond as soon as possible.");
    res.redirect("/contact");
  } catch (err) {
    console.error(err);
    req.flash("error", "Your message could not be sent. Please try again.");
    res.redirect("/contact");
  }
};

exports.getTerms = (req, res) => {
  res.render("public/terms", {
    title: "Terms | TechSphere",
  });
};

exports.getNews = async (req, res, next) => {
  try {
    const { search = "" } = req.query;

    const newsResult = await getTechNews({
      refresh: false,
      limit: Number(process.env.NEWS_MAX_ITEMS) || 40,
    });

    let newsItems = newsResult.items;

    if (search) {
      const keyword = search.toLowerCase();

      newsItems = newsItems.filter((item) => {
        return (
          String(item.title || "").toLowerCase().includes(keyword) ||
          String(item.description || "").toLowerCase().includes(keyword) ||
          String(item.sourceName || "").toLowerCase().includes(keyword)
        );
      });
    }

    res.render("public/news", {
      title: "Tech News | TechSphere",
      newsItems,
      search,
      newsMeta: newsResult,
    });
  } catch (err) {
    next(err);
  }
};