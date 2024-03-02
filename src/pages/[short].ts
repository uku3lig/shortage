import type { APIRoute } from "astro";

export const ALL: APIRoute = async ({ params, locals, redirect }) => {
  const db = locals.runtime.env.SHORTAGE_AUTH;
  const value = await db
    .prepare("SELECT * FROM urls WHERE short = ?")
    .bind(params.short)
    .first<ShortenedUrl>();

  if (value && value.uses < (value.max_uses || +Infinity)) {
    await db
      .prepare("UPDATE urls SET uses = uses + 1 WHERE short = ?")
      .bind(params.short)
      .run();

    return redirect(value.target);
  } else {
    return new Response("Not found", { status: 404 });
  }
};
