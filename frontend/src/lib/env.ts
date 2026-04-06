export const publicApiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Server-side base URL (RSC / Route Handlers). Falls back to public URL. */
export const serverApiUrl =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
