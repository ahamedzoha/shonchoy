export function GET(): Response {
  const body = `User-agent: *\nAllow: /\nSitemap: http://localhost:3000/sitemap.xml`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
