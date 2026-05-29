const SiteProfile = require("../models/SiteProfile");

function splitList(value = "") {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function getSiteProfile() {
  let profile = await SiteProfile.findOne({ key: "main" });

  if (!profile) {
    profile = await SiteProfile.create({ key: "main" });
  }

  return profile;
}

async function updateSiteProfile(body) {
  const update = {
    siteName: body.siteName || "TechSphere",
    ownerName: body.ownerName || "Faramade Ayeni",
    initials: body.initials || "FA",
    profileImage: body.profileImage || "",
    professionalTitle: body.professionalTitle || "Web Developer • Tech Writer",
    availabilityStatus: body.availabilityStatus || "Open to opportunities",
    location: body.location || "Remote",
    email: body.email || "hello@techsphere.dev",
    
    heroEyebrow: body.heroEyebrow || "Portfolio & Tech Blog",
    heroHeadline: body.heroHeadline || "",
    heroDescription: body.heroDescription || "",

    aboutIntro: body.aboutIntro || "",
    bio: body.bio || "",
    currentFocusTitle: body.currentFocusTitle || "",
    currentFocus: body.currentFocus || "",
    mission: body.mission || "Build, learn, share",

    skills: splitList(body.skills),

    socialLinks: {
      github: body.github || "#",
      linkedin: body.linkedin || "#",
      twitter: body.twitter || "#",
      portfolio: body.portfolio || "#",
      resume: body.resume || "#",
    },

    stats: {
      yearsLearning: body.yearsLearning || "3+",
    },

    seoTitle: body.seoTitle || "TechSphere | Portfolio & Tech Blog",
    seoDescription: body.seoDescription || "",
  };

  return SiteProfile.findOneAndUpdate(
    { key: "main" },
    { $set: update },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );
}

function profileToSite(profile) {
  return {
    name: profile.siteName || "TechSphere",
    owner: profile.ownerName || "Faramade Ayeni",
    email: profile.email || "hello@techsphere.dev",
    github: profile.socialLinks?.github || "#",
    linkedin: profile.socialLinks?.linkedin || "#",
    twitter: profile.socialLinks?.twitter || "#",
    resume: profile.socialLinks?.resume || "#",
    profileImage: profile.profileImage || "",
  };
}

module.exports = {
  getSiteProfile,
  updateSiteProfile,
  profileToSite,
};