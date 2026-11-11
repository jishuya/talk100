const PRODUCTION_FRONTEND_URL = 'https://talk100.work';

// Keep the published app available even when a local frontend is configured.
const getAllowedFrontendOrigins = (env = process.env) => {
  const origins = new Set([PRODUCTION_FRONTEND_URL]);
  if (env.FRONTEND_URL) origins.add(env.FRONTEND_URL);
  if (env.NODE_ENV !== 'production') origins.add('http://localhost:5173');
  return [...origins];
};

module.exports = { getAllowedFrontendOrigins };
