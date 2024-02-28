import type { APIRoute } from "astro";
import { destr } from "destr";
import { nanoid } from "nanoid";
import { z } from "zod";

const RegisterSchema = z.object({
  target: z.string(),
  name: z.string().optional(),
  expiration: z.string().datetime().optional(),
  max_uses: z.number().int().positive().safe().optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const body = await request.text();
  const result = RegisterSchema.safeParse(destr(body));

  if (!result.success) {
    return new Response(JSON.stringify(result.error.flatten()), {
      status: 400,
    });
  }

  const kv = locals.runtime.env.SHORTAGE_NAMESPACE;
  const { name, ...data } = result.data;
  const short = name || nanoid(8);

  if (await kv.get(short)) {
    return new Response("Name already taken", { status: 409 });
  }

  const shortened = { ...data, uses: 0, owner: 0 };
  await kv.put(short, JSON.stringify(shortened));

  return new Response(short);
};
