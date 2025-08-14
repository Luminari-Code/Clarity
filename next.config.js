/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      handlebars: "handlebars/dist/cjs/handlebars.js",
      "handlebars/runtime": "handlebars/dist/cjs/handlebars.runtime.js",
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        child_process: false,
        net: false,
        tls: false,
        module: false,
        vm: false,
        perf_hooks: false,
        "require-in-the-middle": false,
        "@genkit-ai/firebase": false,
        "@opentelemetry/winston-transport": false,
        "@opentelemetry/exporter-jaeger": false,
      };
    }
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        message: /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
      },
    ];

    return config;
  },
};

module.exports = nextConfig;
