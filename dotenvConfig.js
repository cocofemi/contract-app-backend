module.exports = () => {
  const dotenv = require("dotenv");
  const path = require("path");

  const localEnvPath = path.resolve(process.cwd(), ".env.local");
  dotenv.config({ path: localEnvPath })
    ? dotenv.config()
    : dotenv.config({ path: localEnvPath });
};
