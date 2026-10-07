import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "L'appli des parents",
    short_name: "Parents",
    description: "L'assistant qui retire la charge mentale des parents.",
    start_url: "/famille",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    lang: "fr",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
