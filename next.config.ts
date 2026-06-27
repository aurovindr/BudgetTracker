import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server's internal /_next/* assets and HMR to be requested
  // from other devices on the LAN (e.g. a phone opening http://<MAC_IP>:3000).
  // Without this, Next.js 16 blocks cross-origin dev requests, so the client
  // JS never loads and forms don't hydrate. Update the IP if your LAN IP changes.
  allowedDevOrigins: ["192.168.1.5"],
};

export default nextConfig;
