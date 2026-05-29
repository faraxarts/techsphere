const multer = require("multer");
const path = require("path");
const fs = require("fs");

const profileDir = path.join(__dirname, "../public/uploads/profiles");
const resumeDir = path.join(__dirname, "../public/uploads/resumes");

[profileDir, resumeDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const allowedResumeTypes = ["application/pdf"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "profileImageFile") {
      return cb(null, profileDir);
    }

    if (file.fieldname === "resumeFile") {
      return cb(null, resumeDir);
    }

    cb(null, profileDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase();

    const safeName = `${Date.now()}-${baseName}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "profileImageFile") {
      if (!allowedImageTypes.includes(file.mimetype)) {
        return cb(new Error("Profile image must be JPG, PNG, or WEBP."));
      }
    }

    if (file.fieldname === "resumeFile") {
      if (!allowedResumeTypes.includes(file.mimetype)) {
        return cb(new Error("Resume must be a PDF file."));
      }
    }

    cb(null, true);
  },
});

function uploadSiteAssets(req, res, next) {
  const handler = upload.fields([
    { name: "profileImageFile", maxCount: 1 },
    { name: "resumeFile", maxCount: 1 },
  ]);

  handler(req, res, (err) => {
    if (!err) {
      if (req.files?.profileImageFile?.[0]) {
        req.body.profileImage = `/uploads/profiles/${req.files.profileImageFile[0].filename}`;
      }

      if (req.files?.resumeFile?.[0]) {
        req.body.resume = `/uploads/resumes/${req.files.resumeFile[0].filename}`;
      }

      return next();
    }

    req.flash("error", err.message || "File upload failed.");
    return res.redirect("/admin/settings");
  });
}

module.exports = {
  uploadSiteAssets,
};