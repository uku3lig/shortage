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
  const body = await request.text();
  const result = EditSchema.safeParse(destr(body));

  if (!result.success) {
    return new Response(JSON.stringify(result.error.flatten()), {
      status: 400,
    });
  }

  const kv = locals.runtime.env.SHORTAGE_NAMESPACE;
  const { name, ...data } = result.data;

  const shortened = await kv.get(name);
  if (!shortened) {
    return new Response("Not found", { status: 404 });
  }

  const parsed: ShortenedUrl = destr(shortened);
  const updated = { ...parsed, ...data };
  await kv.put(name, JSON.stringify(updated));

  return new Response(null, { status: 204 });
};