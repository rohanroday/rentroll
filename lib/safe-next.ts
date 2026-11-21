// Keeps post-login redirects inside RentRoll. URL parsers strip tabs and newlines,
// so "/\t/evil.example" would otherwise leave the site.
export function safeNext(value: string | null | undefined, fallback = "/rooms") {
  if (!value || !value.startsWith("/")) return fallback;
  const unsafe = [...value].some((c) => c === "\\" || c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127);
  if (unsafe) return fallback;
  try {
    const base = "https://rentroll.invalid";
    const url = new URL(value, base);
    return url.origin === base ? url.pathname + url.search + url.hash : fallback;
  } catch {
    return fallback;
  }
}
