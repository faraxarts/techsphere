function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    req.flash("error", "Please log in to access the admin area.");
    return res.redirect("/admin/login");
  }

  next();
}

function redirectIfAdmin(req, res, next) {
  if (req.session.admin) {
    return res.redirect("/admin/dashboard");
  }

  next();
}

module.exports = {
  requireAdmin,
  redirectIfAdmin,
};
