import type { HandleFetch } from "@sveltejs/kit";

export function GET({ fetch, request }: { fetch: HandleFetch, request: Request }) {
    return new Response(JSON.stringify({ ex: "Hello world" }));
}