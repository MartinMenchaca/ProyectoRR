const allowedExactOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

const localNetworkOriginPattern =
  /^http:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}):5173$/;

export function isAllowedOrigin(origin) {
  if (!origin) return true;
  return allowedExactOrigins.has(origin) || localNetworkOriginPattern.test(origin);
}

export const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origen no permitido por CORS: ${origin}`));
  }
};
