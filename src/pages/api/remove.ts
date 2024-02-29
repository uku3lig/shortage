import type { APIRoute } from "astro";

import { destr } from "destr";
import { z } from "zod";

const DeleteSchema = z.object({
  name: z.string(),
});

export const DELETE: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.text();
  const result = DeleteSchema.safeParse(destr(body));

  if (!result.success) {
    return new Response(JSON.stringify(result.error.flatten()), {
      status: 400,
    });
  }

  const kv = locals.runtime.env.SHORTAGE_NAMESPACE;

  const shortened = await kv.get(result.data.name);
  const parsed: ShortenedUrl = destr(shortened);

  if (!parsed || parsed.owner != user.githubId) {
    return new Response("Not found", { status: 404 });
  }

  await kv.delete(result.data.name);

  return new Response(null, { status: 204 });
};
