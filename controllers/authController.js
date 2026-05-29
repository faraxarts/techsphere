const bcrypt = require("bcrypt");
const User = require("../models/User");

exports.getLogin = (req, res) => {
  res.render("admin/login", {
    title: "Admin Login | TechSphere",
  });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await User.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      req.flash("error", "Invalid admin credentials.");
      return res.redirect("/admin/login");
    }

    const passwordMatches = await bcrypt.compare(password, admin.password);

    if (!passwordMatches) {
      req.flash("error", "Invalid admin credentials.");
      return res.redirect("/admin/login");
    }

    req.session.admin = {
      _id: admin._id,
      firstname: admin.firstname,
      surname: admin.surname,
      email: admin.email,
      role: admin.role || "admin",
    };

    req.flash("success", `Welcome back, ${admin.firstname}.`);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error", "Login failed. Please try again.");
    res.redirect("/admin/login");
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect("/admin/dashboard");
    }

    res.clearCookie("connect.sid");
    res.redirect("/");
  });
};
