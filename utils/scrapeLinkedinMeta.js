const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeLinkedinMeta(linkedinUrl) {
  try {
    const res = await axios.get(linkedinUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
    });

    const $ = cheerio.load(res.data);

    const title = $('meta[property="og:title"]').attr("content") || "";
    const description =
      $('meta[property="og:description"]').attr("content") || "";
    console.log(title, description);
    return {
      title,
      description,
    };
  } catch (err) {
    console.error("LinkedIn scrape failed:", err.message);
    return null;
  }
}

module.exports = { scrapeLinkedinMeta };
