require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const connectDB = require("./models/db");
const publicRoutes = require("./routes/publicRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { getSiteProfile, profileToSite } = require("./services/siteProfileService");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "techsphere-dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(flash());

app.use(async (req, res, next) => {
  try {
    const profile = await getSiteProfile();

    req.siteProfile = profile;
    res.locals.profile = profile;
    res.locals.site = profileToSite(profile);

    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.admin = req.session.admin || null;
    res.locals.currentPath = req.path;

    next();
  } catch (err) {
    console.error("Failed to load site profile:", err.message);

    res.locals.profile = null;
    res.locals.site = {
      name: "TechSphere",
      owner: "Faramade Ayeni",
      email: "hello@techsphere.dev",
      github: "#",
      linkedin: "#",
      twitter: "#",
      resume: "#",
    };

    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.admin = req.session.admin || null;
    res.locals.currentPath = req.path;

    next();
  }
});

app.use("/", publicRoutes);
app.use("/admin", authRoutes);
app.use("/admin", adminRoutes);

// Backward-compatible redirects from the old version.
app.get("/login", (req, res) => res.redirect("/admin/login"));
app.get("/register", (req, res) => res.redirect("/admin/login"));
app.get("/create", (req, res) => res.redirect("/admin/posts/new"));
app.get("/edit/:id", (req, res) => res.redirect(`/admin/posts/${req.params.id}/edit`));
app.post("/delete/:id", (req, res) => res.redirect(307, `/admin/posts/${req.params.id}/delete`));

app.use((req, res) => {
  res.status(404).render("public/404", {
    title: "Page Not Found | TechSphere",
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("public/500", {
    title: "Server Error | TechSphere",
  });
});

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ TechSphere server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();
