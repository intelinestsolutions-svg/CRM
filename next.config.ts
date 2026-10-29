import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Baileys (and its crypto/websocket stack) must run as native Node modules.
  // Bundling it with webpack breaks the noise handshake, so the socket closes
  // before a QR code is ever emitted.
  serverExternalPackages: ['@whiskeysockets/baileys', 'pino', 'qrcode'],
};

export default nextConfig;
