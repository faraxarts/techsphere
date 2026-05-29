const express = require("express");
const publicController = require("../controllers/publicController");

const router = express.Router();

router.get("/", publicController.getHome);
router.get("/about", publicController.getAbout);
router.get("/projects", publicController.getProjects);
router.get("/projects/:slug", publicController.getProjectDetails);
router.get("/blog", publicController.getBlog);
router.get("/blog/:slug", publicController.getPostDetails);
router.get("/contact", publicController.getContact);
router.post("/contact", publicController.postContact);
router.get("/terms", publicController.getTerms);
router.get("/news", publicController.getNews);

module.exports = router;
