import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Quase toda página depende da sessão ou da agenda ao vivo: modelo dinâmico clássico.
  cacheComponents: false,
  // PGlite (banco local de dev) carrega .wasm/.data do próprio pacote em runtime.
  serverExternalPackages: ["@electric-sql/pglite"],
  experimental: {
    // fotos são reduzidas no navegador antes do envio; folga para o limite de 4,5 MB da Vercel
    serverActions: { bodySizeLimit: "4mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
