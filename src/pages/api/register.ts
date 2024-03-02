import type { APIRoute } from "astro";

import { destr } from "destr";
import { nanoid } from "nanoid";
import { z } from "zod";

const RegisterSchema = z.object({
  target: z.string(),
  name: z.string().optional(),
  expiration: z.string().datetime().optional(),
  max_uses: z.coerce.number().int().positive().safe().optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.text();
  const result = RegisterSchema.safeParse(destr(body));

  if (!result.success) {
    return new Response(JSON.stringify(result.error.flatten()), {
      status: 400,
    });
  }

  const db = locals.runtime.env.SHORTAGE_AUTH;
  const { name, ...data } = result.data;
  const short = name || nanoid(8);

  const existing = await db
    .prepare("SELECT * FROM urls WHERE short = ?")
    .bind(short)
    .first<ShortenedUrl>();

  if (existing) {
    return new Response("Name already taken", { status: 409 });
  }

  const shortened = { ...data, uses: 0, owner: user.githubId };
  await db
    .prepare(
      "INSERT INTO urls (short, target, expiration, max_uses, uses, owner) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(
      short,
      shortened.target,
      shortened.expiration ? shortened.expiration : null,
      shortened.max_uses ? shortened.max_uses : null,
      shortened.uses,
      shortened.owner,
    )
    .run();

  return new Response(short);
};
