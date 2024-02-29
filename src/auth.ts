import { Lucia } from "lucia";
import { D1Adapter } from "@lucia-auth/adapter-sqlite";
import { GitHub } from "arctic";

export const github = new GitHub(
  import.meta.env.GITHUB_CLIENT_ID,
  import.meta.env.GITHUB_CLIENT_SECRET,
);

let lucia: ReturnType<typeof makeLucia>;

export function initializeLucia(D1: D1Database) {
  if (!lucia) {
    const adapter = new D1Adapter(D1, {
      user: "user",
      session: "session",
    });

    lucia = makeLucia(adapter);
  }

  return lucia;
}

function makeLucia(adapter: D1Adapter) {
  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: import.meta.env.PROD,
      },
    },
    getUserAttributes: (attr) => {
      return {
        githubId: attr.github_id,
        username: attr.username,
      };
    },
  });
}

declare module "lucia" {
  interface Register {
    Lucia: ReturnType<typeof makeLucia>;
    DatabaseUserAttributes: Omit<DatabaseUser, "id">;
  }
}

interface DatabaseUser {
  github_id: number;
  username: string;
}
