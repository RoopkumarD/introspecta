// import adapter from "@sveltejs/adapter-auto";
import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/kit/vite";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    csp: {
      directives: {
        "default-src": ["self"],
        "script-src": [
          "self",
          "fonts.googleapis.com",
          "https://accounts.google.com/gsi/client",
          "wasm-unsafe-eval",
          "https://apis.google.com",
        ],
        "font-src": ["self", "fonts.gstatic.com"],
        "style-src": ["self", "fonts.googleapis.com"],
        // connect-src to do xmlHttprequest
        "connect-src": [
          "self",
          "https://accounts.google.com/gsi/",
          "https://www.googleapis.com/upload/drive/v3/",
          "https://www.googleapis.com/drive/v3/files/",
        ],
        "frame-src": [
          "self",
          "https://content.googleapis.com/",
          "https://accounts.google.com/gsi/",
        ],
      },
    },
  },
};

export default config;
