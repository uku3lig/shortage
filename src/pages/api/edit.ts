import type { APIRoute } from "astro";

import { destr } from "destr";
import { z } from "zod";

const EditSchema = z.object({
  target: z.string().optional(),
  name: z.string(),
  expiration: z.string().datetime().optional(),
  max_uses: z.number().int().positive().safe().optional(),
});

export const PATCH: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.text();
  const result = EditSchema.safeParse(destr(body));

  if (!result.success) {
    return new Response(JSON.stringify(result.error.flatten()), {
      status: 400,
    });
  }

  const db = locals.runtime.env.SHORTAGE_AUTH;
  const { name, ...data } = result.data;

  const shortened = await db
    .prepare("SELECT * FROM urls WHERE short = ?")
    .bind(name)
    .first<ShortenedUrl>();

  if (!shortened || shortened.owner != user.githubId) {
    return new Response("Not found", { status: 404 });
  }

  const updated = { ...shortened, ...data };
  await db
    .prepare(
      "UPDATE urls SET target = ?, expiration = ?, max_uses = ? WHERE short = ?",
    )
    .bind(updated.target, updated.expiration, updated.max_uses, name)
    .run();

  return new Response(null, { status: 204 });
};
