export const isBotCheck = (userAgent: string) => {
  const ua = userAgent.toLowerCase();
  if (
    ua.includes("google") ||
    ua.includes("vercel") ||
    ua.includes("bot") ||
    ua.includes("crawl") ||
    ua.includes("spider") ||
    ua.includes("slurp") ||
    ua.includes("facebook") ||
    ua.includes("twitter") ||
    ua.includes("cloudflare")
  ) {
    return true;
  }
  return false;
};
