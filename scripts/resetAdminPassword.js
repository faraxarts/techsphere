require("dotenv").config();
const bcrypt = require("bcrypt");
const connectDB = require("../models/db");
const User = require("../models/User");

async function resetAdminPassword() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  await connectDB();

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    {
      firstname: process.env.ADMIN_FIRSTNAME || "Faramade",
      surname: process.env.ADMIN_SURNAME || "Ayeni",
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
    },
    {
      new: true,
      upsert: true,
    }
  );

  console.log("✅ Admin password reset successfully for:", admin.email);
  process.exit(0);
}

resetAdminPassword().catch((err) => {
  console.error("❌ Failed to reset admin password:", err.message);
  process.exit(1);
});