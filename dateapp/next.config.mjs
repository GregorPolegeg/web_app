import withPWAInit from "@ducanh2912/next-pwa";

await import("./src/env.mjs");


const withPWA = withPWAInit({
  dest: "public",
  workboxOptions: {
    mode: 'production',
  },
});

/** @type {import("next").NextConfig} */

const config = {
  reactStrictMode: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

export default withPWA(config);
