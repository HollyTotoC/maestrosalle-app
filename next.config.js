module.exports = {
  async headers() {
    if (process.env.NODE_ENV === "production") {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "Cross-Origin-Opener-Policy",
              value: "same-origin",
            },
            {
              key: "Cross-Origin-Embedder-Policy",
              value: "require-corp",
            },
          ],
        },
      ];
    }
    return [];
  },
};