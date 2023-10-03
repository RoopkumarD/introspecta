import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const theme = event.cookies.get("theme");
  const themes = ["cupcake", "business"];

  if (!theme || !themes.includes(theme)) {
    const response = await resolve(event, {
      transformPageChunk: ({ html }) => {
        return html.replace('data-theme=""', `data-theme="cupcake"`);
      },
    });
    response.headers.set("x-frame-options", "DENY");
    return response;
  }

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('data-theme=""', `data-theme="${theme}"`);
    },
  });
  response.headers.set("x-frame-options", "DENY");
  return response;
};
