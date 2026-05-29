const mongoose = require("mongoose");
const slugify = require("../utils/slugify");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    problem: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    caseStudy: {
      type: String,
      trim: true,
    },
    lessons: {
      type: String,
      trim: true,
    },
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    image: {
      type: String,
      trim: true,
    },
    githubUrl: {
      type: String,
      trim: true,
    },
    liveUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Completed", "In Progress", "Planned"],
      default: "In Progress",
    },
    category: {
      type: String,
      default: "Full-Stack",
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

projectSchema.pre("validate", function () {
  const nextSlug = slugify(this.slug || this.title || "");
  this.slug = nextSlug || undefined;
});

module.exports = mongoose.model("Project", projectSchema);
