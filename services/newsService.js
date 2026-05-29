const NewsItem = require("../models/NewsItem");

function getCacheAgeMs() {
  const hours = Number(process.env.NEWS_CACHE_HOURS) || 6;
  return hours * 60 * 60 * 1000;
}

function getMaxItems() {
  return Number(process.env.NEWS_MAX_ITEMS) || 40;
}

function cleanText(value = "") {
  return String(value || "").trim();
}

async function fetchFreshTechNews(limit = getMaxItems()) {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    throw new Error("NEWS_API_KEY is missing in .env");
  }

  const country = process.env.NEWS_COUNTRY || "us";

  const url = new URL("https://newsapi.org/v2/top-headlines");
  url.searchParams.set("category", "technology");
  url.searchParams.set("country", country);
  url.searchParams.set("pageSize", String(limit));
  url.searchParams.set("apiKey", apiKey);

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok || data.status !== "ok") {
    throw new Error(data.message || "Failed to fetch tech news");
  }

  const articles = Array.isArray(data.articles) ? data.articles : [];

  const savedItems = [];

  for (const article of articles) {
    const title = cleanText(article.title);
    const originalUrl = cleanText(article.url);

    if (!title || !originalUrl || title.toLowerCase() === "[removed]") {
      continue;
    }

    const item = await NewsItem.findOneAndUpdate(
      { originalUrl },
      {
        $set: {
          title,
          description: cleanText(article.description),
          sourceName: cleanText(article.source && article.source.name),
          author: cleanText(article.author),
          imageUrl: cleanText(article.urlToImage),
          originalUrl,
          publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
          fetchedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    savedItems.push(item);
  }

  return NewsItem.find()
    .sort({ publishedAt: -1, fetchedAt: -1 })
    .limit(limit);
}

async function getTechNews(options = {}) {
  const refresh = options.refresh || false;
  const limit = options.limit || getMaxItems();

  if (!refresh) {
    const latestCachedItem = await NewsItem.findOne().sort({ fetchedAt: -1 });
    const cacheStillFresh =
      latestCachedItem && Date.now() - new Date(latestCachedItem.fetchedAt).getTime() < getCacheAgeMs();

    if (cacheStillFresh) {
      const cachedItems = await NewsItem.find()
        .sort({ publishedAt: -1, fetchedAt: -1 })
        .limit(limit);

      return {
        items: cachedItems,
        fetchedFresh: false,
        error: null,
      };
    }
  }

  try {
    const freshItems = await fetchFreshTechNews(limit);

    return {
      items: freshItems,
      fetchedFresh: true,
      error: null,
    };
  } catch (error) {
    const cachedItems = await NewsItem.find()
      .sort({ publishedAt: -1, fetchedAt: -1 })
      .limit(limit);

    return {
      items: cachedItems,
      fetchedFresh: false,
      error: error.message,
    };
  }
}

module.exports = {
  getTechNews,
  fetchFreshTechNews,
};