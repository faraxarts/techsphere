const mongoose = require("mongoose");

const siteProfileSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "main",
      unique: true,
    },

    siteName: {
      type: String,
      default: "TechSphere",
      trim: true,
    },

    ownerName: {
      type: String,
      default: "Faramade Ayeni",
      trim: true,
    },

    initials: {
      type: String,
      default: "FA",
      trim: true,
    },

    profileImage: {
     type: String,
     default: "",
     trim: true,
    },

    professionalTitle: {
      type: String,
      default: "Web Developer • Tech Writer",
      trim: true,
    },

    availabilityStatus: {
      type: String,
      default: "Open to opportunities",
      trim: true,
    },

    location: {
      type: String,
      default: "Remote",
      trim: true,
    },

    email: {
      type: String,
      default: "hello@techsphere.dev",
      trim: true,
    },

    heroEyebrow: {
      type: String,
      default: "Portfolio & Tech Blog",
      trim: true,
    },

    heroHeadline: {
      type: String,
      default: "Building web experiences through code, creativity, and continuous learning.",
      trim: true,
    },

    heroDescription: {
      type: String,
      default:
        "Welcome to TechSphere, my personal portfolio and blog where I showcase projects, share what I’m learning, and publish practical articles about web development and technology.",
      trim: true,
    },

    aboutIntro: {
      type: String,
      default:
        "I am a developer focused on turning ideas into useful web applications. TechSphere is where I bring together my projects, technical notes, lessons learned, and growth as a developer.",
      trim: true,
    },

    bio: {
      type: String,
      default:
        "This page currently uses placeholder personal content. Later, it can be replaced with my real bio, background, experience, and resume details.",
      trim: true,
    },

    currentFocusTitle: {
      type: String,
      default: "Full-stack fundamentals and portfolio growth",
      trim: true,
    },

    currentFocus: {
      type: String,
      default:
        "Right now, the focus is building strong fundamentals with JavaScript, Node.js, Express, MongoDB, EJS, Tailwind CSS, authentication, clean UI, and real project documentation.",
      trim: true,
    },

    mission: {
      type: String,
      default: "Build, learn, share",
      trim: true,
    },

    skills: {
      type: [String],
      default: [
        "HTML",
        "CSS",
        "JavaScript",
        "Node.js",
        "Express.js",
        "MongoDB",
        "EJS",
        "Tailwind CSS",
        "Git/GitHub",
        "UI/UX Thinking",
      ],
    },

    socialLinks: {
      github: {
        type: String,
        default: "#",
        trim: true,
      },
      linkedin: {
        type: String,
        default: "#",
        trim: true,
      },
      twitter: {
        type: String,
        default: "#",
        trim: true,
      },
      portfolio: {
        type: String,
        default: "#",
        trim: true,
      },
      resume: {
        type: String,
        default: "#",
        trim: true,
      },
    },

    stats: {
      yearsLearning: {
        type: String,
        default: "3+",
        trim: true,
      },
    },

    seoTitle: {
      type: String,
      default: "TechSphere | Portfolio & Tech Blog",
      trim: true,
    },

    seoDescription: {
      type: String,
      default:
        "TechSphere is a personal portfolio and technology blog showcasing projects, developer growth, and practical web development articles.",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteProfile", siteProfileSchema);