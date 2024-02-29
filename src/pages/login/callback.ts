import type { APIRoute } from "astro";

import { github, initializeLucia } from "../../auth";
import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";

export const GET: APIRoute = async (context) => {
  const code = context.url.searchParams.get("code");
  const state = context.url.searchParams.get("state");
  const storedState = context.cookies.get("github_oauth_state")?.value ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await github.validateAuthorizationCode(code);
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    const githubUser: GitHubUser = await githubUserResponse.json();

    const db = context.locals.runtime.env.SHORTAGE_AUTH;
    const lucia = initializeLucia(db);

    const existingUser = await db
      .prepare("SELECT * FROM user WHERE github_id = ?")
      .bind(githubUser.id)
      .first<DatabaseUser>();

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      context.cookies.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
      return context.redirect("/");
    }

    const userId = generateId(15);

    await db
      .prepare("INSERT INTO user (id, github_id, username) VALUES (?, ?, ?)")
      .bind(userId, githubUser.id, githubUser.login)
      .run();

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return context.redirect("/");
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response("invalid oauth2 code", {
        status: 400,
      });
    } else {
      return new Response(null, {
        status: 500,
      });
    }
  }
};

interface GitHubUser {
  id: string;
  login: string;
}

interface DatabaseUser {
  id: string;
  github_id: number;
  username: string;
}
