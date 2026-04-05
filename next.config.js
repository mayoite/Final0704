const resolvedSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  process.env.URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
const configuredAssetBaseUrl =
  process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
  process.env.ASSET_BASE_URL ||
  "";
const parsedAssetBaseUrl = (() => {
  try {
    return configuredAssetBaseUrl ? new URL(configuredAssetBaseUrl) : null;
  } catch {
    return null;
  }
})();
const isHostedVercelRuntime =
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.VERCEL_URL) ||
  Boolean(process.env.VERCEL_ENV);
const useUnoptimizedImages =
  process.env.NEXT_IMAGE_UNOPTIMIZED === "1" ||
  process.env.NEXT_IMAGE_UNOPTIMIZED === "true" ||
  isHostedVercelRuntime;
const firstPartyAssetHost = process.env.NEXT_PUBLIC_ASSET_HOSTNAME?.trim();

const imageRemotePatterns = [
  {
    protocol: "https",
    hostname: "*.supabase.co",
    pathname: "/storage/v1/object/public/**",
  },
];

if (firstPartyAssetHost) {
  imageRemotePatterns.push({
    protocol: "https",
    hostname: firstPartyAssetHost,
    pathname: "/**",
  });
}

if (parsedAssetBaseUrl) {
  const normalizedBasePath = parsedAssetBaseUrl.pathname.replace(/\/+$/, "");
  imageRemotePatterns.push({
    protocol: parsedAssetBaseUrl.protocol.replace(":", ""),
    hostname: parsedAssetBaseUrl.hostname,
    pathname: `${normalizedBasePath || ""}/**`,
  });
}

const securityHeaders = [
  // Remove server fingerprint
  { key: "X-Powered-By", value: "" },
  // Clickjack protection
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // XSS protection
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HSTS — force HTTPS for 2 years (standard for enterprise)
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
  // Lock down browser feature access
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // Content Security Policy (CSP)
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.cloudflare.com *.cloudflareinsights.com *.google.com *.gstatic.com scripts.tldraw.com",
      "style-src 'self' 'unsafe-inline' *.google.com *.gstatic.com",
      "img-src 'self' data: blob: *.supabase.co https: http:",
      "font-src 'self' data: *.gstatic.com",
      "connect-src 'self' *.supabase.co *.cloudflare.com *.cloudflareinsights.com *.google.com *.gstatic.com wss://*.supabase.co",
      "media-src 'self' data: blob: https: http:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  env: {
    NEXT_PUBLIC_SITE_URL: resolvedSiteUrl,
    NEXT_PUBLIC_ASSET_BASE_URL:
      process.env.NEXT_PUBLIC_ASSET_BASE_URL || process.env.ASSET_BASE_URL || "",
  },
  trailingSlash: true,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/(images|fonts|icons|3d-assets)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/products/oando-chairs",
        destination: "/products/seating",
        permanent: true,
      },
      {
        source: "/products/oando-chairs/:slug",
        destination: "/products/seating/:slug",
        permanent: true,
      },
      {
        source: "/products/oando-other-seating",
        destination: "/products/seating",
        permanent: true,
      },
      {
        source: "/products/oando-other-seating/:slug",
        destination: "/products/seating/:slug",
        permanent: true,
      },
      {
        source: "/products/oando-seating",
        destination: "/products/seating",
        permanent: true,
      },
      {
        source: "/products/oando-workstations",
        destination: "/products/workstations",
        permanent: true,
      },
      {
        source: "/products/oando-tables",
        destination: "/products/tables",
        permanent: true,
      },
      {
        source: "/products/oando-storage",
        destination: "/products/storages",
        permanent: true,
      },
      {
        source: "/products/oando-soft-seating",
        destination: "/products/soft-seating",
        permanent: true,
      },
      {
        source: "/products/oando-collaborative",
        destination: "/products/soft-seating",
        permanent: true,
      },
      {
        source: "/products/oando-educational",
        destination: "/products/education",
        permanent: true,
      },
      {
        source: "/products/chairs-mesh",
        destination: "/products/seating",
        permanent: true,
      },
      {
        source: "/products/chairs-others",
        destination: "/products/seating",
        permanent: true,
      },
      {
        source: "/products/cafe-seating",
        destination: "/products/seating",
        permanent: true,
      },
      {
        source: "/products/desks-cabin-tables",
        destination: "/products/tables",
        permanent: true,
      },
      {
        source: "/products/meeting-conference-tables",
        destination: "/products/tables",
        permanent: true,
      },
      {
        source: "/products/others-1",
        destination: "/products/soft-seating",
        permanent: true,
      },
      {
        source: "/products/others-2",
        destination: "/products/seating",
        permanent: true,
      },
      // Legacy planner-related redirects
      {
        source: "/configurator",
        destination: "/planner",
        permanent: true,
      },
      {
        source: "/smartdraw",
        destination: "/planner",
        permanent: true,
      },
      {
        source: "/workstations/configurator",
        destination: "/planner",
        permanent: true,
      },
      {
        source: "/lab",
        destination: "/planner",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/@vite/client", destination: "/api/vite-client" },
      { source: "/@vite/client/", destination: "/api/vite-client" },
    ];
  },
  images: {
    qualities: [75, 95, 100],
    unoptimized: useUnoptimizedImages,
    remotePatterns: imageRemotePatterns,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

module.exports = nextConfig;
