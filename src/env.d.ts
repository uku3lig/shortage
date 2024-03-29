/// <reference types="astro/client" />

type D1Database = import("@cloudflare/workers-types").D1Database;
type ENV = {
  SHORTAGE_AUTH: D1Database;
};

type Runtime = import("@astrojs/cloudflare").AdvancedRuntime<ENV>;
declare namespace App {
  interface Locals extends Runtime {
    session: import("lucia").Session | null;
    user: import("lucia").User | null;
  }
}

interface ShortenedUrl {
  short: string;
  target: string;
  expiration?: string;
  max_uses?: number;
  uses: number;
  owner: number;
}
