const mongoose = require("mongoose");

const newsItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    sourceName: {
      type: String,
      trim: true,
    },
    author: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    originalUrl: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    publishedAt: {
      type: Date,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
    isImported: {
      type: Boolean,
      default: false,
    },
    importedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

newsItemSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 3 });
newsItemSchema.index({ publishedAt: -1 });

module.exports = mongoose.model("NewsItem", newsItemSchema);