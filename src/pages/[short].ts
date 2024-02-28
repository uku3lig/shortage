import type { APIRoute } from "astro";
import { destr } from "destr";

export const ALL: APIRoute = async ({ params, locals, redirect }) => {
  const kv = locals.runtime.env.SHORTAGE_NAMESPACE;
  const value = await kv.get(params.short || "");
  const target: ShortenedUrl = destr(value);

  if (target) {
    return redirect(target.target);
  } else {
    return new Response("Not found", { status: 404 });
  }
};
