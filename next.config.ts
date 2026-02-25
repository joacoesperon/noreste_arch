import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    // Solo aplicamos el "bloqueo" en Producción (Vercel)
    // En localhost (development), las rutas funcionarán normal.
    if (process.env.NODE_ENV === "development") {
      return [];
    }

    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/info",
        },
        {
          source: "/indice",
          destination: "/info",
        },
      ],
    };
  },
};

export default nextConfig;
