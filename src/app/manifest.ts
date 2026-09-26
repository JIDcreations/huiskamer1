import type { MetadataRoute } from "next";

// PWA-basis voor de cliënt: op het beginscherm zetten opent meteen Vandaag, zonder browserbalk.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Huiskamer",
    short_name: "Huiskamer",
    description: "Een rustige plek voor jou en je psycholoog.",
    lang: "nl-BE",
    start_url: "/c/vandaag",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FBF7F4",
    theme_color: "#FBF7F4",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
