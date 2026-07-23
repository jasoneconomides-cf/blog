const MARKDOWN_ACCEPT = /\btext\/markdown\b/i;

export async function onRequest(context) {
  const response = await context.next();
  const accept = context.request.headers.get("accept") || "";
  const contentType = response.headers.get("content-type") || "";

  if (
    context.request.method !== "GET" ||
    !MARKDOWN_ACCEPT.test(accept) ||
    !contentType.includes("text/html") ||
    !response.ok
  ) {
    return response;
  }

  const html = await response.text();
  const title = decodeEntities(
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "",
  );
  const canonical =
    html.match(
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i,
    )?.[1] || "";
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] || html;
  const body = htmlToMarkdown(main);
  const preamble = [
    title ? `# ${title}` : "",
    canonical ? `Source: ${canonical}` : "",
  ].filter(Boolean);
  const markdown = `${preamble.join("\n\n")}\n\n${body}\n`;

  const headers = new Headers(response.headers);
  headers.set("content-type", "text/markdown; charset=utf-8");
  headers.set("vary", appendVary(headers.get("vary"), "Accept"));
  headers.set("x-markdown-tokens", String(estimateTokens(markdown)));
  headers.set("x-original-tokens", String(estimateTokens(html)));
  headers.delete("content-length");
  headers.delete("content-encoding");
  headers.delete("etag");

  return new Response(markdown, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function estimateTokens(value) {
  return Math.max(1, Math.ceil(value.length / 4));
}

function appendVary(value, header) {
  const fields = (value || "")
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean);

  if (!fields.some((field) => field.toLowerCase() === header.toLowerCase())) {
    fields.push(header);
  }

  return fields.join(", ");
}

function htmlToMarkdown(html) {
  return decodeEntities(
    html
      .replace(/<(script|style|noscript|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
      .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, text) =>
        `${"#".repeat(Number(level))} ${stripTags(text)}\n\n`,
      )
      .replace(
        /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
        (_, href, text) => `[${stripTags(text)}](${href})`,
      )
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, text) =>
        `- ${stripTags(text)}\n`,
      )
      .replace(/<(p|div|section|article|header|footer)[^>]*>/gi, "")
      .replace(/<\/(p|div|section|article|header|footer)>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**")
      .replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*")
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
      .replace(/<[^>]+>/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, "").trim();
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}
