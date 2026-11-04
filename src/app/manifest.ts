import type { MetadataRoute } from "next";

/**
 * Makes Spexify installable on phones, so it opens like an app and plays from the lock screen.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spexify",
    short_name: "Spexify",
    description: "Spexens musik",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1447e6",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
