import type { APIRoute } from "astro";
import { destr } from "destr";

export const ALL: APIRoute = async ({ params, locals, redirect }) => {
  const db = locals.runtime.env.SHORTAGE_AUTH;
  const value = await db
    .prepare("SELECT * FROM urls WHERE short = ?")
    .bind(params.short)
    .first<ShortenedUrl>();

  if (value) {
    return redirect(value.target);
  } else {
    return new Response("Not found", { status: 404 });
  }
};
