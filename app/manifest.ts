import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lifestyle Dashboard",
    short_name: "Dashboard",
    description:
      "Mijn persoonlijke dashboard voor routines, voeding, sport, werk en meer.",
    start_url: "/vandaag",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0d12",
    theme_color: "#0b0d12",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Taak toevoegen",
        short_name: "Taak",
        description: "Voeg direct een eigen dagelijkse taak toe",
        url: "/vandaag?actie=taak-toevoegen",
      },
    ],
  };
}
