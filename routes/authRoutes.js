const express = require("express");
const authController = require("../controllers/authController");
const { redirectIfAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/login", redirectIfAdmin, authController.getLogin);
router.post("/login", redirectIfAdmin, authController.postLogin);
router.get("/logout", authController.logout);

module.exports = router;
