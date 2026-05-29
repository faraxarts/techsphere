require("dotenv").config();
const bcrypt = require("bcrypt");
const connectDB = require("../models/db");
const User = require("../models/User");

async function createAdmin() {
  const firstname = process.env.ADMIN_FIRSTNAME || "Faramade";
  const surname = process.env.ADMIN_SURNAME || "Ayeni";
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  await connectDB();

  const existingAdmin = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingAdmin) {
    console.log("Admin already exists:", existingAdmin.email);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    firstname,
    surname,
    email,
    password: hashedPassword,
    role: "admin",
  });

  console.log("✅ Admin account created:", email);
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error("❌ Failed to create admin:", err.message);
  process.exit(1);
});
