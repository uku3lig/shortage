/// <reference types="astro/client" />

type KVNamespace = import("@cloudflare/workers-types").KVNamespace;
type ENV = {
  SHORTAGE_NAMESPACE: KVNamespace;
};

type Runtime = import("@astrojs/cloudflare").AdvancedRuntime<ENV>;
declare namespace App {
  interface Locals extends Runtime {}
}

interface ShortenedUrl {
  target: string;
  expiration?: string;
  max_uses?: number;
  uses: number;
  owner: number;
}
