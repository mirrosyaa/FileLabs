// Helper function to detect platform
function detectPlatform(url) {
  const urlLower = url.toLowerCase();

  // YouTube detection
  if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be"))
    return "youtube";
  if (urlLower.includes("tiktok.com")) return "tiktok";
  if (urlLower.includes("instagram.com")) return "instagram";
  if (
    urlLower.includes("facebook.com") ||
    urlLower.includes("fb.watch") ||
    urlLower.includes("fb.com")
  )
    return "facebook";
  if (urlLower.includes("twitter.com") || urlLower.includes("x.com"))
    return "twitter";

  return "direct";
}

// Helper function to format duration
function formatDuration(seconds) {
  if (!seconds) return "Unknown";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

module.exports = {
  detectPlatform,
  formatDuration,
};
