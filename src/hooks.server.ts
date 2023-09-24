import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const theme = event.cookies.get("theme");
  const themes = ["cupcake", "business"];

  if (!theme || !themes.includes(theme)) {
    return await resolve(event, {
      transformPageChunk: ({ html }) => {
        return html.replace('data-theme=""', `data-theme="cupcake"`);
      },
    });
  }

  return await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('data-theme=""', `data-theme="${theme}"`);
    },
  });
};
