const mongoose = require("mongoose");
const slugify = require("../utils/slugify");
const calculateReadingTime = require("../utils/readingTime");

const postSchema = new mongoose.Schema(
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
    excerpt: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "Learning Journey",
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    image: {
      type: String,
      trim: true,
    },
    featuredImage: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    readingTime: {
      type: Number,
      default: 1,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

postSchema.pre("validate", function () {
  const nextSlug = slugify(this.slug || this.title || "");
  this.slug = nextSlug || undefined;

  if (!this.excerpt && this.content) {
    this.excerpt = this.content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 220);
  }

  this.readingTime = calculateReadingTime(this.content);
});

module.exports = mongoose.model("Post", postSchema);
