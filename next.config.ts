import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rustige demo: geen Next-indicator in de hoek.
  devIndicators: false,
  // Oude cliëntroutes van voor de herwerking blijven werken.
  async redirects() {
    return [
      { source: "/c/home", destination: "/c/vandaag", permanent: false },
      { source: "/c/afspraken", destination: "/c/sessies", permanent: false },
      { source: "/c/tafel", destination: "/c/sessies", permanent: false },
      { source: "/c/tafel/:path*", destination: "/c/sessies", permanent: false },
      { source: "/p/clienten/:id/tafel", destination: "/p/clienten/:id?tab=sessies", permanent: false },
      { source: "/p/clienten/:id/tafel/:path*", destination: "/p/clienten/:id?tab=sessies", permanent: false },
    ];
  },
};

export default nextConfig;
