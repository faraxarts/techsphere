const express = require("express");
const adminController = require("../controllers/adminController");
const { requireAdmin } = require("../middleware/authMiddleware");
const { uploadSingleImage } = require("../middleware/imageUpload");
const router = express.Router();
const { uploadSiteAssets } = require("../middleware/siteAssetsUpload");

router.use(requireAdmin);


router.get("/dashboard", adminController.getDashboard);

router.get("/settings", adminController.getSettings);
router.post("/settings", uploadSiteAssets, adminController.updateSettings);

router.get("/posts", adminController.getPosts);
router.get("/posts/new", adminController.getCreatePost);
router.post("/posts", uploadSingleImage("imageFile"), adminController.createPost);
router.post("/posts/:id", uploadSingleImage("imageFile"), adminController.updatePost);
router.get("/posts/:id/edit", adminController.getEditPost);

router.post("/posts/:id/delete", adminController.deletePost);

router.get("/projects", adminController.getProjects);
router.get("/projects/new", adminController.getCreateProject);
router.get("/projects/:id/edit", adminController.getEditProject);
router.post("/projects", uploadSingleImage("imageFile"), adminController.createProject);
router.post("/projects/:id", uploadSingleImage("imageFile"), adminController.updateProject);
router.post("/projects/:id/delete", adminController.deleteProject);

router.get("/news", adminController.getNews);
router.post("/news/refresh", adminController.refreshNews);
router.post("/news/:id/import", adminController.importNewsAsDraft);
router.post("/news/:id/delete", adminController.deleteNewsItem);

router.get("/messages", adminController.getMessages);
router.post("/messages/:id/read", adminController.markMessageRead);
router.post("/messages/:id/delete", adminController.deleteMessage);

module.exports = router;
