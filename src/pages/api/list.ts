import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const db = locals.runtime.env.SHORTAGE_AUTH;

  const { results } = await db
    .prepare("SELECT * FROM urls WHERE owner = ?")
    .bind(user.githubId)
    .all<ShortenedUrl>();

  return new Response(JSON.stringify(results));
};
