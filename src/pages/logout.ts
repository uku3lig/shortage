import { initializeLucia } from "../auth";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
  if (!context.locals.session) {
    return new Response(null, {
      status: 401,
    });
  }

  const lucia = initializeLucia(context.locals.runtime.env.SHORTAGE_AUTH);

  await lucia.invalidateSession(context.locals.session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  context.cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return context.redirect("/");
};
