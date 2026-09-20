import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Zodat de dev server ook op mijn telefoon werkt als ik hem via het
  // lokale netwerk-IP open (nodig voor hot reload en interactiviteit).
  allowedDevOrigins: ["192.168.178.109"],
};

export default nextConfig;
