import type { APIRoute } from "astro";

import { generateState } from "arctic";
import { github } from "../../auth";

export const GET: APIRoute = async (context) => {
  const state = generateState();
  const url = await github.createAuthorizationURL(state);

  context.cookies.set("github_oauth_state", state, {
    path: "/",
    secure: import.meta.env.PROD,
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return context.redirect(url.toString());
};
