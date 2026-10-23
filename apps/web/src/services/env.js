import { API_MODES } from "../utils/constants";

let rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD || (typeof window !== "undefined" && window.location.hostname.endsWith("vercel.app"))
    ? "/api/v1"
    : "http://localhost:5000/api/v1");

rawBaseUrl = rawBaseUrl.replace(/\/+$/, "");
if (rawBaseUrl.endsWith("/api")) {
  rawBaseUrl = `${rawBaseUrl}/v1`;
}

export const env = {
  apiBaseUrl: rawBaseUrl,
  apiMode:
    import.meta.env.VITE_API_MODE ||
    (import.meta.env.MODE === "test" ? API_MODES.MOCK : API_MODES.HYBRID),
  enableThreeHero: String(import.meta.env.VITE_ENABLE_THREE_HERO ?? "true") === "true"
};
